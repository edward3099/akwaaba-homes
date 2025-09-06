'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { User, Session } from '@supabase/supabase-js';

// Supabase client configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// User profile interface
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  user_type: 'admin' | 'super_admin' | 'moderator' | 'seller' | 'agent' | 'buyer';
  is_verified: boolean;
  is_active: boolean;
  phone?: string;
  company_name?: string;
  bio?: string;
  profile_image_url?: string;
  created_at: string;
  updated_at: string;
}

// Authentication context interface
interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: Partial<UserProfile>) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error?: string }>;
  refreshProfile: () => Promise<void>;
}

// Create the authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Authentication provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from the database
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Update user profile
  const updateProfile = async (updates: Partial<UserProfile>): Promise<{ error?: string }> => {
    if (!user) {
      return { error: 'No user logged in' };
    }

    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        return { error: error.message };
      }

      // Refresh the profile
      await refreshProfile();
      return {};
    } catch (error) {
      console.error('Error updating profile:', error);
      return { error: 'Failed to update profile' };
    }
  };

  // Refresh user profile
  const refreshProfile = async (): Promise<void> => {
    if (!user) {
      setProfile(null);
      return;
    }

    const userProfile = await fetchUserProfile(user.id);
    setProfile(userProfile);
  };

  // Sign up function
  const signUp = async (email: string, password: string, userData: Partial<UserProfile>): Promise<{ error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            user_type: userData.user_type || 'buyer',
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        // Create user profile in the database
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email: data.user.email!,
              full_name: userData.full_name || '',
              user_type: userData.user_type || 'buyer',
              is_verified: false,
              is_active: true,
              phone: userData.phone || null,
              company_name: userData.company_name || null,
              bio: userData.bio || null,
              profile_image_url: userData.profile_image_url || null,
            },
          ]);

        if (profileError) {
          console.error('Error creating user profile:', profileError);
          return { error: 'Account created but profile setup failed' };
        }
      }

      return {};
    } catch (error) {
      console.error('Error during sign up:', error);
      return { error: 'Failed to create account' };
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      console.error('Error during sign in:', error);
      return { error: 'Failed to sign in' };
    }
  };

  // Sign out function
  const signOut = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  // Effect to handle authentication state changes
  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const userProfile = await fetchUserProfile(session.user.id);
        setProfile(userProfile);
      }
      
      setLoading(false);
    };

    getInitialSession();

    // Listen for authentication changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const userProfile = await fetchUserProfile(session.user.id);
          setProfile(userProfile);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Context value
  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use the authentication context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook to check if user has specific role
export function useUserRole(): {
  isAdmin: boolean;
  isSeller: boolean;
  isBuyer: boolean;
  hasRole: (role: string | string[]) => boolean;
} {
  const { profile } = useAuth();
  
  const isAdmin = profile?.user_type === 'admin' || profile?.user_type === 'super_admin' || profile?.user_type === 'moderator';
  const isSeller = profile?.user_type === 'seller' || profile?.user_type === 'agent' || profile?.user_type === 'developer';
  const isBuyer = profile?.user_type === 'buyer';
  
  const hasRole = (role: string | string[]): boolean => {
    if (!profile) return false;
    
    if (Array.isArray(role)) {
      return role.includes(profile.user_type);
    }
    
    return profile.user_type === role;
  };
  
  return { isAdmin, isSeller, isBuyer, hasRole };
}

// Hook to check if user is authenticated
export function useIsAuthenticated(): boolean {
  const { user } = useAuth();
  return !!user;
}

// Hook to check if user is verified
export function useIsVerified(): boolean {
  const { profile } = useAuth();
  return profile?.is_verified ?? false;
}

// Hook to check if user is active
export function useIsActive(): boolean {
  const { profile } = useAuth();
  return profile?.is_active ?? false;
}

