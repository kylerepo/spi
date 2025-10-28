/**
 * Example API implementations using the new Supabase configuration
 * These examples show how to use the db and storage services
 */

import { db } from './db';
import { storage } from './storage';
import type { Request, Response } from 'express';

// ==================== PROFILE EXAMPLES ====================

/**
 * Example: Get complete profile with all related data
 */
export async function getCompleteProfile(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get main profile
    const profile = await db.getProfileByUserId(userId);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Get all related data in parallel
    const [photos, interests, preferences, boundaries, safeSex, coupleProfile] = await Promise.all([
      db.getProfilePhotos(profile.id),
      db.getProfileInterests(profile.id),
      db.getProfilePreferences(profile.id),
      db.getProfileBoundaries(profile.id),
      db.getProfileSafeSex(profile.id),
      profile.account_type === 'couple' ? db.getCoupleProfile(profile.id) : null,
    ]);

    res.json({
      profile,
      photos,
      interests,
      preferences,
      boundaries,
      safeSex,
      coupleProfile,
    });
  } catch (error: any) {
    console.error('Error fetching complete profile:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Example: Create a new profile with photo
 */
export async function createNewProfile(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      account_type,
      profile_type,
      display_name,
      bio,
      age,
      gender,
      sexuality,
      city,
      state,
      country,
    } = req.body;

    // Create profile
    const profile = await db.createProfile({
      user_id: userId,
      account_type,
      profile_type,
      display_name,
      bio,
      age,
      gender,
      sexuality,
      city,
      state,
      country,
      is_profile_complete: false,
      is_visible: false,
      verification_status: 'pending',
      membership_type: 'free',
    });

    // Create default preferences
    await db.createProfilePreferences({
      profile_id: profile.id,
      soft_swap: false,
      full_swap: false,
      group_activities: false,
      voyeurism: false,
      exhibitionism: false,
      bdsm: false,
      role_play: false,
    });

    // Create default boundaries
    await db.createProfileBoundaries({
      profile_id: profile.id,
      no_anal_sex: false,
      no_oral_sex: false,
      no_bdsm: false,
      no_group_activities: false,
    });

    // Create default safe sex practices
    await db.createProfileSafeSex({
      profile_id: profile.id,
      condom_use: false,
      dental_dam_use: false,
      regular_testing: false,
    });

    res.json({ success: true, profile });
  } catch (error: any) {
    console.error('Error creating profile:', error);
    res.status(500).json({ error: error.message });
  }
}

// ==================== PHOTO UPLOAD EXAMPLES ====================

/**
 * Example: Upload multiple photos and set primary
 */
export async function uploadMultiplePhotos(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const profile = await db.getProfileByUserId(userId);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadPromises = files.map(async (file, index) => {
      // Upload to storage
      const uploadResult = await storage.uploadProfilePhoto(
        userId,
        file.buffer,
        file.originalname,
        file.mimetype
      );

      // Save to database
      return db.createProfilePhoto({
        profile_id: profile.id,
        url: uploadResult.url,
        storage_path: uploadResult.path,
        is_profile: index === 0, // First photo is profile pic
        order: index,
        is_verified: false,
      });
    });

    const photos = await Promise.all(uploadPromises);

    res.json({
      success: true,
      photos,
      message: `${photos.length} photos uploaded successfully`,
    });
  } catch (error: any) {
    console.error('Error uploading photos:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Example: Update profile photo order and primary status
 */
export async function updatePhotoOrder(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const profile = await db.getProfileByUserId(userId);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const { photoId, newOrder, isPrimary } = req.body;

    // Get photo and verify ownership
    const photo = await db.getProfilePhoto(photoId);
    if (photo.profile_id !== profile.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // If setting as primary, unset other primary photos
    if (isPrimary) {
      const allPhotos = await db.getProfilePhotos(profile.id);
      await Promise.all(
        allPhotos
          .filter((p) => p.is_profile && p.id !== photoId)
          .map((p) => db.updateProfilePhoto(p.id, { is_profile: false }))
      );
    }

    // Update photo
    const updatedPhoto = await db.updateProfilePhoto(photoId, {
      order: newOrder,
      is_profile: isPrimary,
    });

    res.json({ success: true, photo: updatedPhoto });
  } catch (error: any) {
    console.error('Error updating photo:', error);
    res.status(500).json({ error: error.message });
  }
}

// ==================== VERIFICATION EXAMPLES ====================

/**
 * Example: Submit verification with document upload
 */
export async function submitVerificationWithDocument(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { verification_type, notes } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload document to private bucket
    const uploadResult = await storage.uploadVerificationDocument(
      userId,
      file.buffer,
      file.originalname,
      file.mimetype
    );

    // Create verification record
    const verification = await db.createUserVerification({
      user_id: userId,
      verification_type,
      file_url: uploadResult.url,
      storage_path: uploadResult.path,
      status: 'pending',
      notes,
    });

    res.json({
      success: true,
      verification,
      message: 'Verification submitted successfully',
    });
  } catch (error: any) {
    console.error('Error submitting verification:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Example: Get all verifications with fresh signed URLs
 */
export async function getUserVerificationsWithUrls(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const verifications = await db.getUserVerifications(userId);

    // Generate fresh signed URLs for each document
    const verificationsWithUrls = await Promise.all(
      verifications.map(async (v) => {
        if (v.storage_path) {
          try {
            const signedUrl = await storage.getVerificationDocumentUrl(v.storage_path, 7200); // 2 hours
            return { ...v, file_url: signedUrl };
          } catch (error) {
            console.error('Error generating signed URL:', error);
            return v;
          }
        }
        return v;
      })
    );

    res.json(verificationsWithUrls);
  } catch (error: any) {
    console.error('Error fetching verifications:', error);
    res.status(500).json({ error: error.message });
  }
}

// ==================== INTERESTS EXAMPLES ====================

/**
 * Example: Get interests grouped by category
 */
export async function getInterestsByCategory(req: Request, res: Response) {
  try {
    const categories = await db.getInterestCategories();
    
    const categoriesWithInterests = await Promise.all(
      categories.map(async (category) => {
        const interests = await db.getInterestsByCategory(category.id);
        return {
          ...category,
          interests,
        };
      })
    );

    res.json(categoriesWithInterests);
  } catch (error: any) {
    console.error('Error fetching interests:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Example: Update user interests
 */
export async function updateUserInterests(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const profile = await db.getProfileByUserId(userId);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const { interest_ids, custom_interests } = req.body;

    // Get current interests
    const currentInterests = await db.getProfileInterests(profile.id);

    // Remove all current interests
    await Promise.all(
      currentInterests.map((interest) => db.removeProfileInterest(interest.id))
    );

    // Add new interests
    const addedInterests = [];

    if (interest_ids && Array.isArray(interest_ids)) {
      for (const interestId of interest_ids) {
        const added = await db.addProfileInterest(profile.id, interestId);
        addedInterests.push(added);
      }
    }

    if (custom_interests && Array.isArray(custom_interests)) {
      for (const customInterest of custom_interests) {
        const added = await db.addCustomInterest(profile.id, customInterest);
        addedInterests.push(added);
      }
    }

    res.json({
      success: true,
      interests: addedInterests,
      message: 'Interests updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating interests:', error);
    res.status(500).json({ error: error.message });
  }
}

// ==================== CLEANUP EXAMPLES ====================

/**
 * Example: Delete user account and all associated data
 */
export async function deleteUserAccount(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const profile = await db.getProfileByUserId(userId);
    
    if (profile) {
      // Delete all files from storage
      await storage.deleteAllUserFiles(userId);

      // Delete profile (cascade will delete related records)
      await db.deleteProfile(profile.id);
    }

    // The user record in auth.users will remain unless you use Supabase Auth API

    res.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: error.message });
  }
}
