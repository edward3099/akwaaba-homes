require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkJohnDeveloper() {
  try {
    console.log('🔍 Checking John Developer\'s user profile...');
    
    // Find John Developer's user record
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .ilike('full_name', '%John Developer%');

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }

    console.log(`📋 Found ${users.length} users matching "John Developer"`);
    
    users.forEach((user, index) => {
      console.log(`\n👤 User ${index + 1}:`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Name: ${user.full_name}`);
      console.log(`  Phone: ${user.phone}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  User Type: ${user.user_type}`);
      console.log(`  Created: ${user.created_at}`);
    });

    // Check properties by John Developer
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
      .ilike('users.full_name', '%John Developer%');

    if (propertiesError) {
      console.error('❌ Error fetching properties:', propertiesError);
      return;
    }

    console.log(`📋 Found ${properties.length} properties by John Developer`);
    
    properties.forEach((property, index) => {
      console.log(`\n🏠 Property ${index + 1}:`);
      console.log(`  ID: ${property.id}`);
      console.log(`  Title: ${property.title}`);
      console.log(`  Seller ID: ${property.seller_id}`);
      console.log(`  Seller Name: ${property.users?.full_name}`);
      console.log(`  Seller Phone: ${property.users?.phone}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkJohnDeveloper();
