import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
          }
        },
      },
    }
  );
    
    // Check if user is authenticated and is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '6m';

    // Get user growth data
    const { data: userGrowth, error: userError } = await supabase
      .from('profiles')
      .select('created_at, role')
      .gte('created_at', getDateFromTimeRange(timeRange));

    // Get property metrics
    const { data: propertyMetrics, error: propertyError } = await supabase
      .from('properties')
      .select('created_at, status, views')
      .gte('created_at', getDateFromTimeRange(timeRange));

    // Get revenue data (mock for now)
    const revenueData = generateMockRevenueData(timeRange);

    // Calculate platform stats
    const platformStats = await calculatePlatformStats(supabase);

    // Generate mock analytics data (replace with actual calculations when available)
    const analyticsData = {
      userGrowth: generateUserGrowthData(userGrowth || [], timeRange),
      propertyMetrics: generatePropertyMetricsData(propertyMetrics || [], timeRange),
      revenueData,
      platformStats,
      deviceUsage: [
        { device: 'Mobile', percentage: 68 },
        { device: 'Desktop', percentage: 28 },
        { device: 'Tablet', percentage: 4 },
      ],
      locationData: [
        { city: 'Accra', properties: 89, users: 280 },
        { city: 'Kumasi', properties: 34, users: 95 },
        { city: 'Tamale', properties: 18, users: 52 },
        { city: 'Sekondi', properties: 15, users: 53 },
      ],
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error('Error in admin analytics GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getDateFromTimeRange(timeRange: string): string {
  const now = new Date();
  switch (timeRange) {
    case '1m':
      return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).toISOString();
    case '3m':
      return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()).toISOString();
    case '6m':
      return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()).toISOString();
    case '1y':
      return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).toISOString();
    default:
      return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()).toISOString();
  }
}

function generateUserGrowthData(users: any[], timeRange: string) {
  const months = getMonthsFromTimeRange(timeRange);
  const userGrowth = months.map(month => {
    const monthUsers = users.filter(user => {
      const userDate = new Date(user.created_at);
      return userDate.getFullYear() === month.year && userDate.getMonth() === month.month;
    });
    
    const totalUsers = users.filter(user => {
      const userDate = new Date(user.created_at);
      return userDate <= month.date;
    }).length;

    const agents = monthUsers.filter(user => user.role === 'agent').length;
    
    return {
      date: month.label,
      users: totalUsers,
      agents: agents,
    };
  });

  return userGrowth;
}

function generatePropertyMetricsData(properties: any[], timeRange: string) {
  const months = getMonthsFromTimeRange(timeRange);
  const propertyMetrics = months.map(month => {
    const monthProperties = properties.filter(property => {
      const propertyDate = new Date(property.created_at);
      return propertyDate.getFullYear() === month.year && propertyDate.getMonth() === month.month;
    });
    
    const listed = monthProperties.length;
    const sold = monthProperties.filter(p => p.status === 'sold').length;
    const views = monthProperties.reduce((sum, p) => sum + (p.views || 0), 0);
    
    return {
      month: month.shortLabel,
      listed,
      sold,
      views,
    };
  });

  return propertyMetrics;
}

function generateMockRevenueData(timeRange: string) {
  const months = getMonthsFromTimeRange(timeRange);
  return months.map(month => ({
    month: month.shortLabel,
    revenue: Math.floor(Math.random() * 50000) + 30000,
    transactions: Math.floor(Math.random() * 20) + 10,
  }));
}

function getMonthsFromTimeRange(timeRange: string) {
  const months = [];
  const now = new Date();
  let count = 0;
  
  switch (timeRange) {
    case '1m':
      count = 1;
      break;
    case '3m':
      count = 3;
      break;
    case '6m':
      count = 6;
      break;
    case '1y':
      count = 12;
      break;
    default:
      count = 6;
  }
  
  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      year: date.getFullYear(),
      month: date.getMonth(),
      date: date,
      label: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      shortLabel: date.toLocaleDateString('en-US', { month: 'short' }),
    });
  }
  
  return months;
}

async function calculatePlatformStats(supabase: any) {
  try {
    // Get total users
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Get total properties
    const { count: totalProperties } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true });

    // Get active agents
    const { count: activeAgents } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'agent')
      .eq('status', 'active');

    // Mock data for now (replace with actual calculations)
    return {
      totalUsers: totalUsers || 480,
      totalProperties: totalProperties || 156,
      totalRevenue: 387000,
      activeAgents: activeAgents || 47,
      conversionRate: 8.2,
      avgPropertyPrice: 2480,
    };
  } catch (error) {
    console.error('Error calculating platform stats:', error);
    return {
      totalUsers: 480,
      totalProperties: 156,
      totalRevenue: 387000,
      activeAgents: 47,
      conversionRate: 8.2,
      avgPropertyPrice: 2480,
    };
  }
}

