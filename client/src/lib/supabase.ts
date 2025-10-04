import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database Types
export type Profile = {
  id: string;
  user_id: string;
  profile_type: 'single' | 'couple';
  name: string;
  age: number;
  bio: string;
  location: string;
  latitude?: number;
  longitude?: number;
  gender?: string;
  orientation?: string;
  looking_for?: string[];
  interests: string[];
  photos: string[];
  is_verified: boolean;
  is_premium: boolean;
  partner_id?: string;
  created_at: string;
  updated_at: string;
};

export type Match = {
  id: string;
  user1_id: string;
  user2_id: string;
  matched_at: string;
  last_message_at?: string;
};

export type Message = {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  type: 'text' | 'image';
  is_read: boolean;
  created_at: string;
};

export type Swipe = {
  id: string;
  swiper_id: string;
  swiped_id: string;
  action: 'like' | 'pass' | 'superlike';
  created_at: string;
};