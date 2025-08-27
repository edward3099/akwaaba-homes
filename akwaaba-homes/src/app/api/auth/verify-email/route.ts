import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Validation schema for email verification
const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
  type: z.enum(['signup', 'recovery', 'invite']).default('signup'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input data
    const validationResult = verifyEmailSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const { token, type } = validationResult.data;

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

    // Verify the email using Supabase Auth
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: type === 'signup' ? 'signup' : type === 'recovery' ? 'recovery' : 'invite',
    });

    if (error) {
      console.error('Email verification error:', error);
      return NextResponse.json(
        { 
          error: 'Email verification failed', 
          details: error.message,
          code: error.status 
        },
        { status: 400 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'No user found for verification' },
        { status: 400 }
      );
    }

    // Update user profile to mark email as verified
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        email_verified: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', data.user.id);

    if (profileError) {
      console.error('Profile update error:', profileError);
      // Don't fail the verification if profile update fails
      // The user can still sign in and complete their profile
    }

    // Log the verification for audit purposes
    console.log(`Email verified for user: ${data.user.email} (${data.user.id})`);

    return NextResponse.json({
      message: 'Email verified successfully',
      user: {
        id: data.user.id,
        email: data.user.email,
        email_verified: true
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Email verification error:', error);
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

