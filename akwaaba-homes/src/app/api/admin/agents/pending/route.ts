import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || 'pending';
    const search = searchParams.get('search') || '';

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

    // Get current user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if current user is admin
    const { data: adminProfile, error: adminError } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('user_id', user.id)
      .single();

    if (adminError || adminProfile?.user_role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions. Admin access required.' },
        { status: 403 }
      );
    }

    // Build query for pending agents
    let query = supabase
      .from('profiles')
      .select('*')
      .eq('user_role', 'agent');

    // Filter by status
    if (status === 'pending') {
      query = query.eq('verification_status', 'pending');
    } else if (status === 'rejected') {
      query = query.eq('verification_status', 'rejected');
    } else if (status === 'verified') {
      query = query.eq('verification_status', 'verified');
    }

    // Add search filter if provided
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,company_name.ilike.%${search}%`);
    }

    // Get total count for pagination
    const { count: totalCount, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('user_role', 'agent')
      .eq('verification_status', status === 'pending' ? 'pending' : status === 'rejected' ? 'rejected' : 'verified');

    if (countError) {
      console.error('Count error:', countError);
      return NextResponse.json(
        { error: 'Failed to get agent count', details: countError.message },
        { status: 500 }
      );
    }

    // Apply pagination and ordering
    const offset = (page - 1) * limit;
    const { data: agents, error: agentsError } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (agentsError) {
      console.error('Agents fetch error:', agentsError);
      return NextResponse.json(
        { error: 'Failed to fetch agents', details: agentsError.message },
        { status: 500 }
      );
    }

    // Calculate pagination info
    const totalPages = Math.ceil((totalCount || 0) / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return NextResponse.json({
      agents: agents?.map((agent: Record<string, any>) => ({
        id: agent.id,
        user_id: agent.user_id,
        email: agent.email,
        full_name: agent.full_name,
        phone: agent.phone,
        company_name: agent.company_name,
        business_type: agent.business_type,
        license_number: agent.license_number,
        experience_years: agent.experience_years,
        bio: agent.bio,
        verification_status: agent.verification_status,
        is_verified: agent.is_verified,
        created_at: agent.created_at,
        updated_at: agent.updated_at
      })) || [],
      pagination: {
        page,
        limit,
        totalCount: totalCount || 0,
        totalPages,
        hasNextPage,
        hasPreviousPage
      }
    });

  } catch (error) {
    console.error('Pending agents fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
