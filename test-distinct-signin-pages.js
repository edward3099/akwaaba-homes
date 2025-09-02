#!/usr/bin/env node

const BASE_URL = 'http://localhost:3000';

// Helper function to log test results
function logTest(testName, passed, details = '') {
  const status = passed ? '✓ PASS' : '✗ FAIL';
  const color = passed ? '\x1b[32m' : '\x1b[31m';
  const reset = '\x1b[0m';
  console.log(`${color}${status}${reset} ${testName}`);
  if (details) {
    console.log(`  ${details}`);
  }
}

// Helper function to log headers
function logHeader(header) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(header);
  console.log(`${'='.repeat(50)}`);
}

async function testPageAccessibility() {
  logHeader('Testing Page Accessibility');
  
  // Test admin signin page
  try {
    const adminResponse = await fetch(`${BASE_URL}/admin-signin`);
    const adminStatus = adminResponse.status;
    const adminContent = await adminResponse.text();
    
    const adminAccessible = adminStatus === 200;
    logTest('Admin Signin Page Accessible', adminAccessible, `Status: ${adminStatus}`);
    
    if (adminAccessible) {
      // Check for admin-specific content
      const hasAdminContent = adminContent.includes('Admin Portal') && 
                             adminContent.includes('Administrator Sign In') &&
                             adminContent.includes('from-slate-900') &&
                             adminContent.includes('lucide-building2') && // Checking for class
                             adminContent.includes('lucide-shield') &&    // Checking for class
                             adminContent.includes('from-blue-600') &&
                             adminContent.includes('Administrative access only');
      
      logTest('Admin Page Has Corporate Design', hasAdminContent, 'Corporate styling and branding present');
    }
  } catch (error) {
    logTest('Admin Signin Page Accessible', false, `Error: ${error.message}`);
  }
  
  // Test agent login page
  try {
    const agentResponse = await fetch(`${BASE_URL}/login`);
    const agentStatus = agentResponse.status;
    const agentContent = await agentResponse.text();
    
    const agentAccessible = agentStatus === 200;
    logTest('Agent Login Page Accessible', agentStatus === 200, `Status: ${agentStatus}`);
    
    if (agentAccessible) {
      // Check for agent-specific content
      const hasAgentContent = agentContent.includes('Akwaaba!') &&
                             agentContent.includes('Agent Sign In') &&
                             agentContent.includes('from-green-500') &&
                             agentContent.includes('lucide-house') &&    // Checking for class
                             agentContent.includes('lucide-heart') &&    // Checking for class
                             agentContent.includes('lucide-users') &&    // Checking for class
                             agentContent.includes('Building dreams, one home at a time');
      
      logTest('Agent Page Has Friendly Design', hasAgentContent, 'Friendly styling and branding present');
    }
  } catch (error) {
    logTest('Agent Login Page Accessible', false, `Error: ${error.message}`);
  }
}

async function testDesignDifferences() {
  logHeader('Testing Design Differences');
  
  try {
    // Fetch both pages
    const adminResponse = await fetch(`${BASE_URL}/admin-signin`);
    const agentResponse = await fetch(`${BASE_URL}/login`);
    
    if (adminResponse.ok && agentResponse.ok) {
      const adminContent = await adminResponse.text();
      const agentContent = await agentResponse.text();
      
      // Check for distinct color schemes
      const adminHasSlateTheme = adminContent.includes('from-slate-900') && adminContent.includes('to-slate-900');
      const agentHasGreenTheme = agentContent.includes('from-green-500') && agentContent.includes('from-green-50');
      
      logTest('Admin Page Has Slate Theme', adminHasSlateTheme, 'Dark corporate theme present');
      logTest('Agent Page Has Green Theme', agentHasGreenTheme, 'Friendly green theme present');
      
      // Check for distinct icon sets
      const adminHasCorporateIcons = adminContent.includes('lucide-building2') && adminContent.includes('lucide-shield');
      const agentHasFriendlyIcons = agentContent.includes('lucide-house') && agentContent.includes('lucide-heart');
      
      logTest('Admin Page Has Corporate Icons', adminHasCorporateIcons, 'Building2 and Shield icons present');
      logTest('Agent Page Has Friendly Icons', agentHasFriendlyIcons, 'House and Heart icons present');
      
      // Check for distinct messaging
      const adminHasCorporateMessage = adminContent.includes('Secure Administrative Access') && 
                                      adminContent.includes('Administrative access only');
      const agentHasFriendlyMessage = agentContent.includes('Akwaaba!') && 
                                      agentContent.includes('Building dreams, one home at a time');
      
      logTest('Admin Page Has Corporate Messaging', adminHasCorporateMessage, 'Professional administrative tone');
      logTest('Agent Page Has Friendly Messaging', agentHasFriendlyMessage, 'Welcoming and friendly tone');
    }
  } catch (error) {
    logTest('Design Differences Test', false, `Error: ${error.message}`);
  }
}

async function testNavigationLinks() {
  logHeader('Testing Navigation Links');
  
  try {
    // Test admin page navigation
    const adminResponse = await fetch(`${BASE_URL}/admin-signin`);
    if (adminResponse.ok) {
      const adminContent = await adminResponse.text();
      
      const hasContactSupport = adminContent.includes('/contact') && adminContent.includes('Contact IT Support');
      const hasAgentSignIn = adminContent.includes('/login') && adminContent.includes('Agent Sign In');
      
      logTest('Admin Page Has Contact Support Link', hasContactSupport, 'Link to contact support present');
      logTest('Admin Page Has Agent Sign In Link', hasAgentSignIn, 'Link to agent login present');
    }
    
    // Test agent page navigation
    const agentResponse = await fetch(`${BASE_URL}/login`);
    if (agentResponse.ok) {
      const agentContent = await agentResponse.text();
      
      const hasSignup = agentContent.includes('/signup') && agentContent.includes('Apply as an Agent');
      const hasContactSupport = agentContent.includes('/contact') && agentContent.includes('Contact Support');
      const hasAdminPortal = agentContent.includes('/admin-signin') && agentContent.includes('Admin Portal');
      
      logTest('Agent Page Has Signup Link', hasSignup, 'Link to agent signup present');
      logTest('Agent Page Has Contact Support Link', hasContactSupport, 'Link to contact support present');
      logTest('Agent Page Has Admin Portal Link', hasAdminPortal, 'Link to admin signin present');
    }
  } catch (error) {
    logTest('Navigation Links Test', false, `Error: ${error.message}`);
  }
}

async function testRedirects() {
  logHeader('Testing Redirects');
  
  try {
    // Test old admin/signin route - this should return 404 since we moved it
    const oldAdminResponse = await fetch(`${BASE_URL}/admin/signin`, { redirect: 'manual' });
    const oldAdminStatus = oldAdminResponse.status;
    
    logTest('Old Admin Route Returns 404 (Expected)', oldAdminStatus === 404, `Status: ${oldAdminStatus} - Route moved to /admin-signin`);
    
    // Test old signin redirects to login
    const oldSigninResponse = await fetch(`${BASE_URL}/signin`, { redirect: 'manual' });
    const oldSigninStatus = oldSigninResponse.status;
    
    logTest('Old Signin Route Redirects', oldSigninStatus === 307 || oldSigninStatus === 301, `Status: ${oldSigninStatus}`);
    
  } catch (error) {
    logTest('Redirects Test', false, `Error: ${error.message}`);
  }
}

async function testAuthenticationFlow() {
  logHeader('Testing Authentication Flow');
  
  try {
    // Test admin signin form submission (without actual credentials)
    const adminResponse = await fetch(`${BASE_URL}/admin-signin`);
    if (adminResponse.ok) {
      const adminContent = await adminResponse.text();
      
      const hasEmailField = adminContent.includes('type="email"') && adminContent.includes('Email');
      const hasPasswordField = adminContent.includes('type="password"') && adminContent.includes('Password');
      const hasSubmitButton = adminContent.includes('type="submit"') && adminContent.includes('Access Admin Portal');
      
      logTest('Admin Page Has Email Field', hasEmailField, 'Email input field present');
      logTest('Admin Page Has Password Field', hasPasswordField, 'Password input field present');
      logTest('Admin Page Has Submit Button', hasSubmitButton, 'Submit button with correct text');
    }
    
    // Test agent login form submission
    const agentResponse = await fetch(`${BASE_URL}/login`);
    if (agentResponse.ok) {
      const agentContent = await agentResponse.text();
      
      const hasEmailField = agentContent.includes('type="email"') && agentContent.includes('Email');
      const hasPasswordField = agentContent.includes('type="password"') && agentContent.includes('Password');
      const hasSubmitButton = agentContent.includes('type="submit"') && agentContent.includes('Sign In');
      
      logTest('Agent Page Has Email Field', hasEmailField, 'Email input field present');
      logTest('Agent Page Has Password Field', hasPasswordField, 'Password input field present');
      logTest('Agent Page Has Submit Button', hasSubmitButton, 'Submit button with correct text');
    }
  } catch (error) {
    logTest('Authentication Flow Test', false, `Error: ${error.message}`);
  }
}

async function runAllTests() {
  console.log('Starting Distinct Sign-in Pages Test Suite...\n');
  
  try {
    await testPageAccessibility();
    await testDesignDifferences();
    await testNavigationLinks();
    await testRedirects();
    await testAuthenticationFlow();
    
    console.log('\n' + '='.repeat(50));
    console.log('Test Suite Completed!');
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('Test suite failed:', error.message);
  }
}

// Run the tests
runAllTests();
