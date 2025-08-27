-- Storage Buckets Setup for AkwaabaHomes
-- This file contains the SQL commands to set up storage buckets and policies

-- ============================================================================
-- CREATE STORAGE BUCKETS
-- ============================================================================

-- Main property images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-images',
  'property-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml']
);

-- Property documents bucket (for contracts, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-documents',
  'property-documents',
  false,
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- User avatars bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-avatars',
  'user-avatars',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Temporary uploads bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'temp-uploads',
  'temp-uploads',
  false,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
);

-- ============================================================================
-- STORAGE POLICIES
-- ============================================================================

-- Property Images Bucket Policies
CREATE POLICY "Allow public read access to property images" ON storage.objects
FOR SELECT USING (bucket_id = 'property-images');

CREATE POLICY "Allow authenticated users to upload property images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'property-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow property owners to update their images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'property-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow property owners to delete their images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'property-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Property Documents Bucket Policies
CREATE POLICY "Allow authenticated users to read their own documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'property-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow authenticated users to upload documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'property-documents' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow document owners to update their documents" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'property-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow document owners to delete their documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'property-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- User Avatars Bucket Policies
CREATE POLICY "Allow public read access to user avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'user-avatars');

CREATE POLICY "Allow users to upload their own avatar" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'user-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow users to update their own avatar" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'user-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow users to delete their own avatar" ON storage.objects
FOR DELETE USING (
  bucket_id = 'user-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Temporary Uploads Bucket Policies
CREATE POLICY "Allow authenticated users to upload temporary files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'temp-uploads' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow users to read their own temporary files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'temp-uploads' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow users to delete their own temporary files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'temp-uploads' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================================================
-- STORAGE FUNCTIONS
-- ============================================================================

-- Function to get storage bucket info
CREATE OR REPLACE FUNCTION get_storage_bucket_info(bucket_name text)
RETURNS TABLE (
  id text,
  name text,
  public boolean,
  file_size_limit bigint,
  allowed_mime_types text[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.name,
    b.public,
    b.file_size_limit,
    b.allowed_mime_types
  FROM storage.buckets b
  WHERE b.name = bucket_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can access file
CREATE OR REPLACE FUNCTION can_access_file(bucket_id text, file_path text, user_id uuid)
RETURNS boolean AS $$
BEGIN
  -- Public buckets are always accessible
  IF bucket_id IN ('property-images', 'user-avatars') THEN
    RETURN true;
  END IF;
  
  -- Private buckets require ownership
  IF bucket_id IN ('property-documents', 'temp-uploads') THEN
    RETURN user_id::text = (storage.foldername(file_path))[1];
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STORAGE TRIGGERS
-- ============================================================================

-- Trigger to automatically create user folder structure
CREATE OR REPLACE FUNCTION create_user_storage_folders()
RETURNS TRIGGER AS $$
BEGIN
  -- This function can be extended to create user-specific folders
  -- when new users are created
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STORAGE VIEWS
-- ============================================================================

-- View for storage usage statistics
CREATE VIEW storage_usage_stats AS
SELECT 
  b.name as bucket_name,
  b.public,
  COUNT(o.id) as file_count,
  COALESCE(SUM(o.metadata->>'size')::bigint, 0) as total_size_bytes,
  COALESCE(SUM(o.metadata->>'size')::bigint / 1024 / 1024, 0) as total_size_mb
FROM storage.buckets b
LEFT JOIN storage.objects o ON b.id = o.bucket_id
GROUP BY b.id, b.name, b.public;

-- View for user storage usage
CREATE VIEW user_storage_usage AS
SELECT 
  (storage.foldername(o.name))[1] as user_id,
  b.name as bucket_name,
  COUNT(o.id) as file_count,
  COALESCE(SUM(o.metadata->>'size')::bigint, 0) as total_size_bytes
FROM storage.buckets b
JOIN storage.objects o ON b.id = o.bucket_id
WHERE b.name IN ('property-images', 'property-documents', 'user-avatars', 'temp-uploads')
GROUP BY (storage.foldername(o.name))[1], b.name;

