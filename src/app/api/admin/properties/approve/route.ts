import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

const approveSchema = z.object({
  propertyId: z.string().uuid(),
  action: z.enum(['approve', 'reject', 'request_changes']),
  reason: z.string().optional(),
  changes: z.array(z.string()).optional(),
  adminNotes: z.string().optional()
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

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verify admin access
    const adminUser = await requireAdmin(supabase)

    const body = await request.json()
    const validatedData = approveSchema.parse(body)

    // Get the property details
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', validatedData.propertyId)
      .single()

    if (propertyError || !property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Check if property is in a state that can be acted upon
    if (property.status !== 'pending' && property.status !== 'under_review') {
      return NextResponse.json(
        { error: 'Property is not in a state that can be approved/rejected' },
        { status: 400 }
      )
    }

    let newStatus: string
    let statusMessage: string

    switch (validatedData.action) {
      case 'approve':
        newStatus = 'verified'
        statusMessage = 'Property approved successfully'
        break
      case 'reject':
        newStatus = 'rejected'
        statusMessage = 'Property rejected'
        break
      case 'request_changes':
        newStatus = 'changes_requested'
        statusMessage = 'Changes requested for property'
        break
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    // Update property status
    const { error: updateError } = await supabase
      .from('properties')
      .update({
        status: newStatus,
        admin_reviewed_at: new Date().toISOString(),
        admin_reviewed_by: adminUser.id,
        admin_notes: validatedData.adminNotes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', validatedData.propertyId)

    if (updateError) {
      console.error('Error updating property status:', updateError)
      return NextResponse.json(
        { error: 'Failed to update property status' },
        { status: 500 }
      )
    }

    // Log the admin action
    const { error: logError } = await supabase
      .from('admin_logs')
      .insert({
        admin_id: adminUser.id,
        action: `property_${validatedData.action}`,
        target_type: 'property',
        target_id: validatedData.propertyId,
        details: {
          propertyId: validatedData.propertyId,
          action: validatedData.action,
          reason: validatedData.reason,
          changes: validatedData.changes,
          adminNotes: validatedData.adminNotes,
          previousStatus: property.status,
          newStatus: newStatus
        },
        status: 'completed',
        created_at: new Date().toISOString()
      })

    if (logError) {
      console.error('Error logging admin action:', logError)
      // Don't fail the request if logging fails
    }

    // If rejecting or requesting changes, send notification to property owner
    if (validatedData.action === 'reject' || validatedData.action === 'request_changes') {
      try {
        // Get property owner details
        const { data: owner } = await supabase
          .from('profiles')
          .select('email, first_name, last_name')
          .eq('id', property.owner_id)
          .single()

        if (owner) {
          // Here you would typically send an email notification
          // For now, we'll just log it
          console.log(`Notification would be sent to ${owner.email} about property ${validatedData.propertyId}`)
        }
      } catch (notificationError) {
        console.error('Error sending notification:', notificationError)
        // Don't fail the request if notification fails
      }
    }

    // Get updated property details
    const { data: updatedProperty } = await supabase
      .from('properties')
      .select('*')
      .eq('id', validatedData.propertyId)
      .single()

    return NextResponse.json({
      message: statusMessage,
      property: updatedProperty,
      action: validatedData.action,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Admin property approval error:', error)
    
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
