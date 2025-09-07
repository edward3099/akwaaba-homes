require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateJohnPhone() {
  try {
    console.log('🔍 Updating John Developer\'s phone number...');
    
    // Update John Developer's phone number to match the profile page
    const { data, error } = await supabase
      .from('users')
      .update({ 
        phone: '+233 88888888',
        updated_at: new Date().toISOString()
      })
      .eq('full_name', 'John Developer')
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
      .select('id, full_name, phone, email')
      .eq('full_name', 'John Developer');

    if (verifyError) {
      console.error('❌ Error verifying update:', verifyError);
      return;
    }

    console.log('📋 Verification result:', verifyData);

    // Check properties to see if they now use the correct phone number
    console.log('\n🏠 Checking properties by John Developer...');
    const { data: properties, error: propertiesError } = await supabase
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
      .eq('seller_id', 'fd6f5766-d16f-4df5-b360-e48c82b825f8');

    if (propertiesError) {
      console.error('❌ Error fetching properties:', propertiesError);
      return;
    }

    console.log(`📋 Found ${properties.length} properties by John Developer`);
    
    properties.forEach((property, index) => {
      console.log(`\n🏠 Property ${index + 1}:`);
      console.log(`  ID: ${property.id}`);
      console.log(`  Title: ${property.title}`);
      console.log(`  Seller Name: ${property.users?.full_name}`);
      console.log(`  Seller Phone: ${property.users?.phone}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

updateJohnPhone();
