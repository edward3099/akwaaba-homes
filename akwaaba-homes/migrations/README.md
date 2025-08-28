# Database Migrations

This directory contains SQL migration files for the AkwaabaHomes project.

## Current Migration

### `create_platform_settings_table.sql`

This migration creates the `platform_settings` table that is required for the admin settings page to function properly.

**What it does:**
- Creates a `platform_settings` table with JSONB columns for platform configuration, email templates, and notification settings
- Enables Row Level Security (RLS) on the table
- Creates RLS policies that allow only admin users to read, update, and insert settings
- Inserts default configuration values
- Grants necessary permissions to authenticated users

**How to run:**

1. **Access Supabase Dashboard:**
   - Go to your Supabase project dashboard
   - Navigate to the "SQL Editor" section

2. **Run the Migration:**
   - Copy the contents of `create_platform_settings_table.sql`
   - Paste it into the SQL editor
   - Click "Run" to execute the migration

3. **Verify the Migration:**
   - Check that the `platform_settings` table was created in the "Table Editor"
   - Verify that RLS policies are in place under "Authentication" > "Policies"
   - Confirm that default data was inserted

**After running this migration:**
- The admin settings page should load without 500 errors
- Admin users will be able to view and modify platform settings
- The settings will be properly secured with RLS policies

## Troubleshooting

If you encounter any issues:

1. **Check Supabase Logs:**
   - Go to "Logs" in your Supabase dashboard
   - Look for any error messages related to the migration

2. **Verify Table Creation:**
   - Check "Table Editor" to ensure the table exists
   - Verify the table structure matches the migration

3. **Check RLS Policies:**
   - Go to "Authentication" > "Policies"
   - Ensure policies are created for the `platform_settings` table

4. **Test Admin Access:**
   - Try accessing the admin settings page after running the migration
   - Check browser console and network tab for any remaining errors

## Next Steps

After successfully running this migration:

1. Test the admin settings page to ensure it loads properly
2. Verify that settings can be viewed and modified
3. Remove the diagnostic logging from the settings API route
4. Update the task status in Taskmaster to reflect completion
