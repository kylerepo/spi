-- ============================================
-- SUPABASE STORAGE BUCKET AND POLICIES FIX
-- Run these commands in Supabase SQL Editor
-- ============================================

-- Step 1: Create the photos storage bucket (if it doesn't exist)
-- Note: This needs to be done in Supabase Dashboard > Storage, not SQL
-- Bucket name: photos
-- Public: true (for public read access)

-- Step 2: Apply storage policies for the photos bucket
-- These policies control who can upload, read, update, and delete photos

-- Policy 1: Allow authenticated users to upload photos to their own folder
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command, roles)
VALUES (
  'authenticated-upload-photos',
  'photos',
  'Authenticated users can upload photos',
  'bucket_id = ''photos'' AND (storage.foldername(name))[1] = auth.uid()::text',
  'bucket_id = ''photos'' AND (storage.foldername(name))[1] = auth.uid()::text',
  'INSERT',
  '{authenticated}'
) ON CONFLICT (id) DO NOTHING;

-- Policy 2: Allow public read access to all photos
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command, roles)
VALUES (
  'public-read-photos',
  'photos',
  'Public can view photos',
  'bucket_id = ''photos''',
  NULL,
  'SELECT',
  '{public, authenticated}'
) ON CONFLICT (id) DO NOTHING;

-- Policy 3: Allow users to delete their own photos
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command, roles)
VALUES (
  'authenticated-delete-own-photos',
  'photos',
  'Users can delete their own photos',
  'bucket_id = ''photos'' AND (storage.foldername(name))[1] = auth.uid()::text',
  NULL,
  'DELETE',
  '{authenticated}'
) ON CONFLICT (id) DO NOTHING;

-- Policy 4: Allow users to update their own photos
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command, roles)
VALUES (
  'authenticated-update-own-photos',
  'photos',
  'Users can update their own photos',
  'bucket_id = ''photos'' AND (storage.foldername(name))[1] = auth.uid()::text',
  'bucket_id = ''photos'' AND (storage.foldername(name))[1] = auth.uid()::text',
  'UPDATE',
  '{authenticated}'
) ON CONFLICT (id) DO NOTHING;

-- Step 3: Verify policies are created
SELECT * FROM storage.policies WHERE bucket_id = 'photos';