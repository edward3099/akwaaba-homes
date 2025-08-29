import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email
    });

    if (error) {
      console.error('Resend verification error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to resend verification email' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Verification email sent. Please check your email for the verification link.'
    });

  } catch (error) {
    console.error('Resend verification API error:', error);
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

