import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { validateJWTPayload, isJWTExpiringSoon } from '@/lib/utils/jwtSecurity';

interface SessionRefreshOptions {
  autoRefresh: boolean;
  refreshThreshold: number; // seconds before expiry to refresh
  maxRefreshAttempts: number;
  refreshCooldown: number; // seconds between refresh attempts
}

const DEFAULT_OPTIONS: SessionRefreshOptions = {
  autoRefresh: true,
  refreshThreshold: 300, // 5 minutes
  maxRefreshAttempts: 3,
  refreshCooldown: 60 // 1 minute
};

export class SessionRefreshMiddleware {
  private options: SessionRefreshOptions;
  private refreshAttempts: Map<string, { count: number; lastAttempt: number }> = new Map();

  constructor(options: Partial<SessionRefreshOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Safely extract client IP from request headers
   */
  private getClientIP(request: NextRequest): string {
    // Try to get IP from various headers in order of preference
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
      // x-forwarded-for can contain multiple IPs, take the first one
      return forwardedFor.split(',')[0].trim();
    }

    const realIP = request.headers.get('x-real-ip');
    if (realIP) {
      return realIP;
    }

    const cfConnectingIP = request.headers.get('cf-connecting-ip');
    if (cfConnectingIP) {
      return cfConnectingIP;
    }

    // Fallback to a default identifier
    return 'unknown';
  }

  /**
   * Process request with session refresh logic
   */
  async processRequest(request: NextRequest): Promise<NextResponse> {
    const response = NextResponse.next({ request });
    
    try {
      // Create Supabase client
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) => {
                response.cookies.set(name, value, options);
              });
            },
          },
        }
      );

      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.warn('Session refresh middleware error:', error.message);
        return response;
      }

      if (!session) {
        return response;
      }

      // Check if session needs refresh
      const clientIP = this.getClientIP(request);
      const shouldRefresh = await this.shouldRefreshSession(session, clientIP);
      
      if (shouldRefresh) {
        const refreshResult = await this.refreshSession(supabase, clientIP);
        
        if (refreshResult.success) {
          console.log('Session refreshed successfully for user:', session.user.email);
        } else {
          console.warn('Session refresh failed:', refreshResult.error);
        }
      }

      // Validate JWT claims
      const validationResult = await this.validateSessionClaims(supabase);
      if (!validationResult.isValid) {
        console.warn('Invalid JWT claims, forcing re-authentication');
        await supabase.auth.signOut();
        
        // Redirect to login if on protected route
        if (this.isProtectedRoute(request.nextUrl.pathname)) {
          const loginUrl = new URL('/login', request.url);
          loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
          return NextResponse.redirect(loginUrl);
        }
      }

      return response;

    } catch (error) {
      console.error('Session refresh middleware error:', error);
      return response;
    }
  }

  /**
   * Determine if session should be refreshed
   */
  private async shouldRefreshSession(session: any, ip: string): Promise<boolean> {
    if (!this.options.autoRefresh) {
      return false;
    }

    // Check refresh cooldown
    const refreshInfo = this.refreshAttempts.get(ip);
    if (refreshInfo) {
      const timeSinceLastAttempt = Date.now() - refreshInfo.lastAttempt;
      if (timeSinceLastAttempt < this.options.refreshCooldown * 1000) {
        return false;
      }
    }

    // Check if JWT is expiring soon
    try {
      const { data: claimsData } = await createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll: () => [], setAll: () => {} } }
      ).auth.getClaims();

      const claims = claimsData?.claims;
      if (claims && isJWTExpiringSoon(claims, this.options.refreshThreshold)) {
        return true;
      }
    } catch (error) {
      console.warn('Error checking JWT expiration:', error);
    }

    return false;
  }

  /**
   * Attempt to refresh the session
   */
  private async refreshSession(supabase: any, ip: string): Promise<{ success: boolean; error?: string }> {
    const refreshInfo = this.refreshAttempts.get(ip) || { count: 0, lastAttempt: 0 };
    
    // Check if we've exceeded max attempts
    if (refreshInfo.count >= this.options.maxRefreshAttempts) {
      return { success: false, error: 'Max refresh attempts exceeded' };
    }

    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        throw error;
      }

      if (data.session) {
        // Reset refresh attempts on success
        this.refreshAttempts.delete(ip);
        return { success: true };
      }

      return { success: false, error: 'No session returned from refresh' };

    } catch (error) {
      // Increment refresh attempts
      refreshInfo.count++;
      refreshInfo.lastAttempt = Date.now();
      this.refreshAttempts.set(ip, refreshInfo);

      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown refresh error' 
      };
    }
  }

  /**
   * Validate session JWT claims
   */
  private async validateSessionClaims(supabase: any): Promise<{ isValid: boolean; errors: string[] }> {
    try {
      const { data: claimsData } = await supabase.auth.getClaims();
      const claims = claimsData?.claims;

      if (!claims) {
        return { isValid: false, errors: ['No JWT claims found'] };
      }

      const validation = validateJWTPayload(claims);
      return {
        isValid: validation.isValid,
        errors: validation.errors
      };

    } catch (error) {
      console.error('Error validating session claims:', error);
      return { isValid: false, errors: ['Failed to validate claims'] };
    }
  }

  /**
   * Check if route requires authentication
   */
  private isProtectedRoute(pathname: string): boolean {
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

  /**
   * Clean up expired refresh attempts
   */
  cleanup(): void {
    const now = Date.now();
    const cooldownMs = this.options.refreshCooldown * 1000;
    
    for (const [ip, info] of this.refreshAttempts.entries()) {
      if (now - info.lastAttempt > cooldownMs) {
        this.refreshAttempts.delete(ip);
      }
    }
  }
}

// Create default instance
export const sessionRefreshMiddleware = new SessionRefreshMiddleware();

// Cleanup expired attempts every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    sessionRefreshMiddleware.cleanup();
  }, 5 * 60 * 1000);
}

