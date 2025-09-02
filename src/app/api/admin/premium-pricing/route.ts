import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

const pricingSchema = z.object({
  listingType: z.enum(['for-sale', 'for-rent', 'short-let']),
  priceGHS: z.number().positive(),
  duration: z.number().positive(), // days
  features: z.array(z.string()),
  isActive: z.boolean().default(true)
})

const updatePricingSchema = z.object({
  id: z.string().uuid(),
  priceGHS: z.number().positive().optional(),
  duration: z.number().positive().optional(),
  features: z.array(z.string()).optional(),
  isActive: z.boolean().optional()
})

// Admin authentication middleware
async function requireAdmin(supabase: any) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const { data: userProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!userProfile || !['admin', 'super_admin'].includes(userProfile.role)) {
    throw new Error('Insufficient permissions')
  }

  return user
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verify admin access
    await requireAdmin(supabase)

    const { searchParams } = new URL(request.url)
    const listingType = searchParams.get('listingType')
    const isActive = searchParams.get('isActive')

    let query = supabase
      .from('premium_pricing')
      .select('*')
      .order('created_at', { ascending: false })

    if (listingType) {
      query = query.eq('listing_type', listingType)
    }

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true')
    }

    const { data: pricing, error } = await query

    if (error) {
      console.error('Error fetching premium pricing:', error)
      return NextResponse.json(
        { error: 'Failed to fetch premium pricing' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      pricing: pricing || [],
      total: pricing?.length || 0
    })

  } catch (error) {
    console.error('Admin premium pricing GET error:', error)
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    if (error.message === 'Insufficient permissions') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verify admin access
    const adminUser = await requireAdmin(supabase)

    const body = await request.json()
    const validatedData = pricingSchema.parse(body)

    // Check if pricing already exists for this listing type
    const { data: existingPricing } = await supabase
      .from('premium_pricing')
      .select('id')
      .eq('listing_type', validatedData.listingType)
      .eq('is_active', true)
      .single()

    if (existingPricing) {
      return NextResponse.json(
        { error: 'Pricing already exists for this listing type. Use PUT to update existing pricing.' },
        { status: 409 }
      )
    }

    // Create new premium pricing
    const { data: newPricing, error: createError } = await supabase
      .from('premium_pricing')
      .insert({
        listing_type: validatedData.listingType,
        price_ghs: validatedData.priceGHS,
        duration: validatedData.duration,
        features: validatedData.features,
        is_active: validatedData.isActive,
        created_by: adminUser.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating premium pricing:', createError)
      return NextResponse.json(
        { error: 'Failed to create premium pricing' },
        { status: 500 }
      )
    }

    // Log the admin action
    const { error: logError } = await supabase
      .from('admin_logs')
      .insert({
        admin_id: adminUser.id,
        action: 'create_premium_pricing',
        target_type: 'premium_pricing',
        target_id: newPricing.id,
        details: {
          listingType: validatedData.listingType,
          priceGHS: validatedData.priceGHS,
          duration: validatedData.duration,
          features: validatedData.features,
          isActive: validatedData.isActive
        },
        status: 'completed',
        created_at: new Date().toISOString()
      })

    if (logError) {
      console.error('Error logging admin action:', logError)
      // Don't fail the request if logging fails
    }

    return NextResponse.json({
      message: 'Premium pricing created successfully',
      pricing: newPricing
    }, { status: 201 })

  } catch (error) {
    console.error('Admin premium pricing POST error:', error)
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    if (error.message === 'Insufficient permissions') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
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

export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verify admin access
    const adminUser = await requireAdmin(supabase)

    const body = await request.json()
    const validatedData = updatePricingSchema.parse(body)

    // Get existing pricing
    const { data: existingPricing, error: fetchError } = await supabase
      .from('premium_pricing')
      .select('*')
      .eq('id', validatedData.id)
      .single()

    if (fetchError || !existingPricing) {
      return NextResponse.json(
        { error: 'Premium pricing not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString(),
      updated_by: adminUser.id
    }

    if (validatedData.priceGHS !== undefined) updateData.price_ghs = validatedData.priceGHS
    if (validatedData.duration !== undefined) updateData.duration = validatedData.duration
    if (validatedData.features !== undefined) updateData.features = validatedData.features
    if (validatedData.isActive !== undefined) updateData.is_active = validatedData.isActive

    // Update premium pricing
    const { data: updatedPricing, error: updateError } = await supabase
      .from('premium_pricing')
      .update(updateData)
      .eq('id', validatedData.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating premium pricing:', updateError)
      return NextResponse.json(
        { error: 'Failed to update premium pricing' },
        { status: 500 }
      )
    }

    // Log the admin action
    const { error: logError } = await supabase
      .from('admin_logs')
      .insert({
        admin_id: adminUser.id,
        action: 'update_premium_pricing',
        target_type: 'premium_pricing',
        target_id: validatedData.id,
        details: {
          previousData: existingPricing,
          newData: updatedPricing,
          changes: updateData
        },
        status: 'completed',
        created_at: new Date().toISOString()
      })

    if (logError) {
      console.error('Error logging admin action:', logError)
      // Don't fail the request if logging fails
    }

    return NextResponse.json({
      message: 'Premium pricing updated successfully',
      pricing: updatedPricing
    })

  } catch (error) {
    console.error('Admin premium pricing PUT error:', error)
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    if (error.message === 'Insufficient permissions') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
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

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verify admin access
    const adminUser = await requireAdmin(supabase)

    const { searchParams } = new URL(request.url)
    const pricingId = searchParams.get('id')

    if (!pricingId) {
      return NextResponse.json(
        { error: 'Pricing ID is required' },
        { status: 400 }
      )
    }

    // Get existing pricing for logging
    const { data: existingPricing } = await supabase
      .from('premium_pricing')
      .select('*')
      .eq('id', pricingId)
      .single()

    if (!existingPricing) {
      return NextResponse.json(
        { error: 'Premium pricing not found' },
        { status: 404 }
      )
    }

    // Soft delete by setting is_active to false
    const { error: deleteError } = await supabase
      .from('premium_pricing')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
        updated_by: adminUser.id
      })
      .eq('id', pricingId)

    if (deleteError) {
      console.error('Error deleting premium pricing:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete premium pricing' },
        { status: 500 }
      )
    }

    // Log the admin action
    const { error: logError } = await supabase
      .from('admin_logs')
      .insert({
        admin_id: adminUser.id,
        action: 'delete_premium_pricing',
        target_type: 'premium_pricing',
        target_id: pricingId,
        details: {
          deletedPricing: existingPricing
        },
        status: 'completed',
        created_at: new Date().toISOString()
      })

    if (logError) {
      console.error('Error logging admin action:', logError)
      // Don't fail the request if logging fails
    }

    return NextResponse.json({
      message: 'Premium pricing deleted successfully'
    })

  } catch (error) {
    console.error('Admin premium pricing DELETE error:', error)
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    if (error.message === 'Insufficient permissions') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
