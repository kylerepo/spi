import { z } from "zod";

// ==================== ENUMS ====================
export const AccountType = {
  SINGLE: 'single',
  COUPLE: 'couple'
} as const;

export const Gender = {
  MALE: 'male',
  FEMALE: 'female',
  NON_BINARY: 'non_binary',
  TRANSGENDER: 'transgender',
  OTHER: 'other'
} as const;

export const MembershipType = {
  FREE: 'free',
  PREMIUM: 'premium',
  VIP: 'vip'
} as const;

export const ProfileType = {
  SINGLE_PROFILE: 'single_profile',
  COUPLE_PROFILE: 'couple_profile'
} as const;

export const RelationshipStatus = {
  SINGLE: 'single',
  IN_RELATIONSHIP: 'in_relationship',
  MARRIED: 'married',
  SEPARATED: 'separated',
  DIVORCED: 'divorced',
  OTHER: 'other'
} as const;

export const Sexuality = {
  STRAIGHT: 'straight',
  GAY: 'gay',
  LESBIAN: 'lesbian',
  BISEXUAL: 'bisexual',
  PANSEXUAL: 'pansexual',
  ASEXUAL: 'asexual',
  OTHER: 'other'
} as const;

export const UserRole = {
  USER: 'user',
  MODERATOR: 'moderator',
  ADMIN: 'admin'
} as const;

export const VerificationStatus = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected'
} as const;

// ==================== TYPE DEFINITIONS ====================

// User types
export type AccountTypeValue = typeof AccountType[keyof typeof AccountType];
export type GenderValue = typeof Gender[keyof typeof Gender];
export type MembershipTypeValue = typeof MembershipType[keyof typeof MembershipType];
export type ProfileTypeValue = typeof ProfileType[keyof typeof ProfileType];
export type RelationshipStatusValue = typeof RelationshipStatus[keyof typeof RelationshipStatus];
export type SexualityValue = typeof Sexuality[keyof typeof Sexuality];
export type UserRoleValue = typeof UserRole[keyof typeof UserRole];
export type VerificationStatusValue = typeof VerificationStatus[keyof typeof VerificationStatus];

// ==================== DATABASE INTERFACES ====================

export interface User {
  id: string;
  email: string;
  role: UserRoleValue;
  is_active: boolean;
  email_verified: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  account_type: AccountTypeValue;
  profile_type: ProfileTypeValue;
  display_name: string;
  gender?: GenderValue;
  gender_other?: string;
  sexuality?: SexualityValue;
  sexuality_other?: string;
  age?: number;
  relationship_status?: RelationshipStatusValue;
  relationship_status_other?: string;
  headline?: string;
  bio?: string;
  city?: string;
  state?: string;
  country?: string;
  seeking_genders?: string[];
  seeking_account_types?: string[];
  age_range_min?: number;
  age_range_max?: number;
  is_profile_complete: boolean;
  is_visible: boolean;
  verification_status: VerificationStatusValue;
  membership_type: MembershipTypeValue;
  max_distance?: number;
  show_only_verified?: boolean;
  show_only_with_photos?: boolean;
  required_interests?: string[];
  excluded_interests?: string[];
  created_at: string;
  updated_at: string;
}

export interface CoupleProfile {
  id: string;
  profile_id: string;
  partner1_name?: string;
  partner1_gender?: GenderValue;
  partner1_gender_other?: string;
  partner1_sexuality?: SexualityValue;
  partner1_sexuality_other?: string;
  partner1_age?: number;
  partner1_bio?: string;
  partner2_name?: string;
  partner2_gender?: GenderValue;
  partner2_gender_other?: string;
  partner2_sexuality?: SexualityValue;
  partner2_sexuality_other?: string;
  partner2_age?: number;
  partner2_bio?: string;
  created_at: string;
  updated_at: string;
}

export interface ProfilePhoto {
  id: string;
  profile_id: string;
  url: string;
  storage_path?: string;
  is_profile: boolean;
  order: number;
  is_verified: boolean;
  created_at: string;
}

export interface InterestCategory {
  id: string;
  name: string;
  description?: string;
  order: number;
}

export interface Interest {
  id: string;
  category_id?: string;
  name: string;
  description?: string;
  is_active: boolean;
}

export interface ProfileInterest {
  id: string;
  profile_id: string;
  interest_id?: string;
  custom_interest?: string;
  created_at: string;
}

export interface ProfilePreferences {
  id: string;
  profile_id: string;
  soft_swap: boolean;
  full_swap: boolean;
  group_activities: boolean;
  voyeurism: boolean;
  exhibitionism: boolean;
  bdsm: boolean;
  role_play: boolean;
  custom_preferences?: string;
  created_at: string;
  updated_at: string;
}

export interface ProfileBoundaries {
  id: string;
  profile_id: string;
  no_anal_sex: boolean;
  no_oral_sex: boolean;
  no_bdsm: boolean;
  no_group_activities: boolean;
  custom_boundaries?: string;
  created_at: string;
  updated_at: string;
}

export interface ProfileSafeSex {
  id: string;
  profile_id: string;
  condom_use: boolean;
  dental_dam_use: boolean;
  regular_testing: boolean;
  last_test_date?: string;
  custom_practices?: string;
  created_at: string;
  updated_at: string;
}

export interface UserVerification {
  id: string;
  user_id: string;
  verification_type: string;
  file_url?: string;
  storage_path?: string;
  status: VerificationStatusValue;
  reviewed_by?: string;
  reviewed_at?: string;
  notes?: string;
  created_at: string;
}

export interface UserReport {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  reason: string;
  description?: string;
  status: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface UserBlock {
  id: string;
  blocker_id: string;
  blocked_user_id: string;
  created_at: string;
}

export interface AppSetting {
  id: string;
  key: string;
  value?: any;
  description?: string;
  updated_by?: string;
  updated_at: string;
}

// ==================== INSERT/UPDATE TYPES ====================

export type InsertUser = Omit<User, 'id' | 'created_at' | 'updated_at'>;
export type UpdateUser = Partial<InsertUser>;

export type InsertProfile = Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
export type UpdateProfile = Partial<Omit<Profile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

export type InsertCoupleProfile = Omit<CoupleProfile, 'id' | 'created_at' | 'updated_at'>;
export type UpdateCoupleProfile = Partial<Omit<CoupleProfile, 'id' | 'profile_id' | 'created_at' | 'updated_at'>>;

export type InsertProfilePhoto = Omit<ProfilePhoto, 'id' | 'created_at'>;
export type UpdateProfilePhoto = Partial<Omit<ProfilePhoto, 'id' | 'profile_id' | 'created_at'>>;

export type InsertProfilePreferences = Omit<ProfilePreferences, 'id' | 'created_at' | 'updated_at'>;
export type UpdateProfilePreferences = Partial<Omit<ProfilePreferences, 'id' | 'profile_id' | 'created_at' | 'updated_at'>>;

export type InsertProfileBoundaries = Omit<ProfileBoundaries, 'id' | 'created_at' | 'updated_at'>;
export type UpdateProfileBoundaries = Partial<Omit<ProfileBoundaries, 'id' | 'profile_id' | 'created_at' | 'updated_at'>>;

export type InsertProfileSafeSex = Omit<ProfileSafeSex, 'id' | 'created_at' | 'updated_at'>;
export type UpdateProfileSafeSex = Partial<Omit<ProfileSafeSex, 'id' | 'profile_id' | 'created_at' | 'updated_at'>>;

export type InsertUserVerification = Omit<UserVerification, 'id' | 'created_at'>;
export type UpdateUserVerification = Partial<Omit<UserVerification, 'id' | 'user_id' | 'created_at'>>;

// ==================== VALIDATION SCHEMAS ====================

export const createProfileSchema = z.object({
  account_type: z.enum(['single', 'couple']),
  profile_type: z.enum(['single_profile', 'couple_profile']),
  display_name: z.string().min(2).max(100),
  gender: z.enum(['male', 'female', 'non_binary', 'transgender', 'other']).optional(),
  gender_other: z.string().max(50).optional(),
  sexuality: z.enum(['straight', 'gay', 'lesbian', 'bisexual', 'pansexual', 'asexual', 'other']).optional(),
  sexuality_other: z.string().max(50).optional(),
  age: z.number().int().min(18).max(100).optional(),
  relationship_status: z.enum(['single', 'in_relationship', 'married', 'separated', 'divorced', 'other']).optional(),
  relationship_status_other: z.string().max(50).optional(),
  headline: z.string().min(10).max(100).optional(),
  bio: z.string().min(50).max(1000).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  seeking_genders: z.array(z.string()).optional(),
  seeking_account_types: z.array(z.string()).optional(),
  age_range_min: z.number().int().min(18).optional(),
  age_range_max: z.number().int().max(100).optional(),
});

export const updateProfileSchema = createProfileSchema.partial();

export const createCoupleProfileSchema = z.object({
  partner1_name: z.string().max(100).optional(),
  partner1_gender: z.enum(['male', 'female', 'non_binary', 'transgender', 'other']).optional(),
  partner1_gender_other: z.string().max(50).optional(),
  partner1_sexuality: z.enum(['straight', 'gay', 'lesbian', 'bisexual', 'pansexual', 'asexual', 'other']).optional(),
  partner1_sexuality_other: z.string().max(50).optional(),
  partner1_age: z.number().int().min(18).max(100).optional(),
  partner1_bio: z.string().max(500).optional(),
  partner2_name: z.string().max(100).optional(),
  partner2_gender: z.enum(['male', 'female', 'non_binary', 'transgender', 'other']).optional(),
  partner2_gender_other: z.string().max(50).optional(),
  partner2_sexuality: z.enum(['straight', 'gay', 'lesbian', 'bisexual', 'pansexual', 'asexual', 'other']).optional(),
  partner2_sexuality_other: z.string().max(50).optional(),
  partner2_age: z.number().int().min(18).max(100).optional(),
  partner2_bio: z.string().max(500).optional(),
});

export const createPreferencesSchema = z.object({
  soft_swap: z.boolean().default(false),
  full_swap: z.boolean().default(false),
  group_activities: z.boolean().default(false),
  voyeurism: z.boolean().default(false),
  exhibitionism: z.boolean().default(false),
  bdsm: z.boolean().default(false),
  role_play: z.boolean().default(false),
  custom_preferences: z.string().optional(),
});

export const createBoundariesSchema = z.object({
  no_anal_sex: z.boolean().default(false),
  no_oral_sex: z.boolean().default(false),
  no_bdsm: z.boolean().default(false),
  no_group_activities: z.boolean().default(false),
  custom_boundaries: z.string().optional(),
});

export const createSafeSexSchema = z.object({
  condom_use: z.boolean().default(false),
  dental_dam_use: z.boolean().default(false),
  regular_testing: z.boolean().default(false),
  last_test_date: z.string().optional(),
  custom_practices: z.string().optional(),
});


// Community post schemas
export const insertCommunityPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  content: z.string().min(1, "Content is required").max(2000),
  postType: z.enum(["iso", "discussion", "announcement", "event"]).default("iso"),
  isoSeekingType: z.enum(["couples_seeking", "singles_seeking", "groups", "all"]).optional(),
  category: z.string().min(1, "Category is required").max(50),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  isUrgent: z.boolean().default(false),
  authorId: z.string().uuid("Valid author ID is required"),
});

export type InsertCommunityPost = z.infer<typeof insertCommunityPostSchema>;
