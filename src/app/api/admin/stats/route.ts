import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is an admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile || profile.user_role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    // Fetch admin statistics
    const [
      { count: totalUsers },
      { count: totalProperties },
      { count: totalInquiries },
      { count: pendingProperties },
      { count: verifiedAgents }
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('properties').select('*', { count: 'exact', head: true }),
      supabase.from('inquiries').select('*', { count: 'exact', head: true }),
      supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('user_role', 'agent').eq('is_verified', true)
    ])

    // Fetch recent activity
    const { data: recentProperties } = await supabase
      .from('properties')
      .select('id, title, status, created_at, profiles!properties_seller_id_fkey(full_name)')
      .order('created_at', { ascending: false })
      .limit(5)

    const { data: recentUsers } = await supabase
      .from('profiles')
      .select('id, full_name, user_role, created_at')
      .order('created_at', { ascending: false })
      .limit(5)

    // Calculate growth metrics (simplified - you might want to implement proper date-based calculations)
    const stats = {
      overview: {
        totalUsers: totalUsers || 0,
        totalProperties: totalProperties || 0,
        totalInquiries: totalInquiries || 0,
        pendingProperties: pendingProperties || 0,
        verifiedAgents: verifiedAgents || 0
      },
      recentActivity: {
        properties: recentProperties || [],
        users: recentUsers || []
      },
      systemHealth: {
        status: 'healthy',
        lastUpdated: new Date().toISOString()
      }
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Admin stats API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
