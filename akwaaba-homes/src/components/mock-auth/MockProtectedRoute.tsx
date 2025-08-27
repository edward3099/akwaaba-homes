'use client';

import { useMockAuth } from '@/lib/mock-auth/mockAuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface MockProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

export default function MockProtectedRoute({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/mock-login' 
}: MockProtectedRouteProps) {
  const { user, isAuthenticated } = useMockAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
      // Redirect based on user role
      switch (user.role) {
        case 'ADMIN':
          router.push('/admin');
          break;
        case 'AGENT':
          router.push('/agent-dashboard');
          break;
        default:
          router.push('/dashboard');
      }
      return;
    }
  }, [isAuthenticated, user, router, allowedRoles, redirectTo]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
