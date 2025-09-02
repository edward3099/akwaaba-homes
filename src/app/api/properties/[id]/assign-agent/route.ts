import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

const assignAgentSchema = z.object({
  agent_id: z.string().uuid('Invalid agent ID'),
  notes: z.string().optional()
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
    const { agent_id, notes } = assignAgentSchema.parse(body)

    const propertyId = params.id

    // Check if property exists and user has permission
    const { data: property, error: fetchError } = await supabase
      .from('properties')
      .select('id, seller_id, agent_id, deleted_at')
      .eq('id', propertyId)
      .single()

    if (fetchError || !property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Check if property is deleted
    if (property.deleted_at) {
      return NextResponse.json(
        { error: 'Cannot assign agent to deleted property' },
        { status: 400 }
      )
    }

    // Check if user owns the property or is admin
    if (property.seller_id !== user.id) {
      // TODO: Add admin role check here
      return NextResponse.json(
        { error: 'Forbidden: You can only assign agents to your own properties' },
        { status: 403 }
      )
    }

    // Verify the agent exists and has the correct role
    const { data: agent, error: agentError } = await supabase
      .from('profiles')
      .select('id, role, is_active')
      .eq('id', agent_id)
      .eq('role', 'agent')
      .eq('is_active', true)
      .single()

    if (agentError || !agent) {
      return NextResponse.json(
        { error: 'Invalid agent or agent not found' },
        { status: 400 }
      )
    }

    // Update the property with the new agent
    const { data: updatedProperty, error: updateError } = await supabase
      .from('properties')
      .update({
        agent_id: agent_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', propertyId)
      .select(`
        id,
        title,
        agent_id,
        updated_at
      `)
      .single()

    if (updateError) {
      console.error('Agent assignment error:', updateError)
      return NextResponse.json(
        { error: 'Failed to assign agent to property' },
        { status: 500 }
      )
    }

    // Log the agent assignment (optional)
    console.log(`Property ${propertyId} assigned to agent ${agent_id} by user ${user.id} at ${new Date().toISOString()}`)

    return NextResponse.json({
      success: true,
      message: 'Agent assigned successfully',
      property: updatedProperty
    })

  } catch (error) {
    console.error('Agent assignment error:', error)
    
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

// Remove agent assignment
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

    // Check if property exists and user has permission
    const { data: property, error: fetchError } = await supabase
      .from('properties')
      .select('id, seller_id, agent_id, deleted_at')
      .eq('id', propertyId)
      .single()

    if (fetchError || !property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Check if property is deleted
    if (property.deleted_at) {
      return NextResponse.json(
        { error: 'Cannot modify deleted property' },
        { status: 400 }
      )
    }

    // Check if user owns the property or is admin
    if (property.seller_id !== user.id) {
      // TODO: Add admin role check here
      return NextResponse.json(
        { error: 'Forbidden: You can only modify your own properties' },
        { status: 403 }
      )
    }

    // Check if property has an agent assigned
    if (!property.agent_id) {
      return NextResponse.json(
        { error: 'Property has no agent assigned' },
        { status: 400 }
      )
    }

    // Remove the agent assignment
    const { data: updatedProperty, error: updateError } = await supabase
      .from('properties')
      .update({
        agent_id: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', propertyId)
      .select(`
        id,
        title,
        agent_id,
        updated_at
      `)
      .single()

    if (updateError) {
      console.error('Agent removal error:', updateError)
      return NextResponse.json(
        { error: 'Failed to remove agent from property' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Agent removed successfully',
      property: updatedProperty
    })

  } catch (error) {
    console.error('Agent removal error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
