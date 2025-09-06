import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Fetch all developers with their profiles (no auth required for testing)
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
    console.error('Error in test developers API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
