import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
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
    
    // Check authentication - handle both cookie and header auth
    let user = null;
    let authError = null;
    
    // Try to get user from cookies first
    const { data: { user: cookieUser }, error: cookieError } = await supabase.auth.getUser();
    
    if (cookieUser) {
      user = cookieUser;
    } else {
      // If no cookie auth, try Authorization header
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const { data: { user: headerUser }, error: headerError } = await supabase.auth.getUser(token);
        if (headerUser) {
          user = headerUser;
        } else {
          authError = headerError;
        }
      } else {
        authError = cookieError;
      }
    }
    
    console.log('Admin stats API - Auth check:', { user: user?.id, authError }); // Added logging
    
    if (authError || !user) {
      console.log('Admin stats API - Authentication failed:', authError); // Added logging
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is an admin by checking user metadata
    const userType = user.user_metadata?.user_type || user.app_metadata?.user_type;
    console.log('Admin stats API - User metadata check:', { userType, userMetadata: user.user_metadata, appMetadata: user.app_metadata }); // Added logging

    if (userType !== 'admin') {
      console.log('Admin stats API - Admin role check failed:', { userType }); // Added logging
      return NextResponse.json(
        { error: 'Access denied. Only admins can access admin stats.' },
        { status: 403 }
      );
    }

    // Get admin stats
    const [
      { count: totalUsers },
      { count: totalAgents },
      { count: totalProperties },
      { count: pendingVerifications },
      { count: pendingApprovals },
      { count: totalInquiries }
    ] = await Promise.all([
      // Total users
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true }),
      
      // Total agents
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('user_role', 'agent'),
      
      // Total properties
      supabase
        .from('properties')
        .select('*', { count: 'exact', head: true }),
      
      // Pending verifications
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('user_role', 'agent')
        .eq('verification_status', 'pending'),
      
      // Pending property approvals
      supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),
      
      // Total inquiries
      supabase
        .from('inquiries')
        .select('*', { count: 'exact', head: true })
    ]);

    // Determine system health based on pending items
    let systemHealth: 'healthy' | 'warning' | 'critical' = 'healthy';
    const totalPending = (pendingVerifications || 0) + (pendingApprovals || 0);
    
    if (totalPending > 20) {
      systemHealth = 'critical';
    } else if (totalPending > 10) {
      systemHealth = 'warning';
    }

    // Get additional stats for the expected structure
    const [
      { count: activeProperties },
      { count: featuredProperties },
      { count: totalSellers },
      { count: totalBuyers }
    ] = await Promise.all([
      // Active properties
      supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active'),
      
      // Featured properties
      supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('is_featured', true),
      
      // Total sellers
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('user_role', 'seller'),
      
      // Total buyers
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('user_role', 'buyer')
    ]);

    return NextResponse.json({
      properties: {
        total: totalProperties || 0,
        active: activeProperties || 0,
        pending: pendingApprovals || 0,
        featured: featuredProperties || 0
      },
      users: {
        total: totalUsers || 0,
        agents: totalAgents || 0,
        sellers: totalSellers || 0,
        buyers: totalBuyers || 0
      },
      revenue: {
        total: 0, // TODO: Implement revenue tracking
        monthly: 0,
        premium: 0
      },
      activity: {
        views: 0, // TODO: Implement view tracking
        inquiries: totalInquiries || 0,
        approvals: 0 // TODO: Implement approval tracking
      },
      systemHealth
    });

  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
