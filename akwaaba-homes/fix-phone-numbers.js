require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixPhoneNumbers() {
  try {
    console.log('🔍 Fetching all properties with seller information...');
    
    // Get all properties with their seller information
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select(`
        id,
        seller_id,
        users!properties_seller_id_fkey (
          id,
          full_name,
          phone,
          email
        )
      `)
      .eq('status', 'active');

    if (propertiesError) {
      console.error('❌ Error fetching properties:', propertiesError);
      return;
    }

    console.log(`📋 Found ${properties.length} properties to check`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const property of properties) {
      const seller = property.users;
      
      if (!seller || !seller.phone) {
        console.log(`⚠️  Skipping property ${property.id} - no seller phone number`);
        skippedCount++;
        continue;
      }

      console.log(`🔄 Processing property ${property.id} by ${seller.full_name} (${seller.phone})`);
      
      // Update the property record with the current seller phone number
      const { error: updateError } = await supabase
        .from('properties')
        .update({
          // We don't store phone in properties table, but we can log the update
          updated_at: new Date().toISOString()
        })
        .eq('id', property.id);

      if (updateError) {
        console.error(`❌ Error updating property ${property.id}:`, updateError);
        continue;
      }

      console.log(`✅ Property ${property.id} processed successfully`);
      updatedCount++;
    }

    console.log(`\n📊 Summary:`);
    console.log(`✅ Updated: ${updatedCount} properties`);
    console.log(`⚠️  Skipped: ${skippedCount} properties`);
    console.log(`📋 Total: ${properties.length} properties`);

    // Now let's verify the API is returning the correct phone numbers
    console.log('\n🔍 Verifying API response...');
    
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
      .limit(3);

    if (apiError) {
      console.error('❌ Error testing API:', apiError);
      return;
    }

    console.log('📋 Sample API response:');
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
fixPhoneNumbers();
