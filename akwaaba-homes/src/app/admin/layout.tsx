import React from 'react';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
          }
        },
      },
    }
  );

  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect('/login?redirect=/admin');
  }

  // Check if user has admin role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('user_role, verification_status')
    .eq('user_id', user.id)
    .single();

  if (profileError || !profile) {
    redirect('/login?redirect=/admin');
  }

  // Check if user is an admin role
  if (!['admin', 'super_admin', 'moderator'].includes(profile.user_role)) {
    redirect('/unauthorized');
  }

  // Check if user is verified (be more lenient for admin users)
  if (profile.verification_status !== 'verified' && profile.user_role !== 'admin') {
    redirect('/unauthorized?reason=unverified');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
