import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

const querySchema = z.object({
  limit: z.string().transform(Number).default('20'),
  type: z.enum(['all', 'properties', 'users', 'agents', 'payments']).default('all')
})

// Define activity interface
interface Activity {
  id: string
  type: string
  action: string
  title: string
  description: string
  status: string
  timestamp: string
  metadata: Record<string, any>
  tier?: string
  role?: string
  amount?: number
}

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
    const validatedData = querySchema.parse(Object.fromEntries(searchParams.entries()))

    const limit = Math.min(validatedData.limit, 100) // Cap at 100

    let recentActivity

    switch (validatedData.type) {
      case 'properties':
        recentActivity = await getPropertyActivity(supabase, limit)
        break
      case 'users':
        recentActivity = await getUserActivity(supabase, limit)
        break
      case 'agents':
        recentActivity = await getAgentActivity(supabase, limit)
        break
      case 'payments':
        recentActivity = await getPaymentActivity(supabase, limit)
        break
      default:
        recentActivity = await getAllActivity(supabase, limit)
    }

    return NextResponse.json(recentActivity)

  } catch (error) {
    console.error('Admin dashboard recent activity error:', error)
    
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
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function getAllActivity(supabase: any, limit: number) {
  const activities: Activity[] = []

  // Get recent property activities
  const { data: properties } = await supabase
    .from('properties')
    .select('id, title, status, tier, created_at, updated_at, owner_id')
    .order('updated_at', { ascending: false })
    .limit(Math.ceil(limit / 4))

  // Get recent user activities
  const { data: users } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email, role, is_verified, created_at, updated_at')
    .order('updated_at', { ascending: false })
    .limit(Math.ceil(limit / 4))

  // Get recent admin logs
  const { data: adminLogs } = await supabase
    .from('admin_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(Math.ceil(limit / 4))

  // Get recent analytics updates
  const { data: analytics } = await supabase
    .from('analytics')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(Math.ceil(limit / 4))

  // Process property activities
  properties?.forEach(property => {
    activities.push({
      id: `property-${property.id}`,
      type: 'property',
      action: property.status === 'pending' ? 'pending_approval' : 
              property.status === 'verified' ? 'verified' : 
              property.status === 'rejected' ? 'rejected' : 'updated',
      title: `Property: ${property.title}`,
      description: `Property ${property.title} ${property.status}`,
      status: property.status,
      tier: property.tier,
      timestamp: property.updated_at || property.created_at,
      metadata: {
        propertyId: property.id,
        ownerId: property.owner_id,
        status: property.status,
        tier: property.tier
      }
    })
  })

  // Process user activities
  users?.forEach(user => {
    activities.push({
      id: `user-${user.id}`,
      type: 'user',
      action: user.is_verified ? 'verified' : 'registered',
      title: `User: ${user.first_name} ${user.last_name}`,
      description: `${user.role} ${user.first_name} ${user.last_name} ${user.is_verified ? 'verified' : 'registered'}`,
      status: user.is_verified ? 'verified' : 'pending',
      role: user.role,
      timestamp: user.updated_at || user.created_at,
      metadata: {
        userId: user.id,
        email: user.email,
        role: user.role,
        isVerified: user.is_verified
      }
    })
  })

  // Process admin log activities
  adminLogs?.forEach(log => {
    activities.push({
      id: `log-${log.id}`,
      type: 'admin_action',
      action: log.action || 'system_action',
      title: `Admin Action: ${log.action || 'System'}`,
      description: log.description || log.action || 'Admin action performed',
      status: log.status || 'completed',
      timestamp: log.created_at,
      metadata: {
        logId: log.id,
        adminId: log.admin_id,
        action: log.action,
        details: log.details
      }
    })
  })

  // Process analytics activities
  analytics?.forEach(record => {
    activities.push({
      id: `analytics-${record.id}`,
      type: 'analytics',
      action: 'data_updated',
      title: 'Analytics Updated',
      description: 'Platform analytics data updated',
      status: 'completed',
      timestamp: record.created_at,
      metadata: {
        analyticsId: record.id,
        dataType: 'platform_metrics',
        period: record.period
      }
    })
  })

  // Sort all activities by timestamp and limit
  return {
    activities: activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit),
    total: activities.length,
    summary: {
      properties: properties?.length || 0,
      users: users?.length || 0,
      adminActions: adminLogs?.length || 0,
      analytics: analytics?.length || 0
    }
  }
}

async function getPropertyActivity(supabase: any, limit: number) {
  const { data: properties } = await supabase
    .from('properties')
    .select('id, title, status, tier, created_at, updated_at, owner_id')
    .order('updated_at', { ascending: false })
    .limit(limit)

  const activities: Activity[] = properties?.map(property => ({
    id: `property-${property.id}`,
    type: 'property',
    action: property.status === 'pending' ? 'pending_approval' : 
            property.status === 'verified' ? 'verified' : 
            property.status === 'rejected' ? 'rejected' : 'updated',
    title: `Property: ${property.title}`,
    description: `Property ${property.title} ${property.status}`,
    status: property.status,
    tier: property.tier,
    timestamp: property.updated_at || property.created_at,
    metadata: {
      propertyId: property.id,
      ownerId: property.owner_id,
      status: property.status,
      tier: property.tier
    }
  })) || []

  return {
    activities,
    total: activities.length,
    type: 'properties'
  }
}

async function getUserActivity(supabase: any, limit: number) {
  const { data: users } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email, role, is_verified, created_at, updated_at')
    .order('updated_at', { ascending: false })
    .limit(limit)

  const activities: Activity[] = users?.map(user => ({
    id: `user-${user.id}`,
    type: 'user',
    action: user.is_verified ? 'verified' : 'registered',
    title: `User: ${user.first_name} ${user.last_name}`,
    description: `${user.role} ${user.first_name} ${user.last_name} ${user.is_verified ? 'verified' : 'registered'}`,
    status: user.is_verified ? 'verified' : 'pending',
    role: user.role,
    timestamp: user.updated_at || user.created_at,
    metadata: {
      userId: user.id,
      email: user.email,
      role: user.role,
      isVerified: user.is_verified
    }
  })) || []

  return {
    activities,
    total: activities.length,
    type: 'users'
  }
}

async function getAgentActivity(supabase: any, limit: number) {
  const { data: agents } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email, is_verified, created_at, updated_at')
    .eq('role', 'agent')
    .order('updated_at', { ascending: false })
    .limit(limit)

  const activities: Activity[] = agents?.map(agent => ({
    id: `agent-${agent.id}`,
    type: 'agent',
    action: agent.is_verified ? 'verified' : 'registered',
    title: `Agent: ${agent.first_name} ${agent.last_name}`,
    description: `Agent ${agent.first_name} ${agent.last_name} ${agent.is_verified ? 'verified' : 'registered'}`,
    status: agent.is_verified ? 'verified' : 'pending',
    timestamp: agent.updated_at || agent.created_at,
    metadata: {
      agentId: agent.id,
      email: agent.email,
      isVerified: agent.is_verified
    }
  })) || []

  return {
    activities,
    total: activities.length,
    type: 'agents'
  }
}

async function getPaymentActivity(supabase: any, limit: number) {
  // This would typically come from a payments/transactions table
  // For now, we'll return mock data structure
  const { data: analytics } = await supabase
    .from('analytics')
    .select('id, created_at, premium_revenue')
    .order('created_at', { ascending: false })
    .limit(limit)

  const activities: Activity[] = analytics?.map(record => ({
    id: `payment-${record.id}`,
    type: 'payment',
    action: 'revenue_recorded',
    title: 'Premium Revenue Recorded',
    description: `Premium listing revenue: GHS ${record.premium_revenue || 0}`,
    status: 'completed',
    amount: record.premium_revenue || 0,
    timestamp: record.created_at,
    metadata: {
      analyticsId: record.id,
      revenue: record.premium_revenue || 0,
      type: 'premium_listing'
    }
  })) || []

  return {
    activities,
    total: activities.length,
    type: 'payments'
  }
}
