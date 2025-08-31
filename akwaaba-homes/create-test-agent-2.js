#!/usr/bin/env node

/**
 * Script to create test agent 2 for testing
 * This will directly create a test agent user using the Supabase admin client
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Test Agent 2 data
const TEST_AGENT_2 = {
  email: 'testagent2@akwaabahomes.com',
  password: 'testagent123',
  full_name: 'Test Agent 2',
  phone: '+233244987654',
  user_type: 'agent'
};

async function createTestAgent2() {
  console.log('🔑 Creating Test Agent 2...');
  
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
      email: TEST_AGENT_2.email,
      password: TEST_AGENT_2.password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        first_name: 'Test',
        last_name: 'Agent 2',
        phone: TEST_AGENT_2.phone,
        company_name: 'Test Real Estate Agency',
        business_type: 'Real Estate',
        license_number: 'AGENT002',
        experience_years: 5,
        bio: 'Test agent for AkwaabaHomes platform testing',
        user_type: 'agent',
        verification_status: 'verified'
      }
    });
    
    if (authError) {
      throw new Error(`Auth user creation failed: ${authError.message}`);
    }
    
    console.log('✅ Auth user created successfully');
    console.log('   User ID:', authData.user.id);
    
    // Step 2: Create profile in profiles table
    console.log('Step 2: Creating agent profile...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        email: TEST_AGENT_2.email,
        full_name: TEST_AGENT_2.full_name,
        phone: TEST_AGENT_2.phone,
        company_name: 'Test Real Estate Agency',
        business_type: 'Real Estate',
        license_number: 'AGENT002',
        experience_years: 5,
        bio: 'Test agent for AkwaabaHomes platform testing',
        user_role: 'agent',
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
    
    console.log('✅ Agent profile created successfully');
    console.log('   Profile ID:', profile.id);
    console.log('   User Role:', profile.user_role);
    console.log('   Verified:', profile.is_verified);
    
    // Step 3: Create user record in users table
    console.log('Step 3: Creating user record...');
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: TEST_AGENT_2.email,
        full_name: TEST_AGENT_2.full_name,
        phone: TEST_AGENT_2.phone,
        user_type: 'agent',
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
    
    console.log('\n🎉 Test Agent 2 creation complete!');
    console.log('You can now log in with:');
    console.log('   Email:', TEST_AGENT_2.email);
    console.log('   Password:', TEST_AGENT_2.password);
    console.log('   User ID:', authData.user.id);
    
    return true;
    
  } catch (error) {
    console.log('❌ Test Agent 2 creation error:', error.message);
    return false;
  }
}

// Run the test agent 2 creation
createTestAgent2().catch(console.error);
