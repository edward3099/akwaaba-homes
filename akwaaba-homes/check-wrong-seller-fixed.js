require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkWrongSeller() {
  try {
    console.log('🔍 Checking properties with Edward Antwi\'s seller_id...');
    
    // Check properties with Edward Antwi's ID
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
      .eq('seller_id', '276631ac-b4dc-4137-889e-2515d666a208')
      .eq('status', 'active');

    if (propertiesError) {
      console.error('❌ Error fetching properties:', propertiesError);
      return;
    }

    console.log(`📋 Found ${properties.length} properties with Edward Antwi's seller_id`);
    
    properties.forEach((property, index) => {
      console.log(`\n🏠 Property ${index + 1}:`);
      console.log(`  ID: ${property.id}`);
      console.log(`  Title: ${property.title}`);
      console.log(`  Seller ID: ${property.seller_id}`);
      console.log(`  Seller Name: ${property.users?.full_name}`);
      console.log(`  Seller Phone: ${property.users?.phone}`);
    });

    // Now let's check what properties should actually be John Developer's
    console.log('\n🔍 Checking all properties to see the mapping...');
    const { data: allProperties, error: allError } = await supabase
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
      .order('created_at', { ascending: false });

    if (allError) {
      console.error('❌ Error fetching all properties:', allError);
      return;
    }

    console.log(`\n📋 All ${allProperties.length} active properties:`);
    allProperties.forEach((property, index) => {
      console.log(`\n🏠 Property ${index + 1}:`);
      console.log(`  ID: ${property.id}`);
      console.log(`  Title: ${property.title}`);
      console.log(`  Seller ID: ${property.seller_id}`);
      console.log(`  Seller Name: ${property.users?.full_name || 'UNDEFINED'}`);
      console.log(`  Seller Phone: ${property.users?.phone || 'UNDEFINED'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkWrongSeller();
