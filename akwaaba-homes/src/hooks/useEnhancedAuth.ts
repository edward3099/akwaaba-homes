'use client';

import { useEffect, useState, useCallback } from 'react';
import { User, Session, AuthError as SupabaseAuthError } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';
import { validateJWTPayload, extractUserFromJWT, isJWTExpiringSoon } from '@/lib/utils/jwtSecurity';
import { supabase } from '@/lib/supabase';
import { AuthError, parseAuthError } from '@/lib/utils/authErrorHandler';

interface EnhancedUser extends User {
  verification_status?: string;
  user_type?: string;
  email_verified?: boolean;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  userProfile: any | null;
  loading: boolean;
  error: AuthError | null;
  isAuthenticated: boolean;
  isVerified: boolean;
  isAgent: boolean;
  isAdmin: boolean;
  jwtClaims: any | null;
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
  isLoading: boolean;
  userProfile: any | null;
  refreshUserProfile: () => Promise<void>;
  validateAndExtractUser: (session: Session | null) => Promise<{ user: EnhancedUser | null; jwtClaims: any | null; jwtValidation: { isValid: boolean; errors: string[]; warnings: string[] } }>;
  updateAuthState: (session: Session | null) => Promise<void>;
}

export function useEnhancedAuth(): UseEnhancedAuthReturn {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    userProfile: null,
    loading: true,
    error: null,
    isAuthenticated: false,
    isVerified: false,
    isAgent: false,
    isAdmin: false,
    jwtClaims: null,
    jwtValidation: { isValid: false, errors: [], warnings: [] }
  });

  const router = useRouter();
  const pathname = usePathname();

  // Use the singleton Supabase client instead of creating a new one
  // const supabase = createBrowserClient(
  //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
  //   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  // );

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
  }, []);

  // Update auth state
  const updateAuthState = useCallback(async (session: Session | null) => {
    try {
      const { user, jwtClaims, jwtValidation } = await validateAndExtractUser(session);
      
      if (user) {
        // Fetch user profile from the database
        let userProfile = null;
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('user_id, user_role, is_verified, full_name, phone')
            .eq('user_id', user.id)
            .single();
          
          if (!profileError && profile) {
            userProfile = {
              id: profile.user_id,
              user_type: profile.user_role,
              is_verified: profile.is_verified,
              is_active: true, // Default to true for profiles
              full_name: profile.full_name,
              phone: profile.phone
            };
          } else {
            console.warn('Profile fetch error:', profileError);
          }
        } catch (profileError) {
          console.warn('Failed to fetch user profile:', profileError);
        }

        const isVerified = user.email_verified === true && 
                          (userProfile?.is_verified || user.user_metadata?.verification_status === 'verified');
        const isAgent = userProfile?.user_type === 'agent' || user.user_metadata?.user_type === 'agent' || 
                       userProfile?.user_type === 'developer' || user.user_metadata?.user_type === 'developer';
        const isAdmin = userProfile?.user_type === 'admin' || user.user_metadata?.user_type === 'admin';

        setAuthState(prev => ({
          ...prev,
          user: user,
          session,
          loading: false,
          error: null,
          isAuthenticated: true,
          isVerified,
          isAgent,
          isAdmin,
          jwtClaims,
          jwtValidation,
          userProfile: userProfile
        }));
      } else {
        setAuthState(prev => ({
          ...prev,
          user: null,
          session: null,
          loading: false,
          error: null,
          isAuthenticated: false,
          isVerified: false,
          isAgent: false,
          isAdmin: false,
          jwtClaims: null,
          jwtValidation: { isValid: false, errors: [], warnings: [] },
          userProfile: null
        }));
      }
    } catch (error) {
      console.error('Error updating auth state:', error);
      setAuthState(prev => ({ ...prev, loading: false, error: parseAuthError(error) }));
    }
  }, [validateAndExtractUser]);

  // Initialize auth state
  useEffect(() => {
    let isInitialized = false;
    
    const initializeAuth = async () => {
      if (isInitialized) return;
      isInitialized = true;
      
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          setAuthState(prev => ({ ...prev, error: parseAuthError(error), loading: false }));
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
  }, [updateAuthState, pathname, router]);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setAuthState(prev => ({ ...prev, loading: false, error: parseAuthError(error) }));
        return { success: false, error: error.message };
      }

      if (data.session) {
        await updateAuthState(data.session);
        return { success: true };
      }

      return { success: false, error: 'No session created' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setAuthState(prev => ({ ...prev, loading: false, error: parseAuthError(error) }));
      return { success: false, error: errorMessage };
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, metadata: any) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      // Use our API route instead of calling Supabase directly
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          fullName: metadata.full_name,
          userType: metadata.user_type,
          phone: metadata.phone,
          company: metadata.company
        }),
      });

      const result = await response.json();
      console.log('Signup API response:', { status: response.status, result });

      if (!response.ok) {
        console.error('Signup failed:', result);
        setAuthState(prev => ({ ...prev, loading: false, error: result.error || 'Signup failed' }));
        return { success: false, error: result.error || 'Signup failed' };
      }

      // DO NOT store signup data in localStorage as it causes redirect issues
      // localStorage.setItem('agentOnboarding', JSON.stringify({
      //   email,
      //   fullName: metadata.full_name,
      //   company: metadata.company,
      //   phone: metadata.phone,
      //   userType: metadata.user_type
      // }));

      // Since we don't auto sign-in anymore (email verification required),
      // just set loading to false
      setAuthState(prev => ({ ...prev, loading: false }));
      
      console.log('Signup successful, returning success: true');
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setAuthState(prev => ({ ...prev, loading: false, error: parseAuthError(error) }));
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
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : '/reset-password'
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

  // Refresh user profile
  const refreshProfile = useCallback(async () => {
    if (!authState.session) {
      return;
    }
    try {
      const { user, jwtClaims, jwtValidation } = await validateAndExtractUser(authState.session);
      if (user) {
        let userProfile = null;
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('user_id, user_role, is_verified, full_name, phone')
            .eq('user_id', user.id)
            .single();
          if (!profileError && profile) {
            userProfile = {
              id: profile.user_id,
              user_type: profile.user_role,
              is_verified: profile.is_verified,
              is_active: true, // Default to true for profiles
              full_name: profile.full_name,
              phone: profile.phone
            };
          } else {
            console.warn('Profile fetch error:', profileError);
          }
        } catch (profileError) {
          console.warn('Failed to fetch user profile:', profileError);
        }
        setAuthState(prev => ({ ...prev, userProfile }));
      }
    } catch (error) {
      console.error('Error refreshing user profile:', error);
    }
  }, [authState.session, validateAndExtractUser]);

  return {
    ...authState,
    // Add aliases for backward compatibility
    isLoading: authState.loading,
    userProfile: authState.userProfile,
    refreshUserProfile: refreshProfile,
    signIn,
    signUp,
    signOut,
    refreshSession,
    updateProfile,
    resendVerification,
    resetPassword,
    updatePassword,
    validateAndExtractUser,
    updateAuthState
  };
}

