require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkEdwardPhone() {
  try {
    console.log('🔍 Checking Edward Antwi\'s current phone number in database...');
    
    // Check Edward Antwi's user record
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .eq('full_name', 'Edward Antwi');

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }

    console.log(`📋 Found ${users.length} users matching "Edward Antwi"`);
    
    users.forEach((user, index) => {
      console.log(`\n👤 User ${index + 1}:`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Name: ${user.full_name}`);
      console.log(`  Phone: ${user.phone}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Updated: ${user.updated_at}`);
    });

    // Also check the profiles table
    console.log('\n🔍 Checking profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('full_name', 'Edward Antwi');

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
      return;
    }

    console.log(`📋 Found ${profiles.length} profiles matching "Edward Antwi"`);
    
    profiles.forEach((profile, index) => {
      console.log(`\n👤 Profile ${index + 1}:`);
      console.log(`  User ID: ${profile.user_id}`);
      console.log(`  Name: ${profile.full_name}`);
      console.log(`  Phone: ${profile.phone}`);
      console.log(`  Updated: ${profile.updated_at}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkEdwardPhone();
