import { supabase } from './supabase';

/**
 * Upload profile photo to Supabase storage via backend API
 * @param file - The image file to upload
 * @param isProfile - Whether this is the main profile photo
 * @param order - Photo order/position
 * @returns Object with photo URL and storage path
 */
export async function uploadProfilePhoto(
  file: File,
  isProfile: boolean = false,
  order: number = 0
): Promise<{ url: string; path: string; id: string }> {
  // Validate file
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error('File size must be less than 10MB');
  }

  // Get auth session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session?.access_token) {
    throw new Error('You must be logged in to upload photos');
  }

  // Create form data
  const formData = new FormData();
  formData.append('photo', file);
  formData.append('is_profile', isProfile.toString());
  formData.append('order', order.toString());

  // Upload to backend
  const response = await fetch('/api/upload/profile-photo', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || 'Failed to upload photo');
  }

  const result = await response.json();
  
  if (!result.success || !result.photo) {
    throw new Error('Upload succeeded but no photo data returned');
  }

  return {
    url: result.photo.url,
    path: result.photo.storage_path || '',
    id: result.photo.id,
  };
}

/**
 * Delete profile photo
 * @param photoId - The photo ID to delete
 */
export async function deleteProfilePhoto(photoId: string): Promise<void> {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session?.access_token) {
    throw new Error('You must be logged in to delete photos');
  }

  const response = await fetch(`/api/profile-photos/${photoId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || 'Failed to delete photo');
  }
}

/**
 * Get all profile photos for the current user
 */
export async function getProfilePhotos(): Promise<any[]> {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session?.access_token) {
    throw new Error('You must be logged in to view photos');
  }

  const response = await fetch('/api/profile-photos', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || 'Failed to fetch photos');
  }

  return response.json();
}
