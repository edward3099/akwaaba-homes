# Database Setup Guide

## Prerequisites
- Access to your Supabase project dashboard
- Admin privileges on your Supabase project

## Steps to Set Up Database

### 1. Access Supabase Dashboard
1. Go to [https://supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your AkwaabaHomes project

### 2. Open SQL Editor
1. In the left sidebar, click on "SQL Editor"
2. Click "New Query"

### 3. Run the Schema
1. Copy the entire content from `database-schema.sql`
2. Paste it into the SQL editor
3. Click "Run" to execute the schema

### 4. Verify Tables
1. Go to "Table Editor" in the left sidebar
2. You should see the following tables:
   - `profiles`
   - `users`
   - `properties`
   - `property_images`
   - `inquiries`
   - `analytics`

### 5. Create Admin User
After the schema is set up, you can create an admin user using the `create-admin-user.js` script:

```bash
cd akwaaba-homes
node create-admin-user.js
```

## Alternative: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Apply the schema
supabase db push
```

## Troubleshooting

### Common Issues

1. **Permission Denied**: Make sure you're logged in as a project owner or have admin privileges
2. **Table Already Exists**: The schema uses `CREATE TABLE IF NOT EXISTS`, so this shouldn't be an issue
3. **Extension Not Available**: The `uuid-ossp` extension should be available by default in Supabase

### Verification

After setup, you can verify the schema by running:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'users', 'properties', 'property_images', 'inquiries', 'analytics');

-- Check table structure
\d profiles
\d users
\d properties
```

## Next Steps

Once the database is set up:
1. Restart your Next.js development server
2. Try logging in as admin again
3. Test the admin dashboard functionality
4. The 500 errors should be resolved

## Notes

- The schema includes Row Level Security (RLS) policies for data protection
- All tables have proper foreign key relationships
- Indexes are created for better query performance
- Triggers automatically update `updated_at` timestamps
- The schema supports the archiving functionality we implemented
