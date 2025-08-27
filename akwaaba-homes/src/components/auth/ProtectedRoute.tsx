'use client';

import React from 'react';
import { useAuth } from '@/lib/auth/authContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/auth' 
}: ProtectedRouteProps) {
  const { user, isAgent, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // User not authenticated, redirect to login
        router.push(redirectTo);
        return;
      }

      if (allowedRoles.length > 0) {
        // Check if user has required role
        const hasRequiredRole = allowedRoles.some(role => {
          const upperRole = role.toUpperCase();
          if (upperRole === 'ADMIN') return isAdmin;
          if (upperRole === 'AGENT') return isAgent;
          if (upperRole === 'SELLER') return !isAdmin && !isAgent; // Assume seller if not admin/agent
          return false;
        });
        
        if (!hasRequiredRole) {
          // User doesn't have required role, redirect to unauthorized page
          router.push('/unauthorized');
          return;
        }
      }
    }
  }, [user, isAgent, isAdmin, loading, allowedRoles, redirectTo, router]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render children (will redirect)
  if (!user) {
    return null;
  }

  // If role check is required and user doesn't have required role, don't render children
  if (allowedRoles.length > 0) {
    const hasRequiredRole = allowedRoles.some(role => {
      const upperRole = role.toUpperCase();
      if (upperRole === 'ADMIN') return isAdmin;
      if (upperRole === 'AGENT') return isAgent;
      if (upperRole === 'SELLER') return !isAdmin && !isAgent; // Assume seller if not admin/agent
      return false;
    });
    
    if (!hasRequiredRole) {
      return null;
    }
  }

  // User is authenticated and has required role, render children
  return <>{children}</>;
}
