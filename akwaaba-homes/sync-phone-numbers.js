require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function syncPhoneNumbers() {
  try {
    console.log('🔍 Syncing phone numbers between profiles and users tables...');
    
    // Get all profiles with phone numbers
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, full_name, phone')
      .not('phone', 'is', null);

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
      return;
    }

    console.log(`📋 Found ${profiles.length} profiles with phone numbers`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const profile of profiles) {
      try {
        // Update the corresponding user record
        const { data, error } = await supabase
          .from('users')
          .update({ 
            phone: profile.phone,
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.user_id)
          .select();

        if (error) {
          console.error(`❌ Error updating user ${profile.full_name}:`, error);
          errorCount++;
        } else {
          console.log(`✅ Updated ${profile.full_name}: ${profile.phone}`);
          updatedCount++;
        }
      } catch (error) {
        console.error(`❌ Error processing ${profile.full_name}:`, error);
        errorCount++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`  ✅ Successfully updated: ${updatedCount} users`);
    console.log(`  ❌ Errors: ${errorCount} users`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

syncPhoneNumbers();
