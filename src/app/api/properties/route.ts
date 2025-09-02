import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const listingType = searchParams.get('listing_type')
    const propertyType = searchParams.get('property_type')
    const minPrice = searchParams.get('min_price')
    const maxPrice = searchParams.get('max_price')
    const bedrooms = searchParams.get('bedrooms')
    const city = searchParams.get('city')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    const supabase = createRouteHandlerClient({ cookies })

    // Build the query with proper join to get seller information
    let query = supabase
      .from('properties')
      .select(`
        *,
        users!properties_seller_id_fkey (
          id,
          full_name,
          phone,
          email,
          user_type,
          is_verified
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    // Apply filters
    if (listingType) {
      query = query.eq('listing_type', listingType)
    }
    if (propertyType) {
      query = query.eq('property_type', propertyType)
    }
    if (minPrice) {
      query = query.gte('price', parseInt(minPrice))
    }
    if (maxPrice) {
      query = query.lte('price', parseInt(maxPrice))
    }
    if (bedrooms) {
      query = query.gte('bedrooms', parseInt(bedrooms))
    }
    if (city) {
      query = query.ilike('city', `%${city}%`)
    }

    // Get total count for pagination
    const { count } = await query.count()

    // Apply pagination
    const { data: properties, error } = await query
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Properties API error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch properties' },
        { status: 500 }
      )
    }

    // Transform the data to match frontend expectations
    const transformedProperties = properties?.map(property => ({
      id: property.id,
      title: property.title,
      description: property.description,
      price: property.price,
      currency: property.currency || 'GHS',
      status: property.listing_type === 'for_sale' ? 'for-sale' : 'for-rent',
      type: property.property_type,
      location: {
      address: property.address,
      city: property.city,
      region: property.region,
        country: 'Ghana',
        coordinates: {
          lat: property.latitude || 0,
          lng: property.longitude || 0
        }
      },
      specifications: {
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        size: property.square_feet || 0,
        sizeUnit: 'sqft'
      },
      images: property.images || [],
      features: property.features || [],
      amenities: property.amenities || [],
      seller: {
        id: property.seller_id || 'unknown',
        name: property.users?.full_name || 'Unknown Seller',
        type: (property.users?.user_type as 'individual' | 'agent' | 'developer') || 'individual',
        phone: property.users?.phone || '',
        email: property.users?.email || undefined,
        whatsapp: property.users?.phone || undefined, // Use phone as WhatsApp
        isVerified: property.users?.is_verified || false,
        company: undefined,
        licenseNumber: undefined
      },
      verification: {
        isVerified: property.is_verified || false,
        documentsUploaded: true,
        verificationDate: property.updated_at
      },
      createdAt: property.created_at,
      updatedAt: property.updated_at,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      tier: 'normal'
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
    console.error('Properties API error:', error)
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

    // Check if user is an agent
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile || profile.user_role !== 'agent') {
      return NextResponse.json(
        { error: 'Only agents can create properties' },
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
        status: 'pending', // New properties start as pending for admin approval
        seller_id: user.id
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

    // If images are provided, create property_images records
    if (body.images && Array.isArray(body.images) && body.images.length > 0) {
      const imageRecords = body.images.map((image: any, index: number) => ({
        property_id: property.id,
        image_url: image.url,
        image_type: image.type || 'interior',
        alt_text: image.alt || body.title,
        is_primary: index === 0, // First image is primary
        order: index + 1
      }))

      const { error: imageError } = await supabase
        .from('property_images')
        .insert(imageRecords)

      if (imageError) {
        console.error('Image creation error:', imageError)
        // Don't fail the entire request if images fail
      }
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
