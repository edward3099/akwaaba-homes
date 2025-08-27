#!/usr/bin/env node

/**
 * Script to create an admin user for testing
 * This will directly create an admin user using the Supabase admin client
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Admin user data
const ADMIN_USER = {
  email: 'admin@akwaabahomes.com',
  password: 'adminpassword123',
  full_name: 'Admin User',
  phone: '+233244123456',
  user_type: 'admin'
};

async function createAdminUser() {
  console.log('🔑 Creating Admin User...');
  
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
    
    console.log('Step 1: Creating auth user...');
    
    // Create user in auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: ADMIN_USER.email,
      password: ADMIN_USER.password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        first_name: 'Admin',
        last_name: 'User',
        phone: ADMIN_USER.phone,
        company_name: 'AkwaabaHomes',
        business_type: 'Real Estate',
        license_number: 'ADMIN001',
        experience_years: 10,
        bio: 'System administrator for AkwaabaHomes platform',
        user_type: 'admin',
        verification_status: 'verified'
      }
    });
    
    if (authError) {
      throw new Error(`Auth user creation failed: ${authError.message}`);
    }
    
    console.log('✅ Auth user created successfully');
    console.log('   User ID:', authData.user.id);
    
    // Step 2: Create profile in profiles table
    console.log('Step 2: Creating admin profile...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        email: ADMIN_USER.email,
        full_name: ADMIN_USER.full_name,
        phone: ADMIN_USER.phone,
        company_name: 'AkwaabaHomes',
        business_type: 'Real Estate',
        license_number: 'ADMIN001',
        experience_years: 10,
        bio: 'System administrator for AkwaabaHomes platform',
        user_role: 'admin',
        verification_status: 'verified',
        is_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (profileError) {
      throw new Error(`Profile creation failed: ${profileError.message}`);
    }
    
    console.log('✅ Admin profile created successfully');
    console.log('   Profile ID:', profile.id);
    console.log('   User Role:', profile.user_role);
    console.log('   Verified:', profile.is_verified);
    
    // Step 3: Create user record in users table
    console.log('Step 3: Creating user record...');
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: ADMIN_USER.email,
        full_name: ADMIN_USER.full_name,
        phone: ADMIN_USER.phone,
        user_type: 'admin',
        is_verified: true,
        verification_status: 'verified',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (userError) {
      throw new Error(`User record creation failed: ${userError.message}`);
    }
    
    console.log('✅ User record created successfully');
    console.log('   User ID:', user.id);
    console.log('   User Type:', user.user_type);
    
    console.log('\n🎉 Admin user creation complete!');
    console.log('You can now log in with:');
    console.log('   Email:', ADMIN_USER.email);
    console.log('   Password:', ADMIN_USER.password);
    console.log('   User ID:', authData.user.id);
    
    return true;
    
  } catch (error) {
    console.log('❌ Admin user creation error:', error.message);
    return false;
  }
}

// Run the admin user creation
createAdminUser().catch(console.error);
