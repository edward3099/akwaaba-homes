#!/usr/bin/env node

/**
 * Script to reset password for test agent 2
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function resetTestAgent2Password() {
  console.log('🔑 Resetting Test Agent 2 password...');
  
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
    
    // First, find the user by email
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      throw new Error(`Failed to list users: ${listError.message}`);
    }
    
    const user = users.users.find(u => u.email === 'testagent2@gmail.com');
    if (!user) {
      throw new Error('User testagent2@gmail.com not found');
    }
    
    console.log('Found user:', user.id, user.email);
    
    // Update password using user ID
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: 'testagent123' }
    );
    
    if (updateError) {
      throw new Error(`Failed to update password: ${updateError.message}`);
    }
    
    console.log('✅ Password updated successfully for testagent2@gmail.com');
    console.log('New password: testagent123');
    
  } catch (error) {
    console.log('❌ Error resetting password:', error.message);
  }
}

// Run the password reset
resetTestAgent2Password().catch(console.error);
