# Supabase Storage Setup Guide

## The Problem
You're getting "The string did not match the expected pattern" errors because:
1. The Supabase storage bucket "photos" doesn't exist
2. Storage policies are missing or incorrectly configured

## Quick Fix Steps

### Step 1: Create Storage Bucket
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `hvafquyruidsvteerdwf`
3. Navigate to **Storage** in the left sidebar
4. Click **"New bucket"**
5. Set these values:
   - **Name**: `photos`
   - **Public bucket**: ✅ **CHECKED** (important!)
   - **File size limit**: 50MB (recommended)
   - **Allowed MIME types**: `image/*` (optional, for security)

### Step 2: Apply Storage Policies
1. Go to **SQL Editor** in your Supabase Dashboard
2. Copy and paste the contents of `SUPABASE_STORAGE_FIX.sql`
3. Click **"Run"** to execute the policies

### Step 3: Verify Setup
Run this query in SQL Editor to verify:
```sql
-- Check if bucket exists
SELECT * FROM storage.buckets WHERE name = 'photos';

-- Check policies
SELECT * FROM storage.policies WHERE bucket_id = 'photos';
```

## Alternative: Manual Policy Creation

If the SQL approach doesn't work, create policies manually:

1. Go to **Storage** > **Policies** in Supabase Dashboard
2. Click **"New Policy"** for the `photos` bucket
3. Create these 4 policies:

**Policy 1: Upload Photos**
- Name: `Authenticated users can upload photos`
- Allowed operation: `INSERT`
- Target roles: `authenticated`
- USING expression: `bucket_id = 'photos' AND (storage.foldername(name))[1] = auth.uid()::text`

**Policy 2: Read Photos**
- Name: `Public can view photos`
- Allowed operation: `SELECT`
- Target roles: `public`
- USING expression: `bucket_id = 'photos'`

**Policy 3: Delete Photos**
- Name: `Users can delete their own photos`
- Allowed operation: `DELETE`
- Target roles: `authenticated`
- USING expression: `bucket_id = 'photos' AND (storage.foldername(name))[1] = auth.uid()::text`

**Policy 4: Update Photos**
- Name: `Users can update their own photos`
- Allowed operation: `UPDATE`
- Target roles: `authenticated`
- USING expression: `bucket_id = 'photos' AND (storage.foldername(name))[1] = auth.uid()::text`

## Test the Fix

After setup, test by:
1. Opening your app
2. Going through profile setup
3. Trying to upload photos
4. The error should be resolved!

## Common Issues

**Issue**: Still getting pattern errors
**Solution**: Make sure the bucket is marked as "Public" and policies are active

**Issue**: "Bucket not found" error
**Solution**: Double-check the bucket name is exactly "photos" (lowercase)

**Issue**: Upload works but photos don't display
**Solution**: Verify the public read policy is in place