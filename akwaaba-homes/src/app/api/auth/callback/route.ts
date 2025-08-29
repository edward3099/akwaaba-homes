import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') || '/dashboard';

    if (!code) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/login?error=missing_code`);
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Exchange code for session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/login?error=auth_failed&message=${encodeURIComponent(error.message)}`);
    }

    // Get user session to determine redirect
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/login?error=no_session`);
    }

    // Get user profile to determine role
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type, verification_status')
      .eq('id', session.user.id)
      .single();

    const userType = profile?.user_type || 'user';
    const isVerified = profile?.verification_status === 'verified';

    // Redirect based on user type and verification status
    let redirectUrl = next;
    
    if (userType === 'agent') {
      if (isVerified) {
        redirectUrl = '/agent-dashboard';
      } else {
        redirectUrl = '/agent-dashboard?verification=pending';
      }
    } else if (userType === 'admin') {
      redirectUrl = '/admin';
    } else {
      redirectUrl = '/dashboard';
    }

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}${redirectUrl}`);

  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/login?error=callback_failed`);
  }
}
