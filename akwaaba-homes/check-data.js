#!/usr/bin/env node

/**
 * Script to check the actual data in the database tables
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function checkData() {
  console.log('🔍 Checking AkwaabaHomes Database Data...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required');
    process.exit(1);
  }

  const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    // Check profiles
    console.log('👥 Profiles:');
    const { data: profiles, error: profilesError } = await adminSupabase
      .from('profiles')
      .select('*');
    
    if (profilesError) {
      console.log(`  ❌ Error: ${profilesError.message}`);
    } else {
      console.log(`  📊 Found ${profiles?.length || 0} profiles:`);
      profiles?.forEach(profile => {
        console.log(`    - ID: ${profile.id}`);
        console.log(`      User ID: ${profile.user_id}`);
        console.log(`      Email: ${profile.email}`);
        console.log(`      Name: ${profile.full_name}`);
        console.log(`      Role: ${profile.user_role}`);
        console.log(`      Verified: ${profile.is_verified}`);
        console.log(`      Status: ${profile.verification_status}`);
        console.log('');
      });
    }

    // Check users
    console.log('👤 Users:');
    const { data: users, error: usersError } = await adminSupabase
      .from('users')
      .select('*');
    
    if (usersError) {
      console.log(`  ❌ Error: ${usersError.message}`);
    } else {
      console.log(`  📊 Found ${users?.length || 0} users:`);
      users?.forEach(user => {
        console.log(`    - ID: ${user.id}`);
        console.log(`      Email: ${user.email}`);
        console.log(`      Name: ${user.full_name}`);
        console.log(`      Type: ${user.user_type}`);
        console.log(`      Verified: ${user.is_verified}`);
        console.log('');
      });
    }

    // Check properties
    console.log('🏠 Properties:');
    const { data: properties, error: propertiesError } = await adminSupabase
      .from('properties')
      .select('*');
    
    if (propertiesError) {
      console.log(`  ❌ Error: ${propertiesError.message}`);
    } else {
      console.log(`  📊 Found ${properties?.length || 0} properties:`);
      properties?.forEach(property => {
        console.log(`    - ID: ${property.id}`);
        console.log(`      Title: ${property.title}`);
        console.log(`      Status: ${property.status}`);
        console.log(`      Seller ID: ${property.seller_id}`);
        console.log(`      Price: ${property.price} ${property.currency}`);
        console.log(`      Type: ${property.property_type}`);
        console.log(`      City: ${property.city}`);
        console.log('');
      });
    }

    // Check property images
    console.log('🖼️ Property Images:');
    const { data: images, error: imagesError } = await adminSupabase
      .from('property_images')
      .select('*');
    
    if (imagesError) {
      console.log(`  ❌ Error: ${imagesError.message}`);
    } else {
      console.log(`  📊 Found ${images?.length || 0} images:`);
      images?.forEach(image => {
        console.log(`    - ID: ${image.id}`);
        console.log(`      Property ID: ${image.property_id}`);
        console.log(`      URL: ${image.image_url}`);
        console.log(`      Primary: ${image.is_primary}`);
        console.log('');
      });
    }

    // Check inquiries
    console.log('💬 Inquiries:');
    const { data: inquiries, error: inquiriesError } = await adminSupabase
      .from('inquiries')
      .select('*');
    
    if (inquiriesError) {
      console.log(`  ❌ Error: ${inquiriesError.message}`);
    } else {
      console.log(`  📊 Found ${inquiries?.length || 0} inquiries:`);
      inquiries?.forEach(inquiry => {
        console.log(`    - ID: ${inquiry.id}`);
        console.log(`      Property ID: ${inquiry.property_id}`);
        console.log(`      Buyer: ${inquiry.buyer_name} (${inquiry.buyer_email})`);
        console.log(`      Status: ${inquiry.status}`);
        console.log('');
      });
    }

    // Check analytics
    console.log('📈 Analytics:');
    const { data: analytics, error: analyticsError } = await adminSupabase
      .from('analytics')
      .select('*');
    
    if (analyticsError) {
      console.log(`  ❌ Error: ${analyticsError.message}`);
    } else {
      console.log(`  📊 Found ${analytics?.length || 0} analytics events:`);
      analytics?.forEach(event => {
        console.log(`    - ID: ${event.id}`);
        console.log(`      Type: ${event.event_type}`);
        console.log(`      User ID: ${event.user_id || 'N/A'}`);
        console.log(`      Property ID: ${event.property_id || 'N/A'}`);
        console.log('');
      });
    }

    console.log('✅ Data check completed!');

  } catch (error) {
    console.error('❌ Data check failed:', error.message);
    process.exit(1);
  }
}

// Run the check
checkData().catch(console.error);
