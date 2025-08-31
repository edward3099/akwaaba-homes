const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAdminUsers() {
  try {
    const { data: users, error } = await supabase.auth.admin.listUsers();
    if (error) {
      console.error('Error:', error);
      return;
    }
    
    console.log('All users:');
    users.users.forEach(user => {
      console.log(`- Email: ${user.email}, ID: ${user.id}, Created: ${user.created_at}`);
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAdminUsers();
