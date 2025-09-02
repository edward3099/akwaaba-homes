import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

const querySchema = z.object({
  period: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
  metric: z.enum(['properties', 'users', 'revenue', 'views']).default('properties')
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
    const validatedData = querySchema.parse(Object.fromEntries(searchParams.entries()))

    // Calculate date range based on period
    const endDate = new Date()
    const startDate = new Date()
    
    switch (validatedData.period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(endDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(endDate.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
    }

    let chartData

    switch (validatedData.metric) {
      case 'properties':
        chartData = await getPropertyChartData(supabase, startDate, endDate)
        break
      case 'users':
        chartData = await getUserChartData(supabase, startDate, endDate)
        break
      case 'revenue':
        chartData = await getRevenueChartData(supabase, startDate, endDate)
        break
      case 'views':
        chartData = await getViewsChartData(supabase, startDate, endDate)
        break
      default:
        chartData = await getPropertyChartData(supabase, startDate, endDate)
    }

    return NextResponse.json(chartData)

  } catch (error) {
    console.error('Admin dashboard chart data error:', error)
    
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

async function getPropertyChartData(supabase: any, startDate: Date, endDate: Date) {
  const { data: properties } = await supabase
    .from('properties')
    .select('created_at, status, tier')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .order('created_at', { ascending: true })

  // Group by date and count properties
  const dailyCounts = new Map()
  const currentDate = new Date(startDate)
  
  while (currentDate <= endDate) {
    const dateKey = currentDate.toISOString().split('T')[0]
    dailyCounts.set(dateKey, {
      date: dateKey,
      total: 0,
      verified: 0,
      pending: 0,
      premium: 0
    })
    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Count properties for each day
  properties?.forEach(property => {
    const dateKey = new Date(property.created_at).toISOString().split('T')[0]
    if (dailyCounts.has(dateKey)) {
      const dayData = dailyCounts.get(dateKey)
      dayData.total++
      
      if (property.status === 'verified') dayData.verified++
      if (property.status === 'pending') dayData.pending++
      if (property.tier === 'premium') dayData.premium++
    }
  })

  return {
    metric: 'properties',
    period: 'daily',
    data: Array.from(dailyCounts.values()),
    summary: {
      total: properties?.length || 0,
      verified: properties?.filter(p => p.status === 'verified').length || 0,
      pending: properties?.filter(p => p.status === 'pending').length || 0,
      premium: properties?.filter(p => p.tier === 'premium').length || 0
    }
  }
}

async function getUserChartData(supabase: any, startDate: Date, endDate: Date) {
  const { data: users } = await supabase
    .from('profiles')
    .select('created_at, role, is_verified')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .order('created_at', { ascending: true })

  // Group by date and count users
  const dailyCounts = new Map()
  const currentDate = new Date(startDate)
  
  while (currentDate <= endDate) {
    const dateKey = currentDate.toISOString().split('T')[0]
    dailyCounts.set(dateKey, {
      date: dateKey,
      total: 0,
      agents: 0,
      sellers: 0,
      buyers: 0,
      verified: 0
    })
    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Count users for each day
  users?.forEach(user => {
    const dateKey = new Date(user.created_at).toISOString().split('T')[0]
    if (dailyCounts.has(dateKey)) {
      const dayData = dailyCounts.get(dateKey)
      dayData.total++
      
      if (user.role === 'agent') dayData.agents++
      if (user.role === 'seller') dayData.sellers++
      if (user.role === 'buyer') dayData.buyers++
      if (user.is_verified) dayData.verified++
    }
  })

  return {
    metric: 'users',
    period: 'daily',
    data: Array.from(dailyCounts.values()),
    summary: {
      total: users?.length || 0,
      agents: users?.filter(u => u.role === 'agent').length || 0,
      sellers: users?.filter(u => u.role === 'seller').length || 0,
      buyers: users?.filter(u => u.role === 'buyer').length || 0,
      verified: users?.filter(u => u.is_verified).length || 0
    }
  }
}

async function getRevenueChartData(supabase: any, startDate: Date, endDate: Date) {
  // This would typically come from a payments/transactions table
  // For now, we'll return mock data structure
  const { data: analytics } = await supabase
    .from('analytics')
    .select('created_at, premium_revenue')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .order('created_at', { ascending: true })

  // Group by date and sum revenue
  const dailyRevenue = new Map()
  const currentDate = new Date(startDate)
  
  while (currentDate <= endDate) {
    const dateKey = currentDate.toISOString().split('T')[0]
    dailyRevenue.set(dateKey, {
      date: dateKey,
      revenue: 0,
      premiumListings: 0
    })
    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Sum revenue for each day
  analytics?.forEach(record => {
    const dateKey = new Date(record.created_at).toISOString().split('T')[0]
    if (dailyRevenue.has(dateKey)) {
      const dayData = dailyRevenue.get(dateKey)
      dayData.revenue += record.premium_revenue || 0
      dayData.premiumListings++
    }
  })

  return {
    metric: 'revenue',
    period: 'daily',
    data: Array.from(dailyRevenue.values()),
    summary: {
      totalRevenue: analytics?.reduce((sum, record) => sum + (record.premium_revenue || 0), 0) || 0,
      averageDailyRevenue: analytics?.length ? 
        analytics.reduce((sum, record) => sum + (record.premium_revenue || 0), 0) / analytics.length : 0,
      totalPremiumListings: analytics?.length || 0
    }
  }
}

async function getViewsChartData(supabase: any, startDate: Date, endDate: Date) {
  // This would typically come from a property_views or analytics table
  // For now, we'll return mock data structure
  const { data: properties } = await supabase
    .from('properties')
    .select('id, created_at')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  // Mock view data for demonstration
  const dailyViews = new Map()
  const currentDate = new Date(startDate)
  
  while (currentDate <= endDate) {
    const dateKey = currentDate.toISOString().split('T')[0]
    dailyViews.set(dateKey, {
      date: dateKey,
      views: Math.floor(Math.random() * 100) + 50, // Mock data
      uniqueVisitors: Math.floor(Math.random() * 30) + 20
    })
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return {
    metric: 'views',
    period: 'daily',
    data: Array.from(dailyViews.values()),
    summary: {
      totalViews: Array.from(dailyViews.values()).reduce((sum, day) => sum + day.views, 0),
      totalUniqueVisitors: Array.from(dailyViews.values()).reduce((sum, day) => sum + day.uniqueVisitors, 0),
      averageDailyViews: Array.from(dailyViews.values()).reduce((sum, day) => sum + day.views, 0) / dailyViews.size
    }
  }
}
