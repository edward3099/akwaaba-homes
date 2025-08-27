import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { validateJWTPayload, DEFAULT_JWT_SECURITY_CONFIG } from '@/lib/utils/jwtSecurity';

/**
 * Enhanced Supabase session management middleware with JWT security
 * Based on Supabase best practices for Next.js App Router
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // Enhanced security: Log authentication attempts for monitoring
  if (error) {
    console.warn('Auth middleware error:', error.message);
  }

  // Enhanced security: Validate JWT claims if user exists
  if (user) {
    try {
      // Get JWT claims for additional validation
      const { data: claimsData } = await supabase.auth.getClaims();
      
      if (claimsData?.claims) {
        const claims = claimsData.claims;
        
        // Validate JWT claims using the security utility
        const validationResult = validateJWTPayload(claims, DEFAULT_JWT_SECURITY_CONFIG);
        if (!validationResult.isValid) {
          console.warn('Invalid JWT claims:', validationResult.errors);
          // Force re-authentication for invalid tokens
          await supabase.auth.signOut();
          const url = request.nextUrl.clone();
          url.pathname = '/login';
          return NextResponse.redirect(url);
        }
      }
    } catch (claimsError) {
      console.error('Error validating JWT claims:', claimsError);
      // Continue with user session if claims validation fails
    }
  }

  // Route protection logic
  const isProtectedRoute = isRouteProtected(request.nextUrl.pathname);
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/signup') ||
                     request.nextUrl.pathname.startsWith('/auth') ||
                     request.nextUrl.pathname.startsWith('/forgot-password') ||
                     request.nextUrl.pathname.startsWith('/reset-password') ||
                     request.nextUrl.pathname.startsWith('/verify-email');

  if (!user && isProtectedRoute) {
    // Redirect unauthenticated users to login
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    // Redirect authenticated users away from auth pages
    const url = request.nextUrl.clone();
    url.pathname = '/agent/dashboard';
    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}

/**
 * Validate JWT claims according to Supabase security best practices
 */


/**
 * Check if a route requires authentication
 */
function isRouteProtected(pathname: string): boolean {
  const protectedPaths = [
    '/agent/dashboard',
    '/agent/profile',
    '/admin',
    '/api/admin',
    '/api/user/profile',
    '/api/agents/dashboard'
  ];
  
  return protectedPaths.some(path => pathname.startsWith(path));
}

