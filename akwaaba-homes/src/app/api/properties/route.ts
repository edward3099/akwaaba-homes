import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Create Supabase client using the same approach as middleware
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => 
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const currentPage = parseInt(searchParams.get('page') || '1');
    const propertiesPerPage = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || 'active';
    const propertyType = searchParams.get('property_type');
    const listingType = searchParams.get('listing_type');
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    const city = searchParams.get('city');
    const region = searchParams.get('region');
    const bedrooms = searchParams.get('bedrooms');
    const furnishing = searchParams.get('furnishing');
    const serviced = searchParams.get('serviced');
    const shared = searchParams.get('shared');
    const addedToSite = searchParams.get('added_to_site');
    const propertyRef = searchParams.get('property_ref');

    // Build query - start with basic properties
    let query = supabase
      .from('properties')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    // Build count query with same filters
    let countQuery = supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('status', status);

    // Apply filters to both queries
    if (propertyType) {
      query = query.eq('property_type', propertyType);
      countQuery = countQuery.eq('property_type', propertyType);
    }
    if (listingType) {
      query = query.eq('listing_type', listingType);
      countQuery = countQuery.eq('listing_type', listingType);
    }
    if (minPrice) {
      query = query.gte('price', parseFloat(minPrice));
      countQuery = countQuery.gte('price', parseFloat(minPrice));
    }
    if (maxPrice) {
      query = query.lte('price', parseFloat(maxPrice));
      countQuery = countQuery.lte('price', parseFloat(maxPrice));
    }
    if (city) {
      query = query.ilike('city', `%${city}%`);
      countQuery = countQuery.ilike('city', `%${city}%`);
    }
    if (region) {
      // Implement proper ranking: city-specific properties first, then broader region properties
      // This provides clear separation and better user experience
      const searchText = region.trim();
      if (searchText) {
        // First, get properties that have the search term in their address (city-specific)
        // These are the most relevant results and should appear first
        const citySpecificQuery = supabase
          .from('properties')
          .select('*')
          .eq('status', 'active')
          .eq('listing_type', listingType)
          .ilike('address', `%${searchText}%`)
          .order('created_at', { ascending: false });

        // Then, get properties that have the search term in their region (broader area)
        // These are less relevant but still useful
        const regionQuery = supabase
          .from('properties')
          .select('*')
          .eq('status', 'active')
          .eq('listing_type', listingType)
          .ilike('region', `%${searchText}%`)
          .not('address', 'ilike', `%${searchText}%`) // Exclude city-specific ones to avoid duplicates
          .order('created_at', { ascending: false });

        // Execute both queries
        const [cityResults, regionResults] = await Promise.all([
          citySpecificQuery,
          regionQuery
        ]);

        // Combine results with city-specific first, then region results
        let allResults = [];
        if (cityResults.data) allResults.push(...cityResults.data);
        if (regionResults.data) allResults.push(...regionResults.data);

        // Apply pagination manually
        const startIndex = (currentPage - 1) * propertiesPerPage;
        const endIndex = startIndex + propertiesPerPage;
        const paginatedResults = allResults.slice(startIndex, endIndex);

        // Get total count for pagination
        const totalCount = allResults.length;

        return NextResponse.json({
          properties: paginatedResults,
          pagination: {
            currentPage,
            totalPages: Math.ceil(totalCount / propertiesPerPage),
            totalCount,
            propertiesPerPage
          }
        });
      }
    }
    if (bedrooms) {
      query = query.gte('bedrooms', parseInt(bedrooms));
      countQuery = countQuery.gte('bedrooms', parseInt(bedrooms));
    }

    // Apply expanded search option filters
    if (addedToSite && addedToSite !== '0') {
      const days = parseInt(addedToSite);
      const dateThreshold = new Date();
      dateThreshold.setDate(dateThreshold.getDate() - days);
      query = query.gte('created_at', dateThreshold.toISOString());
      countQuery = countQuery.gte('created_at', dateThreshold.toISOString());
    }

    // Get total count for pagination with filters applied
    const { count } = await countQuery;

    // Apply pagination
    const offset = (currentPage - 1) * propertiesPerPage;
    const { data: properties, error } = await query
      .range(offset, offset + propertiesPerPage - 1);

    if (error) {
      console.error('Properties fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch properties' },
        { status: 500 }
      );
    }

    // Transform the data to match frontend expectations
    const transformedProperties = properties?.map(property => ({
      id: property.id,
      title: property.title,
      description: property.description,
      price: property.price,
      currency: property.currency,
      property_type: property.property_type,
      listing_type: property.listing_type,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      square_feet: property.square_feet,
      address: property.address,
      city: property.city,
      region: property.region,
      latitude: property.latitude,
      longitude: property.longitude,
      features: property.features || [],
      amenities: property.amenities || [],
      status: property.listing_type === 'sale' ? 'for-sale' : 
              property.listing_type === 'rent' ? 'for-rent' : 
              property.listing_type === 'lease' ? 'short-let' : 'for-sale',
      type: property.property_type || 'house',
      // Transform image_urls to images for frontend compatibility
      images: (property.image_urls || []).filter(url => 
        url && typeof url === 'string' && url.trim() !== '' && 
        (url.startsWith('http') || url.startsWith('/') || url.startsWith('blob:'))
      ),
      // Keep original image_urls for backward compatibility
      image_urls: property.image_urls || [],
      specifications: {
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        size: property.square_feet || 0,
        sizeUnit: 'sqft' as const,
        lotSize: property.lot_size || 0,
        lotSizeUnit: 'sqft' as const,
        yearBuilt: property.year_built || undefined,
        parkingSpaces: property.parking_spaces || 0
      },
      location: {
        address: property.address || '',
        city: property.city || '',
        region: property.region || '',
        country: 'Ghana' as const,
        coordinates: {
          lat: property.latitude || 0,
          lng: property.longitude || 0
        },
        plusCode: property.plus_code || undefined
      },
      seller: {
        id: property.seller_id || 'unknown',
        name: property.seller_name || 'Unknown Seller',
        type: 'individual' as const,
        phone: property.seller_phone || '',
        email: property.seller_email || undefined,
        whatsapp: property.seller_whatsapp || undefined,
        isVerified: property.seller_verified || false,
        company: property.seller_company || undefined,
        licenseNumber: property.seller_license || undefined
      },
      verification: {
        isVerified: property.verification_status === 'verified',
        documentsUploaded: property.documents_uploaded || false,
        verificationDate: property.verification_date || undefined,
        adminNotes: property.admin_notes || undefined
      },
      createdAt: property.created_at || new Date().toISOString(),
      updatedAt: property.updated_at || new Date().toISOString(),
      expiresAt: property.expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      tier: property.tier || 'normal',
      diasporaFeatures: {
        multiCurrencyDisplay: true,
        inspectionScheduling: true,
        virtualTourAvailable: false,
        familyRepresentativeContact: undefined
      }
    })) || [];

    return NextResponse.json({
      properties: transformedProperties,
      pagination: {
        currentPage,
        propertiesPerPage,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / propertiesPerPage)
      }
    });

  } catch (error) {
    console.error('Properties fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client using the same approach as middleware
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => 
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );
    
    // Check authentication using Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to create properties' },
        { status: 401 }
      );
    }

    console.log('Authenticated user:', { id: user.id, email: user.email });

    // Check if user is an agent - check both profiles and users tables
    let isAgent = false;
    let userRole = null;
    let userType = null;

    // First check profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('user_id', user.id)
      .single();

    if (profile && !profileError) {
      userRole = profile.user_role;
      isAgent = userRole === 'agent';
      console.log('Profile found:', { userRole, isAgent });
    }

    // If not found in profiles, check users table
    if (!isAgent) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('user_type')
        .eq('id', user.id)
        .single();

      if (userData && !userError) {
        userType = userData.user_type;
        isAgent = userType === 'agent';
        console.log('User data found:', { userType, isAgent });
      }
    }

    // If still not an agent, check if user email matches known agent emails
    if (!isAgent) {
      const { data: knownAgent, error: agentError } = await supabase
        .from('users')
        .select('id, user_type')
        .eq('email', user.email)
        .eq('user_type', 'agent')
        .single();

      if (knownAgent && !agentError) {
        isAgent = true;
        console.log('Known agent found by email:', { email: user.email, isAgent });
      }
    }

    if (!isAgent) {
      console.error('User is not an agent:', { 
        userId: user.id, 
        email: user.email, 
        userRole, 
        userType 
      });
      return NextResponse.json(
        { error: 'Unauthorized - Only agents can create properties' },
        { status: 403 }
      );
    }

    console.log('Agent verification successful:', { 
      userId: user.id, 
      email: user.email, 
      userRole, 
      userType, 
      isAgent 
    });

    // Parse request body
    const body = await request.json();
    console.log('Request body received:', body);

    // Validate required fields
    const requiredFields = ['title', 'description', 'price', 'address', 'city', 'region'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate images - handle both 'images' and 'image_urls' field names
    const imageUrls = body.image_urls || body.images;
    
    // Allow property creation without images initially (two-step process)
    // Images will be uploaded after property creation
    if (imageUrls && imageUrls.length > 0) {
      // If images are provided, validate them
      if (imageUrls.length < 3) {
        return NextResponse.json(
          { error: 'If images are provided, at least 3 images are required' },
          { status: 400 }
        );
      }

      // Validate that image URLs are actual uploaded URLs (not blob URLs)
      const invalidImageUrls = imageUrls.filter((url: string) => 
        !url || 
        url.startsWith('blob:') || 
        url.startsWith('data:') ||
        !url.startsWith('http')
      );
      
      if (invalidImageUrls.length > 0) {
        return NextResponse.json(
          { error: 'Invalid image URLs detected. Please upload images properly.' },
          { status: 400 }
        );
      }
    }

    // Prepare property data
    const propertyData = {
      title: body.title,
      description: body.description,
      price: parseFloat(body.price),
      currency: body.currency || 'GHS',
      property_type: body.property_type || body.type || 'house',
      listing_type: body.listing_type || 'sale',
      bedrooms: parseInt(body.bedrooms) || 0,
      bathrooms: parseInt(body.bathrooms) || 0,
      square_feet: parseFloat(body.square_feet) || parseFloat(body.size) || 0,
      address: body.address,
      city: body.city,
      region: body.region,
      latitude: parseFloat(body.latitude) || (body.coordinates?.lat ? parseFloat(body.coordinates.lat) : 0),
      longitude: parseFloat(body.longitude) || (body.coordinates?.lng ? parseFloat(body.coordinates.lng) : 0),
      features: body.features || [],
      amenities: body.amenities || [],
      virtual_tour_url: body.virtual_tour_url || body.virtualTour || null,
      image_urls: imageUrls || [], // Use provided images or empty array
      status: 'pending',
      approval_status: 'pending',
      seller_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Property data prepared:', propertyData);

    // Insert property into database
    const { data: newProperty, error: insertError } = await supabase
      .from('properties')
      .insert([propertyData])
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create property in database', details: insertError.message },
        { status: 500 }
      );
    }

    console.log('Property created successfully:', newProperty);

    // Update the property_images table to link the uploaded images to this property
    // Only process if there are actual images
    if (imageUrls && imageUrls.length > 0) {
      // First, get the temporary property ID from the image URLs
      const tempPropertyIds = [...new Set(imageUrls.map((url: string) => {
        const match = url.match(/temp-(\d+)-[a-z0-9]+/);
        return match ? match[1] : null;
      }).filter(Boolean))];

      if (tempPropertyIds.length > 0) {
        console.log('Updating image records for property:', newProperty.id);
        
        // Update all image records that were uploaded with temporary property IDs
        for (const tempId of tempPropertyIds) {
          const { error: updateError } = await supabase
            .from('property_images')
            .update({ 
              property_id: newProperty.id,
              updated_at: new Date().toISOString()
            })
            .like('property_id', `temp-${tempId}-%`);
          
          if (updateError) {
            console.error('Failed to update image records for temp ID:', tempId, updateError);
          }
        }
      }
    }

    return NextResponse.json(
      { 
        message: 'Property created successfully', 
        property: newProperty,
        id: newProperty.id 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Unexpected error in POST /api/properties:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
