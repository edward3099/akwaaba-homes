import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
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

  try {

    // Get current user to verify admin access
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.user_role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all developers with their profiles
    const { data: developers, error: developersError } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        phone,
        company_name,
        bio,
        address,
        city,
        region,
        postal_code,
        is_verified,
        profile_image,
        cover_image,
        created_at,
        updated_at
      `)
      .eq('user_role', 'developer')
      .order('created_at', { ascending: false });

    if (developersError) {
      console.error('Error fetching developers:', developersError);
      return NextResponse.json({ error: 'Failed to fetch developers' }, { status: 500 });
    }

    // Get properties count for each developer
    const developersWithCounts = await Promise.all(
      developers.map(async (developer) => {
        const { count: propertiesCount } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .eq('agent_id', developer.id);

        return {
          ...developer,
          properties_count: propertiesCount || 0,
          last_active: developer.updated_at
        };
      })
    );

    return NextResponse.json({ 
      developers: developersWithCounts,
      total: developersWithCounts.length
    });

  } catch (error) {
    console.error('Error in developers API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
