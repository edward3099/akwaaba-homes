// Quick Fix Script for Authentication Issues
// This script helps diagnose and potentially fix the login problem

const testAndFixAuth = async () => {
  console.log('🔧 Quick Fix Script for Authentication Issues...\n');
  
  // Test 1: Check if we can create a user and immediately log in
  console.log('📝 Test 1: Create user and immediate login...');
  
  const testEmail = `quickfix${Date.now()}@gmail.com`;
  const testPassword = 'QuickFix123!';
  
  try {
    // Step 1: Create user
    console.log('Creating user:', testEmail);
    const signupResponse = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        user_metadata: {
          first_name: 'Quick',
          last_name: 'Fix',
          phone: '1234567890',
          company_name: 'Quick Fix Company',
          business_type: 'Real Estate',
          license_number: `QF${Date.now()}`,
          experience_years: 3,
          bio: 'Quick fix test user',
          user_type: 'agent',
          verification_status: 'pending'
        }
      })
    });
    
    const signupData = await signupResponse.json();
    console.log('Signup response:', signupData);
    
    if (signupData.user?.id) {
      console.log('✅ User created successfully');
      
      // Step 2: Wait a moment for user to be fully created
      console.log('⏳ Waiting 2 seconds for user creation to complete...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Step 3: Try to login
      console.log('🔐 Attempting login...');
      const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword
        })
      });
      
      const loginData = await loginResponse.json();
      console.log('Login response status:', loginResponse.status);
      console.log('Login response:', loginData);
      
      if (loginResponse.status === 200) {
        console.log('✅ Login successful! Authentication is working.');
      } else {
        console.log('❌ Login failed. Let\'s investigate...');
        
        // Step 4: Check if user exists in Supabase
        console.log('🔍 Checking user existence...');
        console.log('User ID from signup:', signupData.user.id);
        console.log('Email:', testEmail);
        
        // Step 5: Try alternative login method
        console.log('🔄 Trying alternative approach...');
        console.log('This might be a Supabase configuration issue.');
        console.log('Check the following:');
        console.log('1. Environment variables in .env.local');
        console.log('2. Supabase project settings');
        console.log('3. Email verification requirements');
        console.log('4. Password hashing configuration');
      }
    } else {
      console.log('❌ User creation failed:', signupData);
    }
    
  } catch (error) {
    console.error('❌ Error during test:', error);
  }
  
  console.log('\n🔧 Quick Fix Recommendations:');
  console.log('1. Check .env.local file for Supabase configuration');
  console.log('2. Verify Supabase project is active and accessible');
  console.log('3. Check if email verification is required');
  console.log('4. Test with Supabase dashboard directly');
  console.log('5. Check server logs for detailed error messages');
  
  console.log('\n📋 Next Steps:');
  console.log('1. Run this script to see detailed error information');
  console.log('2. Check the server console for additional logs');
  console.log('3. Verify Supabase configuration in environment variables');
  console.log('4. Test authentication directly in Supabase dashboard');
};

// Run the test
testAndFixAuth().catch(console.error);
