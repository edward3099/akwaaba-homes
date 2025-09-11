import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceRoleSupabaseClient();

    const { searchParams } = new URL(request.url);
    const approvalStatus = searchParams.get('approval_status') || 'pending';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get properties based on approval status
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('id, title, status, approval_status, created_at')
      .eq('approval_status', approvalStatus)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (propertiesError) {
      console.error('Properties fetch error:', propertiesError);
      return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      properties: properties || [],
      pagination: {
        offset,
        limit,
        total: properties?.length || 0
      }
    });

  } catch (error) {
    console.error('Properties API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}