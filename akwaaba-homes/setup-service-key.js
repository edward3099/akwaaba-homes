#!/usr/bin/env node

/**
 * Setup script for Supabase service role key
 * This script helps configure the SUPABASE_SERVICE_ROLE_KEY environment variable
 */

const fs = require('fs');
const path = require('path');

console.log('🔑 Supabase Service Role Key Setup');
console.log('====================================\n');

console.log('To get your service role key:');
console.log('1. Go to your Supabase project dashboard');
console.log('2. Navigate to Settings > API');
console.log('3. Copy the "service_role" key (NOT the anon key)');
console.log('4. Add it to your .env.local file\n');

const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('📁 Found .env.local file');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  if (envContent.includes('SUPABASE_SERVICE_ROLE_KEY')) {
    console.log('✅ SUPABASE_SERVICE_ROLE_KEY is already configured');
  } else {
    console.log('❌ SUPABASE_SERVICE_ROLE_KEY is missing');
    console.log('\nAdd this line to your .env.local file:');
    console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here');
  }
} else {
  console.log('📁 .env.local file not found');
  console.log('\nCreate .env.local file with:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_project_url');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
}

console.log('\n⚠️  IMPORTANT: Never commit your service role key to version control!');
console.log('   Make sure .env.local is in your .gitignore file.\n');

// Check if .gitignore contains .env.local
const gitignorePath = path.join(process.cwd(), '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  if (gitignoreContent.includes('.env.local')) {
    console.log('✅ .env.local is properly ignored in .gitignore');
  } else {
    console.log('❌ .env.local is NOT in .gitignore - add it now!');
  }
} else {
  console.log('❌ .gitignore file not found - create one with .env.local');
}
