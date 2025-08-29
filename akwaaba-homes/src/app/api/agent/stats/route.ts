import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is an agent or admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    if (profileError || (!profile || (profile.user_type !== 'agent' && profile.user_type !== 'admin'))) {
      return NextResponse.json(
        { error: 'Access denied. Only agents and admins can access stats.' },
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
      totalProperties: totalProperties || 0,
      pendingProperties: pendingProperties || 0,
      activeProperties: activeProperties || 0,
      totalInquiries: totalInquiries || 0
    });

  } catch (error) {
    console.error('Agent stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
