-- Migration: Remove Sample Data Creation
-- This migration ensures no demo/sample data is automatically created for new users

-- Drop any sample data creation functions if they exist
DO $$ 
BEGIN
    -- Drop sample data creation functions
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_sample_data') THEN
        DROP FUNCTION IF EXISTS create_sample_data();
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'seed_demo_data') THEN
        DROP FUNCTION IF EXISTS seed_demo_data();
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'initialize_user_data') THEN
        DROP FUNCTION IF EXISTS initialize_user_data();
    END IF;
    
    -- Drop any triggers that might create sample data
    IF EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'create_sample_data_trigger') THEN
        DROP TRIGGER IF EXISTS create_sample_data_trigger ON auth.users;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'initialize_user_trigger') THEN
        DROP TRIGGER IF EXISTS initialize_user_trigger ON auth.users;
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the migration
        RAISE NOTICE 'Error during sample data cleanup: %', SQLERRM;
END $$;

-- Create a function to ensure clean user onboarding
CREATE OR REPLACE FUNCTION ensure_clean_user_onboarding()
RETURNS TRIGGER AS $$
BEGIN
    -- This function ensures new users start with clean, empty profiles
    -- No demo data is created automatically
    
    -- Only create the basic profile record
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        user_type,
        verification_status,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'user_type', 'user'),
        'pending',
        NOW(),
        NOW()
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the user creation
        RAISE NOTICE 'Error creating user profile: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation (clean onboarding)
DROP TRIGGER IF EXISTS ensure_clean_user_onboarding_trigger ON auth.users;
CREATE TRIGGER ensure_clean_user_onboarding_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION ensure_clean_user_onboarding();

-- Add comment to document the clean onboarding approach
COMMENT ON FUNCTION ensure_clean_user_onboarding() IS 'Ensures new users start with clean, empty profiles without any demo data';

-- Log the migration
INSERT INTO public.admin_logs (action, resource, resource_id, metadata, created_at)
VALUES (
    'migration',
    'database',
    'remove_sample_data_creation',
    '{"description": "Removed sample data creation functions and ensured clean user onboarding", "version": "1.0.0"}',
    NOW()
);
