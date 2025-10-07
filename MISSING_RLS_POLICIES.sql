-- ============================================
-- MISSING RLS POLICIES FOR SUPABASE
-- Run these in Supabase SQL Editor
-- ============================================

-- ==================== STORAGE POLICIES ====================

-- Policy 1: Allow authenticated users to upload photos
CREATE POLICY "Authenticated users can upload photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Allow public read access
CREATE POLICY "Public can view photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'photos');

-- Policy 3: Allow users to delete their own photos
CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Allow users to update their own photos
CREATE POLICY "Users can update their own photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ==================== TABLE POLICIES ====================

-- Interests table policies (currently missing)
CREATE POLICY "Anyone can view interests"
ON interests FOR SELECT
TO public
USING (true);

-- Allow reading messages for match participants
CREATE POLICY "Users can mark messages as read"
ON messages FOR UPDATE
USING (
  match_id IN (
    SELECT id FROM matches WHERE
    user1_id = (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
    user2_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  )
)
WITH CHECK (
  match_id IN (
    SELECT id FROM matches WHERE
    user1_id = (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
    user2_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  )
);

-- Allow users to view reports they created
CREATE POLICY "Users can view their own reports"
ON reports FOR SELECT
USING (reporter_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- ==================== AUTH HOOKS ====================

-- Function to create profile automatically on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, age, bio, location)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'New User'),
    COALESCE((NEW.raw_user_meta_data->>'age')::integer, 18),
    '',
    ''
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==================== VERIFICATION ====================

-- Run this to verify all policies are in place
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

-- Run this to verify storage policies
SELECT * FROM storage.policies WHERE bucket_id = 'photos';