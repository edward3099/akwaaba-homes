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
              // user sessions.
            }
          },
        },
      }
    );
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Authentication error in agent stats:', authError);
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to access agent stats' },
        { status: 401 }
      );
    }

    // Check if user is an agent or admin
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('user_type')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error in agent stats:', profileError);
      return NextResponse.json(
        { error: 'Failed to verify user role' },
        { status: 500 }
      );
    }

    if (!profile || !['agent', 'admin', 'developer'].includes(profile.user_type)) {
      console.error('Access denied for user:', user.id, 'user_type:', profile?.user_type);
      return NextResponse.json(
        { error: 'Access denied. Only agents, developers, and admins can access stats.' },
        { status: 403 }
      );
    }

    // Get agent stats
    const agentId = user.id;

    // Get total properties
    const { count: totalProperties } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('agent_id', agentId);

    // Get pending properties
    const { count: pendingProperties } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('agent_id', agentId)
      .eq('status', 'pending');

    // Get active properties
    const { count: activeProperties } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('agent_id', agentId)
      .eq('status', 'approved');

    // Get total inquiries
    const { count: totalInquiries } = await supabase
      .from('inquiries')
      .select('*', { count: 'exact', head: true })
      .eq('agent_id', agentId);

    return NextResponse.json({
      success: true,
      totalProperties: totalProperties || 0,
      pendingProperties: pendingProperties || 0,
      activeProperties: activeProperties || 0,
      totalInquiries: totalInquiries || 0
    });

  } catch (error) {
    console.error('Agent stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
