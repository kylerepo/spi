-- Create enums
CREATE TYPE account_type AS ENUM ('single', 'couple');
CREATE TYPE gender AS ENUM ('male', 'female', 'non_binary', 'transgender', 'other');
CREATE TYPE membership_type AS ENUM ('free', 'premium', 'vip');
CREATE TYPE profile_type AS ENUM ('single_profile', 'couple_profile');
CREATE TYPE relationship_status AS ENUM ('single', 'in_relationship', 'married', 'separated', 'divorced', 'other');
CREATE TYPE sexuality AS ENUM ('straight', 'gay', 'lesbian', 'bisexual', 'pansexual', 'asexual', 'other');
CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE swipe_action AS ENUM ('like', 'pass', 'superlike');
CREATE TYPE message_type AS ENUM ('text', 'image');

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role user_role DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_type account_type NOT NULL,
  profile_type profile_type NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  gender gender,
  gender_other VARCHAR(50),
  sexuality sexuality,
  sexuality_other VARCHAR(50),
  age INTEGER,
  relationship_status relationship_status,
  relationship_status_other VARCHAR(50),
  headline VARCHAR(100),
  bio TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  seeking_genders VARCHAR(255)[],
  seeking_account_types VARCHAR(255)[],
  age_range_min INTEGER,
  age_range_max INTEGER,
  is_profile_complete BOOLEAN DEFAULT false,
  is_visible BOOLEAN DEFAULT true,
  verification_status verification_status DEFAULT 'pending',
  membership_type membership_type DEFAULT 'free',
  max_distance INTEGER,
  show_only_verified BOOLEAN DEFAULT false,
  show_only_with_photos BOOLEAN DEFAULT false,
  required_interests VARCHAR(255)[],
  excluded_interests VARCHAR(255)[],
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create couple_profiles table
CREATE TABLE couple_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  partner1_name VARCHAR(100),
  partner1_gender gender,
  partner1_gender_other VARCHAR(50),
  partner1_sexuality sexuality,
  partner1_sexuality_other VARCHAR(50),
  partner1_age INTEGER,
  partner1_bio TEXT,
  partner2_name VARCHAR(100),
  partner2_gender gender,
  partner2_gender_other VARCHAR(50),
  partner2_sexuality sexuality,
  partner2_sexuality_other VARCHAR(50),
  partner2_age INTEGER,
  partner2_bio TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create profile_photos table
CREATE TABLE profile_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  storage_path TEXT,
  is_profile BOOLEAN DEFAULT false,
  "order" INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create interest_categories table
CREATE TABLE interest_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  "order" INTEGER DEFAULT 0
);

-- Create interests table
CREATE TABLE interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES interest_categories(id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true
);

-- Create profile_interests table
CREATE TABLE profile_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  interest_id UUID REFERENCES interests(id) ON DELETE CASCADE,
  custom_interest VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create profile_preferences table
CREATE TABLE profile_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  soft_swap BOOLEAN DEFAULT false,
  full_swap BOOLEAN DEFAULT false,
  group_activities BOOLEAN DEFAULT false,
  voyeurism BOOLEAN DEFAULT false,
  exhibitionism BOOLEAN DEFAULT false,
  bdsm BOOLEAN DEFAULT false,
  role_play BOOLEAN DEFAULT false,
  custom_preferences TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create profile_boundaries table
CREATE TABLE profile_boundaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  no_anal_sex BOOLEAN DEFAULT false,
  no_oral_sex BOOLEAN DEFAULT false,
  no_bdsm BOOLEAN DEFAULT false,
  no_group_activities BOOLEAN DEFAULT false,
  custom_boundaries TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create profile_safe_sex table
CREATE TABLE profile_safe_sex (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  condom_use BOOLEAN DEFAULT false,
  dental_dam_use BOOLEAN DEFAULT false,
  regular_testing BOOLEAN DEFAULT false,
  last_test_date DATE,
  custom_practices TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create swipes table
CREATE TABLE swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  swiper_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  swiped_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action swipe_action NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create matches table
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  matched_at TIMESTAMP DEFAULT NOW() NOT NULL,
  last_message_at TIMESTAMP
);

-- Create messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type message_type DEFAULT 'text',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create refresh_tokens table
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_account_type ON profiles(account_type);
CREATE INDEX idx_profiles_is_visible ON profiles(is_visible);
CREATE INDEX idx_profiles_is_profile_complete ON profiles(is_profile_complete);
CREATE INDEX idx_profile_photos_profile_id ON profile_photos(profile_id);
CREATE INDEX idx_profile_interests_profile_id ON profile_interests(profile_id);
CREATE INDEX idx_profile_interests_interest_id ON profile_interests(interest_id);
CREATE INDEX idx_swipes_swiper_id ON swipes(swiper_id);
CREATE INDEX idx_swipes_swiped_id ON swipes(swiped_id);
CREATE INDEX idx_matches_user1_id ON matches(user1_id);
CREATE INDEX idx_matches_user2_id ON matches(user2_id);
CREATE INDEX idx_messages_match_id ON messages(match_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);

-- Insert default interest categories
INSERT INTO interest_categories (id, name, description, "order") VALUES
  (gen_random_uuid(), 'Lifestyle', 'Activities and lifestyle preferences', 1),
  (gen_random_uuid(), 'Entertainment', 'Movies, music, and entertainment', 2),
  (gen_random_uuid(), 'Wellness', 'Health, fitness, and wellness', 3),
  (gen_random_uuid(), 'Social', 'Social activities and nightlife', 4);

-- Insert default interests
INSERT INTO interests (id, category_id, name, description, is_active) VALUES
  -- Lifestyle interests
  (gen_random_uuid(), (SELECT id FROM interest_categories WHERE name = 'Lifestyle'), 'Wine Tasting', 'Enjoying fine wines and vineyard experiences', true),
  (gen_random_uuid(), (SELECT id FROM interest_categories WHERE name = 'Lifestyle'), 'Cooking', 'Preparing and experimenting with food', true),
  (gen_random_uuid(), (SELECT id FROM interest_categories WHERE name = 'Lifestyle'), 'Travel', 'Exploring new places and cultures', true),
  (gen_random_uuid(), (SELECT id FROM interest_categories WHERE name = 'Lifestyle'), 'Photography', 'Capturing moments and creating art', true),
  
  -- Entertainment interests
  (gen_random_uuid(), (SELECT id FROM interest_categories WHERE name = 'Entertainment'), 'Movies', 'Watching films and cinema', true),
  (gen_random_uuid(), (SELECT id FROM interest_categories WHERE name = 'Entertainment'), 'Music', 'Listening to and enjoying music', true),
  (gen_random_uuid(), (SELECT id FROM interest_categories WHERE name = 'Entertainment'), 'Theater', 'Live performances and shows', true),
  (gen_random_uuid(), (SELECT id FROM interest_categories WHERE name = 'Entertainment'), 'Gaming', 'Video games and gaming culture', true),
  
  -- Wellness interests
  (gen_random_uuid(), (SELECT id FROM interest_categories WHERE name = 'Wellness'), 'Yoga', 'Mind-body practice and flexibility', true),
  (gen_random_uuid(), (SELECT id FROM interest_categories WHERE name = 'Wellness'), 'Fitness', 'Exercise and physical health', true),
  (gen_random_uuid(), (SELECT id FROM interest_categories WHERE name = 'Wellness'), 'Meditation', 'Mindfulness and mental wellness', true),
  (gen_random_uuid(), (SELECT id FROM interest_categories WHERE name = 'Wellness'), 'Hiking', 'Outdoor walking and nature', true),
  
  -- Social interests
  (gen_random_uuid(), (SELECT id FROM interest_categories WHERE name = 'Social'), 'Nightlife', 'Going out and social venues', true),
  (gen_random_uuid(), (SELECT id FROM interest_categories WHERE name = 'Social'), 'Dancing', 'Moving to music and dance styles', true),
  (gen_random_uuid(), (SELECT id FROM interest_categories WHERE name = 'Social'), 'Fine Dining', 'High-end restaurant experiences', true),
  (gen_random_uuid(), (SELECT id FROM interest_categories WHERE name = 'Social'), 'Beach', 'Ocean, sand, and beach activities', true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_couple_profiles_updated_at BEFORE UPDATE ON couple_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profile_preferences_updated_at BEFORE UPDATE ON profile_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profile_boundaries_updated_at BEFORE UPDATE ON profile_boundaries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profile_safe_sex_updated_at BEFORE UPDATE ON profile_safe_sex
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();