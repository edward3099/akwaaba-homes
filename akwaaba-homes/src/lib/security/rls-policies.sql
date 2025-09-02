-- Row-Level Security (RLS) Policies for AkwaabaHomes Database
-- This file contains all the security policies to ensure proper data access control

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES TABLE POLICIES
-- ============================================================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own profile
CREATE POLICY "Users can create own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND user_role IN ('admin', 'super_admin')
    )
  );

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND user_role IN ('admin', 'super_admin')
    )
  );

-- Only admins can delete profiles
CREATE POLICY "Only admins can delete profiles" ON profiles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND user_role IN ('admin', 'super_admin')
    )
  );

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Users can only read their own profile
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Admins can read all user profiles
CREATE POLICY "Admins can read all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND user_type IN ('admin', 'super_admin')
    )
  );

-- Admins can update all user profiles
CREATE POLICY "Admins can update all users" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND user_type IN ('admin', 'super_admin')
    )
  );

-- Only admins can delete users
CREATE POLICY "Only admins can delete users" ON users
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND user_type IN ('admin', 'super_admin')
    )
  );

-- ============================================================================
-- PROPERTIES TABLE POLICIES
-- ============================================================================

-- Anyone can read active properties (for public listing)
CREATE POLICY "Anyone can read active properties" ON properties
  FOR SELECT USING (status = 'active');

-- Sellers can read their own properties
CREATE POLICY "Sellers can read own properties" ON properties
  FOR SELECT USING (
    seller_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND user_type = 'seller'
    )
  );

-- Sellers can create properties
CREATE POLICY "Sellers can create properties" ON properties
  FOR INSERT WITH CHECK (
    seller_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND user_type = 'seller'
    )
  );

-- Sellers can update their own properties
CREATE POLICY "Sellers can update own properties" ON properties
  FOR UPDATE USING (
    seller_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND user_type = 'seller'
    )
  );

-- Sellers can delete their own properties
CREATE POLICY "Sellers can delete own properties" ON properties
  FOR DELETE USING (
    seller_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND user_type = 'seller'
    )
  );

-- Admins can read all properties
CREATE POLICY "Admins can read all properties" ON properties
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND user_type IN ('admin', 'super_admin')
    )
  );

-- Admins can update all properties
CREATE POLICY "Admins can update all properties" ON properties
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND user_type IN ('admin', 'super_admin')
    )
  );

-- Admins can delete any property
CREATE POLICY "Admins can delete any property" ON properties
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND user_type IN ('admin', 'super_admin')
    )
  );

-- ============================================================================
-- PROPERTY_IMAGES TABLE POLICIES
-- ============================================================================

-- Anyone can read images for active properties
CREATE POLICY "Anyone can read images for active properties" ON property_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE id = property_id 
      AND status = 'active'
    )
  );

-- Sellers can read images for their own properties
CREATE POLICY "Sellers can read own property images" ON property_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE id = property_id 
      AND seller_id = auth.uid()
    )
  );

-- Sellers can create images for their own properties
CREATE POLICY "Sellers can create images for own properties" ON property_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE id = property_id 
      AND seller_id = auth.uid()
    )
  );

-- Sellers can update images for their own properties
CREATE POLICY "Sellers can update own property images" ON property_images
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE id = property_id 
      AND seller_id = auth.uid()
    )
  );

-- Sellers can delete images for their own properties
CREATE POLICY "Sellers can delete own property images" ON property_images
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE id = property_id 
      AND seller_id = auth.uid()
    )
  );

-- Admins can manage all property images
CREATE POLICY "Admins can manage all property images" ON property_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND user_type IN ('admin', 'super_admin')
    )
  );

-- ============================================================================
-- INQUIRIES TABLE POLICIES
-- ============================================================================

-- Sellers can read inquiries for their own properties
CREATE POLICY "Sellers can read inquiries for own properties" ON inquiries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE id = property_id 
      AND seller_id = auth.uid()
    )
  );

-- Sellers can update inquiries for their own properties
CREATE POLICY "Sellers can update inquiries for own properties" ON inquiries
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE id = property_id 
      AND seller_id = auth.uid()
    )
  );

-- Anyone can create inquiries (for public access)
CREATE POLICY "Anyone can create inquiries" ON inquiries
  FOR INSERT WITH CHECK (true);

-- Admins can read all inquiries
CREATE POLICY "Admins can read all inquiries" ON inquiries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND user_type IN ('admin', 'super_admin')
    )
  );

-- Admins can update all inquiries
CREATE POLICY "Admins can update all inquiries" ON inquiries
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND user_type IN ('admin', 'super_admin')
    )
  );

-- Admins can delete any inquiry
CREATE POLICY "Admins can delete any inquiry" ON inquiries
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND user_type IN ('admin', 'super_admin')
    )
  );

-- ============================================================================
-- VERIFICATIONS TABLE POLICIES
-- ============================================================================

-- Users can read their own verifications
CREATE POLICY "Users can read own verifications" ON verifications
  FOR SELECT USING (user_id = auth.uid());

-- Users can create their own verifications
CREATE POLICY "Users can create own verifications" ON verifications
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own verifications
CREATE POLICY "Users can update own verifications" ON verifications
  FOR UPDATE USING (user_id = auth.uid());

-- Admins can read all verifications
CREATE POLICY "Admins can read all verifications" ON verifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND user_type IN ('admin', 'super_admin')
    )
  );

-- Admins can update all verifications
CREATE POLICY "Admins can update all verifications" ON verifications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND user_type IN ('admin', 'super_admin')
    )
  );

-- ============================================================================
-- ANALYTICS_EVENTS TABLE POLICIES
-- ============================================================================

-- Sellers can read analytics for their own properties
CREATE POLICY "Sellers can read own property analytics" ON analytics_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE id = property_id 
      AND seller_id = auth.uid()
    )
  );

-- Anyone can create analytics events (for tracking)
CREATE POLICY "Anyone can create analytics events" ON analytics_events
  FOR INSERT WITH CHECK (true);

-- Admins can read all analytics
CREATE POLICY "Admins can read all analytics" ON analytics_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND user_type IN ('admin', 'super_admin')
    )
  );

-- ============================================================================
-- MESSAGES TABLE POLICIES
-- ============================================================================

-- Users can read messages they sent or received
CREATE POLICY "Users can read own messages" ON messages
  FOR SELECT USING (
    sender_id = auth.uid() OR 
    recipient_id = auth.uid()
  );

-- Users can create messages
CREATE POLICY "Users can create messages" ON messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Users can update their own messages
CREATE POLICY "Users can update own messages" ON messages
  FOR UPDATE USING (sender_id = auth.uid());

-- Users can delete their own messages
CREATE POLICY "Users can delete own messages" ON messages
  FOR DELETE USING (sender_id = auth.uid());

-- Admins can read all messages
CREATE POLICY "Admins can read all messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND user_type IN ('admin', 'super_admin')
    )
  );

-- ============================================================================
-- NOTIFICATIONS TABLE POLICIES
-- ============================================================================

-- Users can read their own notifications
CREATE POLICY "Users can read own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

-- Users can update their own notifications
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- System can create notifications for users
CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Admins can read all notifications
CREATE POLICY "Admins can read all notifications" ON notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND user_type IN ('admin', 'super_admin')
    )
  );

-- ============================================================================
-- ADDITIONAL SECURITY MEASURES
-- ============================================================================

-- Create indexes for better performance on security checks
CREATE INDEX IF NOT EXISTS idx_properties_seller_id ON properties(seller_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_property_id ON inquiries(property_id);
CREATE INDEX IF NOT EXISTS idx_analytics_property_id ON analytics_events(property_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_recipient ON messages(sender_id, recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = user_id 
    AND user_type IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user owns property
CREATE OR REPLACE FUNCTION owns_property(user_id UUID, property_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM properties 
    WHERE id = property_id 
    AND seller_id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION owns_property(UUID, UUID) TO authenticated;

