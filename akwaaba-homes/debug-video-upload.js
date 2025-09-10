const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const FormData = require('form-data');
const fs = require('fs');

async function testVideoUpload() {
  try {
    console.log('🧪 Testing video upload API...');
    
    // First, let's test with a simple request to see if the API route is accessible
    const testResponse = await fetch('http://localhost:3000/api/properties/test-id/videos/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ test: 'data' })
    });
    
    console.log('📊 Test response status:', testResponse.status);
    console.log('📊 Test response headers:', Object.fromEntries(testResponse.headers.entries()));
    
    const testText = await testResponse.text();
    console.log('📊 Test response body:', testText);
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testVideoUpload();
