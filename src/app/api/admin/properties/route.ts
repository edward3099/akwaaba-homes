import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is an admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile || profile.user_role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Build the query
    let query = supabase
      .from('properties')
      .select(`
        *,
        profiles!properties_seller_id_fkey (
          id,
          full_name,
          company_name,
          user_role,
          email
        ),
        property_images!property_images_property_id_fkey (
          id,
          image_url,
          image_type,
          is_primary
        )
      `)
      .order('created_at', { ascending: false })

    // Apply status filter if provided
    if (status) {
      query = query.eq('status', status)
    }

    // Get total count for pagination
    const { count } = await query.count()

    // Apply pagination
    const { data: properties, error } = await query
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Admin properties API error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch properties' },
        { status: 500 }
      )
    }

    // Transform the data for the admin interface
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
      status: property.status,
      created_at: property.created_at,
      updated_at: property.updated_at,
      seller: property.profiles ? {
        id: property.profiles.id,
        name: property.profiles.full_name,
        company: property.profiles.company_name,
        role: property.profiles.user_role,
        email: property.profiles.email
      } : null,
      primaryImage: property.property_images?.find(img => img.is_primary)?.image_url || null
    })) || []

    return NextResponse.json({
      properties: transformedProperties,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Admin properties API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is an admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile || profile.user_role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'price', 'property_type', 'listing_type', 'address', 'city']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Create the property
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .insert({
        title: body.title,
        description: body.description,
        price: body.price,
        currency: body.currency || 'GHS',
        property_type: body.property_type,
        listing_type: body.listing_type,
        bedrooms: body.bedrooms || 1,
        bathrooms: body.bathrooms || 1,
        square_feet: body.square_feet,
        address: body.address,
        city: body.city,
        region: body.region || 'Greater Accra',
        latitude: body.latitude,
        longitude: body.longitude,
        features: body.features || [],
        amenities: body.amenities || [],
        status: 'active', // Admin-created properties are active by default
        seller_id: body.seller_id || user.id
      })
      .select()
      .single()

    if (propertyError) {
      console.error('Property creation error:', propertyError)
      return NextResponse.json(
        { error: 'Failed to create property' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Property created successfully',
      property: {
        id: property.id,
        title: property.title,
        status: property.status
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Property creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
