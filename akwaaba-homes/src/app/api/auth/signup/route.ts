import { NextRequest, NextResponse } from 'next/server';
import { createApiRouteSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createApiRouteSupabaseClient();
    const body = await request.json();
    const { email, password, user_metadata } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Sign up the user with PKCE flow
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        data: user_metadata || {}
      }
    });

    if (error) {
      console.error('Signup error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // If user was created successfully, create their profile
    if (data.user) {
      try {
        // Create user profile in the profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            user_id: data.user.id,
            email: data.user.email,
            full_name: `${user_metadata?.first_name || ''} ${user_metadata?.last_name || ''}`.trim(),
            company_name: user_metadata?.company_name || '',
            business_type: user_metadata?.business_type || '',
            user_role: user_metadata?.user_type || 'agent',
            phone: user_metadata?.phone || '',
            license_number: user_metadata?.license_number || '',
            experience_years: user_metadata?.experience_years || 0,
            bio: user_metadata?.bio || '',
            verification_status: user_metadata?.verification_status || 'pending',
            is_verified: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Note: We don't fail the signup if profile creation fails
          // The user can still sign in and complete their profile later
        }
      } catch (profileError) {
        console.error('Profile creation error:', profileError);
        // Continue with signup even if profile creation fails
      }
    }

    // Check if email confirmation is required
    if (data.user && !data.user.email_confirmed_at) {
      return NextResponse.json({
        message: 'Please check your email to confirm your account before signing in.',
        user: data.user,
        session: data.session
      }, { status: 200 });
    }

    // If email is already confirmed, return success
    if (data.user && data.user.email_confirmed_at) {
      return NextResponse.json({
        message: 'Account created successfully! You can now sign in.',
        user: data.user,
        session: data.session
      }, { status: 200 });
    }

    return NextResponse.json({
      message: 'Account created successfully! Please check your email to confirm your account.',
      user: data.user
    }, { status: 200 });

  } catch (error) {
    console.error('Signup route error:', error);
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
