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
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Admin stats API - Auth check:', { user: user?.id, authError }); // Added logging
    
    if (authError || !user) {
      console.log('Admin stats API - Authentication failed:', authError); // Added logging
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is an admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('id', user.id)
      .single();
    
    console.log('Admin stats API - Profile check:', { profile, profileError, userId: user.id }); // Added logging

    if (profileError || (!profile || profile.user_role !== 'admin')) {
      console.log('Admin stats API - Admin role check failed:', { profile, profileError }); // Added logging
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
        .eq('user_type', 'agent'),
      
      // Total properties
      supabase
        .from('properties')
        .select('*', { count: 'exact', head: true }),
      
      // Pending verifications
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('user_type', 'agent')
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

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      totalAgents: totalAgents || 0,
      totalProperties: totalProperties || 0,
      pendingVerifications: pendingVerifications || 0,
      pendingApprovals: pendingApprovals || 0,
      totalInquiries: totalInquiries || 0,
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
