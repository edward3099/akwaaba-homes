import { FullConfig } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

async function globalTeardown(config: FullConfig) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';
  
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    await cleanupTestUsers(supabase);
    await cleanupTestProperties(supabase);
    console.log('✅ Test cleanup completed successfully');
  } catch (error) {
    console.log('⚠️  Supabase not available, skipping test cleanup:', error.message);
    console.log('📝 Test data cleanup will be handled manually if needed');
  }
}

async function cleanupTestUsers(supabase: any) {
  try {
    const { data: users, error } = await supabase.auth.admin.listUsers();
    if (error) {
      console.log('Error listing users:', error.message);
      return;
    }
    
    for (const user of users) {
      if (user.email && user.email.includes('test-')) {
        const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
        if (deleteError) {
          console.log(`Error deleting test user ${user.email}:`, deleteError.message);
        } else {
          console.log(`Deleted test user: ${user.email}`);
        }
      }
    }
  } catch (error) {
    console.log('Error during user cleanup:', error.message);
  }
}

async function cleanupTestProperties(supabase: any) {
  try {
    const { error } = await supabase
      .from('properties')
      .delete()
      .like('title', '%TEST%');
    
    if (error) {
      console.log('Error cleaning up test properties:', error.message);
    } else {
      console.log('Test properties cleaned up');
    }
  } catch (error) {
    console.log('Error during property cleanup:', error.message);
  }
}

export default globalTeardown;
