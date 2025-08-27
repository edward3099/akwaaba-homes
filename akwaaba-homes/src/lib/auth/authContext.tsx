'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';

// Create the auth context
const AuthContext = createContext<ReturnType<typeof useEnhancedAuth> | undefined>(undefined);

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useEnhancedAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Export the enhanced auth hook directly for components that need it
export { useEnhancedAuth };
