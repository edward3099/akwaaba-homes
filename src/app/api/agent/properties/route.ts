import { NextRequest, NextResponse } from 'next/server'
import { createApiRouteSupabaseClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schema for creating a new property
const createPropertySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().positive('Price must be positive'),
  property_type: z.enum(['house', 'apartment', 'land', 'commercial']),
  status: z.enum(['available', 'sold', 'pending']).default('available'),
  location: z.object({
    coordinates: z.tuple([z.number(), z.number()]).optional(),
    plusCode: z.string().optional(),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    region: z.string().min(1, 'Region is required')
  }),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  area: z.number().positive().optional(),
  features: z.array(z.string()).default([]),
  images: z.array(z.string()).default([])
})

// Agent authentication middleware
async function requireAgent(supabase: any) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const { data: userProfile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', user.id)
    .single()

  if (!userProfile || !['agent', 'developer'].includes(userProfile.user_type)) {
    throw new Error('Insufficient permissions - Agent or Developer access required')
  }

  return user
}

// GET /api/agent/properties - List agent's properties
export async function GET(request: NextRequest) {
  try {
    const supabase = await createApiRouteSupabaseClient()
    
    // Verify agent access
    const agentUser = await requireAgent(supabase)

    // Get query parameters for filtering and pagination
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const propertyType = searchParams.get('type') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Build the query
    let query = supabase
      .from('properties')
      .select(`
        *,
        location:properties_location(*),
        images:property_images(*)
      `)
      .eq('owner_id', agentUser.id)

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }
    
    if (status) {
      query = query.eq('status', status)
    }
    
    if (propertyType) {
      query = query.eq('property_type', propertyType)
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', agentUser.id)

    // Apply pagination and get results
    const { data: properties, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching properties:', error)
      return NextResponse.json(
        { error: 'Failed to fetch properties' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      properties: properties || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Agent properties GET error:', error)
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    if (error.message.includes('Insufficient permissions')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/agent/properties - Create a new property
export async function POST(request: NextRequest) {
  try {
    const supabase = await createApiRouteSupabaseClient()
    
    // Verify agent access
    const agentUser = await requireAgent(supabase)

    const body = await request.json()
    const validatedData = createPropertySchema.parse(body)

    // Start a transaction-like operation
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .insert({
        title: validatedData.title,
        description: validatedData.description,
        price: validatedData.price,
        property_type: validatedData.property_type,
        status: validatedData.status,
        bedrooms: validatedData.bedrooms,
        bathrooms: validatedData.bathrooms,
        area: validatedData.area,
        features: validatedData.features,
        owner_id: agentUser.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (propertyError) {
      console.error('Error creating property:', propertyError)
      return NextResponse.json(
        { error: 'Failed to create property' },
        { status: 500 }
      )
    }

    // Insert location data
    if (validatedData.location) {
      const { error: locationError } = await supabase
        .from('properties_location')
        .insert({
          property_id: property.id,
          coordinates: validatedData.location.coordinates,
          plus_code: validatedData.location.plusCode,
          address: validatedData.location.address,
          city: validatedData.location.city,
          region: validatedData.location.region
        })

      if (locationError) {
        console.error('Error creating property location:', locationError)
        // Don't fail the request if location creation fails
      }
    }

    // Insert images if provided
    if (validatedData.images.length > 0) {
      const imageRecords = validatedData.images.map((imageUrl, index) => ({
        property_id: property.id,
        image_url: imageUrl,
        is_primary: index === 0, // First image is primary
        created_at: new Date().toISOString()
      }))

      const { error: imagesError } = await supabase
        .from('property_images')
        .insert(imageRecords)

      if (imagesError) {
        console.error('Error creating property images:', imagesError)
        // Don't fail the request if image creation fails
      }
    }

    // Get the complete property with location and images
    const { data: completeProperty, error: fetchError } = await supabase
      .from('properties')
      .select(`
        *,
        location:properties_location(*),
        images:property_images(*)
      `)
      .eq('id', property.id)
      .single()

    if (fetchError) {
      console.error('Error fetching complete property:', fetchError)
      // Return the basic property if we can't fetch the complete one
      return NextResponse.json({
        message: 'Property created successfully',
        property: property
      })
    }

    return NextResponse.json({
      message: 'Property created successfully',
      property: completeProperty
    }, { status: 201 })

  } catch (error) {
    console.error('Agent properties POST error:', error)
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    if (error.message.includes('Insufficient permissions')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
