import { NextRequest, NextResponse } from 'next/server';
import { createApiRouteSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const supabase = await createApiRouteSupabaseClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error);
      
      // Handle specific error cases
      if (error.message === 'Email not confirmed') {
        return NextResponse.json(
          { 
            error: 'Please verify your email before signing in',
            code: 'EMAIL_NOT_CONFIRMED'
          },
          { status: 401 }
        );
      }
      
      if (error.message === 'Invalid login credentials') {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: error.message || 'Login failed' },
        { status: 401 }
      );
    }

    if (!data.user || !data.session) {
      return NextResponse.json(
        { error: 'No user data returned' },
        { status: 500 }
      );
    }

    // Get user metadata to determine role
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('user_role, verification_status, full_name')
      .eq('id', data.user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Profile fetch error:', profileError);
    }

    const userRole = profileData?.user_role || 'user';
    const isVerified = profileData?.verification_status === 'verified';
    const fullName = profileData?.full_name || data.user.user_metadata?.full_name;

    // Check if user requires verification
    if (userRole === 'agent' && !isVerified) {
      return NextResponse.json({
        requires_verification: true,
        message: 'Your account is pending verification',
        user: {
          id: data.user.id,
          email: data.user.email,
          user_role: userRole,
          full_name: fullName
        }
      });
    }

    // Successful login
    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        user_role: userRole,
        full_name: fullName,
        is_verified: isVerified
      },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token
      }
    });

  } catch (error) {
    console.error('Login API error:', error);
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
