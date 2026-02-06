import { db } from './neon-db';
import * as schema from '../shared/neon-schema';
import { eq, and, or, sql, desc, asc, inArray } from 'drizzle-orm';
import type { 
  InsertUser, 
  InsertProfile, 
  UpdateProfile, 
  InsertCoupleProfile, 
  InsertProfilePhoto,
  InsertProfilePreferences,
  InsertProfileBoundaries,
  InsertProfileSafeSex 
} from '../shared/neon-schema';

export class NeonDB {
  // ==================== USER OPERATIONS ====================
  
  async getUser(userId: string) {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);
    
    return user || null;
  }

  async getUserByEmail(email: string) {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);
    
    return user || null;
  }

  async createUser(userData: InsertUser) {
    const [user] = await db
      .insert(schema.users)
      .values(userData)
      .returning();
    
    return user;
  }

  async updateUser(userId: string, updates: Partial<InsertUser>) {
    const [user] = await db
      .update(schema.users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.users.id, userId))
      .returning();
    
    return user;
  }

  // ==================== PROFILE OPERATIONS ====================

  async getProfile(userId: string) {
    const [profile] = await db
      .select({
        profile: schema.profiles,
        user: {
          id: schema.users.id,
          email: schema.users.email,
          role: schema.users.role,
        },
        photos: sql`COALESCE(${schema.profilePhotos}, '[]')`,
        interests: sql`COALESCE(${schema.profileInterests}, '[]')`,
      })
      .from(schema.profiles)
      .leftJoin(schema.users, eq(schema.profiles.userId, schema.users.id))
      .leftJoin(schema.profilePhotos, eq(schema.profiles.id, schema.profilePhotos.profileId))
      .leftJoin(schema.profileInterests, eq(schema.profiles.id, schema.profileInterests.profileId))
      .where(eq(schema.profiles.userId, userId))
      .groupBy(schema.profiles.id, schema.users.id)
      .limit(1);

    return profile?.profile || null;
  }

  async getProfileById(profileId: string) {
    const [profile] = await db
      .select()
      .from(schema.profiles)
      .where(eq(schema.profiles.id, profileId))
      .limit(1);

    return profile || null;
  }

  async createProfile(profileData: InsertProfile) {
    const [profile] = await db
      .insert(schema.profiles)
      .values(profileData)
      .returning();

    return profile;
  }

  async updateProfile(profileId: string, updates: UpdateProfile) {
    const [profile] = await db
      .update(schema.profiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.profiles.id, profileId))
      .returning();

    return profile;
  }

  async updateProfileByUserId(userId: string, updates: UpdateProfile) {
    const [profile] = await db
      .update(schema.profiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.profiles.userId, userId))
      .returning();

    return profile;
  }

  // ==================== COUPLE PROFILE OPERATIONS ====================

  async getCoupleProfile(profileId: string) {
    const [coupleProfile] = await db
      .select()
      .from(schema.coupleProfiles)
      .where(eq(schema.coupleProfiles.profileId, profileId))
      .limit(1);

    return coupleProfile || null;
  }

  async createCoupleProfile(coupleProfileData: InsertCoupleProfile) {
    const [coupleProfile] = await db
      .insert(schema.coupleProfiles)
      .values(coupleProfileData)
      .returning();

    return coupleProfile;
  }

  async updateCoupleProfile(profileId: string, updates: Partial<InsertCoupleProfile>) {
    const [coupleProfile] = await db
      .update(schema.coupleProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.coupleProfiles.profileId, profileId))
      .returning();

    return coupleProfile;
  }

  // ==================== PHOTO OPERATIONS ====================

  async getProfilePhotos(profileId: string) {
    return await db
      .select()
      .from(schema.profilePhotos)
      .where(eq(schema.profilePhotos.profileId, profileId))
      .orderBy(asc(schema.profilePhotos.order), desc(schema.profilePhotos.createdAt));
  }

  async getProfilePhoto(photoId: string) {
    const [photo] = await db
      .select()
      .from(schema.profilePhotos)
      .where(eq(schema.profilePhotos.id, photoId))
      .limit(1);

    return photo || null;
  }

  async createProfilePhoto(photoData: InsertProfilePhoto) {
    const [photo] = await db
      .insert(schema.profilePhotos)
      .values(photoData)
      .returning();

    return photo;
  }

  async updateProfilePhoto(photoId: string, updates: Partial<InsertProfilePhoto>) {
    const [photo] = await db
      .update(schema.profilePhotos)
      .set(updates)
      .where(eq(schema.profilePhotos.id, photoId))
      .returning();

    return photo;
  }

  async deleteProfilePhoto(photoId: string) {
    const [deletedPhoto] = await db
      .delete(schema.profilePhotos)
      .where(eq(schema.profilePhotos.id, photoId))
      .returning();

    return deletedPhoto;
  }

  async setProfilePhoto(photoId: string, profileId: string) {
    // Unset all other profile photos
    await db
      .update(schema.profilePhotos)
      .set({ isProfile: false })
      .where(eq(schema.profilePhotos.profileId, profileId));

    // Set new profile photo
    const [photo] = await db
      .update(schema.profilePhotos)
      .set({ isProfile: true })
      .where(eq(schema.profilePhotos.id, photoId))
      .returning();

    return photo;
  }

  // ==================== INTEREST OPERATIONS ====================

  async getAllInterests() {
    return await db
      .select({
        interest: schema.interests,
        category: schema.interestCategories,
      })
      .from(schema.interests)
      .leftJoin(schema.interestCategories, eq(schema.interests.categoryId, schema.interestCategories.id))
      .where(eq(schema.interests.isActive, true))
      .orderBy(asc(schema.interestCategories.order), asc(schema.interests.name));
  }

  async getProfileInterests(profileId: string) {
    return await db
      .select({
        interest: schema.interests,
        category: schema.interestCategories,
        profileInterest: schema.profileInterests,
      })
      .from(schema.profileInterests)
      .leftJoin(schema.interests, eq(schema.profileInterests.interestId, schema.interests.id))
      .leftJoin(schema.interestCategories, eq(schema.interests.categoryId, schema.interestCategories.id))
      .where(eq(schema.profileInterests.profileId, profileId));
  }

  async addProfileInterest(profileId: string, interestId: string | null, customInterest?: string) {
    const [profileInterest] = await db
      .insert(schema.profileInterests)
      .values({
        profileId,
        interestId,
        customInterest,
      })
      .returning();

    return profileInterest;
  }

  async removeProfileInterest(profileInterestId: string) {
    const [deletedInterest] = await db
      .delete(schema.profileInterests)
      .where(eq(schema.profileInterests.id, profileInterestId))
      .returning();

    return deletedInterest;
  }

  // ==================== PREFERENCES OPERATIONS ====================

  async getProfilePreferences(profileId: string) {
    const [preferences] = await db
      .select()
      .from(schema.profilePreferences)
      .where(eq(schema.profilePreferences.profileId, profileId))
      .limit(1);

    return preferences || null;
  }

  async createProfilePreferences(preferencesData: InsertProfilePreferences) {
    const [preferences] = await db
      .insert(schema.profilePreferences)
      .values(preferencesData)
      .returning();

    return preferences;
  }

  async updateProfilePreferences(profileId: string, updates: Partial<InsertProfilePreferences>) {
    const [preferences] = await db
      .update(schema.profilePreferences)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.profilePreferences.profileId, profileId))
      .returning();

    return preferences;
  }

  // ==================== BOUNDARIES OPERATIONS ====================

  async getProfileBoundaries(profileId: string) {
    const [boundaries] = await db
      .select()
      .from(schema.profileBoundaries)
      .where(eq(schema.profileBoundaries.profileId, profileId))
      .limit(1);

    return boundaries || null;
  }

  async createProfileBoundaries(boundariesData: InsertProfileBoundaries) {
    const [boundaries] = await db
      .insert(schema.profileBoundaries)
      .values(boundariesData)
      .returning();

    return boundaries;
  }

  async updateProfileBoundaries(profileId: string, updates: Partial<InsertProfileBoundaries>) {
    const [boundaries] = await db
      .update(schema.profileBoundaries)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.profileBoundaries.profileId, profileId))
      .returning();

    return boundaries;
  }

  // ==================== SAFE SEX OPERATIONS ====================

  async getProfileSafeSex(profileId: string) {
    const [safeSex] = await db
      .select()
      .from(schema.profileSafeSex)
      .where(eq(schema.profileSafeSex.profileId, profileId))
      .limit(1);

    return safeSex || null;
  }

  async createProfileSafeSex(safeSexData: InsertProfileSafeSex) {
    const [safeSex] = await db
      .insert(schema.profileSafeSex)
      .values(safeSexData)
      .returning();

    return safeSex;
  }

  async updateProfileSafeSex(profileId: string, updates: Partial<InsertProfileSafeSex>) {
    const [safeSex] = await db
      .update(schema.profileSafeSex)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.profileSafeSex.profileId, profileId))
      .returning();

    return safeSex;
  }

  // ==================== DISCOVERY OPERATIONS ====================

  async getDiscoveryProfiles(profileId: string, limit: number = 20, offset: number = 0) {
    // Get current profile to apply filters
    const currentProfile = await this.getProfileById(profileId);
    if (!currentProfile) return [];

    let query = db
      .select({
        profile: schema.profiles,
        photos: sql`COALESCE(${schema.profilePhotos}, '[]')`,
        interests: sql`COALESCE(${schema.profileInterests}, '[]')`,
      })
      .from(schema.profiles)
      .leftJoin(schema.profilePhotos, eq(schema.profiles.id, schema.profilePhotos.profileId))
      .leftJoin(schema.profileInterests, eq(schema.profiles.id, schema.profileInterests.profileId))
      .where(and(
        eq(schema.profiles.isVisible, true),
        eq(schema.profiles.isProfileComplete, true),
        sql`${schema.profiles.id} != ${profileId}`
      ))
      .groupBy(schema.profiles.id)
      .limit(limit)
      .offset(offset);

    // Apply filters based on current profile preferences
    if (currentProfile.seekingGenders && currentProfile.seekingGenders.length > 0) {
      query.where(inArray(schema.profiles.gender, currentProfile.seekingGenders));
    }

    if (currentProfile.seekingAccountTypes && currentProfile.seekingAccountTypes.length > 0) {
      query.where(inArray(schema.profiles.accountType, currentProfile.seekingAccountTypes));
    }

    if (currentProfile.ageRangeMin && currentProfile.ageRangeMax) {
      query.where(and(
        sql`${schema.profiles.age} >= ${currentProfile.ageRangeMin}`,
        sql`${schema.profiles.age} <= ${currentProfile.ageRangeMax}`
      ));
    }

    if (currentProfile.showOnlyVerified) {
      query.where(eq(schema.profiles.verificationStatus, 'verified'));
    }

    if (currentProfile.showOnlyWithPhotos) {
      query.where(sql`EXISTS (
        SELECT 1 FROM ${schema.profilePhotos} 
        WHERE ${schema.profilePhotos.profileId} = ${schema.profiles.id}
      )`);
    }

    return await query;
  }

  // ==================== SWIPE OPERATIONS ====================

  async createSwipe(swiperId: string, swipedId: string, action: 'like' | 'pass' | 'superlike') {
    const [swipe] = await db
      .insert(schema.swipes)
      .values({
        swiperId,
        swipedId,
        action,
      })
      .returning();

    return swipe;
  }

  async getSwipe(swiperId: string, swipedId: string) {
    const [swipe] = await db
      .select()
      .from(schema.swipes)
      .where(and(
        eq(schema.swipes.swiperId, swiperId),
        eq(schema.swipes.swipedId, swipedId)
      ))
      .limit(1);

    return swipe || null;
  }

  // ==================== MATCH OPERATIONS ====================

  async createMatch(user1Id: string, user2Id: string) {
    const [match] = await db
      .insert(schema.matches)
      .values({
        user1Id,
        user2Id,
      })
      .returning();

    return match;
  }

  async getMatches(profileId: string) {
    return await db
      .select({
        match: schema.matches,
        otherProfile: schema.profiles,
        otherUser: schema.users,
        lastMessage: sql`COALESCE(${schema.messages}, NULL)`,
      })
      .from(schema.matches)
      .leftJoin(schema.profiles, or(
        eq(schema.matches.user1Id, schema.profiles.id),
        eq(schema.matches.user2Id, schema.profiles.id)
      ))
      .leftJoin(schema.users, eq(schema.profiles.userId, schema.users.id))
      .leftJoin(schema.messages, eq(schema.matches.id, schema.messages.matchId))
      .where(or(
        eq(schema.matches.user1Id, profileId),
        eq(schema.matches.user2Id, profileId)
      ))
      .orderBy(desc(schema.matches.lastMessageAt));
  }

  // ==================== MESSAGE OPERATIONS ====================

  async createMessage(matchId: string, senderId: string, content: string, type: 'text' | 'image' = 'text') {
    const [message] = await db
      .insert(schema.messages)
      .values({
        matchId,
        senderId,
        content,
        type,
      })
      .returning();

    // Update match last message time
    await db
      .update(schema.matches)
      .set({ lastMessageAt: new Date() })
      .where(eq(schema.matches.id, matchId));

    return message;
  }

  async getMessages(matchId: string, limit: number = 50, offset: number = 0) {
    return await db
      .select({
        message: schema.messages,
        sender: {
          id: schema.profiles.id,
          displayName: schema.profiles.displayName,
          accountType: schema.profiles.accountType,
        },
      })
      .from(schema.messages)
      .leftJoin(schema.profiles, eq(schema.messages.senderId, schema.profiles.id))
      .where(eq(schema.messages.matchId, matchId))
      .orderBy(desc(schema.messages.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async markMessagesAsRead(matchId: string, userId: string) {
    await db
      .update(schema.messages)
      .set({ isRead: true })
      .where(and(
        eq(schema.messages.matchId, matchId),
        sql`${schema.messages.senderId} != ${userId}`,
        eq(schema.messages.isRead, false)
      ));
  }
}

export const neonDB = new NeonDB();