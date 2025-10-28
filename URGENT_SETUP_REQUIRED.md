# 🚨 URGENT SETUP REQUIRED

## Critical Issues

Your application has **3 critical configuration issues** that must be fixed:

### 1. ❌ SUPABASE_SERVICE_ROLE_KEY Not Set

**Problem:**
- The `.env` file has `SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here`
- This is a placeholder, not a real key
- Server cannot start without it
- All backend operations are broken

**Solution:**
Get your Supabase Service Role Key and add it to `.env`:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** > **API**
4. Copy the **`service_role` key** (under "Project API keys")
5. Update `.env` file:

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmF...
```

⚠️ **NEVER commit or share this key publicly!**

---

### 2. ❌ Database Trigger Missing

**Problem:**
- When users sign up via Supabase Auth, a record must be created in `public.users` table
- This trigger doesn't exist yet
- Signup fails with "Database error saving new user"

**Solution:**
Run this SQL in your Supabase SQL Editor:

**File:** `/app/supabase_auth_trigger.sql`

```sql
-- Copy the entire contents of supabase_auth_trigger.sql
-- and run it in Supabase Dashboard > SQL Editor
```

This creates 3 triggers:
1. **on_auth_user_created** - Creates users table record on signup
2. **on_auth_user_email_verified** - Updates email_verified status
3. **on_auth_user_login** - Updates last_login timestamp

---

### 3. ❌ Storage Buckets May Not Exist

**Problem:**
- Photo upload requires `profile-photos` bucket
- Verification upload requires `verification-documents` bucket
- These may not be created yet

**Solution:**
Run this SQL in your Supabase SQL Editor:

**File:** `/app/003_storage_setup.sql` (from your uploaded schema files)

Or manually create buckets:
1. Go to Supabase Dashboard > **Storage**
2. Click "New Bucket"
3. Create `profile-photos`:
   - Name: `profile-photos`
   - Public: ✅ Yes
   - File size limit: 10MB
   - Allowed types: image/jpeg, image/png, image/webp
4. Create `verification-documents`:
   - Name: `verification-documents`
   - Public: ❌ No
   - File size limit: 20MB
   - Allowed types: image/jpeg, image/png, image/webp, application/pdf

---

## Quick Setup Checklist

- [ ] 1. Get Supabase Service Role Key
- [ ] 2. Update `.env` with real key
- [ ] 3. Run `supabase_auth_trigger.sql` in Supabase
- [ ] 4. Verify storage buckets exist
- [ ] 5. Restart your application
- [ ] 6. Test signup flow

---

## Step-by-Step Setup

### Step 1: Get Supabase Credentials

```bash
# Your Supabase project URL (already set correctly)
SUPABASE_URL=https://zjyoqxqcdzxwtkmqamas.supabase.co

# Get this from Supabase Dashboard > Settings > API
SUPABASE_SERVICE_ROLE_KEY=<YOUR_KEY_HERE>

# Anon key (already set correctly)
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 2: Update Environment Variables

**Local Development:**
1. Edit `/app/.env`
2. Replace `your_service_role_key_here` with actual key
3. Save file

**Vercel/Production:**
1. Go to Vercel Dashboard
2. Select your project
3. Go to **Settings** > **Environment Variables**
4. Add/Update:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Redeploy

### Step 3: Run Database Migrations

In Supabase Dashboard > SQL Editor, run these files in order:

1. ✅ `001_initial_schema.sql` (already run)
2. ✅ `002_rls_policies.sql` (already run)
3. ⚠️ `003_storage_setup.sql` (verify this ran)
4. ✅ `004_seed_data.sql` (already run)
5. ✅ `005_add_preference_fields.sql` (already run)
6. **NEW:** `supabase_auth_trigger.sql` ⚠️ **MUST RUN THIS**

### Step 4: Verify Setup

**Check 1: Database Trigger**
```sql
-- Run this in Supabase SQL Editor
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name LIKE '%auth%';
```

Should show:
- `on_auth_user_created` on `auth.users`
- `on_auth_user_email_verified` on `auth.users`
- `on_auth_user_login` on `auth.users`

**Check 2: Storage Buckets**
```sql
-- Run this in Supabase SQL Editor
SELECT name, public FROM storage.buckets;
```

Should show:
- `profile-photos` (public: true)
- `verification-documents` (public: false)

**Check 3: Test Signup**
1. Go to your app's signup page
2. Create a test account
3. Check Supabase Dashboard > **Authentication** > **Users**
4. Verify user appears there
5. Check Supabase Dashboard > **Table Editor** > **users**
6. Verify user record was automatically created

---

## Common Errors & Solutions

### Error: "Missing Supabase environment variables"

**Cause:** Service role key not set
**Solution:** Follow Step 1 & 2 above

### Error: "Database error saving new user"

**Cause:** Database trigger missing
**Solution:** Run `supabase_auth_trigger.sql`

### Error: "Failed to get upload URL"

**Cause:** Storage buckets don't exist or service role key missing
**Solution:** Create buckets + set service role key

### Error: "Profile not found"

**Cause:** Profile creation flow not completing
**Solution:** Check that:
1. User record was created (trigger works)
2. Profile setup flow completes without errors
3. Check browser console for errors

---

## Testing After Setup

### Test 1: Signup
```
1. Go to /signup
2. Enter email, password, confirm password
3. Agree to terms
4. Click "Create Account"
5. ✅ Should succeed and redirect to profile setup
```

### Test 2: Profile Setup
```
1. Complete profile setup steps 1-10
2. Step 11: Upload photos
3. ✅ Photos should upload successfully
4. Click "Complete Profile"
5. ✅ Should succeed without errors
```

### Test 3: Photo Upload
```
1. Go to profile page
2. Click to upload photo
3. Select image file (<10MB)
4. ✅ Should upload and display photo
```

---

## Current Status

### ✅ Working:
- Supabase client configuration
- Database schema and tables
- RLS policies
- Frontend UI and forms
- Authentication (signin/signout)

### ❌ Broken (until fixed):
- User signup (database trigger missing)
- Photo upload (service role key missing)
- Profile completion (depends on above)
- Any admin operations

### 📝 Required Actions:
1. **CRITICAL:** Set SUPABASE_SERVICE_ROLE_KEY
2. **CRITICAL:** Run supabase_auth_trigger.sql
3. **IMPORTANT:** Verify storage buckets exist
4. **RECOMMENDED:** Test full signup flow

---

## Support

If you still have issues after following this guide:

1. **Check Server Logs:**
   ```bash
   # If using local development
   npm run dev
   
   # If deployed
   Check Vercel logs or your hosting platform logs
   ```

2. **Check Supabase Logs:**
   - Go to Supabase Dashboard > **Logs**
   - Look for errors during signup/upload

3. **Check Browser Console:**
   - Open DevTools (F12)
   - Look for JavaScript errors
   - Check Network tab for failed requests

4. **Verify Environment:**
   ```bash
   # Check if .env is loaded
   echo $SUPABASE_URL
   echo $SUPABASE_SERVICE_ROLE_KEY
   ```

---

## Files Reference

- `/app/.env` - Environment variables
- `/app/supabase_auth_trigger.sql` - **NEW** Database triggers (MUST RUN)
- `/app/server/supabase.ts` - Supabase client configuration
- `/app/server/routes.ts` - API endpoints
- `/app/server/db.ts` - Database operations
- `/app/server/storage.ts` - File storage operations
- `/app/SUPABASE_CONFIG_README.md` - Full documentation

---

## Next Steps After Setup

Once everything is working:

1. **Test thoroughly:**
   - Signup multiple test users
   - Upload photos
   - Complete profiles
   - Test all features

2. **Deploy to production:**
   - Set environment variables in Vercel
   - Redeploy application
   - Test production environment

3. **Monitor:**
   - Check Supabase usage/quotas
   - Monitor error logs
   - Watch for failed uploads

4. **Secure:**
   - Never expose service role key
   - Keep RLS policies enabled
   - Review storage permissions

---

**⚠️ IMPORTANT:** Do not proceed with production deployment until all 3 critical issues are resolved and tested!
