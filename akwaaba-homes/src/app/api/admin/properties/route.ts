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
    console.log('🎯 Admin properties API called');
    
    const supabase = await createApiRouteSupabaseClient();
    
    // Verify admin access
    await requireAdmin(supabase);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';

    console.log('📝 Fetching properties with filters:', {
      page,
      limit,
      status,
      search
    });

    // Build query
    let query = supabase
      .from('properties')
      .select(`
        *,
        profiles!properties_owner_id_fkey (
          id,
          first_name,
          last_name,
          email,
          phone
        )
      `)
      .order('created_at', { ascending: false });

    // Apply status filter
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply search filter
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,location.address.ilike.%${search}%`);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: properties, error: propertiesError, count } = await query;

    if (propertiesError) {
      console.error('❌ Error fetching properties:', propertiesError);
      return NextResponse.json(
        { error: 'Failed to fetch properties' },
        { status: 500 }
      );
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('properties')
      .select('*', { count: 'exact', head: true });

    if (status !== 'all') {
      countQuery = countQuery.eq('status', status);
    }

    if (search) {
      countQuery = countQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%,location.address.ilike.%${search}%`);
    }

    const { count: totalCount } = await countQuery;

    console.log('✅ Properties fetched successfully:', {
      count: properties?.length || 0,
      totalCount: totalCount || 0
    });

    return NextResponse.json({
      properties: properties || [],
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        pages: Math.ceil((totalCount || 0) / limit)
      }
    });

  } catch (error) {
    console.error('❌ Admin properties API error:', error);
    
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
