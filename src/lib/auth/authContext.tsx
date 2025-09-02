'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { DatabaseUser } from '@/lib/types/database';

interface AuthContextType {
  user: User | null;
  userProfile: DatabaseUser | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string, userData: Partial<DatabaseUser>) => Promise<{ user: User | null; error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: Partial<DatabaseUser>) => Promise<{ error: AuthError | null }>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<DatabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile from our database
  const fetchUserProfile = async (userId: string) => {
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

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          const profile = await fetchUserProfile(initialSession.user.id);
          setUserProfile(profile);
        }

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
              const profile = await fetchUserProfile(session.user.id);
              setUserProfile(profile);
            } else {
              setUserProfile(null);
            }

            setIsLoading(false);
          }
        );

        setIsLoading(false);
        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Sign up function
  const signUp = async (email: string, password: string, userData: Partial<DatabaseUser>) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            user_type: userData.user_type || 'agent', // Default to agent
            full_name: userData.full_name,
            phone: userData.phone,
            company_name: userData.company_name,
            license_number: userData.license_number,
            subscription_tier: userData.subscription_tier || 'basic'
          }
        }
      });

      if (error) {
        return { user: null, error };
      }

      if (data.user) {
        // Create user profile in our users table
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email: data.user.email!,
              user_type: userData.user_type || 'agent',
              full_name: userData.full_name,
              phone: userData.phone,
              company_name: userData.company_name,
              license_number: userData.license_number,
              subscription_tier: userData.subscription_tier || 'basic',
              is_verified: false,
              verification_status: 'pending'
            }
          ]);

        if (profileError) {
          console.error('Error creating user profile:', profileError);
        }
      }

      return { user: data.user, error: null };
    } catch (error) {
      console.error('Error in signUp:', error);
      return { user: null, error: error as AuthError };
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { user: null, error };
      }

      return { user: data.user, error: null };
    } catch (error) {
      console.error('Error in signIn:', error);
      return { user: null, error: error as AuthError };
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserProfile(null);
      setSession(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Reset password function
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      return { error };
    } catch (error) {
      console.error('Error in resetPassword:', error);
      return { error: error as AuthError };
    }
  };

  // Update profile function
  const updateProfile = async (updates: Partial<DatabaseUser>) => {
    if (!user) {
      return { error: { message: 'No user logged in' } as AuthError };
    }

    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        return { error: { message: error.message } as AuthError };
      }

      // Refresh user profile
      await refreshUserProfile();

      return { error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { error: { message: 'Failed to update profile' } as AuthError };
    }
  };

  // Refresh user profile
  const refreshUserProfile = async () => {
    if (!user) return;

    const profile = await fetchUserProfile(user.id);
    setUserProfile(profile);
  };

  const value: AuthContextType = {
    user,
    userProfile,
    session,
    isLoading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    refreshUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
