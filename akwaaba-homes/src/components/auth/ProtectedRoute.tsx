'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/authContext';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { AlertTriangle, LogIn, Home } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
  requireAuth?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/auth',
  requireAuth = true 
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated, isAgent, isAdmin } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return; // Wait for auth to load

    // If no auth required, allow access
    if (!requireAuth) return;

    // If not authenticated, redirect to auth page
    if (!isAuthenticated) {
      setError('Authentication required');
      router.push(redirectTo);
      return;
    }

    // If roles are specified, check if user has required role
    if (allowedRoles.length > 0) {
      let hasRequiredRole = false;
      
      if (allowedRoles.includes('agent') && isAgent) {
        hasRequiredRole = true;
      } else if (allowedRoles.includes('admin') && isAdmin) {
        hasRequiredRole = true;
      } else if (allowedRoles.includes('seller') && user?.user_metadata?.user_type === 'seller') {
        hasRequiredRole = true;
      }
      
      if (!hasRequiredRole) {
        setError(`Access denied. Required role: ${allowedRoles.join(' or ')}`);
        router.push('/unauthorized');
        return;
      }
    }

    // Clear any previous errors
    setError(null);
  }, [user, loading, isAuthenticated, isAgent, isAdmin, allowedRoles, requireAuth, redirectTo, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-3">
            <Button onClick={() => router.push(redirectTo)}>
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </Button>
            <Button variant="outline" onClick={() => router.push('/')}>
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show children if authenticated and authorized
  return <>{children}</>;
}
