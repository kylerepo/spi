import { put, del } from '@vercel/blob';
import { db } from './neon-db';
import { profilePhotos } from '../shared/neon-schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export interface UploadOptions {
  maxFileSize?: number;
  allowedMimeTypes?: string[];
}

export interface UploadResult {
  url: string;
  storagePath: string;
  deleteUrl?: string;
}

export class StorageService {
  private static readonly DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif'
  ];

  // Upload profile photo
  static async uploadProfilePhoto(
    file: File | Buffer,
    profileId: string,
    filename: string,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    try {
      const maxFileSize = options.maxFileSize || this.DEFAULT_MAX_FILE_SIZE;
      const allowedTypes = options.allowedMimeTypes || this.ALLOWED_IMAGE_TYPES;

      // Validate file
      if (file instanceof File) {
        if (file.size > maxFileSize) {
          throw new Error(`File size exceeds ${maxFileSize / 1024 / 1024}MB limit`);
        }

        if (!allowedTypes.includes(file.type)) {
          throw new Error(`File type ${file.type} not allowed`);
        }
      }

      // Generate unique filename
      const fileExt = filename.split('.').pop()?.toLowerCase() || 'jpg';
      const uniqueFilename = `${profileId}/${uuidv4()}.${fileExt}`;

      // Upload to Vercel Blob
      const blob = await put(uniqueFilename, file, {
        access: 'public',
        addRandomSuffix: false,
      });

      // Save to database
      const [photo] = await db
        .insert(profilePhotos)
        .values({
          profileId,
          url: blob.url,
          storagePath: uniqueFilename,
        })
        .returning();

      return {
        url: blob.url,
        storagePath: uniqueFilename,
      };
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload file');
    }
  }

  // Upload multiple profile photos
  static async uploadMultipleProfilePhotos(
    files: File[],
    profileId: string,
    options: UploadOptions = {}
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];

    for (const file of files) {
      try {
        const result = await this.uploadProfilePhoto(
          file,
          profileId,
          file.name,
          options
        );
        results.push(result);
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        // Continue with other files
      }
    }

    return results;
  }

  // Delete photo
  static async deletePhoto(photoId: string): Promise<boolean> {
    try {
      // Get photo record
      const [photo] = await db
        .select()
        .from(profilePhotos)
        .where(eq(profilePhotos.id, photoId))
        .limit(1);

      if (!photo) {
        throw new Error('Photo not found');
      }

      // Delete from Vercel Blob
      await del(photo.storagePath);

      // Delete from database
      await db.delete(profilePhotos).where(eq(profilePhotos.id, photoId));

      return true;
    } catch (error) {
      console.error('Delete error:', error);
      return false;
    }
  }

  // Get photos for profile
  static async getProfilePhotos(profileId: string) {
    try {
      return await db
        .select()
        .from(profilePhotos)
        .where(eq(profilePhotos.profileId, profileId))
        .orderBy(profilePhotos.order, profilePhotos.createdAt);
    } catch (error) {
      console.error('Get photos error:', error);
      return [];
    }
  }

  // Set profile photo
  static async setProfilePhoto(photoId: string, profileId: string): Promise<boolean> {
    try {
      // Unset all other profile photos
      await db
        .update(profilePhotos)
        .set({ isProfile: false })
        .where(eq(profilePhotos.profileId, profileId));

      // Set new profile photo
      await db
        .update(profilePhotos)
        .set({ isProfile: true })
        .where(eq(profilePhotos.id, photoId));

      return true;
    } catch (error) {
      console.error('Set profile photo error:', error);
      return false;
    }
  }

  // Validate file
  static validateFile(file: File, options: UploadOptions = {}): boolean {
    const maxFileSize = options.maxFileSize || this.DEFAULT_MAX_FILE_SIZE;
    const allowedTypes = options.allowedMimeTypes || this.ALLOWED_IMAGE_TYPES;

    if (file.size > maxFileSize) {
      throw new Error(`File size exceeds ${maxFileSize / 1024 / 1024}MB limit`);
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} not allowed`);
    }

    return true;
  }
}