import { NextRequest, NextResponse } from 'next/server';
import { createApiRouteSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createApiRouteSupabaseClient();
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Attempt to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Supabase auth error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    // Check if user is confirmed
    if (data.user && !data.user.email_confirmed_at) {
      return NextResponse.json({
        error: 'Please check your email to confirm your account before signing in.',
        code: 'EMAIL_NOT_CONFIRMED',
        user_id: data.user.id
      }, { status: 401 });
    }

    // Get user profile to verify admin role
    let userProfile = null;
    if (data.user) {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', data.user.id)
          .single();

        if (!profileError && profileData) {
          userProfile = profileData;
          
          // Check if user has admin role
          if (profileData.user_role !== 'admin') {
            return NextResponse.json({
              error: 'Access denied. Admin privileges required.',
              code: 'INSUFFICIENT_PRIVILEGES'
            }, { status: 403 });
          }
        } else {
          return NextResponse.json({
            error: 'User profile not found. Please contact support.',
            code: 'PROFILE_NOT_FOUND'
          }, { status: 404 });
        }
      } catch (profileError) {
        console.error('Profile fetch error:', profileError);
        return NextResponse.json({
          error: 'Failed to verify user profile.',
          code: 'PROFILE_FETCH_ERROR'
        }, { status: 500 });
      }
    }

    // Success - user is authenticated, confirmed, and has admin role
    return NextResponse.json({
      message: 'Admin login successful',
      user: {
        ...data.user,
        user_role: userProfile?.user_role,
        verification_status: userProfile?.verification_status,
        company_name: userProfile?.company_name,
        business_type: userProfile?.business_type,
        license_number: userProfile?.license_number,
        experience_years: userProfile?.experience_years,
        bio: userProfile?.bio
      },
      session: data.session
    }, { status: 200 });

  } catch (error) {
    console.error('Admin login route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
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
