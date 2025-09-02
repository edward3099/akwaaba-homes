import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './authContext';
import { UserRole } from '@/lib/types/database';

interface UseAuthRedirectOptions {
  allowedRoles?: UserRole[];
  redirectTo?: string;
  requireAuth?: boolean;
}

export function useAuthRedirect({
  allowedRoles = [],
  redirectTo = '/auth',
  requireAuth = true
}: UseAuthRedirectOptions = {}) {
  const { user, userProfile, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Wait for auth to load

    // If no auth required, allow access
    if (!requireAuth) return;

    // If not authenticated, redirect to auth page
    if (!user) {
      router.push(redirectTo);
      return;
    }

    // If roles are specified, check if user has required role
    if (allowedRoles.length > 0 && userProfile) {
      const userRole = userProfile.user_type;
      
      if (!allowedRoles.includes(userRole)) {
        // User doesn't have required role, redirect to appropriate dashboard
        if (userRole === 'admin') {
          router.push('/admin');
        } else if (userRole === 'agent') {
          router.push('/agent-dashboard');
        } else if (userRole === 'seller') {
          router.push('/seller-dashboard');
        } else {
          router.push('/dashboard');
        }
        return;
      }
    }
  }, [user, userProfile, isLoading, allowedRoles, redirectTo, requireAuth, router]);

  return {
    user,
    userProfile,
    isLoading,
    isAuthenticated: !!user,
    hasRequiredRole: allowedRoles.length === 0 || (userProfile && allowedRoles.includes(userProfile.user_type))
  };
}
