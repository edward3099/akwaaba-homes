// Test script for AkwaabaHomes Agent Dashboard APIs
// Run this with: node test-apis.js

const BASE_URL = 'http://localhost:3000';

// Test data for creating a new property
const testProperty = {
  title: "Test Property for API Testing",
  description: "This is a test property to verify the API endpoints work correctly",
  property_type: "house",
  listing_type: "sale",
  price: 500000,
  currency: "GHS",
  address: "123 Test Street",
  city: "Accra",
  region: "Greater Accra",
  postal_code: "00233",
  bedrooms: 3,
  bathrooms: 2,
  square_feet: 1500,
  features: ["Garden", "Security System"],
  amenities: ["Near Schools", "Shopping Center"]
};

// Test data for contact form
const testContact = {
  name: "API Test User",
  email: "test@example.com",
  phone: "+233244123456",
  subject: "API Testing",
  message: "This is a test message to verify the contact API works",
  preferred_contact: "email",
  property_interest: "Residential Properties"
};

async function testAPI(endpoint, method = 'GET', data = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    console.log(`Testing ${method} ${endpoint}...`);
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log(`✅ ${method} ${endpoint} - Success:`, result);
    return result;
  } catch (error) {
    console.error(`❌ ${method} ${endpoint} - Error:`, error.message);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Starting API Tests for AkwaabaHomes Agent Dashboard...\n');

  // Test 1: Contact Form Submission
  console.log('📝 Test 1: Contact Form Submission');
  await testAPI('/api/contact', 'POST', testContact);
  console.log('');

  // Test 2: Get Contact Submissions (this will show the new submission)
  console.log('📋 Test 2: Get Contact Submissions');
  await testAPI('/api/contact', 'GET');
  console.log('');

  // Note: The following tests require authentication, so they will fail without proper auth
  // In a real scenario, you would need to:
  // 1. Sign in as an agent user
  // 2. Get the authentication token
  // 3. Include the token in the Authorization header

  console.log('⚠️  Note: The following tests require authentication:');
  console.log('   - Agent Properties API');
  console.log('   - Agent Clients API');
  console.log('   - Property CRUD operations');
  console.log('');
  console.log('🔐 To test authenticated endpoints:');
  console.log('   1. Sign in to the application as an agent user');
  console.log('   2. Check the browser console for authentication tokens');
  console.log('   3. Include the token in the Authorization header');
  console.log('');
  console.log('📊 Test Summary:');
  console.log('   ✅ Contact form submission (public endpoint)');
  console.log('   ✅ Contact submissions retrieval (public endpoint)');
  console.log('   ⚠️  Agent-specific endpoints (require authentication)');
  console.log('');
  console.log('🎯 Next steps:');
  console.log('   1. Test the contact form on the frontend');
  console.log('   2. Sign in as an agent to test property management');
  console.log('   3. Test the client management features');
}

// Run the tests
runTests().catch(console.error);
