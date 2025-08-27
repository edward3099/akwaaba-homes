import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Validation schema for resend verification
const resendVerificationSchema = z.object({
  email: z.string().email('Invalid email address'),
  type: z.enum(['signup', 'recovery']).default('signup'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input data
    const validationResult = resendVerificationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const { email, type } = validationResult.data;

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

    // In Supabase v2, we can't easily look up users by email through the admin API
    // Instead, we'll attempt to resend the verification email directly
    // The Supabase auth service will handle the case where the user doesn't exist
    
    // Resend verification email
    const { error: resendError } = await supabase.auth.resend({
      type: type === 'signup' ? 'signup' : 'email_change',
      email: email,
      options: {
        emailRedirectTo: `${request.nextUrl.origin}/auth/callback`,
      }
    });

    if (resendError) {
      console.error('Resend verification error:', resendError);
      return NextResponse.json(
        { 
          error: 'Failed to resend verification email', 
          details: resendError.message 
        },
        { status: 500 }
      );
    }

    // Log the resend for audit purposes
    console.log(`Verification email resent to: ${email}`);

    return NextResponse.json({
      message: 'If an account with this email exists, a verification link has been sent.'
    }, { status: 200 });

  } catch (error) {
    console.error('Resend verification error:', error);
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

