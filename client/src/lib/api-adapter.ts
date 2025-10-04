import { supabase } from './supabase';
import type { Profile as SupabaseProfile } from './supabase';
import type { Profile, ProfilePhoto } from '@shared/schema';

// Adapter to convert between Supabase profile format and expected API format
export function adaptSupabaseProfile(supabaseProfile: SupabaseProfile): Profile & { profilePhotos: ProfilePhoto[] } {
  return {
    id: supabaseProfile.id,
    userId: supabaseProfile.user_id,
    displayName: supabaseProfile.name,
    age: supabaseProfile.age,
    bio: supabaseProfile.bio || '',
    location: supabaseProfile.location,
    gender: supabaseProfile.gender,
    seekingGender: supabaseProfile.orientation,
    accountType: supabaseProfile.profile_type,
    isVerified: supabaseProfile.is_verified,
    isPremium: supabaseProfile.is_premium,
    createdAt: supabaseProfile.created_at,
    updatedAt: supabaseProfile.updated_at,
    profilePhotos: supabaseProfile.photos.map((url, index) => ({
      id: `${supabaseProfile.id}-${index}`,
      profileId: supabaseProfile.id,
      url,
      isPrimary: index === 0,
      order: index,
      createdAt: supabaseProfile.created_at,
    })),
  };
}

// API adapter functions that use Supabase
export const api = {
  // Browse profiles
  async getBrowseProfiles(filters?: any) {
    const { data: currentUserProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!currentUserProfile) return [];

    // Get profiles that haven't been swiped on yet
    const { data: swipedIds } = await supabase
      .from('swipes')
      .select('swiped_id')
      .eq('swiper_id', currentUserProfile.id);

    const excludedIds = [currentUserProfile.id, ...(swipedIds?.map(s => s.swiped_id) || [])];

    let query = supabase
      .from('profiles')
      .select('*')
      .not('id', 'in', `(${excludedIds.join(',')})`)
      .limit(50);

    if (filters?.minAge) query = query.gte('age', filters.minAge);
    if (filters?.maxAge) query = query.lte('age', filters.maxAge);

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map(adaptSupabaseProfile);
  },

  // Like a profile
  async likeProfile(likedProfileId: string) {
    const { data: currentUserProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!currentUserProfile) throw new Error('Profile not found');

    const { data, error } = await supabase
      .from('swipes')
      .insert({
        swiper_id: currentUserProfile.id,
        swiped_id: likedProfileId,
        action: 'like',
      })
      .select()
      .single();

    if (error) throw error;

    // Check for match
    const { data: matchData } = await supabase
      .from('swipes')
      .select('*')
      .eq('swiper_id', likedProfileId)
      .eq('swiped_id', currentUserProfile.id)
      .eq('action', 'like')
      .single();

    return {
      success: true,
      isMatch: !!matchData,
    };
  },

  // Pass on a profile
  async passProfile(passedProfileId: string) {
    const { data: currentUserProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!currentUserProfile) throw new Error('Profile not found');

    const { error } = await supabase
      .from('swipes')
      .insert({
        swiper_id: currentUserProfile.id,
        swiped_id: passedProfileId,
        action: 'pass',
      });

    if (error) throw error;
    return { success: true };
  },

  // Get matches
  async getMatches() {
    const { data: currentUserProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!currentUserProfile) return [];

    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        user1:profiles!matches_user1_id_fkey(*),
        user2:profiles!matches_user2_id_fkey(*)
      `)
      .or(`user1_id.eq.${currentUserProfile.id},user2_id.eq.${currentUserProfile.id}`)
      .order('matched_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((match: any) => {
      const otherProfile = match.user1_id === currentUserProfile.id ? match.user2 : match.user1;
      return {
        ...match,
        profile: adaptSupabaseProfile(otherProfile),
      };
    });
  },

  // Get messages for a match
  async getMessages(matchId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('match_id', matchId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Send a message
  async sendMessage(matchId: string, content: string) {
    const { data: currentUserProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!currentUserProfile) throw new Error('Profile not found');

    const { data, error } = await supabase
      .from('messages')
      .insert({
        match_id: matchId,
        sender_id: currentUserProfile.id,
        content,
        type: 'text',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get current user profile
  async getCurrentProfile() {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.user.id)
      .single();

    if (error) throw error;
    return data ? adaptSupabaseProfile(data) : null;
  },

  // Update profile
  async updateProfile(updates: Partial<Profile>) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const supabaseUpdates: any = {};
    if (updates.displayName) supabaseUpdates.name = updates.displayName;
    if (updates.age) supabaseUpdates.age = updates.age;
    if (updates.bio) supabaseUpdates.bio = updates.bio;
    if (updates.location) supabaseUpdates.location = updates.location;
    if (updates.gender) supabaseUpdates.gender = updates.gender;
    if (updates.seekingGender) supabaseUpdates.orientation = updates.seekingGender;

    const { data, error } = await supabase
      .from('profiles')
      .update(supabaseUpdates)
      .eq('user_id', user.user.id)
      .select()
      .single();

    if (error) throw error;
    return adaptSupabaseProfile(data);
  },
};