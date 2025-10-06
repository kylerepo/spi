-- ==================== COMPREHENSIVE RLS POLICY FIX ====================
-- This file contains ALL corrected RLS policies for the swingers dating app
-- Run this AFTER running the initial schema files

-- First, drop all existing policies to start fresh
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname 
              FROM pg_policies 
              WHERE schemaname = 'public') 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- ==================== USERS TABLE POLICIES ====================

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile  
CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- ==================== PROFILES TABLE POLICIES ====================

-- Users can view visible profiles OR their own profile
CREATE POLICY "Users can view profiles"
  ON profiles FOR SELECT
  USING (
    is_visible = true 
    AND is_profile_complete = true 
    AND verification_status = 'verified'
    OR auth.uid() = user_id
  );

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own profile
CREATE POLICY "Users can delete their own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = user_id);

-- ==================== COUPLE PROFILES TABLE POLICIES ====================

-- Users can view couple profiles if they can view the main profile
CREATE POLICY "Users can view couple profiles"
  ON couple_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = couple_profiles.profile_id 
      AND (profiles.is_visible = true OR auth.uid() = profiles.user_id)
    )
  );

-- Users can manage their own couple profile
CREATE POLICY "Users can manage own couple profile"
  ON couple_profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = couple_profiles.profile_id 
      AND auth.uid() = profiles.user_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = couple_profiles.profile_id 
      AND auth.uid() = profiles.user_id
    )
  );

-- ==================== PROFILE PHOTOS TABLE POLICIES ====================

-- Anyone can view photos of visible profiles
CREATE POLICY "Users can view profile photos"
  ON profile_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = profile_photos.profile_id 
      AND (profiles.is_visible = true OR auth.uid() = profiles.user_id)
    )
  );

-- Users can insert their own profile photos
CREATE POLICY "Users can insert own profile photos"
  ON profile_photos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = profile_photos.profile_id 
      AND auth.uid() = profiles.user_id
    )
  );

-- Users can update their own profile photos
CREATE POLICY "Users can update own profile photos"
  ON profile_photos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = profile_photos.profile_id 
      AND auth.uid() = profiles.user_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = profile_photos.profile_id 
      AND auth.uid() = profiles.user_id
    )
  );

-- Users can delete their own profile photos
CREATE POLICY "Users can delete own profile photos"
  ON profile_photos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = profile_photos.profile_id 
      AND auth.uid() = profiles.user_id
    )
  );

-- ==================== INTEREST TABLES POLICIES ====================

-- Anyone can view interest categories
CREATE POLICY "Anyone can view interest categories"
  ON interest_categories FOR SELECT
  USING (true);

-- Anyone can view active interests
CREATE POLICY "Anyone can view active interests"
  ON interests FOR SELECT
  USING (is_active = true);

-- Users can view profile interests
CREATE POLICY "Users can view profile interests"
  ON profile_interests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = profile_interests.profile_id 
      AND (profiles.is_visible = true OR auth.uid() = profiles.user_id)
    )
  );

-- Users can manage their own profile interests
CREATE POLICY "Users can manage own profile interests"
  ON profile_interests FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = profile_interests.profile_id 
      AND auth.uid() = profiles.user_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = profile_interests.profile_id 
      AND auth.uid() = profiles.user_id
    )
  );

-- ==================== PREFERENCES TABLE POLICIES ====================

-- Users can view profile preferences
CREATE POLICY "Users can view profile preferences"
  ON profile_preferences FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = profile_preferences.profile_id 
      AND (profiles.is_visible = true OR auth.uid() = profiles.user_id)
    )
  );

-- Users can manage their own preferences
CREATE POLICY "Users can manage own preferences"
  ON profile_preferences FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = profile_preferences.profile_id 
      AND auth.uid() = profiles.user_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = profile_preferences.profile_id 
      AND auth.uid() = profiles.user_id
    )
  );

-- ==================== BOUNDARIES TABLE POLICIES ====================

-- Users can view profile boundaries
CREATE POLICY "Users can view profile boundaries"
  ON profile_boundaries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = profile_boundaries.profile_id 
      AND (profiles.is_visible = true OR auth.uid() = profiles.user_id)
    )
  );

-- Users can manage their own boundaries
CREATE POLICY "Users can manage own boundaries"
  ON profile_boundaries FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = profile_boundaries.profile_id 
      AND auth.uid() = profiles.user_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = profile_boundaries.profile_id 
      AND auth.uid() = profiles.user_id
    )
  );

-- ==================== SAFE SEX TABLE POLICIES ====================

-- Users can view profile safe sex info
CREATE POLICY "Users can view profile safe sex"
  ON profile_safe_sex FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = profile_safe_sex.profile_id 
      AND (profiles.is_visible = true OR auth.uid() = profiles.user_id)
    )
  );

-- Users can manage their own safe sex info
CREATE POLICY "Users can manage own safe sex"
  ON profile_safe_sex FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = profile_safe_sex.profile_id 
      AND auth.uid() = profiles.user_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = profile_safe_sex.profile_id 
      AND auth.uid() = profiles.user_id
    )
  );

-- ==================== VERIFICATIONS TABLE POLICIES ====================

-- Users can view their own verifications
CREATE POLICY "Users can view own verifications"
  ON user_verifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own verifications
CREATE POLICY "Users can insert own verifications"
  ON user_verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Moderators can view all verifications
CREATE POLICY "Moderators can view all verifications"
  ON user_verifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('moderator', 'admin')
    )
  );

-- Moderators can update verifications
CREATE POLICY "Moderators can update verifications"
  ON user_verifications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('moderator', 'admin')
    )
  );

-- ==================== REPORTS TABLE POLICIES ====================

-- Users can view their own reports
CREATE POLICY "Users can view own reports"
  ON user_reports FOR SELECT
  USING (auth.uid() = reporter_id);

-- Users can create reports
CREATE POLICY "Users can create reports"
  ON user_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- Moderators can view all reports
CREATE POLICY "Moderators can view all reports"
  ON user_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('moderator', 'admin')
    )
  );

-- Moderators can update reports
CREATE POLICY "Moderators can update reports"
  ON user_reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('moderator', 'admin')
    )
  );

-- ==================== BLOCKS TABLE POLICIES ====================

-- Users can view their own blocks
CREATE POLICY "Users can view own blocks"
  ON user_blocks FOR SELECT
  USING (auth.uid() = blocker_id);

-- Users can create blocks
CREATE POLICY "Users can create blocks"
  ON user_blocks FOR INSERT
  WITH CHECK (auth.uid() = blocker_id);

-- Users can delete their own blocks
CREATE POLICY "Users can delete own blocks"
  ON user_blocks FOR DELETE
  USING (auth.uid() = blocker_id);

-- ==================== APP SETTINGS TABLE POLICIES ====================

-- Only admins can view app settings
CREATE POLICY "Admins can view app settings"
  ON app_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Only admins can manage app settings
CREATE POLICY "Admins can manage app settings"
  ON app_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- ==================== STORAGE POLICIES ====================
-- These must be run separately in the Storage section of Supabase Dashboard

-- For profile-photos bucket:
-- 1. Go to Storage > profile-photos > Policies
-- 2. Create these policies:

/*
Policy: "Anyone can view profile photos"
Allowed operation: SELECT
WITH CHECK expression: true

Policy: "Users can upload their own photos"  
Allowed operation: INSERT
WITH CHECK expression: (bucket_id = 'profile-photos'::text) AND (auth.uid()::text = (storage.foldername(name))[1])

Policy: "Users can update their own photos"
Allowed operation: UPDATE  
WITH CHECK expression: (bucket_id = 'profile-photos'::text) AND (auth.uid()::text = (storage.foldername(name))[1])

Policy: "Users can delete their own photos"
Allowed operation: DELETE
WITH CHECK expression: (bucket_id = 'profile-photos'::text) AND (auth.uid()::text = (storage.foldername(name))[1])
*/

-- For verification-documents bucket:
-- 1. Go to Storage > verification-documents > Policies  
-- 2. Create these policies:

/*
Policy: "Users can view their own documents"
Allowed operation: SELECT
WITH CHECK expression: (bucket_id = 'verification-documents'::text) AND (auth.uid()::text = (storage.foldername(name))[1])

Policy: "Moderators can view all documents"
Allowed operation: SELECT
WITH CHECK expression: (bucket_id = 'verification-documents'::text) AND (EXISTS ( SELECT 1 FROM users WHERE ((users.id = auth.uid()) AND (users.role = ANY (ARRAY['moderator'::user_role, 'admin'::user_role])))))

Policy: "Users can upload their own documents"
Allowed operation: INSERT
WITH CHECK expression: (bucket_id = 'verification-documents'::text) AND (auth.uid()::text = (storage.foldername(name))[1])

Policy: "Users can update their own documents"
Allowed operation: UPDATE
WITH CHECK expression: (bucket_id = 'verification-documents'::text) AND (auth.uid()::text = (storage.foldername(name))[1])

Policy: "Users can delete their own documents"
Allowed operation: DELETE  
WITH CHECK expression: (bucket_id = 'verification-documents'::text) AND (auth.uid()::text = (storage.foldername(name))[1])
*/

-- ==================== VERIFICATION ====================

-- Check that all policies are created
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Should show all policies listed above
