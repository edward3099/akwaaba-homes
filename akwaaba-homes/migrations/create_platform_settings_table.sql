-- Migration: Create platform_settings table with RLS policies
-- Run this in your Supabase SQL editor

-- Create platform_settings table
CREATE TABLE IF NOT EXISTS platform_settings (
  id SERIAL PRIMARY KEY,
  platform JSONB NOT NULL DEFAULT '{}',
  email_templates JSONB NOT NULL DEFAULT '{}',
  notification_settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for admin read access
CREATE POLICY IF NOT EXISTS "Admin can read platform settings" ON platform_settings
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.user_role = 'admin'
  )
);

-- Create RLS policy for admin update access
CREATE POLICY IF NOT EXISTS "Admin can update platform settings" ON platform_settings
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.user_role = 'admin'
  )
);

-- Create RLS policy for admin insert access
CREATE POLICY IF NOT EXISTS "Admin can insert platform settings" ON platform_settings
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.user_role = 'admin'
  )
);

-- Insert default settings if table is empty
INSERT INTO platform_settings (platform, email_templates, notification_settings)
SELECT 
  '{
    "siteName": "AkwaabaHomes",
    "siteDescription": "Your trusted real estate marketplace in Ghana",
    "contactEmail": "admin@akwaabahomes.com",
    "supportPhone": "+233 20 123 4567",
    "commissionRate": 5.0,
    "maxImagesPerProperty": 10,
    "enableUserRegistration": true,
    "enableAgentApplications": true,
    "requireEmailVerification": true,
    "enableTwoFactorAuth": false,
    "maintenanceMode": false,
    "debugMode": false
  }'::jsonb,
  '{
    "welcomeEmail": {
      "subject": "Welcome to AkwaabaHomes! 🏠",
      "body": "Dear {{user_name}},\\n\\nWelcome to AkwaabaHomes! We\\'re excited to have you join our community of real estate professionals and home seekers.\\n\\nBest regards,\\nThe AkwaabaHomes Team"
    },
    "propertyApproved": {
      "subject": "Your Property Has Been Approved! ✅",
      "body": "Dear {{agent_name}},\\n\\nGreat news! Your property listing \\"{{property_title}}\\" has been approved and is now live on our platform.\\n\\nBest regards,\\nThe AkwaabaHomes Team"
    },
    "propertyRejected": {
      "subject": "Property Listing Update",
      "body": "Dear {{agent_name}},\\n\\nWe regret to inform you that your property listing \\"{{property_title}}\\" requires some modifications before it can be approved.\\n\\nPlease review our guidelines and resubmit.\\n\\nBest regards,\\nThe AkwaabaHomes Team"
    },
    "agentApproved": {
      "subject": "Agent Application Approved! 🎉",
      "body": "Dear {{agent_name}},\\n\\nCongratulations! Your agent application has been approved. You can now start listing properties on our platform.\\n\\nBest regards,\\nThe AkwaabaHomes Team"
    },
    "agentRejected": {
      "subject": "Agent Application Update",
      "body": "Dear {{applicant_name}},\\n\\nThank you for your interest in becoming an agent on AkwaabaHomes. Unfortunately, we are unable to approve your application at this time.\\n\\nBest regards,\\nThe AkwaabaHomes Team"
    }
  }'::jsonb,
  '{
    "emailNotifications": true,
    "pushNotifications": true,
    "smsNotifications": false,
    "whatsappNotifications": true,
    "notifyOnNewUser": true,
    "notifyOnNewProperty": true,
    "notifyOnAgentApplication": true,
    "notifyOnSystemIssues": true
  }'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM platform_settings);

-- Grant necessary permissions
GRANT ALL ON platform_settings TO authenticated;
GRANT USAGE ON SEQUENCE platform_settings_id_seq TO authenticated;
