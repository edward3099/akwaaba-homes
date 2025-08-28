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
      
      // Check if the error is due to unconfirmed email
      if (error.message.includes('Email not confirmed') || error.message.includes('Invalid login credentials')) {
        return NextResponse.json({
          error: 'Please check your email to confirm your account before signing in.',
          code: 'EMAIL_NOT_CONFIRMED'
        }, { status: 401 });
      }
      
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

    // Get user profile information
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
        }
      } catch (profileError) {
        console.error('Profile fetch error:', profileError);
        // Continue with login even if profile fetch fails
      }
    }

    // Success - user is authenticated and confirmed
    return NextResponse.json({
      message: 'Login successful',
      user: {
        ...data.user,
        user_role: userProfile?.user_role || 'user',
        verification_status: userProfile?.verification_status || 'unknown'
      },
      session: data.session
    }, { status: 200 });

  } catch (error) {
    console.error('Login route error:', error);
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
