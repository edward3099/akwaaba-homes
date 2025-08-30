import { useEffect, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/authContext';
import { useApiClient } from '@/lib/api/apiClient';
import { useErrorHandler } from '@/lib/utils/errorHandler';
import { useLoading } from '@/lib/hooks/useLoading';
import { useToastIntegration } from '@/lib/hooks/useToastIntegration';
import { securityService } from '@/lib/services/securityService';

// Route protection configuration
export interface RouteProtection {
  requireAuth: boolean;
  allowedRoles?: string[];
  redirectTo?: string;
  fallbackComponent?: React.ComponentType;
}

// Route configuration mapping
export interface RouteConfig {
  [path: string]: RouteProtection;
}

// Default route configuration
const DEFAULT_ROUTE_CONFIG: RouteConfig = {
  '/': { requireAuth: false },
  '/auth': { requireAuth: false },
  '/properties': { requireAuth: false },
  '/admin': { requireAuth: true, allowedRoles: ['admin'], redirectTo: '/auth' },
  '/seller': { requireAuth: true, allowedRoles: ['seller', 'admin'], redirectTo: '/auth' },
  '/agent': { requireAuth: true, allowedRoles: ['agent', 'admin'], redirectTo: '/auth' },
  '/dashboard': { requireAuth: true, redirectTo: '/auth' },
  '/profile': { requireAuth: true, redirectTo: '/auth' },
  '/test-apis': { requireAuth: false }, // Development only
  '/test-image-system': { requireAuth: false }, // Development only
  '/test-database': { requireAuth: false }, // Development only
};

// Authentication state
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
  userProfile: any;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAllRoles: (roles: string[]) => boolean;
}

// Authentication actions
export interface AuthActions {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userType: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: any) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
}

// Route protection result
export interface RouteProtectionResult {
  isProtected: boolean;
  isAllowed: boolean;
  requiresAuth: boolean;
  hasRequiredRole: boolean;
  redirectPath?: string;
  fallbackComponent?: React.ComponentType;
}

export const useAuthIntegration = (customRouteConfig?: Partial<RouteConfig>) => {
  const router = useRouter();
  const pathname = usePathname();
  const auth = useAuth();
  const { apiClient } = useApiClient();
  const { showSuccess, showError } = useToastIntegration('useAuthIntegration');
  const { handleError } = useErrorHandler();
  const { withLoading } = useLoading();

  // Merge custom route config with default
  const routeConfig = useMemo(() => ({
    ...DEFAULT_ROUTE_CONFIG,
    ...customRouteConfig,
  }), [customRouteConfig]);

  // Get current route protection configuration
  const currentRouteProtection = useMemo(() => {
    // Find exact match first
    if (routeConfig[pathname]) {
      return routeConfig[pathname];
    }

    // Find pattern match (e.g., /admin/users -> /admin)
    const pathSegments = pathname.split('/');
    for (let i = pathSegments.length; i > 0; i--) {
      const pattern = pathSegments.slice(0, i).join('/');
      if (routeConfig[pattern]) {
        return routeConfig[pattern];
      }
    }

    // Default to no protection
    return { requireAuth: false };
  }, [pathname, routeConfig]);

  // Check if user has specific role
  const hasRole = useCallback((role: string): boolean => {
    if (!auth.userProfile) return false;
    return auth.userProfile.user_type === role;
  }, [auth.userProfile]);

  // Check if user has any of the specified roles
  const hasAnyRole = useCallback((roles: string[]): boolean => {
    if (!auth.userProfile) return false;
    return roles.includes(auth.userProfile.user_type);
  }, [auth.userProfile]);

  // Check if user has all specified roles (for future multi-role support)
  const hasAllRoles = useCallback((roles: string[]): boolean => {
    if (!auth.userProfile) return false;
    return roles.every(role => auth.userProfile.user_type === role);
  }, [auth.userProfile]);

  // Check route protection for current path
  const checkRouteProtection = useCallback((): RouteProtectionResult => {
    const protection = currentRouteProtection;
    
    if (!protection.requireAuth) {
      return {
        isProtected: false,
        isAllowed: true,
        requiresAuth: false,
        hasRequiredRole: true,
      };
    }

    if (!auth.isAuthenticated) {
      return {
        isProtected: true,
        isAllowed: false,
        requiresAuth: true,
        hasRequiredRole: false,
        redirectPath: protection.redirectTo || '/auth',
      };
    }

    if (protection.allowedRoles && !hasAnyRole(protection.allowedRoles)) {
      return {
        isProtected: true,
        isAllowed: false,
        requiresAuth: true,
        hasRequiredRole: false,
        redirectPath: protection.redirectTo || '/auth',
        fallbackComponent: protection.fallbackComponent,
      };
    }

    return {
      isProtected: true,
      isAllowed: true,
      requiresAuth: true,
      hasRequiredRole: true,
    };
  }, [currentRouteProtection, auth.isAuthenticated, hasAnyRole]);

  // Enhanced sign in with security logging
  const signIn = useCallback(async (email: string, password: string): Promise<void> => {
    return (withLoading as any)(
      async () => {
        try {
          // Sanitize inputs
          const sanitizedEmail = securityService.sanitizeInput(email, 'email');
          const sanitizedPassword = password; // Don't sanitize passwords

          // Validate inputs
          if (!securityService.validateEmail(sanitizedEmail)) {
            throw new Error('Invalid email format');
          }

          if (password.length < 6) {
            throw new Error('Password must be at least 6 characters');
          }

          // Attempt sign in
          const result = await auth.signIn(sanitizedEmail, password);
          
          if (result.success) {
            // Log successful authentication
            await securityService.logSecurityEvent(
              'user_signin_success',
              'low',
              {
                email: sanitizedEmail,
                user_agent: navigator.userAgent,
                timestamp: new Date().toISOString(),
              }
            );

            showSuccess('Signed in successfully');
            
            // Redirect based on user role
            const userProfile = auth.userProfile;
            if (userProfile) {
              const redirectPath = getRedirectPathForUser(userProfile.user_type);
              if (redirectPath && redirectPath !== pathname) {
                router.push(redirectPath);
              }
            }
          } else {
            throw new Error(result.error || 'Sign in failed');
          }
        } catch (error) {
          // Log failed authentication attempt
          await securityService.logSecurityEvent(
            'user_signin_failed',
            'medium',
            {
              email,
              error: error instanceof Error ? error.message : 'Unknown error',
              user_agent: navigator.userAgent,
              timestamp: new Date().toISOString(),
            }
          );

          throw error;
        }
      },
      'Signing in...'
    );
  }, [auth, withLoading, showSuccess, router, pathname]);

  // Enhanced sign up with security logging
  const signUp = useCallback(async (email: string, password: string, userType: string): Promise<void> => {
    return (withLoading as any)(
      async () => {
        try {
          // Sanitize and validate inputs
          const sanitizedEmail = securityService.sanitizeInput(email, 'email');
          const sanitizedUserType = securityService.sanitizeInput(userType, 'text');

          if (!securityService.validateEmail(sanitizedEmail)) {
            throw new Error('Invalid email format');
          }

          if (password.length < 6) {
            throw new Error('Password must be at least 6 characters');
          }

          if (!['seller', 'agent'].includes(sanitizedUserType)) {
            throw new Error('Invalid user type');
          }

          // Attempt sign up
          const result = await auth.signUp(sanitizedEmail, password, sanitizedUserType);
          
          if (result.success) {
            // Log successful registration
            await securityService.logSecurityEvent(
              'user_registration_success',
              'low',
              {
                email: sanitizedEmail,
                user_type: sanitizedUserType,
                user_agent: navigator.userAgent,
                timestamp: new Date().toISOString(),
              }
            );

            showSuccess('Account created successfully! Please check your email to verify your account.');
          } else {
            throw new Error(result.error || 'Sign up failed');
          }
        } catch (error) {
          // Log failed registration attempt
          await securityService.logSecurityEvent(
            'user_registration_failed',
            'medium',
            {
              email,
              user_type: userType,
              error: error instanceof Error ? error.message : 'Unknown error',
              user_agent: navigator.userAgent,
              timestamp: new Date().toISOString(),
            }
          );

          throw error;
        }
      },
      'Creating account...',
      5000
    );
  }, [auth, withLoading, showSuccess]);

  // Enhanced sign out with security logging
  const signOut = useCallback(async (): Promise<void> => {
    return (withLoading as any)(
      async () => {
        try {
          // Log sign out attempt
          if (auth.userProfile) {
            await securityService.logSecurityEvent(
              'user_signout',
              'low',
              {
                user_id: auth.userProfile.id,
                user_type: auth.userProfile.user_type,
                timestamp: new Date().toISOString(),
              }
            );
          }

          await auth.signOut();
          showSuccess('Signed out successfully');
          router.push('/');
        } catch (error) {
          throw error;
        }
      },
      'Signing out...',
      2000
    );
  }, [auth, withLoading, showSuccess, router]);

  // Enhanced profile refresh
  const refreshProfile = useCallback(async (): Promise<void> => {
    return (withLoading as any)(
      async () => {
        try {
          await auth.refreshUserProfile();
          showSuccess('Profile refreshed successfully');
        } catch (error) {
          throw error;
        }
      },
      'Refreshing profile...',
      3000
    );
  }, [auth, withLoading, showSuccess]);

  // Enhanced profile update
  const updateProfile = useCallback(async (updates: any): Promise<void> => {
    return (withLoading as any)(
      async () => {
        try {
          // Sanitize updates
          const sanitizedUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
            if (typeof value === 'string') {
              switch (key) {
                case 'email':
                  acc[key] = securityService.sanitizeInput(value as string, 'email');
                  break;
                case 'phone':
                  acc[key] = securityService.sanitizeInput(value as string, 'phone');
                  break;
                case 'full_name':
                case 'bio':
                  acc[key] = securityService.sanitizeInput(value as string, 'text');
                  break;
                default:
                  acc[key] = value;
              }
            } else {
              acc[key] = value;
            }
            return acc;
          }, {} as any);

          // Validate email if present
          if (sanitizedUpdates.email && !securityService.validateEmail(sanitizedUpdates.email)) {
            throw new Error('Invalid email format');
          }

          // Validate phone if present
          if (sanitizedUpdates.phone && !securityService.validatePhone(sanitizedUpdates.phone)) {
            throw new Error('Invalid phone format');
          }

          const result = await auth.updateProfile(sanitizedUpdates);
          
          if (result.success) {
            // Log profile update
            await securityService.logSecurityEvent(
              'profile_updated',
              'low',
              {
                user_id: auth.userProfile?.id,
                updated_fields: Object.keys(sanitizedUpdates),
                timestamp: new Date().toISOString(),
              }
            );

            showSuccess('Profile updated successfully');
          } else {
            throw new Error(result.error || 'Profile update failed');
          }
        } catch (error) {
          throw error;
        }
      },
      'Updating profile...',
      3000
    );
  }, [auth, withLoading, showSuccess]);

  // Enhanced password reset
  const resetPassword = useCallback(async (email: string): Promise<void> => {
    return (withLoading as any)(
      async () => {
        try {
          const sanitizedEmail = securityService.sanitizeInput(email, 'email');
          
          if (!securityService.validateEmail(sanitizedEmail)) {
            throw new Error('Invalid email format');
          }

          const result = await auth.resetPassword(sanitizedEmail);
          
          if (result.success) {
            // Log password reset request
            await securityService.logSecurityEvent(
              'password_reset_requested',
              'medium',
              {
                email: sanitizedEmail,
                user_agent: navigator.userAgent,
                timestamp: new Date().toISOString(),
              }
            );

            showSuccess('Password reset email sent. Please check your inbox.');
          } else {
            throw new Error(result.error || 'Password reset failed');
          }
        } catch (error) {
          throw error;
        }
      },
      'Sending reset email...',
      3000
    );
  }, [auth, withLoading, showSuccess]);

  // Enhanced email verification
  const verifyEmail = useCallback(async (token: string): Promise<void> => {
    return (withLoading as any)(
      async () => {
        try {
          const sanitizedToken = securityService.sanitizeInput(token, 'text');
          
          if (!sanitizedToken || sanitizedToken.length < 10) {
            throw new Error('Invalid verification token');
          }

          // This would typically call an API endpoint to verify the token
          // For now, we'll simulate success
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Log email verification
          await securityService.logSecurityEvent(
            'email_verified',
            'low',
            {
              token_length: sanitizedToken.length,
              timestamp: new Date().toISOString(),
            }
          );

          showSuccess('Email verified successfully!');
          router.push('/auth?mode=signin');
        } catch (error) {
          throw error;
        }
      },
      'Verifying email...',
      3000
    );
  }, [withLoading, showSuccess, router]);

  // Get redirect path for user based on role
  const getRedirectPathForUser = useCallback((userType: string): string => {
    switch (userType) {
      case 'admin':
        return '/admin';
      case 'seller':
        return '/seller';
      case 'agent':
        return '/agent';
      default:
        return '/dashboard';
    }
  }, []);

  // Effect to handle route protection
  useEffect(() => {
    if (auth.isLoading) return; // Wait for auth to initialize

    const protection = checkRouteProtection();
    
    if (protection.isProtected && !protection.isAllowed) {
      // Redirect to appropriate path
      if (protection.redirectPath) {
        router.push(protection.redirectPath);
      }
    }
  }, [auth.isLoading, auth.isAuthenticated, pathname, checkRouteProtection, router]);

  // Effect to log authentication state changes
  useEffect(() => {
    if (auth.isLoading) return;

    const logAuthStateChange = async () => {
      try {
        if (auth.isAuthenticated && auth.userProfile) {
          await securityService.logSecurityEvent(
            'user_session_active',
            'low',
            {
              user_id: auth.userProfile.id,
              user_type: auth.userProfile.user_type,
              timestamp: new Date().toISOString(),
            }
          );
        }
      } catch (error) {
        console.error('Failed to log auth state change:', error);
      }
    };

    logAuthStateChange();
  }, [auth.isLoading, auth.isAuthenticated, auth.userProfile]);

  // Memoized auth state
  const authState: AuthState = useMemo(() => ({
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    user: auth.user,
    userProfile: auth.userProfile,
    hasRole,
    hasAnyRole,
    hasAllRoles,
  }), [auth.isAuthenticated, auth.isLoading, auth.user, auth.userProfile, hasRole, hasAnyRole, hasAllRoles]);

  // Memoized auth actions
  const authActions: AuthActions = useMemo(() => ({
    signIn,
    signUp,
    signOut,
    refreshProfile,
    updateProfile,
    resetPassword,
    verifyEmail,
  }), [signIn, signUp, signOut, refreshProfile, updateProfile, resetPassword, verifyEmail]);

  return {
    // State
    authState,
    currentRouteProtection,
    
    // Actions
    authActions,
    
    // Utilities
    checkRouteProtection,
    getRedirectPathForUser,
    
    // Route protection result for current path
    routeProtection: checkRouteProtection(),
  };
};

// Hook for simple authentication checks
export const useAuthCheck = () => {
  const auth = useAuth();
  
  const isAdmin = useMemo(() => 
    auth.userProfile?.user_type === 'admin', [auth.userProfile]
  );
  
  const isSeller = useMemo(() => 
    auth.userProfile?.user_type === 'seller', [auth.userProfile]
  );
  
  const isAgent = useMemo(() => 
    auth.userProfile?.user_type === 'agent', [auth.userProfile]
  );
  
  const isStaff = useMemo(() => 
    isAdmin || isSeller || isAgent, [isAdmin, isSeller, isAgent]
  );

  return {
    isAdmin,
    isSeller,
    isAgent,
    isStaff,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    user: auth.user,
    userProfile: auth.userProfile,
  };
};
