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
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch (error) {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch profile', details: profileError.message },
        { status: 500 }
      );
    }

    // Check profile completion
    const requiredFields = [
      'full_name',
      'phone', 
      'company_name',
      'license_number',
      'specializations',
      'experience_years',
      'bio',
      'profile_image',
      'cover_image'
    ];

    const missingFields: string[] = [];
    let completedFields = 0;

    requiredFields.forEach(field => {
      const value = profile[field];
      
      if (field === 'specializations') {
        if (!value || !Array.isArray(value) || value.length === 0) {
          missingFields.push(field);
        } else {
          completedFields++;
        }
      } else if (field === 'experience_years') {
        if (value === null || value === undefined || value === 0) {
          missingFields.push(field);
        } else {
          completedFields++;
        }
      } else if (field === 'profile_image' || field === 'cover_image') {
        if (!value || value.trim() === '') {
          missingFields.push(field);
        } else {
          completedFields++;
        }
      } else {
        if (!value || value.trim() === '') {
          missingFields.push(field);
        } else {
          completedFields++;
        }
      }
    });

    const completionPercentage = Math.round((completedFields / requiredFields.length) * 100);
    const isComplete = missingFields.length === 0;

    return NextResponse.json({
      isComplete,
      missingFields,
      completionPercentage
    });

  } catch (error) {
    console.error('Profile completion check error:', error);
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
