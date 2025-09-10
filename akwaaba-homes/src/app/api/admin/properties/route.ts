import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceRoleSupabaseClient();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get properties based on status
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('id, title, status, created_at')
      .eq('status', status)
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