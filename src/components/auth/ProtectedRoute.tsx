'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/authContext';
import { UserRole } from '@/lib/types/database';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
  requireAuth?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/auth',
  requireAuth = true 
}: ProtectedRouteProps) {
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

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If no auth required, render children immediately
  if (!requireAuth) {
    return <>{children}</>;
  }

  // If not authenticated, don't render anything (will redirect)
  if (!user) {
    return null;
  }

  // If roles are specified, check if user has required role
  if (allowedRoles.length > 0 && userProfile) {
    const userRole = userProfile.user_type;
    
    if (!allowedRoles.includes(userRole)) {
      return null; // Will redirect due to useEffect
    }
  }

  // User is authenticated and has required role (if specified)
  return <>{children}</>;
}
