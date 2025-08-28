import { NextRequest, NextResponse } from 'next/server';
import { createApiRouteSupabaseClient } from '@/lib/supabase/server';

// Helper function to check if user is admin
async function checkAdminAccess(supabase: any, userId: string) {
  const { data: userProfile, error: profileError } = await supabase
    .from('profiles')
    .select('user_role, is_verified')
    .eq('user_id', userId)
    .single();

  if (profileError || !userProfile) {
    return { isAdmin: false, error: 'User profile not found' };
  }

  if (userProfile.user_role !== 'admin') {
    return { isAdmin: false, error: 'Admin role required' };
  }

  return { isAdmin: true, profile: userProfile };
}

// GET method to list all properties with admin privileges
export async function GET(request: NextRequest) {
  try {
    console.log('Admin properties API called'); // Added logging
    const supabase = await createApiRouteSupabaseClient();
    
    // Check if user is authenticated and is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Auth check:', { user: user?.id, authError }); // Added logging
    
    if (authError || !user) {
      console.log('Authentication failed:', authError); // Added logging
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin role
    const adminCheck = await checkAdminAccess(supabase, user.id);
    if (!adminCheck.isAdmin) {
      console.log('Admin role check failed:', adminCheck.error); // Added logging
      return NextResponse.json({ error: adminCheck.error }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const property_type = searchParams.get('property_type');
    const listing_type = searchParams.get('listing_type');
    const status = searchParams.get('status');
    const min_price = searchParams.get('min_price');
    const max_price = searchParams.get('max_price');
    const min_bedrooms = searchParams.get('min_bedrooms');
    const min_bathrooms = searchParams.get('min_bathrooms');
    const city = searchParams.get('city');
    const region = searchParams.get('region');

    let query = supabase
      .from('properties')
      .select(
        `
        *,
        property_images(id, url, is_featured),
        inquiries(id)
        `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (search) query = query.ilike('title', `%${search}%`);
    if (property_type) query = query.eq('property_type', property_type);
    if (listing_type) query = query.eq('listing_type', listing_type);
    if (status) query = query.eq('status', status);
    if (min_price) query = query.gte('price', parseFloat(min_price));
    if (max_price) query = query.lte('price', parseFloat(max_price));
    if (min_bedrooms) query = query.gte('bedrooms', parseInt(min_bedrooms));
    if (min_bathrooms) query = query.gte('bathrooms', parseInt(min_bathrooms));
    if (city) query = query.ilike('city', `%${city}%`);
    if (region) query = query.ilike('region', `%${region}%`);

    const { data: properties, error: propertiesError, count } = await query;

    if (propertiesError) {
      console.error('Error fetching properties:', propertiesError);
      return NextResponse.json(
        { error: 'Failed to fetch properties', details: propertiesError.message },
        { status: 500 }
      );
    }

    // If we have properties, fetch seller information separately to avoid JOIN issues
    let propertiesWithSellers = properties || [];
    if (properties && properties.length > 0) {
      try {
        // Get unique seller IDs
        const sellerIds = [...new Set(properties.map(p => p.seller_id).filter(Boolean))];
        
        if (sellerIds.length > 0) {
          // Fetch seller information from profiles table instead of users table
          const { data: sellers, error: sellersError } = await supabase
            .from('profiles')
            .select('user_id, full_name, company_name, phone, email, user_role, is_verified')
            .in('user_id', sellerIds);

          if (!sellersError && sellers) {
            propertiesWithSellers = properties.map(property => {
              const seller = sellers.find(s => s.user_id === property.seller_id);
              return {
                ...property,
                seller: seller ? {
                  id: seller.user_id,
                  full_name: seller.full_name,
                  company_name: seller.company_name,
                  phone: seller.phone,
                  email: seller.email,
                  user_role: seller.user_role,
                  is_verified: seller.is_verified,
                } : null,
              };
            });
          } else {
            console.warn('Could not fetch seller details:', sellersError);
          }
        }
      } catch (sellerFetchError) {
        console.error('Error fetching seller details:', sellerFetchError);
      }
    }

    return NextResponse.json(
      {
        properties: propertiesWithSellers,
        count,
        pagination: {
          page: Math.floor(offset / limit) + 1,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in admin properties GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST method to create a new property (admin can create properties on behalf of sellers)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createApiRouteSupabaseClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is an admin
    const adminCheck = await checkAdminAccess(supabase, user.id);
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'price', 'property_type', 'listing_type'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create the property
    const { data: property, error: createError } = await supabase
      .from('properties')
      .insert([{
        ...body,
        seller_id: body.seller_id || user.id, // Default to current user if no seller specified
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (createError) {
      console.error('Error creating property:', createError);
      return NextResponse.json(
        { error: 'Failed to create property', details: createError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ property }, { status: 201 });
  } catch (error) {
    console.error('Error in admin properties POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
