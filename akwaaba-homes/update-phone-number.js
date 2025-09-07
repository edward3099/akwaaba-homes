require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updatePhoneNumber() {
  try {
    console.log('🔍 Updating Edward Antwi\'s phone number...');
    
    // Update Edward Antwi's phone number to match the profile page
    const { data, error } = await supabase
      .from('users')
      .update({ 
        phone: '+233 99999999',
        updated_at: new Date().toISOString()
      })
      .eq('full_name', 'Edward Antwi')
      .select();

    if (error) {
      console.error('❌ Error updating phone number:', error);
      return;
    }

    console.log('✅ Phone number updated successfully!');
    console.log('📋 Updated user:', data);

    // Verify the update
    console.log('\n🔍 Verifying the update...');
    
    const { data: verifyData, error: verifyError } = await supabase
      .from('users')
      .select('*')
      .eq('full_name', 'Edward Antwi');

    if (verifyError) {
      console.error('❌ Error verifying update:', verifyError);
      return;
    }

    console.log('📋 Current user data:');
    verifyData.forEach(user => {
      console.log(`  Name: ${user.full_name}`);
      console.log(`  Phone: ${user.phone}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Updated: ${user.updated_at}`);
    });

    // Test the API to see if properties now show the correct phone number
    console.log('\n🔍 Testing API response...');
    
    const { data: apiTest, error: apiError } = await supabase
      .from('properties')
      .select(`
        id,
        title,
        seller_id,
        users!properties_seller_id_fkey (
          id,
          full_name,
          phone,
          email
        )
      `)
      .eq('status', 'active')
      .eq('seller_id', '276631ac-b4dc-4137-889e-2515d666a208');

    if (apiError) {
      console.error('❌ Error testing API:', apiError);
      return;
    }

    console.log('📋 Properties by Edward Antwi:');
    apiTest.forEach(property => {
      console.log(`  Property: ${property.title}`);
      console.log(`  Seller: ${property.users?.full_name}`);
      console.log(`  Phone: ${property.users?.phone}`);
      console.log('  ---');
    });

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
updatePhoneNumber();
