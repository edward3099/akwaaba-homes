'use client';

import { useEffect, useState, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';
import { validateJWTPayload, extractUserFromJWT, isJWTExpiringSoon } from '@/lib/utils/jwtSecurity';

interface EnhancedUser extends User {
  verification_status?: string;
  user_type?: string;
  email_verified?: boolean;
}

interface AuthState {
  user: EnhancedUser | null;
  session: Session | null;
  loading: boolean;
  error: AuthError | null;
  isAuthenticated: boolean;
  isVerified: boolean;
  isAgent: boolean;
  isAdmin: boolean;
  jwtClaims: any;
  jwtValidation: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
}

interface UseEnhancedAuthReturn extends AuthState {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, metadata: any) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  updateProfile: (updates: any) => Promise<{ success: boolean; error?: string }>;
  resendVerification: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (password: string) => Promise<{ success: boolean; error?: string }>;
}

export function useEnhancedAuth(): UseEnhancedAuthReturn {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
    isAuthenticated: false,
    isVerified: false,
    isAgent: false,
    isAdmin: false,
    jwtClaims: null,
    jwtValidation: {
      isValid: false,
      errors: [],
      warnings: []
    }
  });

  const router = useRouter();
  const pathname = usePathname();

  // Create Supabase client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Validate JWT and extract user information
  const validateAndExtractUser = useCallback(async (session: Session | null) => {
    if (!session) {
      return {
        user: null,
        jwtClaims: null,
        jwtValidation: { isValid: false, errors: [], warnings: [] }
      };
    }

    try {
      // Get JWT claims
      const { data: claimsData } = await supabase.auth.getClaims();
      const claims = claimsData?.claims;

      if (claims) {
        // Validate JWT payload
        const validation = validateJWTPayload(claims);
        
        // Extract user information
        const userInfo = extractUserFromJWT(claims);
        
        // Check if JWT is expiring soon
        if (isJWTExpiringSoon(claims, 300)) { // 5 minutes
          console.warn('JWT expiring soon, consider refreshing session');
        }

        return {
          user: session.user as EnhancedUser,
          jwtClaims: claims,
          jwtValidation: validation
        };
      }
    } catch (error) {
      console.error('Error validating JWT:', error);
    }

    return {
      user: session.user as EnhancedUser,
      jwtClaims: null,
      jwtValidation: { isValid: false, errors: [], warnings: [] }
    };
  }, [supabase.auth]);

  // Update auth state
  const updateAuthState = useCallback(async (session: Session | null) => {
    const { user, jwtClaims, jwtValidation } = await validateAndExtractUser(session);
    
    if (user) {
      const isVerified = user.email_verified === true && 
                        user.user_metadata?.verification_status === 'verified';
      const isAgent = user.user_metadata?.user_type === 'agent';
      const isAdmin = user.user_metadata?.user_type === 'admin';

      setAuthState({
        user: user,
        session,
        loading: false,
        error: null,
        isAuthenticated: true,
        isVerified,
        isAgent,
        isAdmin,
        jwtClaims,
        jwtValidation
      });
    } else {
      setAuthState({
        user: null,
        session: null,
        loading: false,
        error: null,
        isAuthenticated: false,
        isVerified: false,
        isAgent: false,
        isAdmin: false,
        jwtClaims: null,
        jwtValidation: { isValid: false, errors: [], warnings: [] }
      });
    }
  }, [validateAndExtractUser]);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          setAuthState(prev => ({ ...prev, error, loading: false }));
          return;
        }

        await updateAuthState(session);

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state changed:', event, session?.user?.email);
            
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
              await updateAuthState(session);
            } else if (event === 'SIGNED_OUT') {
              await updateAuthState(null);
              // Redirect to login if on protected route
              if (pathname.startsWith('/agent') || pathname.startsWith('/admin')) {
                router.push('/login');
              }
            }
          }
        );

        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('Error initializing auth:', error);
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    };

    initializeAuth();
  }, [supabase.auth, updateAuthState, pathname, router]);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setAuthState(prev => ({ ...prev, loading: false, error }));
        return { success: false, error: error.message };
      }

      if (data.session) {
        await updateAuthState(data.session);
        return { success: true };
      }

      return { success: false, error: 'No session created' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setAuthState(prev => ({ ...prev, loading: false, error: { message: errorMessage } as AuthError }));
      return { success: false, error: errorMessage };
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, metadata: any) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });

      if (error) {
        setAuthState(prev => ({ ...prev, loading: false, error }));
        return { success: false, error: error.message };
      }

      setAuthState(prev => ({ ...prev, loading: false }));
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setAuthState(prev => ({ ...prev, loading: false, error: { message: errorMessage } as AuthError }));
      return { success: false, error: errorMessage };
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      }
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Refresh session
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Session refresh error:', error);
        return;
      }
      
      if (data.session) {
        await updateAuthState(data.session);
      }
    } catch (error) {
      console.error('Session refresh error:', error);
    }
  };

  // Update profile
  const updateProfile = async (updates: any) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updates
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        await updateAuthState(authState.session);
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  };

  // Resend verification email
  const resendVerification = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  };

  // Update password
  const updatePassword = async (password: string) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  };

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    refreshSession,
    updateProfile,
    resendVerification,
    resetPassword,
    updatePassword
  };
}

