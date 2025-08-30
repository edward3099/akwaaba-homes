import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Use the proper Supabase client for API routes
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
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Authentication error:', authError);
      return NextResponse.json({ 
        error: 'Unauthorized - Please log in to access your properties',
        details: authError?.message 
      }, { status: 401 });
    }

    // Get user profile to check user type
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, user_type, is_verified, is_active')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError);
      return NextResponse.json({ 
        error: 'User profile not found',
        details: profileError?.message 
      }, { status: 404 });
    }

    // Check if user is verified and active
    if (!profile.is_verified || !profile.is_active) {
      return NextResponse.json({ 
        error: 'Account not verified or inactive',
        details: 'Please verify your account or contact support'
      }, { status: 403 });
    }

    // Fetch properties for the authenticated user
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select(`
        id,
        title,
        description,
        price,
        property_type,
        status,
        approval_status,
        address,
        city,
        region,
        postal_code,
        latitude,
        longitude,
        bedrooms,
        bathrooms,
        square_feet,
        land_size,
        year_built,
        features,
        amenities,
        is_featured,
        views_count,
        created_at,
        updated_at
      `)
      .eq('seller_id', user.id);

    if (propertiesError) {
      console.error('Error fetching properties:', propertiesError);
      return NextResponse.json({ 
        error: 'Failed to fetch properties',
        details: propertiesError.message 
      }, { status: 500 });
    }

    // Transform the data to match the expected format
    const transformedProperties = properties?.map(property => ({
      id: property.id,
      title: property.title,
      description: property.description,
      price: property.price,
      propertyType: property.property_type,
      status: property.status,
      approvalStatus: property.approval_status,
      location: {
        address: property.address,
        city: property.city,
        region: property.region,
        postalCode: property.postal_code,
        coordinates: property.latitude && property.longitude ? [property.latitude, property.longitude] : null,
        plusCode: null // Not available in current schema
      },
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      squareFeet: property.square_feet,
      landSize: property.land_size,
      yearBuilt: property.year_built,
      features: property.features || [],
      amenities: property.amenities || [],
      isFeatured: property.is_featured,
      viewsCount: property.views_count,
      createdAt: property.created_at,
      updatedAt: property.updated_at
    })) || [];

    return NextResponse.json({
      success: true,
      properties: transformedProperties,
      total: transformedProperties.length,
      user: {
        id: user.id,
        email: user.email,
        userType: profile.user_type,
        isVerified: profile.is_verified,
        isActive: profile.is_active
      }
    });

  } catch (error) {
    console.error('Error in my-properties API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
