'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface MockUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'AGENT';
  avatar?: string;
  company?: string;
}

interface MockAuthContextType {
  user: MockUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: 'ADMIN' | 'AGENT') => void;
}

const MockAuthContext = createContext<MockAuthContextType | undefined>(undefined);

export function MockAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);

  // Mock login - accepts any email/password
  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock user based on email
    let mockUser: MockUser;
    
    if (email.includes('admin')) {
      mockUser = {
        id: 'admin-1',
        name: 'Admin User',
        email: email,
        role: 'ADMIN',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&q=80',
        company: 'Akwaaba Homes'
      };
    } else {
      // Default to agent for any non-admin email
      mockUser = {
        id: 'agent-1',
        name: 'Kwame Asante',
        email: email,
        role: 'AGENT',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&q=80',
        company: 'AkwaabaHomes Real Estate'
      };
    }
    
    setUser(mockUser);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (role: 'ADMIN' | 'AGENT') => {
    if (user) {
      setUser({ ...user, role });
    }
  };

  return (
    <MockAuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout,
      switchRole
    }}>
      {children}
    </MockAuthContext.Provider>
  );
}

export function useMockAuth() {
  const context = useContext(MockAuthContext);
  if (context === undefined) {
    throw new Error('useMockAuth must be used within a MockAuthProvider');
  }
  return context;
}
