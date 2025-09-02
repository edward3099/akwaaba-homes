import { NextRequest, NextResponse } from 'next/server'
import { createApiRouteSupabaseClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schema for updating a property
const updatePropertySchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  price: z.number().positive('Price must be positive').optional(),
  property_type: z.enum(['house', 'apartment', 'land', 'commercial']).optional(),
  status: z.enum(['available', 'sold', 'pending']).optional(),
  location: z.object({
    coordinates: z.tuple([z.number(), z.number()]).optional(),
    plusCode: z.string().optional(),
    address: z.string().min(1, 'Address is required').optional(),
    city: z.string().min(1, 'City is required').optional(),
    region: z.string().min(1, 'Region is required').optional()
  }).optional(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  area: z.number().positive().optional(),
  features: z.array(z.string()).optional(),
  images: z.array(z.string()).optional()
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

  if (!userProfile || userProfile.user_type !== 'agent') {
    throw new Error('Insufficient permissions - Agent access required')
  }

  return user
}

// Verify property ownership
async function verifyPropertyOwnership(supabase: any, agentUser: any, propertyId: string) {
  const { data: property, error } = await supabase
    .from('properties')
    .select('id, owner_id')
    .eq('id', propertyId)
    .single()

  if (error || !property) {
    throw new Error('Property not found')
  }

  if (property.owner_id !== agentUser.id) {
    throw new Error('Access denied - Property does not belong to this agent')
  }

  return property
}

// PUT /api/agent/properties/[id] - Update a property
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createApiRouteSupabaseClient()
    
    // Verify agent access
    const agentUser = await requireAgent(supabase)
    
    // Verify property ownership
    await verifyPropertyOwnership(supabase, agentUser, params.id)

    const body = await request.json()
    const validatedData = updatePropertySchema.parse(body)

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    // Add optional fields if provided
    if (validatedData.title !== undefined) updateData.title = validatedData.title
    if (validatedData.description !== undefined) updateData.description = validatedData.description
    if (validatedData.price !== undefined) updateData.price = validatedData.price
    if (validatedData.property_type !== undefined) updateData.property_type = validatedData.property_type
    if (validatedData.status !== undefined) updateData.status = validatedData.status
    if (validatedData.bedrooms !== undefined) updateData.bedrooms = validatedData.bedrooms
    if (validatedData.bathrooms !== undefined) updateData.bathrooms = validatedData.bathrooms
    if (validatedData.area !== undefined) updateData.area = validatedData.area
    if (validatedData.features !== undefined) updateData.features = validatedData.features

    // Update property
    const { data: updatedProperty, error: updateError } = await supabase
      .from('properties')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating property:', updateError)
      return NextResponse.json(
        { error: 'Failed to update property' },
        { status: 500 }
      )
    }

    // Update location if provided
    if (validatedData.location) {
      const locationUpdateData: any = {}
      
      if (validatedData.location.coordinates !== undefined) locationUpdateData.coordinates = validatedData.location.coordinates
      if (validatedData.location.plusCode !== undefined) locationUpdateData.plus_code = validatedData.location.plusCode
      if (validatedData.location.address !== undefined) locationUpdateData.address = validatedData.location.address
      if (validatedData.location.city !== undefined) locationUpdateData.city = validatedData.location.city
      if (validatedData.location.region !== undefined) locationUpdateData.region = validatedData.location.region

      if (Object.keys(locationUpdateData).length > 0) {
        const { error: locationError } = await supabase
          .from('properties_location')
          .update(locationUpdateData)
          .eq('property_id', params.id)

        if (locationError) {
          console.error('Error updating property location:', locationError)
          // Don't fail the request if location update fails
        }
      }
    }

    // Update images if provided
    if (validatedData.images !== undefined) {
      // First, delete existing images
      const { error: deleteImagesError } = await supabase
        .from('property_images')
        .delete()
        .eq('property_id', params.id)

      if (deleteImagesError) {
        console.error('Error deleting existing images:', deleteImagesError)
        // Don't fail the request if image deletion fails
      }

      // Insert new images if provided
      if (validatedData.images.length > 0) {
        const imageRecords = validatedData.images.map((imageUrl, index) => ({
          property_id: params.id,
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
    }

    // Get the complete updated property
    const { data: completeProperty, error: fetchError } = await supabase
      .from('properties')
      .select(`
        *,
        location:properties_location(*),
        images:property_images(*)
      `)
      .eq('id', params.id)
      .single()

    if (fetchError) {
      console.error('Error fetching complete property:', fetchError)
      // Return the basic updated property if we can't fetch the complete one
      return NextResponse.json({
        message: 'Property updated successfully',
        property: updatedProperty
      })
    }

    return NextResponse.json({
      message: 'Property updated successfully',
      property: completeProperty
    })

  } catch (error) {
    console.error('Agent property PUT error:', error)
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    if (error.message.includes('Insufficient permissions') || 
        error.message.includes('Access denied') ||
        error.message.includes('Property not found')) {
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

// DELETE /api/agent/properties/[id] - Delete a property
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createApiRouteSupabaseClient()
    
    // Verify agent access
    const agentUser = await requireAgent(supabase)
    
    // Verify property ownership
    await verifyPropertyOwnership(supabase, agentUser, params.id)

    // Delete related records first (due to foreign key constraints)
    
    // Delete property images
    const { error: deleteImagesError } = await supabase
      .from('property_images')
      .delete()
      .eq('property_id', params.id)

    if (deleteImagesError) {
      console.error('Error deleting property images:', deleteImagesError)
      // Continue with deletion even if image deletion fails
    }

    // Delete property location
    const { error: deleteLocationError } = await supabase
      .from('properties_location')
      .delete()
      .eq('property_id', params.id)

    if (deleteLocationError) {
      console.error('Error deleting property location:', deleteLocationError)
      // Continue with deletion even if location deletion fails
    }

    // Delete the property
    const { error: deletePropertyError } = await supabase
      .from('properties')
      .delete()
      .eq('id', params.id)

    if (deletePropertyError) {
      console.error('Error deleting property:', deletePropertyError)
      return NextResponse.json(
        { error: 'Failed to delete property' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Property deleted successfully'
    })

  } catch (error) {
    console.error('Agent property DELETE error:', error)
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    if (error.message.includes('Insufficient permissions') || 
        error.message.includes('Access denied') ||
        error.message.includes('Property not found')) {
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
