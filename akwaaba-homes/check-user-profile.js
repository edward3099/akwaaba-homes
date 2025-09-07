require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUserProfile() {
  try {
    console.log('🔍 Checking Edward Antwi\'s user profile...');
    
    // Find Edward Antwi's user record
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .ilike('full_name', '%Edward Antwi%');

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }

    console.log(`📋 Found ${users.length} users matching "Edward Antwi"`);
    
    users.forEach((user, index) => {
      console.log(`\n👤 User ${index + 1}:`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Name: ${user.full_name}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Phone: ${user.phone}`);
      console.log(`  User Type: ${user.user_type}`);
      console.log(`  Is Verified: ${user.is_verified}`);
      console.log(`  Created: ${user.created_at}`);
      console.log(`  Updated: ${user.updated_at}`);
    });

    // Also check if there are any other users with similar names
    console.log('\n🔍 Checking for other users with "Antwi" in name...');
    
    const { data: antwiUsers, error: antwiError } = await supabase
      .from('users')
      .select('*')
      .ilike('full_name', '%Antwi%');

    if (antwiError) {
      console.error('❌ Error fetching Antwi users:', antwiError);
      return;
    }

    console.log(`📋 Found ${antwiUsers.length} users with "Antwi" in name`);
    
    antwiUsers.forEach((user, index) => {
      console.log(`\n👤 User ${index + 1}:`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Name: ${user.full_name}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Phone: ${user.phone}`);
      console.log(`  User Type: ${user.user_type}`);
    });

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
checkUserProfile();
