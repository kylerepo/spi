import { supabaseAdmin } from './supabase';
import type {
  User,
  Profile,
  CoupleProfile,
  ProfilePhoto,
  InterestCategory,
  Interest,
  ProfileInterest,
  ProfilePreferences,
  ProfileBoundaries,
  ProfileSafeSex,
  UserVerification,
  UserReport,
  UserBlock,
  InsertProfile,
  UpdateProfile,
  InsertCoupleProfile,
  UpdateCoupleProfile,
  InsertProfilePhoto,
  UpdateProfilePhoto,
  InsertProfilePreferences,
  UpdateProfilePreferences,
  InsertProfileBoundaries,
  UpdateProfileBoundaries,
  InsertProfileSafeSex,
  UpdateProfileSafeSex,
  InsertUserVerification,
  UpdateUserVerification,
} from '@shared/schema';

/**
 * Supabase Database Service
 * Provides type-safe methods for database operations
 */
export class SupabaseDB {
  // ==================== USER OPERATIONS ====================
  
  async getUser(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data as User;
  }

  async getUserByEmail(email: string) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data as User | null;
  }

  async updateUser(userId: string, updates: Partial<User>) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data as User;
  }

  // ==================== PROFILE OPERATIONS ====================
  
  async getProfile(profileId: string) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single();
    
    if (error) throw error;
    return data as Profile;
  }

  async getProfileByUserId(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data as Profile | null;
  }

  async createProfile(profile: InsertProfile) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .insert(profile)
      .select()
      .single();
    
    if (error) throw error;
    return data as Profile;
  }

  async updateProfile(profileId: string, updates: UpdateProfile) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', profileId)
      .select()
      .single();
    
    if (error) throw error;
    return data as Profile;
  }

  async updateProfileByUserId(userId: string, updates: UpdateProfile) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data as Profile;
  }

  async deleteProfile(profileId: string) {
    const { error } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', profileId);
    
    if (error) throw error;
  }

  async getVisibleProfiles(limit = 20, excludeUserIds: string[] = []) {
    let query = supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('is_visible', true)
      .eq('is_profile_complete', true)
      .eq('verification_status', 'verified')
      .limit(limit);

    if (excludeUserIds.length > 0) {
      query = query.not('user_id', 'in', `(${excludeUserIds.join(',')})`);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data as Profile[];
  }

  // ==================== COUPLE PROFILE OPERATIONS ====================
  
  async getCoupleProfile(profileId: string) {
    const { data, error } = await supabaseAdmin
      .from('couple_profiles')
      .select('*')
      .eq('profile_id', profileId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data as CoupleProfile | null;
  }

  async createCoupleProfile(coupleProfile: InsertCoupleProfile) {
    const { data, error } = await supabaseAdmin
      .from('couple_profiles')
      .insert(coupleProfile)
      .select()
      .single();
    
    if (error) throw error;
    return data as CoupleProfile;
  }

  async updateCoupleProfile(profileId: string, updates: UpdateCoupleProfile) {
    const { data, error } = await supabaseAdmin
      .from('couple_profiles')
      .update(updates)
      .eq('profile_id', profileId)
      .select()
      .single();
    
    if (error) throw error;
    return data as CoupleProfile;
  }

  // ==================== PROFILE PHOTO OPERATIONS ====================
  
  async getProfilePhotos(profileId: string) {
    const { data, error } = await supabaseAdmin
      .from('profile_photos')
      .select('*')
      .eq('profile_id', profileId)
      .order('order', { ascending: true });
    
    if (error) throw error;
    return data as ProfilePhoto[];
  }

  async getProfilePhoto(photoId: string) {
    const { data, error } = await supabaseAdmin
      .from('profile_photos')
      .select('*')
      .eq('id', photoId)
      .single();
    
    if (error) throw error;
    return data as ProfilePhoto;
  }

  async createProfilePhoto(photo: InsertProfilePhoto) {
    const { data, error } = await supabaseAdmin
      .from('profile_photos')
      .insert(photo)
      .select()
      .single();
    
    if (error) throw error;
    return data as ProfilePhoto;
  }

  async updateProfilePhoto(photoId: string, updates: UpdateProfilePhoto) {
    const { data, error } = await supabaseAdmin
      .from('profile_photos')
      .update(updates)
      .eq('id', photoId)
      .select()
      .single();
    
    if (error) throw error;
    return data as ProfilePhoto;
  }

  async deleteProfilePhoto(photoId: string) {
    const { error } = await supabaseAdmin
      .from('profile_photos')
      .delete()
      .eq('id', photoId);
    
    if (error) throw error;
  }

  async getProfilePicture(profileId: string) {
    const { data, error } = await supabaseAdmin
      .from('profile_photos')
      .select('*')
      .eq('profile_id', profileId)
      .eq('is_profile', true)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data as ProfilePhoto | null;
  }

  // ==================== INTEREST OPERATIONS ====================
  
  async getInterestCategories() {
    const { data, error } = await supabaseAdmin
      .from('interest_categories')
      .select('*')
      .order('order', { ascending: true });
    
    if (error) throw error;
    return data as InterestCategory[];
  }

  async getInterests() {
    const { data, error } = await supabaseAdmin
      .from('interests')
      .select('*, interest_categories(*)')
      .eq('is_active', true)
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data as (Interest & { interest_categories: InterestCategory })[];
  }

  async getInterestsByCategory(categoryId: string) {
    const { data, error } = await supabaseAdmin
      .from('interests')
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data as Interest[];
  }

  async getProfileInterests(profileId: string) {
    const { data, error } = await supabaseAdmin
      .from('profile_interests')
      .select('*, interests(*)')
      .eq('profile_id', profileId);
    
    if (error) throw error;
    return data as (ProfileInterest & { interests: Interest | null })[];
  }

  async addProfileInterest(profileId: string, interestId: string) {
    const { data, error } = await supabaseAdmin
      .from('profile_interests')
      .insert({ profile_id: profileId, interest_id: interestId })
      .select()
      .single();
    
    if (error) throw error;
    return data as ProfileInterest;
  }

  async addCustomInterest(profileId: string, customInterest: string) {
    const { data, error } = await supabaseAdmin
      .from('profile_interests')
      .insert({ profile_id: profileId, custom_interest: customInterest })
      .select()
      .single();
    
    if (error) throw error;
    return data as ProfileInterest;
  }

  async removeProfileInterest(profileInterestId: string) {
    const { error } = await supabaseAdmin
      .from('profile_interests')
      .delete()
      .eq('id', profileInterestId);
    
    if (error) throw error;
  }

  // ==================== PREFERENCES OPERATIONS ====================
  
  async getProfilePreferences(profileId: string) {
    const { data, error } = await supabaseAdmin
      .from('profile_preferences')
      .select('*')
      .eq('profile_id', profileId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data as ProfilePreferences | null;
  }

  async createProfilePreferences(preferences: InsertProfilePreferences) {
    const { data, error } = await supabaseAdmin
      .from('profile_preferences')
      .insert(preferences)
      .select()
      .single();
    
    if (error) throw error;
    return data as ProfilePreferences;
  }

  async updateProfilePreferences(profileId: string, updates: UpdateProfilePreferences) {
    const { data, error } = await supabaseAdmin
      .from('profile_preferences')
      .update(updates)
      .eq('profile_id', profileId)
      .select()
      .single();
    
    if (error) throw error;
    return data as ProfilePreferences;
  }

  // ==================== BOUNDARIES OPERATIONS ====================
  
  async getProfileBoundaries(profileId: string) {
    const { data, error } = await supabaseAdmin
      .from('profile_boundaries')
      .select('*')
      .eq('profile_id', profileId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data as ProfileBoundaries | null;
  }

  async createProfileBoundaries(boundaries: InsertProfileBoundaries) {
    const { data, error } = await supabaseAdmin
      .from('profile_boundaries')
      .insert(boundaries)
      .select()
      .single();
    
    if (error) throw error;
    return data as ProfileBoundaries;
  }

  async updateProfileBoundaries(profileId: string, updates: UpdateProfileBoundaries) {
    const { data, error } = await supabaseAdmin
      .from('profile_boundaries')
      .update(updates)
      .eq('profile_id', profileId)
      .select()
      .single();
    
    if (error) throw error;
    return data as ProfileBoundaries;
  }

  // ==================== SAFE SEX OPERATIONS ====================
  
  async getProfileSafeSex(profileId: string) {
    const { data, error } = await supabaseAdmin
      .from('profile_safe_sex')
      .select('*')
      .eq('profile_id', profileId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data as ProfileSafeSex | null;
  }

  async createProfileSafeSex(safeSex: InsertProfileSafeSex) {
    const { data, error } = await supabaseAdmin
      .from('profile_safe_sex')
      .insert(safeSex)
      .select()
      .single();
    
    if (error) throw error;
    return data as ProfileSafeSex;
  }

  async updateProfileSafeSex(profileId: string, updates: UpdateProfileSafeSex) {
    const { data, error } = await supabaseAdmin
      .from('profile_safe_sex')
      .update(updates)
      .eq('profile_id', profileId)
      .select()
      .single();
    
    if (error) throw error;
    return data as ProfileSafeSex;
  }

  // ==================== VERIFICATION OPERATIONS ====================
  
  async getUserVerifications(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('user_verifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as UserVerification[];
  }

  async createUserVerification(verification: InsertUserVerification) {
    const { data, error } = await supabaseAdmin
      .from('user_verifications')
      .insert(verification)
      .select()
      .single();
    
    if (error) throw error;
    return data as UserVerification;
  }

  async updateUserVerification(verificationId: string, updates: UpdateUserVerification) {
    const { data, error } = await supabaseAdmin
      .from('user_verifications')
      .update(updates)
      .eq('id', verificationId)
      .select()
      .single();
    
    if (error) throw error;
    return data as UserVerification;
  }

  async getPendingVerifications(limit = 50) {
    const { data, error } = await supabaseAdmin
      .from('user_verifications')
      .select('*, users(*)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(limit);
    
    if (error) throw error;
    return data as (UserVerification & { users: User })[];
  }

  // ==================== BLOCK OPERATIONS ====================
  
  async getUserBlocks(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('user_blocks')
      .select('*')
      .eq('blocker_id', userId);
    
    if (error) throw error;
    return data as UserBlock[];
  }

  async createUserBlock(blockerId: string, blockedUserId: string) {
    const { data, error } = await supabaseAdmin
      .from('user_blocks')
      .insert({ blocker_id: blockerId, blocked_user_id: blockedUserId })
      .select()
      .single();
    
    if (error) throw error;
    return data as UserBlock;
  }

  async deleteUserBlock(blockerId: string, blockedUserId: string) {
    const { error } = await supabaseAdmin
      .from('user_blocks')
      .delete()
      .eq('blocker_id', blockerId)
      .eq('blocked_user_id', blockedUserId);
    
    if (error) throw error;
  }

  async isUserBlocked(blockerId: string, blockedUserId: string): Promise<boolean> {
    const { data, error } = await supabaseAdmin
      .from('user_blocks')
      .select('id')
      .eq('blocker_id', blockerId)
      .eq('blocked_user_id', blockedUserId)
      .single();
    
    return !!data && !error;
  }

  // ==================== REPORT OPERATIONS ====================
  
  async createUserReport(reporterId: string, reportedUserId: string, reason: string, description?: string) {
    const { data, error } = await supabaseAdmin
      .from('user_reports')
      .insert({
        reporter_id: reporterId,
        reported_user_id: reportedUserId,
        reason,
        description,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as UserReport;
  }

  async getPendingReports(limit = 50) {
    const { data, error } = await supabaseAdmin
      .from('user_reports')
      .select('*, reporter:users!user_reports_reporter_id_fkey(*), reported:users!user_reports_reported_user_id_fkey(*)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(limit);
    
    if (error) throw error;
    return data as (UserReport & { reporter: User; reported: User })[];
  }

  async updateReportStatus(reportId: string, status: string, reviewedBy: string, notes?: string) {
    const { data, error } = await supabaseAdmin
      .from('user_reports')
      .update({
        status,
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString(),
        ...(notes && { description: notes })
      })
      .eq('id', reportId)
      .select()
      .single();
    
    if (error) throw error;
    return data as UserReport;
  }
}

// Export singleton instance
export const db = new SupabaseDB();
