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

    // Check if current user is an agent
    const { data: agentProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .eq('user_type', 'agent')
      .single();

    if (profileError || !agentProfile) {
      return NextResponse.json(
        { error: 'Access denied. Agent role required.' },
        { status: 403 }
      );
    }

    // Fetch agent's properties
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('*')
      .eq('agent_id', user.id)
      .order('created_at', { ascending: false });

    if (propertiesError) {
      console.error('Properties fetch error:', propertiesError);
      // Don't fail the entire request if properties fetch fails
    }

    // Calculate statistics
    const totalProperties = properties?.length || 0;
    const activeProperties = properties?.filter(p => p.status === 'active').length || 0;
    const pendingProperties = properties?.filter(p => p.status === 'pending').length || 0;
    const soldProperties = properties?.filter(p => p.status === 'sold').length || 0;

    // Calculate total property value
    const totalValue = properties?.reduce((sum, property) => {
      return sum + (parseFloat(property.price) || 0);
    }, 0) || 0;

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentProperties = properties?.filter(p => 
      new Date(p.created_at) >= sevenDaysAgo
    ).length || 0;

    // Prepare dashboard data
    const dashboardData = {
      profile: {
        id: agentProfile.id,
        email: agentProfile.email,
        first_name: agentProfile.first_name,
        last_name: agentProfile.last_name,
        phone: agentProfile.phone,
        company_name: agentProfile.company_name,
        license_number: agentProfile.license_number,
        specializations: agentProfile.specializations || [],
        experience: agentProfile.experience,
        bio: agentProfile.bio,
        profile_image: agentProfile.profile_image,
        verification_status: agentProfile.verification_status,
        created_at: agentProfile.created_at,
        updated_at: agentProfile.updated_at
      },
      properties: {
        total: totalProperties,
        active: activeProperties,
        pending: pendingProperties,
        sold: soldProperties,
        totalValue: totalValue.toFixed(2),
        recent: recentProperties
      },
      propertiesList: properties?.map(property => ({
        id: property.id,
        title: property.title,
        price: property.price,
        status: property.status,
        property_type: property.property_type,
        location: property.location,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        area: property.area,
        created_at: property.created_at,
        updated_at: property.updated_at
      })) || [],
      statistics: {
        totalProperties,
        activeProperties,
        pendingProperties,
        soldProperties,
        totalValue: totalValue.toFixed(2),
        recentProperties,
        averagePrice: totalProperties > 0 ? (totalValue / totalProperties).toFixed(2) : '0.00',
        completionRate: totalProperties > 0 ? ((soldProperties / totalProperties) * 100).toFixed(1) : '0.0'
      }
    };

    return NextResponse.json(dashboardData);

  } catch (error) {
    console.error('Agent dashboard error:', error);
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
