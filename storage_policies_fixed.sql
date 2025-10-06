-- ==================== STORAGE BUCKET POLICIES FIX ====================
-- This must be run in Supabase Dashboard > Storage section

-- NOTE: Storage policies are managed differently than table policies
-- You must apply these through the Supabase Dashboard UI or Storage API

-- ==================== PROFILE-PHOTOS BUCKET ====================
-- Bucket should be PUBLIC

-- Delete existing policies for profile-photos
DELETE FROM storage.objects WHERE bucket_id = 'profile-photos'; -- CAREFUL: This deletes all files!

-- Insert storage bucket configuration (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-photos',
  'profile-photos',
  true, -- PUBLIC bucket
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- ==================== VERIFICATION-DOCUMENTS BUCKET ====================
-- Bucket should be PRIVATE

-- Insert storage bucket configuration (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'verification-documents',
  'verification-documents',
  false, -- PRIVATE bucket
  20971520, -- 20MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 20971520,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

-- ==================== APPLY STORAGE POLICIES ====================
-- These policies control who can access files in the buckets

-- Profile Photos Policies (PUBLIC bucket)
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-photos');

CREATE POLICY "Authenticated users upload profile photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-photos' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users update own profile photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users delete own profile photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Verification Documents Policies (PRIVATE bucket)
CREATE POLICY "Users view own verification documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'verification-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Moderators view all verification documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'verification-documents'
    AND EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('moderator', 'admin')
    )
  );

CREATE POLICY "Authenticated users upload verification documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'verification-documents'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users update own verification documents" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'verification-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users delete own verification documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'verification-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ==================== VERIFY SETUP ====================

-- Check buckets exist
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id IN ('profile-photos', 'verification-documents');

-- Check policies exist
SELECT policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects'
ORDER BY policyname;
