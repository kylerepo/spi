import { pgTable, pgEnum, serial, varchar, text, boolean, integer, timestamp, uuid, jsonb, array, decimal, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ==================== ENUMS ====================
export const accountTypeEnum = pgEnum('account_type', ['single', 'couple']);
export const genderEnum = pgEnum('gender', ['male', 'female', 'non_binary', 'transgender', 'other']);
export const membershipTypeEnum = pgEnum('membership_type', ['free', 'premium', 'vip']);
export const profileTypeEnum = pgEnum('profile_type', ['single_profile', 'couple_profile']);
export const relationshipStatusEnum = pgEnum('relationship_status', ['single', 'in_relationship', 'married', 'separated', 'divorced', 'other']);
export const sexualityEnum = pgEnum('sexuality', ['straight', 'gay', 'lesbian', 'bisexual', 'pansexual', 'asexual', 'other']);
export const userRoleEnum = pgEnum('user_role', ['user', 'moderator', 'admin']);
export const verificationStatusEnum = pgEnum('verification_status', ['pending', 'verified', 'rejected']);
export const swipeActionEnum = pgEnum('swipe_action', ['like', 'pass', 'superlike']);
export const messageTypeEnum = pgEnum('message_type', ['text', 'image']);

// ==================== TABLES ====================

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: userRoleEnum('role').default('user'),
  isActive: boolean('is_active').default(true),
  emailVerified: boolean('email_verified').default(false),
  lastLogin: timestamp('last_login'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Profiles table
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accountType: accountTypeEnum('account_type').notNull(),
  profileType: profileTypeEnum('profile_type').notNull(),
  displayName: varchar('display_name', { length: 100 }).notNull(),
  gender: genderEnum('gender'),
  genderOther: varchar('gender_other', { length: 50 }),
  sexuality: sexualityEnum('sexuality'),
  sexualityOther: varchar('sexuality_other', { length: 50 }),
  age: integer('age'),
  relationshipStatus: relationshipStatusEnum('relationship_status'),
  relationshipStatusOther: varchar('relationship_status_other', { length: 50 }),
  headline: varchar('headline', { length: 100 }),
  bio: text('bio'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  country: varchar('country', { length: 100 }),
  latitude: decimal('latitude', { precision: 10, scale: 8 }),
  longitude: decimal('longitude', { precision: 11, scale: 8 }),
  seekingGenders: varchar('seeking_genders', { length: 255 }).array(),
  seekingAccountTypes: varchar('seeking_account_types', { length: 255 }).array(),
  ageRangeMin: integer('age_range_min'),
  ageRangeMax: integer('age_range_max'),
  isProfileComplete: boolean('is_profile_complete').default(false),
  isVisible: boolean('is_visible').default(true),
  verificationStatus: verificationStatusEnum('verification_status').default('pending'),
  membershipType: membershipTypeEnum('membership_type').default('free'),
  maxDistance: integer('max_distance'),
  showOnlyVerified: boolean('show_only_verified').default(false),
  showOnlyWithPhotos: boolean('show_only_with_photos').default(false),
  requiredInterests: varchar('required_interests', { length: 255 }).array(),
  excludedInterests: varchar('excluded_interests', { length: 255 }).array(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Couple profiles table
export const coupleProfiles = pgTable('couple_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  partner1Name: varchar('partner1_name', { length: 100 }),
  partner1Gender: genderEnum('partner1_gender'),
  partner1GenderOther: varchar('partner1_gender_other', { length: 50 }),
  partner1Sexuality: sexualityEnum('partner1_sexuality'),
  partner1SexualityOther: varchar('partner1_sexuality_other', { length: 50 }),
  partner1Age: integer('partner1_age'),
  partner1Bio: text('partner1_bio'),
  partner2Name: varchar('partner2_name', { length: 100 }),
  partner2Gender: genderEnum('partner2_gender'),
  partner2GenderOther: varchar('partner2_gender_other', { length: 50 }),
  partner2Sexuality: sexualityEnum('partner2_sexuality'),
  partner2SexualityOther: varchar('partner2_sexuality_other', { length: 50 }),
  partner2Age: integer('partner2_age'),
  partner2Bio: text('partner2_bio'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Profile photos table
export const profilePhotos = pgTable('profile_photos', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  storagePath: text('storage_path'),
  isProfile: boolean('is_profile').default(false),
  order: integer('order').default(0),
  isVerified: boolean('is_verified').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Interest categories table
export const interestCategories = pgTable('interest_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  order: integer('order').default(0),
});

// Interests table
export const interests = pgTable('interests', {
  id: uuid('id').primaryKey().defaultRandom(),
  categoryId: uuid('category_id').references(() => interestCategories.id, { onDelete: 'set null' }),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true),
});

// Profile interests junction table
export const profileInterests = pgTable('profile_interests', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  interestId: uuid('interest_id').references(() => interests.id, { onDelete: 'cascade' }),
  customInterest: varchar('custom_interest', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Profile preferences table
export const profilePreferences = pgTable('profile_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  softSwap: boolean('soft_swap').default(false),
  fullSwap: boolean('full_swap').default(false),
  groupActivities: boolean('group_activities').default(false),
  voyeurism: boolean('voyeurism').default(false),
  exhibitionism: boolean('exhibitionism').default(false),
  bdsm: boolean('bdsm').default(false),
  rolePlay: boolean('role_play').default(false),
  customPreferences: text('custom_preferences'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Profile boundaries table
export const profileBoundaries = pgTable('profile_boundaries', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  noAnalSex: boolean('no_anal_sex').default(false),
  noOralSex: boolean('no_oral_sex').default(false),
  noBdsm: boolean('no_bdsm').default(false),
  noGroupActivities: boolean('no_group_activities').default(false),
  customBoundaries: text('custom_boundaries'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Profile safe sex table
export const profileSafeSex = pgTable('profile_safe_sex', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  condomUse: boolean('condom_use').default(false),
  dentalDamUse: boolean('dental_dam_use').default(false),
  regularTesting: boolean('regular_testing').default(false),
  lastTestDate: date('last_test_date'),
  customPractices: text('custom_practices'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Swipes table
export const swipes = pgTable('swipes', {
  id: uuid('id').primaryKey().defaultRandom(),
  swiperId: uuid('swiper_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  swipedId: uuid('swiped_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  action: swipeActionEnum('action').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Matches table
export const matches = pgTable('matches', {
  id: uuid('id').primaryKey().defaultRandom(),
  user1Id: uuid('user1_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  user2Id: uuid('user2_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  matchedAt: timestamp('matched_at').defaultNow().notNull(),
  lastMessageAt: timestamp('last_message_at'),
});

// Messages table
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  matchId: uuid('match_id').notNull().references(() => matches.id, { onDelete: 'cascade' }),
  senderId: uuid('sender_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  type: messageTypeEnum('type').default('text'),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Refresh tokens table
export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==================== RELATIONS ====================

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  refreshTokens: many(refreshTokens),
}));

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
  coupleProfile: one(coupleProfiles),
  photos: many(profilePhotos),
  interests: many(profileInterests),
  preferences: one(profilePreferences),
  boundaries: one(profileBoundaries),
  safeSex: one(profileSafeSex),
  sentSwipes: many(swipes, {
    relationName: 'sentSwipes',
  }),
  receivedSwipes: many(swipes, {
    relationName: 'receivedSwipes',
  }),
  sentMessages: many(messages, {
    relationName: 'sentMessages',
  }),
}));

export const coupleProfilesRelations = relations(coupleProfiles, ({ one }) => ({
  profile: one(profiles, {
    fields: [coupleProfiles.profileId],
    references: [profiles.id],
  }),
}));

export const profilePhotosRelations = relations(profilePhotos, ({ one }) => ({
  profile: one(profiles, {
    fields: [profilePhotos.profileId],
    references: [profiles.id],
  }),
}));

export const profileInterestsRelations = relations(profileInterests, ({ one }) => ({
  profile: one(profiles, {
    fields: [profileInterests.profileId],
    references: [profiles.id],
  }),
  interest: one(interests, {
    fields: [profileInterests.interestId],
    references: [interests.id],
  }),
}));

export const interestsRelations = relations(interests, ({ one, many }) => ({
  category: one(interestCategories, {
    fields: [interests.categoryId],
    references: [interestCategories.id],
  }),
  profileInterests: many(profileInterests),
}));

export const interestCategoriesRelations = relations(interestCategories, ({ many }) => ({
  interests: many(interests),
}));

export const profilePreferencesRelations = relations(profilePreferences, ({ one }) => ({
  profile: one(profiles, {
    fields: [profilePreferences.profileId],
    references: [profiles.id],
  }),
}));

export const profileBoundariesRelations = relations(profileBoundaries, ({ one }) => ({
  profile: one(profiles, {
    fields: [profileBoundaries.profileId],
    references: [profiles.id],
  }),
}));

export const profileSafeSexRelations = relations(profileSafeSex, ({ one }) => ({
  profile: one(profiles, {
    fields: [profileSafeSex.profileId],
    references: [profiles.id],
  }),
}));

export const swipesRelations = relations(swipes, ({ one }) => ({
  swiper: one(profiles, {
    fields: [swipes.swiperId],
    references: [profiles.id],
    relationName: 'sentSwipes',
  }),
  swiped: one(profiles, {
    fields: [swipes.swipedId],
    references: [profiles.id],
    relationName: 'receivedSwipes',
  }),
}));

export const matchesRelations = relations(matches, ({ many }) => ({
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  match: one(matches, {
    fields: [messages.matchId],
    references: [matches.id],
  }),
  sender: one(profiles, {
    fields: [messages.senderId],
    references: [profiles.id],
    relationName: 'sentMessages',
  }),
}));

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}));