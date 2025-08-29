import { NextRequest, NextResponse } from 'next/server';
import { createApiRouteSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createApiRouteSupabaseClient();

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch properties for the authenticated user
    // Note: properties.seller_id references public.users.id, not auth.users.id
    // We need to join with the profiles table to get the user's properties
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
      return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
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
      properties: transformedProperties,
      total: transformedProperties.length
    });

  } catch (error) {
    console.error('Error in my-properties API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
