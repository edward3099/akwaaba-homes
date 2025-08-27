import { chromium, FullConfig } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  
  // Check if Supabase is available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';
  
  let supabase: any = null;
  let testUsersCreated = false;
  
  try {
    supabase = createClient(supabaseUrl, supabaseServiceKey);
    await setupTestUsers(supabase); // Creates test users in Supabase
    testUsersCreated = true;
    console.log('✅ Supabase test users created successfully');
  } catch (error) {
    console.log('⚠️  Supabase not available, skipping test user creation:', error.message);
    console.log('📝 Tests will run without authentication for now');
  }

  const browser = await chromium.launch();
  
  if (testUsersCreated) {
    try {
      // Create authenticated state for customer
      const customerContext = await browser.newContext();
      const customerPage = await customerContext.newPage();
      await customerPage.goto(`${baseURL}/login`);
      await customerPage.fill('[data-testid="email"]', 'test-customer@akwaabahomes.com');
      await customerPage.fill('[data-testid="password"]', 'testpassword123');
      await customerPage.click('[data-testid="login-button"]');
      await customerPage.waitForURL(`${baseURL}/dashboard`);
      await customerContext.storageState({ path: 'tests/auth/customer.json' });
      await customerContext.close();

      // Create authenticated state for agent
      const agentContext = await browser.newContext();
      const agentPage = await agentContext.newPage();
      await agentPage.goto(`${baseURL}/login`);
      await agentPage.fill('[data-testid="email"]', 'test-agent@akwaabahomes.com');
      await agentPage.fill('[data-testid="password"]', 'testpassword123');
      await agentPage.click('[data-testid="login-button"]');
      await agentPage.waitForURL(`${baseURL}/agent/dashboard`);
      await agentContext.storageState({ path: 'tests/auth/agent.json' });
      await agentContext.close();

      // Create authenticated state for admin
      const adminContext = await browser.newContext();
      const adminPage = await adminContext.newPage();
      await adminPage.goto(`${baseURL}/admin-signin`);
      await adminPage.fill('[data-testid="email"]', 'test-admin@akwaabahomes.com');
      await adminPage.fill('[data-testid="password"]', 'testpassword123');
      await adminPage.click('[data-testid="login-button"]');
      await adminPage.waitForURL(`${baseURL}/admin`);
      await adminContext.storageState({ path: 'tests/auth/admin.json' });
      await adminContext.close();
      
      console.log('✅ Authentication states created successfully');
    } catch (error) {
      console.log('⚠️  Failed to create authentication states:', error.message);
      console.log('📝 Tests will run without authentication for now');
    }
  } else {
    console.log('📝 Creating empty auth files for tests without authentication');
    // Create empty auth files so tests don't fail
    if (!fs.existsSync('tests/auth')) {
      fs.mkdirSync('tests/auth', { recursive: true });
    }
    
    fs.writeFileSync('tests/auth/customer.json', '{}');
    fs.writeFileSync('tests/auth/agent.json', '{}');
    fs.writeFileSync('tests/auth/admin.json', '{}');
  }
  
  await browser.close();
}

async function setupTestUsers(supabase: any) {
  // Create test customer
  const { data: customer, error: customerError } = await supabase.auth.admin.createUser({
    email: 'test-customer@akwaabahomes.com',
    password: 'testpassword123',
    email_confirm: true,
    user_metadata: {
      role: 'customer',
      name: 'Test Customer'
    }
  });
  
  if (customerError) {
    console.log('Customer already exists or error:', customerError.message);
  }
  
  // Create test agent
  const { data: agent, error: agentError } = await supabase.auth.admin.createUser({
    email: 'test-agent@akwaabahomes.com',
    password: 'testpassword123',
    email_confirm: true,
    user_metadata: {
      role: 'agent',
      name: 'Test Agent'
    }
  });
  
  if (agentError) {
    console.log('Agent already exists or error:', agentError.message);
  }
  
  // Create test admin
  const { data: admin, error: adminError } = await supabase.auth.admin.createUser({
    email: 'test-admin@akwaabahomes.com',
    password: 'testpassword123',
    email_confirm: true,
    user_metadata: {
      role: 'admin',
      name: 'Test Admin'
    }
  });
  
  if (adminError) {
    console.log('Admin already exists or error:', adminError.message);
  }
}

export default globalSetup;
