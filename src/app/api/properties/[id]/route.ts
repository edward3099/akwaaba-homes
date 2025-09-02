import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { PropertySchema } from '@/lib/schemas/property'

// Schema for property updates (all fields optional except id)
const PropertyUpdateSchema = PropertySchema.partial().omit({ id: true })

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const validatedData = PropertyUpdateSchema.parse(body)
    
    const propertyId = params.id

    // Check if property exists and user has permission to update it
    const { data: existingProperty, error: fetchError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .eq('seller_id', user.id)
      .single()

    if (fetchError || !existingProperty) {
      return NextResponse.json(
        { error: 'Property not found or not authorized to update' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData = {
      ...validatedData,
      updated_at: new Date().toISOString()
    }

    // Update the property
    const { data: updatedProperty, error: updateError } = await supabase
      .from('properties')
      .update(updateData)
      .eq('id', propertyId)
      .eq('seller_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Property update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update property', details: updateError.message },
        { status: 500 }
      )
    }

    // Handle image updates if provided
    if (validatedData.images && Array.isArray(validatedData.images)) {
      // First, remove existing images for this property
      await supabase
        .from('property_images')
        .delete()
        .eq('property_id', propertyId)

      // Then insert new images
      if (validatedData.images.length > 0) {
        const imageData = validatedData.images.map((image, index) => ({
          property_id: propertyId,
          url: image.url,
          is_primary: image.is_primary || index === 0,
          order_index: index
        }))

        const { error: imageError } = await supabase
          .from('property_images')
          .insert(imageData)

        if (imageError) {
          console.error('Image update error:', imageError)
          // Don't fail the entire update, but log the error
        }
      }
    }

    return NextResponse.json(
      { 
        message: 'Property updated successfully', 
        property: updatedProperty 
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('API error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request body', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const propertyId = params.id

    // Fetch property with images
    const { data: property, error: fetchError } = await supabase
      .from('properties')
      .select(`
        *,
        property_images (
          id,
          url,
          is_primary,
          order_index
        )
      `)
      .eq('id', propertyId)
      .eq('seller_id', user.id)
      .single()

    if (fetchError || !property) {
      return NextResponse.json(
        { error: 'Property not found or not authorized to view' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { property },
      { status: 200 }
    )

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
