import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

const softDeleteSchema = z.object({
  reason: z.string().optional(),
  permanent: z.boolean().default(false)
})

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
    const { reason, permanent } = softDeleteSchema.parse(body)

    const propertyId = params.id

    // Check if property exists and user has permission
    const { data: property, error: fetchError } = await supabase
      .from('properties')
      .select('id, seller_id, deleted_at')
      .eq('id', propertyId)
      .single()

    if (fetchError || !property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Check if already deleted
    if (property.deleted_at) {
      return NextResponse.json(
        { error: 'Property is already deleted' },
        { status: 400 }
      )
    }

    // Check if user owns the property or is admin
    if (property.seller_id !== user.id) {
      // TODO: Add admin role check here
      return NextResponse.json(
        { error: 'Forbidden: You can only delete your own properties' },
        { status: 403 }
      )
    }

    // Perform soft delete
    const { data: updatedProperty, error: updateError } = await supabase
      .from('properties')
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', propertyId)
      .select()
      .single()

    if (updateError) {
      console.error('Soft delete error:', updateError)
      return NextResponse.json(
        { error: 'Failed to delete property' },
        { status: 500 }
      )
    }

    // Log the soft delete action (optional)
    console.log(`Property ${propertyId} soft-deleted by user ${user.id} at ${new Date().toISOString()}`)

    return NextResponse.json({
      success: true,
      message: 'Property deleted successfully',
      property: updatedProperty
    })

  } catch (error) {
    console.error('Soft delete error:', error)
    
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

// Optional: Add restore functionality
export async function DELETE(
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

    // Check if property exists and is soft-deleted
    const { data: property, error: fetchError } = await supabase
      .from('properties')
      .select('id, seller_id, deleted_at')
      .eq('id', propertyId)
      .single()

    if (fetchError || !property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Check if not deleted
    if (!property.deleted_at) {
      return NextResponse.json(
        { error: 'Property is not deleted' },
        { status: 400 }
      )
    }

    // Check if user owns the property or is admin
    if (property.seller_id !== user.id) {
      // TODO: Add admin role check here
      return NextResponse.json(
        { error: 'Forbidden: You can only restore your own properties' },
        { status: 403 }
      )
    }

    // Restore the property
    const { data: restoredProperty, error: updateError } = await supabase
      .from('properties')
      .update({
        deleted_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', propertyId)
      .select()
      .single()

    if (updateError) {
      console.error('Restore error:', updateError)
      return NextResponse.json(
        { error: 'Failed to restore property' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Property restored successfully',
      property: restoredProperty
    })

  } catch (error) {
    console.error('Restore error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
