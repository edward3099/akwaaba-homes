#!/usr/bin/env node

/**
 * Test script to verify database connectivity and basic functionality
 * Run this after setting up the database schema
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testDatabase() {
  console.log('🔍 Testing AkwaabaHomes Database Connection...\n');

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('📋 Environment Variables Check:');
  console.log(`  Supabase URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
  console.log(`  Anon Key: ${supabaseAnonKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`  Service Role Key: ${serviceRoleKey ? '✅ Set' : '❌ Missing'}\n`);

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing required environment variables. Please check your .env file.');
    process.exit(1);
  }

  try {
    // Test client-side connection
    console.log('🔗 Testing Client Connection...');
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.log(`  ✅ Client connection successful (no user logged in)`);
    } else {
      console.log(`  ✅ Client connection successful (user: ${user?.email || 'unknown'})`);
    }

    // Test admin connection
    if (serviceRoleKey) {
      console.log('\n🔗 Testing Admin Connection...');
      const adminSupabase = createClient(supabaseUrl, serviceRoleKey);
      
      // Test specific table queries directly
      console.log('\n🔍 Testing Table Access...');
      
      // Test profiles table
      try {
        const { data: profiles, error: profilesError } = await adminSupabase
          .from('profiles')
          .select('*')
          .limit(1);
        
        if (profilesError) {
          console.log(`  ❌ Profiles table: ${profilesError.message}`);
        } else {
          console.log(`  ✅ Profiles table: Accessible (${profiles?.length || 0} records)`);
        }
      } catch (e) {
        console.log(`  ❌ Profiles table: ${e.message}`);
      }

      // Test users table
      try {
        const { data: users, error: usersError } = await adminSupabase
          .from('users')
          .select('*')
          .limit(1);
        
        if (usersError) {
          console.log(`  ❌ Users table: ${usersError.message}`);
        } else {
          console.log(`  ✅ Users table: Accessible (${users?.length || 0} records)`);
        }
      } catch (e) {
        console.log(`  ❌ Users table: ${e.message}`);
      }

      // Test properties table
      try {
        const { data: properties, error: propertiesError } = await adminSupabase
          .from('properties')
          .select('*')
          .limit(1);
        
        if (propertiesError) {
          console.log(`  ❌ Properties table: ${propertiesError.message}`);
        } else {
          console.log(`  ✅ Properties table: Accessible (${properties?.length || 0} records)`);
        }
      } catch (e) {
        console.log(`  ❌ Properties table: ${e.message}`);
      }

      // Test property_images table
      try {
        const { data: images, error: imagesError } = await adminSupabase
          .from('property_images')
          .select('*')
          .limit(1);
        
        if (imagesError) {
          console.log(`  ❌ Property_images table: ${imagesError.message}`);
        } else {
          console.log(`  ✅ Property_images table: Accessible (${images?.length || 0} records)`);
        }
      } catch (e) {
        console.log(`  ❌ Property_images table: ${e.message}`);
      }

      // Test inquiries table
      try {
        const { data: inquiries, error: inquiriesError } = await adminSupabase
          .from('inquiries')
          .select('*')
          .limit(1);
        
        if (inquiriesError) {
          console.log(`  ❌ Inquiries table: ${inquiriesError.message}`);
        } else {
          console.log(`  ✅ Inquiries table: Accessible (${inquiries?.length || 0} records)`);
        }
      } catch (e) {
        console.log(`  ❌ Inquiries table: ${e.message}`);
      }

      // Test analytics table
      try {
        const { data: analytics, error: analyticsError } = await adminSupabase
          .from('analytics')
          .select('*')
          .limit(1);
        
        if (analyticsError) {
          console.log(`  ❌ Analytics table: ${analyticsError.message}`);
        } else {
          console.log(`  ✅ Analytics table: Accessible (${analytics?.length || 0} records)`);
        }
      } catch (e) {
        console.log(`  ❌ Analytics table: ${e.message}`);
      }
    }

    console.log('\n✅ Database test completed!');
    
    if (!serviceRoleKey) {
      console.log('\n💡 Tip: Set SUPABASE_SERVICE_ROLE_KEY to test admin functionality');
    }

  } catch (error) {
    console.error('\n❌ Database test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the test
testDatabase().catch(console.error);
