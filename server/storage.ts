import { supabaseAdmin } from './supabase';
import { randomUUID } from 'crypto';

/**
 * Storage Bucket Names
 */
export const STORAGE_BUCKETS = {
  PROFILE_PHOTOS: 'profile-photos',
  VERIFICATION_DOCUMENTS: 'verification-documents',
} as const;

/**
 * File Upload Result
 */
export interface FileUploadResult {
  path: string;
  url: string;
  fullPath: string;
}

/**
 * Supabase Storage Service
 * Handles file uploads, downloads, and deletions for profile photos and verification documents
 */
export class SupabaseStorage {
  // ==================== PROFILE PHOTOS ====================

  /**
   * Upload profile photo
   * @param userId - User ID (used for folder structure)
   * @param file - File buffer
   * @param fileName - Original file name
   * @param contentType - MIME type (image/jpeg, image/png, image/webp)
   * @returns Upload result with path and URL
   */
  async uploadProfilePhoto(
    userId: string,
    file: Buffer,
    fileName: string,
    contentType: string
  ): Promise<FileUploadResult> {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(contentType)) {
      throw new Error(`Invalid file type. Allowed types: ${validTypes.join(', ')}`);
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.length > maxSize) {
      throw new Error('File size exceeds 10MB limit');
    }

    // Generate unique file path: userId/uuid-filename
    const fileExt = fileName.split('.').pop();
    const uniqueFileName = `${randomUUID()}.${fileExt}`;
    const filePath = `${userId}/${uniqueFileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKETS.PROFILE_PHOTOS)
      .upload(filePath, file, {
        contentType,
        upsert: false,
      });

    if (error) {
      throw new Error(`Failed to upload profile photo: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(STORAGE_BUCKETS.PROFILE_PHOTOS)
      .getPublicUrl(data.path);

    return {
      path: data.path,
      url: urlData.publicUrl,
      fullPath: data.fullPath,
    };
  }

  /**
   * Get profile photo public URL
   * @param path - Storage path
   * @returns Public URL
   */
  getProfilePhotoUrl(path: string): string {
    const { data } = supabaseAdmin.storage
      .from(STORAGE_BUCKETS.PROFILE_PHOTOS)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  /**
   * Delete profile photo
   * @param path - Storage path
   */
  async deleteProfilePhoto(path: string): Promise<void> {
    const { error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKETS.PROFILE_PHOTOS)
      .remove([path]);

    if (error) {
      throw new Error(`Failed to delete profile photo: ${error.message}`);
    }
  }

  /**
   * List all profile photos for a user
   * @param userId - User ID
   * @returns List of file paths
   */
  async listProfilePhotos(userId: string): Promise<string[]> {
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKETS.PROFILE_PHOTOS)
      .list(userId);

    if (error) {
      throw new Error(`Failed to list profile photos: ${error.message}`);
    }

    return data.map(file => `${userId}/${file.name}`);
  }

  // ==================== VERIFICATION DOCUMENTS ====================

  /**
   * Upload verification document
   * @param userId - User ID (used for folder structure)
   * @param file - File buffer
   * @param fileName - Original file name
   * @param contentType - MIME type (image/jpeg, image/png, image/webp, application/pdf)
   * @returns Upload result with path and URL
   */
  async uploadVerificationDocument(
    userId: string,
    file: Buffer,
    fileName: string,
    contentType: string
  ): Promise<FileUploadResult> {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(contentType)) {
      throw new Error(`Invalid file type. Allowed types: ${validTypes.join(', ')}`);
    }

    // Validate file size (20MB max)
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.length > maxSize) {
      throw new Error('File size exceeds 20MB limit');
    }

    // Generate unique file path: userId/uuid-filename
    const fileExt = fileName.split('.').pop();
    const uniqueFileName = `${randomUUID()}.${fileExt}`;
    const filePath = `${userId}/${uniqueFileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKETS.VERIFICATION_DOCUMENTS)
      .upload(filePath, file, {
        contentType,
        upsert: false,
      });

    if (error) {
      throw new Error(`Failed to upload verification document: ${error.message}`);
    }

    // For private bucket, we need to generate a signed URL
    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKETS.VERIFICATION_DOCUMENTS)
      .createSignedUrl(data.path, 3600); // Valid for 1 hour

    if (signedUrlError) {
      throw new Error(`Failed to create signed URL: ${signedUrlError.message}`);
    }

    return {
      path: data.path,
      url: signedUrlData.signedUrl,
      fullPath: data.fullPath,
    };
  }

  /**
   * Get verification document signed URL (valid for 1 hour)
   * @param path - Storage path
   * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
   * @returns Signed URL
   */
  async getVerificationDocumentUrl(path: string, expiresIn: number = 3600): Promise<string> {
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKETS.VERIFICATION_DOCUMENTS)
      .createSignedUrl(path, expiresIn);

    if (error) {
      throw new Error(`Failed to get verification document URL: ${error.message}`);
    }

    return data.signedUrl;
  }

  /**
   * Delete verification document
   * @param path - Storage path
   */
  async deleteVerificationDocument(path: string): Promise<void> {
    const { error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKETS.VERIFICATION_DOCUMENTS)
      .remove([path]);

    if (error) {
      throw new Error(`Failed to delete verification document: ${error.message}`);
    }
  }

  /**
   * List all verification documents for a user
   * @param userId - User ID
   * @returns List of file paths
   */
  async listVerificationDocuments(userId: string): Promise<string[]> {
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKETS.VERIFICATION_DOCUMENTS)
      .list(userId);

    if (error) {
      throw new Error(`Failed to list verification documents: ${error.message}`);
    }

    return data.map(file => `${userId}/${file.name}`);
  }

  // ==================== BATCH OPERATIONS ====================

  /**
   * Delete multiple files from a bucket
   * @param bucket - Bucket name
   * @param paths - Array of file paths
   */
  async deleteMultipleFiles(bucket: string, paths: string[]): Promise<void> {
    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .remove(paths);

    if (error) {
      throw new Error(`Failed to delete files: ${error.message}`);
    }
  }

  /**
   * Delete all files for a user from both buckets
   * @param userId - User ID
   */
  async deleteAllUserFiles(userId: string): Promise<void> {
    try {
      // Delete profile photos
      const profilePhotos = await this.listProfilePhotos(userId);
      if (profilePhotos.length > 0) {
        await this.deleteMultipleFiles(STORAGE_BUCKETS.PROFILE_PHOTOS, profilePhotos);
      }

      // Delete verification documents
      const verificationDocs = await this.listVerificationDocuments(userId);
      if (verificationDocs.length > 0) {
        await this.deleteMultipleFiles(STORAGE_BUCKETS.VERIFICATION_DOCUMENTS, verificationDocs);
      }
    } catch (error) {
      console.error('Error deleting user files:', error);
      throw error;
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Check if a file exists in storage
   * @param bucket - Bucket name
   * @param path - File path
   * @returns True if file exists
   */
  async fileExists(bucket: string, path: string): Promise<boolean> {
    try {
      const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .list(path.split('/')[0], {
          search: path.split('/')[1],
        });

      return !error && data && data.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Get file metadata
   * @param bucket - Bucket name
   * @param path - File path
   * @returns File metadata
   */
  async getFileMetadata(bucket: string, path: string) {
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .list(path.split('/')[0], {
        search: path.split('/')[1],
      });

    if (error || !data || data.length === 0) {
      throw new Error('File not found');
    }

    return data[0];
  }
}

// Export singleton instance
export const storage = new SupabaseStorage();
