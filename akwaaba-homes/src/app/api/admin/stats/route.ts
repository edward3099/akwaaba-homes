import { NextRequest, NextResponse } from 'next/server';
import { createApiRouteSupabaseClient } from '@/lib/supabase/server';

// Admin authentication middleware
async function requireAdmin(supabase: any) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  const { data: userProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!userProfile || !['admin', 'super_admin'].includes(userProfile.role)) {
    throw new Error('Insufficient permissions');
  }

  return user;
}

export async function GET(request: NextRequest) {
  try {
    console.log('🎯 Admin stats API called');
    
    const supabase = await createApiRouteSupabaseClient();
    
    // Verify admin access
    await requireAdmin(supabase);

    // Get property statistics
    const { data: propertyStats, error: propertyStatsError } = await supabase
      .from('properties')
      .select('status')
      .not('status', 'is', null);

    if (propertyStatsError) {
      console.error('❌ Error fetching property stats:', propertyStatsError);
      return NextResponse.json(
        { error: 'Failed to fetch property statistics' },
        { status: 500 }
      );
    }

    // Count properties by status
    const statusCounts = propertyStats.reduce((acc: any, property: any) => {
      acc[property.status] = (acc[property.status] || 0) + 1;
      return acc;
    }, {});

    // Get user statistics
    const { count: totalUsers, error: usersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (usersError) {
      console.error('❌ Error fetching user stats:', usersError);
    }

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: recentProperties, error: recentError } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString());

    if (recentError) {
      console.error('❌ Error fetching recent properties:', recentError);
    }

    const stats = {
      properties: {
        total: propertyStats.length,
        byStatus: statusCounts,
        recent: recentProperties || 0
      },
      users: {
        total: totalUsers || 0
      },
      period: {
        days: 7,
        from: sevenDaysAgo.toISOString(),
        to: new Date().toISOString()
      }
    };

    console.log('✅ Admin stats fetched successfully');

    return NextResponse.json({
      stats
    });

  } catch (error) {
    console.error('❌ Admin stats API error:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (error.message === 'Insufficient permissions') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
