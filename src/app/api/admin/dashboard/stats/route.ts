import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

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

    // Get platform statistics
    const [
      propertiesStats,
      usersStats,
      agentsStats,
      analyticsStats
    ] = await Promise.all([
      // Property statistics
      supabase
        .from('properties')
        .select('status, tier, property_type, listing_type', { count: 'exact' }),
      
      // User statistics
      supabase
        .from('profiles')
        .select('role, is_verified, is_active, created_at', { count: 'exact' }),
      
      // Agent statistics
      supabase
        .from('profiles')
        .select('role, is_verified, created_at', { count: 'exact' })
        .eq('role', 'agent'),
      
      // Analytics statistics
      supabase
        .from('analytics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
    ])

    // Process property statistics
    const properties = propertiesStats.data || []
    const propertyStats = {
      totalProperties: properties.length,
      pendingApproval: properties.filter(p => p.status === 'pending').length,
      verifiedProperties: properties.filter(p => p.status === 'verified').length,
      rejectedProperties: properties.filter(p => p.status === 'rejected').length,
      premiumProperties: properties.filter(p => p.tier === 'premium').length,
      forSaleProperties: properties.filter(p => p.listing_type === 'for-sale').length,
      forRentProperties: properties.filter(p => p.listing_type === 'for-rent').length,
      shortLetProperties: properties.filter(p => p.listing_type === 'short-let').length
    }

    // Process user statistics
    const users = usersStats.data || []
    const userStats = {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.is_active).length,
      verifiedUsers: users.filter(u => u.is_verified).length,
      pendingVerification: users.filter(u => !u.is_verified && u.is_active).length,
      suspendedUsers: users.filter(u => !u.is_active).length,
      newRegistrations: users.filter(u => {
        const createdAt = new Date(u.created_at)
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        return createdAt >= oneWeekAgo
      }).length,
      userTypes: {
        buyers: users.filter(u => u.role === 'buyer').length,
        sellers: users.filter(u => u.role === 'seller').length,
        agents: users.filter(u => u.role === 'agent').length,
        developers: users.filter(u => u.role === 'developer').length
      }
    }

    // Process agent statistics
    const agents = agentsStats.data || []
    const agentStats = {
      totalAgents: agents.length,
      verifiedAgents: agents.filter(a => a.is_verified).length,
      pendingVerification: agents.filter(a => !a.is_verified).length,
      newAgents: agents.filter(a => {
        const createdAt = new Date(a.created_at)
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        return createdAt >= oneWeekAgo
      }).length
    }

    // Get recent activity count
    const { count: recentActivityCount } = await supabase
      .from('admin_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    // Get premium revenue (if analytics table has this data)
    let premiumRevenue = 0
    if (analyticsStats.data && analyticsStats.data.length > 0) {
      const latestAnalytics = analyticsStats.data[0]
      premiumRevenue = latestAnalytics.premium_revenue || 0
    }

    const dashboardStats = {
      properties: propertyStats,
      users: userStats,
      agents: agentStats,
      platform: {
        totalListings: propertyStats.totalProperties,
        totalUsers: userStats.totalUsers,
        totalAgents: agentStats.totalAgents,
        recentActivity: recentActivityCount || 0,
        premiumRevenue: premiumRevenue
      },
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json(dashboardStats)

  } catch (error) {
    console.error('Admin dashboard stats error:', error)
    
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
