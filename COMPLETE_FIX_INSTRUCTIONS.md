# Complete Fix for "String Did Not Match Expected Pattern" Error

## Problem Summary
Your Supabase storage is not properly configured, causing photo uploads to fail with "The string did not match the expected pattern" error.

## Step-by-Step Fix

### 1. Create Storage Bucket (CRITICAL)
**This is the most likely missing piece!**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `hvafquyruidsvteerdwf`
3. Click **Storage** in the left sidebar
4. Click **"New bucket"**
5. Configure:
   - **Name**: `photos` (exactly this, lowercase)
   - **Public bucket**: ✅ **MUST BE CHECKED**
   - **File size limit**: 50MB
   - **Allowed MIME types**: `image/*`

### 2. Apply Storage Policies
Copy and run this in **SQL Editor**:

```sql
-- Create storage policies for photos bucket
INSERT INTO storage.policies (id, bucket_id, name, definition, command, roles)
VALUES 
  ('photos-upload', 'photos', 'Authenticated users can upload', 'bucket_id = ''photos'' AND (storage.foldername(name))[1] = auth.uid()::text', 'INSERT', '{authenticated}'),
  ('photos-read', 'photos', 'Public can read photos', 'bucket_id = ''photos''', 'SELECT', '{public}'),
  ('photos-delete', 'photos', 'Users can delete own photos', 'bucket_id = ''photos'' AND (storage.foldername(name))[1] = auth.uid()::text', 'DELETE', '{authenticated}'),
  ('photos-update', 'photos', 'Users can update own photos', 'bucket_id = ''photos'' AND (storage.foldername(name))[1] = auth.uid()::text', 'UPDATE', '{authenticated}')
ON CONFLICT (id) DO NOTHING;
```

### 3. Test the Configuration
1. Open `test-storage.html` in your browser
2. Click "Test Connection" - should show ✅
3. Click "Check Photos Bucket" - should find the bucket
4. Select an image and click "Test Upload" - should succeed

### 4. Verify in Your App
1. Open your app
2. Go through profile setup
3. Try uploading photos
4. Error should be resolved!

## Alternative: Quick Manual Setup

If SQL doesn't work, create policies manually in Dashboard:

1. Go to **Storage** > **Policies**
2. Select `photos` bucket
3. Create 4 policies:

**Upload Policy:**
- Operation: INSERT
- Roles: authenticated
- Expression: `bucket_id = 'photos' AND (storage.foldername(name))[1] = auth.uid()::text`

**Read Policy:**
- Operation: SELECT  
- Roles: public
- Expression: `bucket_id = 'photos'`

**Delete Policy:**
- Operation: DELETE
- Roles: authenticated
- Expression: `bucket_id = 'photos' AND (storage.foldername(name))[1] = auth.uid()::text`

**Update Policy:**
- Operation: UPDATE
- Roles: authenticated
- Expression: `bucket_id = 'photos' AND (storage.foldername(name))[1] = auth.uid()::text`

## Common Mistakes to Avoid

❌ **Bucket name wrong** - Must be exactly "photos" (lowercase)
❌ **Bucket not public** - Must check "Public bucket" when creating
❌ **Missing policies** - All 4 policies are required
❌ **Wrong policy expressions** - Copy exactly as shown above

## Verification Commands

Run these in SQL Editor to verify:

```sql
-- Check bucket exists and is public
SELECT name, public FROM storage.buckets WHERE name = 'photos';

-- Check policies exist
SELECT id, name, command FROM storage.policies WHERE bucket_id = 'photos';

-- Should return 4 rows (INSERT, SELECT, DELETE, UPDATE)
```

## If Still Not Working

1. **Check browser console** for detailed error messages
2. **Verify authentication** - user must be logged in to upload
3. **Check file size** - must be under bucket limit
4. **Try different image** - some formats might be blocked

## Need Help?

If you're still having issues:
1. Run the test-storage.html tool
2. Share the exact error messages from browser console
3. Verify the bucket exists and is public in Supabase Dashboard

The fix should resolve your profile setup issues immediately!