import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Check if environment variables are set
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json({ 
        error: 'Server configuration error: Missing Supabase credentials. Please check your environment variables.',
        details: 'SUPABASE_URL and SUPABASE_ANON_KEY must be set'
      }, { status: 500 });
    }
    
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
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
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '6');
    const propertyType = searchParams.get('property_type');
    const city = searchParams.get('city');

    // Build query for featured properties with full data
    let query = supabase
      .from('properties')
      .select(`
        *,
        users!properties_seller_id_fkey (
          id,
          full_name,
          phone,
          email,
          user_type,
          is_verified
        ),
        property_images (
          id,
          image_url,
          is_primary
        )
      `)
      .eq('status', 'active')
      .order('views_count', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    // Apply property type filter if specified
    if (propertyType) {
      query = query.eq('listing_type', propertyType);
    }

    // Apply city filter if specified
    if (city) {
      query = query.ilike('city', `%${city}%`);
    }

    // Execute query
    const { data: properties, error } = await query;

    if (error) {
      console.error('Error fetching featured properties:', error);
      return NextResponse.json({ error: 'Failed to fetch featured properties' }, { status: 500 });
    }

    // Track analytics for featured properties view
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('analytics')
          .insert([
            {
              event_type: 'featured_properties_viewed',
              user_id: user.id,
              metadata: {
                limit,
                property_type: propertyType,
                city,
                properties_count: properties.length,
              },
            }
          ]);
      }
    } catch (analyticsError) {
      // Don't fail the main request if analytics fails
      console.warn('Analytics tracking failed:', analyticsError);
    }

    return NextResponse.json({
      properties,
      metadata: {
        total: properties.length,
        filters: {
          property_type: propertyType,
          city,
        },
        selection_criteria: 'Most viewed and recently listed properties for sale',
      },
    });
  } catch (error) {
    console.error('Error in featured properties GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
