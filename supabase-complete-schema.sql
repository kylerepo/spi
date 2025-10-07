-- Complete Supabase Schema for SPICE Dating App
-- This schema supports both single and couple profiles with comprehensive data

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== CORE TABLES ====================

-- Enhanced profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- Basic Info
  display_name VARCHAR(100) NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 18),
  gender VARCHAR(20) NOT NULL,
  gender_other VARCHAR(50),
  sexuality VARCHAR(50) NOT NULL,
  sexuality_other VARCHAR(50),
  relationship_status VARCHAR(50) NOT NULL,
  relationship_status_other VARCHAR(50),
  
  -- Profile Details
  headline VARCHAR(100),
  bio TEXT,
  
  -- Location
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Account Type
  account_type VARCHAR(10) CHECK (account_type IN ('single', 'couple')) NOT NULL DEFAULT 'single',
  profile_type VARCHAR(20) CHECK (profile_type IN ('single_profile', 'couple_profile')) NOT NULL DEFAULT 'single_profile',
  
  -- Status
  is_profile_complete BOOLEAN DEFAULT FALSE,
  is_visible BOOLEAN DEFAULT FALSE,
  verification_status VARCHAR(20) CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')) DEFAULT 'unverified',
  is_premium BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Couple profiles table
CREATE TABLE couple_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- Partner 1
  partner1_name VARCHAR(100),
  partner1_gender VARCHAR(20),
  partner1_gender_other VARCHAR(50),
  partner1_sexuality VARCHAR(50),
  partner1_sexuality_other VARCHAR(50),
  partner1_bio TEXT,
  
  -- Partner 2
  partner2_name VARCHAR(100),
  partner2_gender VARCHAR(20),
  partner2_gender_other VARCHAR(50),
  partner2_sexuality VARCHAR(50),
  partner2_sexuality_other VARCHAR(50),
  partner2_bio TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profile photos table
CREATE TABLE profile_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  is_profile BOOLEAN DEFAULT FALSE,
  order_index INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profile preferences table
CREATE TABLE profile_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  seeking_genders TEXT[] DEFAULT '{}',
  seeking_account_types TEXT[] DEFAULT '{}',
  age_range_min INTEGER DEFAULT 18,
  age_range_max INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profile interests table
CREATE TABLE profile_interests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  interest_name VARCHAR(100) NOT NULL,
  custom_interest TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profile activities/preferences table
CREATE TABLE profile_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  activity_name VARCHAR(100) NOT NULL,
  custom_activity TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profile boundaries table
CREATE TABLE profile_boundaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  boundaries TEXT[] DEFAULT '{}',
  custom_boundaries TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profile safe sex practices table
CREATE TABLE profile_safe_sex (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  practices TEXT[] DEFAULT '{}',
  custom_practices TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== MATCHING & INTERACTION TABLES ====================

-- Swipes table
CREATE TABLE swipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  swiper_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  swiped_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  action VARCHAR(20) CHECK (action IN ('like', 'pass', 'superlike')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(swiper_id, swiped_id)
);

-- Matches table
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  user2_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_at TIMESTAMP WITH TIME ZONE,
  CHECK (user1_id < user2_id), -- Ensure consistent ordering
  UNIQUE(user1_id, user2_id)
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(20) CHECK (type IN ('text', 'image', 'gif')) DEFAULT 'text',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== SAFETY & MODERATION TABLES ====================

-- Blocks table
CREATE TABLE blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  blocked_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

-- Reports table
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reported_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status VARCHAR(20) CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')) DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User verifications table
CREATE TABLE user_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  verification_type VARCHAR(50) NOT NULL,
  file_url TEXT,
  storage_path TEXT,
  status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== INTERESTS & CATEGORIES ====================

-- Interest categories table
CREATE TABLE interest_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Interests table
CREATE TABLE interests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  category_id UUID REFERENCES interest_categories(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== INDEXES ====================

-- Profile indexes
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_account_type ON profiles(account_type);
CREATE INDEX idx_profiles_location ON profiles(latitude, longitude);
CREATE INDEX idx_profiles_visible ON profiles(is_visible, is_profile_complete);
CREATE INDEX idx_profiles_verification ON profiles(verification_status);

-- Couple profile indexes
CREATE INDEX idx_couple_profiles_profile_id ON couple_profiles(profile_id);

-- Photo indexes
CREATE INDEX idx_profile_photos_profile_id ON profile_photos(profile_id);
CREATE INDEX idx_profile_photos_order ON profile_photos(profile_id, order_index);

-- Preference indexes
CREATE INDEX idx_profile_preferences_profile_id ON profile_preferences(profile_id);
CREATE INDEX idx_profile_interests_profile_id ON profile_interests(profile_id);
CREATE INDEX idx_profile_activities_profile_id ON profile_activities(profile_id);
CREATE INDEX idx_profile_boundaries_profile_id ON profile_boundaries(profile_id);
CREATE INDEX idx_profile_safe_sex_profile_id ON profile_safe_sex(profile_id);

-- Interaction indexes
CREATE INDEX idx_swipes_swiper ON swipes(swiper_id);
CREATE INDEX idx_swipes_swiped ON swipes(swiped_id);
CREATE INDEX idx_matches_users ON matches(user1_id, user2_id);
CREATE INDEX idx_messages_match ON messages(match_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);

-- Safety indexes
CREATE INDEX idx_blocks_blocker ON blocks(blocker_id);
CREATE INDEX idx_blocks_blocked ON blocks(blocked_id);
CREATE INDEX idx_reports_reporter ON reports(reporter_id);
CREATE INDEX idx_reports_reported ON reports(reported_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_user_verifications_user ON user_verifications(user_id);
CREATE INDEX idx_user_verifications_status ON user_verifications(status);

-- ==================== FUNCTIONS ====================

-- Function to automatically create a match when two users like each other
CREATE OR REPLACE FUNCTION check_and_create_match()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if the new swipe is a 'like'
  IF NEW.action = 'like' THEN
    -- Check if the other user has also liked this user
    IF EXISTS (
      SELECT 1 FROM swipes
      WHERE swiper_id = NEW.swiped_id
      AND swiped_id = NEW.swiper_id
      AND action = 'like'
    ) THEN
      -- Create a match (ensure user1_id < user2_id for consistency)
      INSERT INTO matches (user1_id, user2_id)
      VALUES (
        LEAST(NEW.swiper_id, NEW.swiped_id),
        GREATEST(NEW.swiper_id, NEW.swiped_id)
      )
      ON CONFLICT (user1_id, user2_id) DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update last_message_at in matches
CREATE OR REPLACE FUNCTION update_match_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE matches
  SET last_message_at = NEW.created_at
  WHERE id = NEW.match_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==================== TRIGGERS ====================

-- Trigger to check for matches after each swipe
CREATE TRIGGER trigger_check_match
AFTER INSERT ON swipes
FOR EACH ROW
EXECUTE FUNCTION check_and_create_match();

-- Triggers to auto-update updated_at
CREATE TRIGGER trigger_update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_couple_profiles_updated_at
BEFORE UPDATE ON couple_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_profile_preferences_updated_at
BEFORE UPDATE ON profile_preferences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_profile_boundaries_updated_at
BEFORE UPDATE ON profile_boundaries
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_profile_safe_sex_updated_at
BEFORE UPDATE ON profile_safe_sex
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update last_message_at when a new message is sent
CREATE TRIGGER trigger_update_match_last_message
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_match_last_message();

-- ==================== ROW LEVEL SECURITY (RLS) ====================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_boundaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_safe_sex ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_verifications ENABLE ROW LEVEL SECURITY;

-- ==================== RLS POLICIES ====================

-- Profiles policies
CREATE POLICY "Users can view visible profiles that haven't blocked them"
  ON profiles FOR SELECT
  USING (
    is_visible = true AND
    is_profile_complete = true AND
    id NOT IN (
      SELECT blocked_id FROM blocks WHERE blocker_id = (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (user_id = auth.uid());

-- Couple profiles policies
CREATE POLICY "Users can view couple profiles for visible profiles"
  ON couple_profiles FOR SELECT
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE is_visible = true AND is_profile_complete = true
    )
  );

CREATE POLICY "Users can manage their own couple profile"
  ON couple_profiles FOR ALL
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Profile photos policies
CREATE POLICY "Users can view photos for visible profiles"
  ON profile_photos FOR SELECT
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE is_visible = true AND is_profile_complete = true
    )
  );

CREATE POLICY "Users can manage their own photos"
  ON profile_photos FOR ALL
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Profile preferences policies
CREATE POLICY "Users can manage their own preferences"
  ON profile_preferences FOR ALL
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Profile interests policies
CREATE POLICY "Users can manage their own interests"
  ON profile_interests FOR ALL
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Profile activities policies
CREATE POLICY "Users can manage their own activities"
  ON profile_activities FOR ALL
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Profile boundaries policies
CREATE POLICY "Users can manage their own boundaries"
  ON profile_boundaries FOR ALL
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Profile safe sex policies
CREATE POLICY "Users can manage their own safe sex practices"
  ON profile_safe_sex FOR ALL
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Swipes policies
CREATE POLICY "Users can view their own swipes"
  ON swipes FOR SELECT
  USING (swiper_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own swipes"
  ON swipes FOR INSERT
  WITH CHECK (swiper_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Matches policies
CREATE POLICY "Users can view their own matches"
  ON matches FOR SELECT
  USING (
    user1_id = (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
    user2_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- Messages policies
CREATE POLICY "Users can view messages in their matches"
  ON messages FOR SELECT
  USING (
    match_id IN (
      SELECT id FROM matches WHERE
      user1_id = (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
      user2_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert messages in their matches"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = (SELECT id FROM profiles WHERE user_id = auth.uid()) AND
    match_id IN (
      SELECT id FROM matches WHERE
      user1_id = (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
      user2_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  USING (sender_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Blocks policies
CREATE POLICY "Users can view their own blocks"
  ON blocks FOR SELECT
  USING (blocker_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own blocks"
  ON blocks FOR INSERT
  WITH CHECK (blocker_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own blocks"
  ON blocks FOR DELETE
  USING (blocker_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Reports policies
CREATE POLICY "Users can insert reports"
  ON reports FOR INSERT
  WITH CHECK (reporter_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- User verifications policies
CREATE POLICY "Users can manage their own verifications"
  ON user_verifications FOR ALL
  USING (user_id = auth.uid());

-- ==================== SAMPLE DATA ====================

-- Insert default interest categories
INSERT INTO interest_categories (name, display_order) VALUES
  ('Lifestyle', 1),
  ('Activities', 2),
  ('Interests', 3),
  ('Preferences', 4),
  ('Kinks', 5),
  ('Safety', 6);

-- Insert default interests
INSERT INTO interests (name, category_id) VALUES
  -- Lifestyle
  ('Wine Tasting', (SELECT id FROM interest_categories WHERE name = 'Lifestyle')),
  ('Fine Dining', (SELECT id FROM interest_categories WHERE name = 'Lifestyle')),
  ('Travel', (SELECT id FROM interest_categories WHERE name = 'Lifestyle')),
  ('Fashion', (SELECT id FROM interest_categories WHERE name = 'Lifestyle')),
  ('Nightlife', (SELECT id FROM interest_categories WHERE name = 'Lifestyle')),
  
  -- Activities
  ('Yoga', (SELECT id FROM interest_categories WHERE name = 'Activities')),
  ('Dancing', (SELECT id FROM interest_categories WHERE name = 'Activities')),
  ('Hiking', (SELECT id FROM interest_categories WHERE name = 'Activities')),
  ('Fitness', (SELECT id FROM interest_categories WHERE name = 'Activities')),
  ('Cooking', (SELECT id FROM interest_categories WHERE name = 'Activities')),
  ('Photography', (SELECT id FROM interest_categories WHERE name = 'Activities')),
  
  -- Interests
  ('Art', (SELECT id FROM interest_categories WHERE name = 'Interests')),
  ('Music', (SELECT id FROM interest_categories WHERE name = 'Interests')),
  ('Movies', (SELECT id FROM interest_categories WHERE name = 'Interests')),
  ('Theater', (SELECT id FROM interest_categories WHERE name = 'Interests')),
  ('Reading', (SELECT id FROM interest_categories WHERE name = 'Interests')),
  ('Gaming', (SELECT id FROM interest_categories WHERE name = 'Interests')),
  
  -- Preferences
  ('Soft swap', (SELECT id FROM interest_categories WHERE name = 'Preferences')),
  ('Full swap', (SELECT id FROM interest_categories WHERE name = 'Preferences')),
  ('Same room', (SELECT id FROM interest_categories WHERE name = 'Preferences')),
  ('Separate rooms', (SELECT id FROM interest_categories WHERE name = 'Preferences')),
  ('Threesomes', (SELECT id FROM interest_categories WHERE name = 'Preferences')),
  ('Group parties', (SELECT id FROM interest_categories WHERE name = 'Preferences')),
  
  -- Kinks
  ('BDSM', (SELECT id FROM interest_categories WHERE name = 'Kinks')),
  ('Role-playing', (SELECT id FROM interest_categories WHERE name = 'Kinks')),
  ('Voyeurism', (SELECT id FROM interest_categories WHERE name = 'Kinks')),
  ('Exhibitionism', (SELECT id FROM interest_categories WHERE name = 'Kinks')),
  ('Fetishes', (SELECT id FROM interest_categories WHERE name = 'Kinks')),
  ('Dom/Sub', (SELECT id FROM interest_categories WHERE name = 'Kinks')),
  
  -- Safety
  ('Condom use', (SELECT id FROM interest_categories WHERE name = 'Safety')),
  ('Regular STI testing', (SELECT id FROM interest_categories WHERE name = 'Safety')),
  ('Open communication', (SELECT id FROM interest_categories WHERE name = 'Safety')),
  ('Safe words', (SELECT id FROM interest_categories WHERE name = 'Safety')),
  ('Consent discussions', (SELECT id FROM interest_categories WHERE name = 'Safety'));