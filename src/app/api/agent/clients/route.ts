import { NextRequest, NextResponse } from 'next/server'
import { createApiRouteSupabaseClient } from '@/lib/supabase/server'

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

// GET /api/agent/clients - List agent's clients
export async function GET(request: NextRequest) {
  try {
    const supabase = await createApiRouteSupabaseClient()
    
    // Verify agent access
    const agentUser = await requireAgent(supabase)

    // Get query parameters for filtering and pagination
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Build the query to get clients who have inquired about this agent's properties
    let query = supabase
      .from('inquiries')
      .select(`
        id,
        created_at,
        status,
        message,
        client:profiles!inquiries_client_id_fkey(
          id,
          first_name,
          last_name,
          email,
          phone,
          user_type
        ),
        property:properties(
          id,
          title,
          price,
          property_type
        )
      `)
      .eq('property.owner_id', agentUser.id)

    // Apply filters
    if (search) {
      query = query.or(`
        client.first_name.ilike.%${search}%,
        client.last_name.ilike.%${search}%,
        client.email.ilike.%${search}%,
        property.title.ilike.%${search}%
      `)
    }
    
    if (status) {
      query = query.eq('status', status)
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('inquiries')
      .select('*', { count: 'exact', head: true })
      .eq('property.owner_id', agentUser.id)

    // Apply pagination and get results
    const { data: inquiries, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching clients:', error)
      return NextResponse.json(
        { error: 'Failed to fetch clients' },
        { status: 500 }
      )
    }

    // Transform the data to a more client-focused structure
    const clients = inquiries?.map(inquiry => ({
      id: inquiry.client.id,
      name: `${inquiry.client.first_name} ${inquiry.client.last_name}`,
      email: inquiry.client.email,
      phone: inquiry.client.phone,
      userType: inquiry.client.user_type,
      lastContact: inquiry.created_at,
      status: inquiry.status,
      lastMessage: inquiry.message,
      interestedIn: inquiry.property.title,
      propertyId: inquiry.property.id,
      propertyType: inquiry.property.property_type,
      propertyPrice: inquiry.property.price
    })) || []

    // Remove duplicates (same client might have multiple inquiries)
    const uniqueClients = clients.filter((client, index, self) => 
      index === self.findIndex(c => c.id === client.id)
    )

    return NextResponse.json({
      clients: uniqueClients,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Agent clients GET error:', error)
    
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
