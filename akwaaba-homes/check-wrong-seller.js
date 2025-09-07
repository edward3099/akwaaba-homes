require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkWrongSeller() {
  try {
    console.log('🔍 Checking properties with wrong seller_id...');
    
    // Check properties with Edward Antwi's ID but should be John Developer's
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select(`
        id,
        title,
        seller_id,
        created_by,
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
      console.log(`  Created By: ${property.created_by}`);
      console.log(`  Seller Name: ${property.users?.full_name}`);
      console.log(`  Seller Phone: ${property.users?.phone}`);
    });

    // Check who created these properties
    console.log('\n🔍 Checking who created these properties...');
    const { data: creators, error: creatorsError } = await supabase
      .from('users')
      .select('id, full_name, phone, email')
      .in('id', properties.map(p => p.created_by).filter(Boolean));

    if (creatorsError) {
      console.error('❌ Error fetching creators:', creatorsError);
      return;
    }

    console.log(`📋 Found ${creators.length} creators`);
    creators.forEach((creator, index) => {
      console.log(`\n👤 Creator ${index + 1}:`);
      console.log(`  ID: ${creator.id}`);
      console.log(`  Name: ${creator.full_name}`);
      console.log(`  Phone: ${creator.phone}`);
      console.log(`  Email: ${creator.email}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkWrongSeller();
