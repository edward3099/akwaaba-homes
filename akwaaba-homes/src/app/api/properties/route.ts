import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || 'active';
    const propertyType = searchParams.get('property_type');
    const listingType = searchParams.get('listing_type');
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    const city = searchParams.get('city');
    const bedrooms = searchParams.get('bedrooms');

    // Build query - start with basic properties
    let query = supabase
      .from('properties')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    // Apply filters
    if (propertyType) {
      query = query.eq('property_type', propertyType);
    }
    if (listingType) {
      query = query.eq('listing_type', listingType);
    }
    if (minPrice) {
      query = query.gte('price', parseFloat(minPrice));
    }
    if (maxPrice) {
      query = query.lte('price', parseFloat(maxPrice));
    }
    if (city) {
      query = query.ilike('city', `%${city}%`);
    }
    if (bedrooms) {
      query = query.gte('bedrooms', parseInt(bedrooms));
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('status', status);

    // Apply pagination
    const offset = (page - 1) * limit;
    const { data: properties, error } = await query
      .range(offset, offset + limit - 1);

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
      status: property.status,
      created_at: property.created_at,
      updated_at: property.updated_at,
      agent: {
        id: property.seller_id,
        name: 'Property Owner',
        company: 'AkwaabaHomes',
        role: 'seller'
      },
      images: [] // We'll add image fetching later if needed
    })) || [];

    return NextResponse.json({
      properties: transformedProperties,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
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
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is an agent
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile || profile.user_role !== 'agent') {
      return NextResponse.json(
        { error: 'Access denied. Only agents can create properties.' },
        { status: 403 }
      );
    }

    // Get request body
    const body = await request.json();
    const {
      title,
      description,
      price,
      currency,
      property_type,
      listing_type,
      bedrooms,
      bathrooms,
      square_feet,
      address,
      city,
      region,
      latitude,
      longitude,
      features,
      amenities
    } = body;

    // Validate required fields
    if (!title || !description || !price || !address || !city) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, price, address, and city are required' },
        { status: 400 }
      );
    }

    // Create property record
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .insert({
        title,
        description,
        price,
        currency: currency || 'GHS',
        property_type: property_type || 'house',
        listing_type: listing_type || 'sale',
        bedrooms: bedrooms || 1,
        bathrooms: bathrooms || 1,
        square_feet: square_feet,
        address,
        city,
        region: region || 'Greater Accra',
        latitude: latitude,
        longitude: longitude,
        features: features || [],
        amenities: amenities || [],
        status: 'pending',
        seller_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (propertyError) {
      console.error('Property creation error:', propertyError);
      return NextResponse.json(
        { error: 'Failed to create property' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      property,
      message: 'Property created successfully'
    });

  } catch (error) {
    console.error('Property creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
