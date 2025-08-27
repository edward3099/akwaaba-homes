import { createClient } from '@supabase/supabase-js';

// Admin client that bypasses RLS policies
export function createAdminSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// Function to create a confirmed user profile for testing
export async function createConfirmedUserProfile(userId: string, userData: {
  email: string;
  full_name: string;
  phone?: string;
  user_type: 'agent' | 'seller' | 'buyer';
}) {
  const supabase = createAdminSupabaseClient();

  // First, ensure the user exists in auth.users
  const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
  if (authError) {
    throw new Error(`Auth user not found: ${authError.message}`);
  }

  // Create profile in profiles table
  // Note: profiles table uses user_role instead of user_type and auto-generates id
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .upsert({
      user_id: userId, // Use user_id, not id
      email: userData.email,
      full_name: userData.full_name,
      phone: userData.phone,
      user_role: userData.user_type, // Map user_type to user_role
      is_verified: true,
      verification_status: 'verified', // Set verification status
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (profileError) {
    throw new Error(`Profile creation failed: ${profileError.message}`);
  }

  // Create user record in users table
  const { data: user, error: userError } = await supabase
    .from('users')
    .upsert({
      id: userId,
      email: userData.email,
      full_name: userData.full_name,
      user_type: userData.user_type,
      is_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (userError) {
    throw new Error(`User record creation failed: ${userError.message}`);
  }

  return { profile, user };
}
