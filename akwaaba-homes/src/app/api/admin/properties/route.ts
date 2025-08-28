import { NextRequest, NextResponse } from 'next/server';
import { createApiRouteSupabaseClient } from '@/lib/supabase/server';

// Helper function to check if user is admin
async function checkAdminAccess(supabase: any, userId: string) {
  const { data: userProfile, error: profileError } = await supabase
    .from('profiles')
    .select('user_role, is_verified')
    .eq('user_id', userId)
    .single();

  if (profileError || !userProfile) {
    return { isAdmin: false, error: 'User profile not found' };
  }

  if (userProfile.user_role !== 'admin') {
    return { isAdmin: false, error: 'Admin role required' };
  }

  return { isAdmin: true, profile: userProfile };
}

// GET method to list all properties with admin privileges
export async function GET(request: NextRequest) {
  try {
    const supabase = await createApiRouteSupabaseClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is an admin
    const adminCheck = await checkAdminAccess(supabase, user.id);
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: 403 }
      );
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const propertyType = searchParams.get('property_type');
    const city = searchParams.get('city');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build the query
    let query = supabase
      .from('properties')
      .select(`
        *,
        users!properties_seller_id_fkey (
          id,
          full_name,
          company_name,
          phone,
          email,
          user_type,
          is_verified
        ),
        property_images (
          id,
          image_url,
          is_primary,
          caption
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (propertyType && propertyType !== 'all') {
      query = query.eq('property_type', propertyType);
    }
    if (city && city !== 'all') {
      query = query.ilike('city', `%${city}%`);
    }

    const { data: properties, error: fetchError, count } = await query;

    if (fetchError) {
      console.error('Error fetching properties:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch properties' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Properties retrieved successfully',
      properties: properties || [],
      count: count || 0,
      pagination: {
        limit,
        offset,
        hasMore: (properties?.length || 0) === limit
      }
    });

  } catch (error) {
    console.error('Admin properties GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST method to create a new property (admin can create properties on behalf of sellers)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createApiRouteSupabaseClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is an admin
    const adminCheck = await checkAdminAccess(supabase, user.id);
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Create property with admin privileges
    const { data: property, error: createError } = await supabase
      .from('properties')
      .insert({
        ...body,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating property:', createError);
      return NextResponse.json(
        { error: 'Failed to create property', details: createError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Property created successfully',
      property
    }, { status: 201 });

  } catch (error) {
    console.error('Admin properties POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
