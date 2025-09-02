import { type EmailOtpType } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'
  const redirectTo = request.nextUrl.clone()
  redirectTo.pathname = next

  if (token_hash && type) {
    const supabase = createRouteHandlerClient({ cookies })

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    
    if (!error) {
      // Successfully verified email, redirect to the intended page
      return NextResponse.redirect(redirectTo)
    }
  }

  // Verification failed, redirect to error page
  redirectTo.pathname = '/auth/error'
  return NextResponse.redirect(redirectTo)
}
