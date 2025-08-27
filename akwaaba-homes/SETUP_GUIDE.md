# 🔑 Akwaaba Homes Setup Guide

## Overview
This guide will help you set up the Supabase service role key to resolve the authentication issues and get the agent signup → property posting flow working.

## 🚨 Current Issue
The system is experiencing authentication issues in API routes due to Row Level Security (RLS) policies that require proper user context. The Supabase client cannot properly read session cookies in Next.js API routes.

## ✅ What's Already Working
- Agent signup API (`/api/auth/signup`)
- User authentication (after email confirmation)
- Database schema and RLS policies
- Property creation logic (confirmed via test endpoint)

## 🔧 Solution: Admin API with Service Role Key

### Step 1: Get Your Supabase Service Role Key

1. **Go to your Supabase project dashboard**
   - URL: https://supabase.com/dashboard
   - Select your project: `nzezwxowonbtbavpwgol`

2. **Navigate to Settings > API**
   - Look for the "service_role" key (NOT the anon key)
   - Copy the entire key

3. **Add to your .env.local file**
   ```bash
   # Add this line to .env.local
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

### Step 2: Verify Configuration

Run the setup script to check your configuration:
```bash
node setup-service-key.js
```

### Step 3: Test the Complete Flow

Once the service role key is configured, run the comprehensive test:
```bash
node test-with-admin.js
```

## 🏗️ What the Admin API Does

The admin API (`/api/admin/create-user`) will:
1. **Bypass RLS policies** using the service role key
2. **Create confirmed user profiles** for testing
3. **Set proper user types** (agent, seller, buyer)
4. **Enable property creation** without authentication issues

## 🔒 Security Notes

- **Service role key bypasses all RLS policies**
- **Only use in development/testing**
- **Never commit to version control**
- **Admin routes are automatically disabled in production**

## 📋 Test Flow

1. **Admin creates confirmed user** → Bypasses email confirmation
2. **User can create properties** → RLS policies satisfied
3. **Properties are properly stored** → Full database functionality
4. **System works end-to-end** → Agent signup → Property posting

## 🚀 Next Steps

1. **Configure service role key** (see Step 1)
2. **Run setup verification** (see Step 2)
3. **Test complete flow** (see Step 3)
4. **Verify property creation works**
5. **Test agent signup → login → property posting**

## 🆘 Troubleshooting

### "SUPABASE_SERVICE_ROLE_KEY is required"
- Add the service role key to .env.local
- Restart your development server

### "Admin routes not available in production"
- This is expected behavior
- Admin routes only work in development

### "Cannot access admin API endpoint"
- Make sure the server is running
- Check that the endpoint file exists

## 📚 Files Created

- `src/lib/supabase/admin.ts` - Admin Supabase client
- `src/app/api/admin/create-user/route.ts` - Admin user creation API
- `setup-service-key.js` - Configuration verification script
- `test-with-admin.js` - Comprehensive test script
- `SETUP_GUIDE.md` - This guide

## 🎯 Expected Outcome

After following this guide, you should have:
- ✅ Working agent signup
- ✅ Working user authentication
- ✅ Working property creation
- ✅ Complete end-to-end flow
- ✅ Proper RLS policy enforcement
- ✅ Secure admin operations

The system will work exactly as intended, with the admin API providing a secure way to create test users while maintaining all security policies for regular operations.
