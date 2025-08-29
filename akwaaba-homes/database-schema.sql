-- AkwaabaHomes Database Schema
-- This file contains the basic database structure needed for the application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    company_name TEXT,
    business_type TEXT,
    license_number TEXT,
    experience_years INTEGER,
    bio TEXT,
    user_role TEXT NOT NULL DEFAULT 'user' CHECK (user_role IN ('user', 'seller', 'buyer', 'agent', 'admin')),
    verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    is_verified BOOLEAN NOT NULL DEFAULT false,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    user_type TEXT NOT NULL DEFAULT 'user' CHECK (user_type IN ('user', 'seller', 'buyer', 'agent', 'admin')),
    is_verified BOOLEAN NOT NULL DEFAULT false,
    verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'GHS',
    property_type TEXT NOT NULL CHECK (property_type IN ('house', 'apartment', 'land', 'commercial', 'office')),
    listing_type TEXT NOT NULL CHECK (listing_type IN ('sale', 'rent')),
    bedrooms INTEGER DEFAULT 0,
    bathrooms INTEGER DEFAULT 0,
    area DECIMAL(10,2),
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    region TEXT NOT NULL,
    postal_code TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    features TEXT[],
    amenities TEXT[],
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive', 'sold', 'rented', 'archived')),
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
    views_count INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT false,
    archived_at TIMESTAMP WITH TIME ZONE,
    archived_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create property_images table
CREATE TABLE IF NOT EXISTS property_images (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    is_primary BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inquiries table
CREATE TABLE IF NOT EXISTS inquiries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    buyer_name TEXT NOT NULL,
    buyer_email TEXT NOT NULL,
    buyer_phone TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'interested', 'not_interested')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analytics table
CREATE TABLE IF NOT EXISTS analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_type TEXT NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_role ON profiles(user_role);
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status ON profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_properties_seller_id ON properties(seller_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON property_images(property_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_property_id ON inquiries(property_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles: Users can view their own profile, admins can view all
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.user_id = auth.uid() AND p.user_role = 'admin'
        )
    );

-- Users: Similar policies
CREATE POLICY "Users can view own user record" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.user_id = auth.uid() AND p.user_role = 'admin'
        )
    );

-- Properties: Public read access, owners and admins can modify
CREATE POLICY "Public can view active properties" ON properties
    FOR SELECT USING (status = 'active');

CREATE POLICY "Owners can modify their properties" ON properties
    FOR ALL USING (auth.uid() = seller_id);

CREATE POLICY "Admins can modify all properties" ON properties
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.user_id = auth.uid() AND p.user_role = 'admin'
        )
    );

-- Property images: Public read access, owners and admins can modify
CREATE POLICY "Public can view property images" ON property_images
    FOR SELECT USING (true);

CREATE POLICY "Owners can modify property images" ON property_images
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM properties prop 
            WHERE prop.id = property_id AND prop.seller_id = auth.uid()
        )
    );

CREATE POLICY "Admins can modify all property images" ON property_images
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.user_id = auth.uid() AND p.user_role = 'admin'
        )
    );

-- Inquiries: Property owners and admins can view
CREATE POLICY "Property owners can view inquiries" ON inquiries
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM properties prop 
            WHERE prop.id = property_id AND prop.seller_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all inquiries" ON inquiries
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.user_id = auth.uid() AND p.user_role = 'admin'
        )
    );

-- Analytics: Admins can view all, users can view their own
CREATE POLICY "Users can view own analytics" ON analytics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all analytics" ON analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.user_id = auth.uid() AND p.user_role = 'admin'
        )
    );

-- Insert permissions for admins
CREATE POLICY "Admins can insert analytics" ON analytics
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.user_id = auth.uid() AND p.user_role = 'admin'
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
