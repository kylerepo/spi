import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = "https://hvafquyruidsvteerdwf.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2YWZxdXlydWlkc3Z0ZWVyZHdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MzQ3ODcsImV4cCI6MjA3NTExMDc4N30.Eu74Afz66mSLrEJK1B2g4WG3OoOTL4dT55LABL_Eu0s";

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
