import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, userType, phone, company } = await request.json();

    if (!email || !password || !fullName || !userType) {
      return NextResponse.json(
        { error: 'Email, password, full name, and user type are required' },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Check if user already exists - we'll handle this during signup
    // Supabase will return an error if the email is already in use

    // Create user account
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          user_type: userType,
          phone: phone || null,
          company: company || null
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback?next=/dashboard`
      }
    });

    if (error) {
      console.error('Signup error:', error);
      return NextResponse.json(
        { error: error.message || 'Signup failed' },
        { status: 400 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'No user data returned' },
        { status: 500 }
      );
    }

    // Create profile record
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        email: data.user.email,
        full_name: fullName,
        user_type: userType,
        phone: phone || null,
        company: company || null,
        verification_status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Don't fail the signup if profile creation fails
      // The profile can be created later
    }

    // Send verification email
    const { error: emailError } = await supabase.auth.resend({
      type: 'signup',
      email: email
    });

    if (emailError) {
      console.error('Verification email error:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully. Please check your email to verify your account.',
      user: {
        id: data.user.id,
        email: data.user.email,
        user_type: userType,
        full_name: fullName
      }
    });

  } catch (error) {
    console.error('Signup API error:', error);
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
