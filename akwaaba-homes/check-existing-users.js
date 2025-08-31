#!/usr/bin/env node

/**
 * Script to check existing users in the database
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkExistingUsers() {
  console.log('🔍 Checking existing users...');
  
  try {
    // Create admin Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }
    
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Check profiles table
    console.log('Checking profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (profilesError) {
      throw new Error(`Profiles query failed: ${profilesError.message}`);
    }
    
    console.log(`Found ${profiles.length} profiles:`);
    profiles.forEach((profile, index) => {
      console.log(`${index + 1}. ${profile.full_name} (${profile.email}) - ${profile.user_role} - ${profile.verification_status}`);
    });
    
    // Check users table
    console.log('\nChecking users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (usersError) {
      throw new Error(`Users query failed: ${usersError.message}`);
    }
    
    console.log(`Found ${users.length} users:`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.full_name} (${user.email}) - ${user.user_type} - ${user.verification_status}`);
    });
    
    // Check auth.users (if possible)
    console.log('\nChecking auth users...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log('Could not access auth users:', authError.message);
    } else {
      console.log(`Found ${authUsers.users.length} auth users:`);
      authUsers.users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} - ${user.user_metadata?.user_type || 'unknown'} - ${user.email_confirmed_at ? 'confirmed' : 'pending'}`);
      });
    }
    
  } catch (error) {
    console.log('❌ Error checking users:', error.message);
  }
}

// Run the user check
checkExistingUsers().catch(console.error);
