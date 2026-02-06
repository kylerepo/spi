import { useState, useEffect } from 'react';
import { supabase, Profile } from '@/lib/supabase';
import { useAuth } from './useAuth';

export function useProfileBackup() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (profileData: Partial<Profile>) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([
          {
            user_id: user?.id,
            ...profileData,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  // Backup photo upload using base64 encoding (stores in database)
  const uploadPhotoBackup = async (file: File) => {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file (JPG, PNG, GIF, etc.)');
      }

      // Validate file size (2MB limit for base64)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('Image must be smaller than 2MB for backup upload');
      }

      // Convert to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Store base64 in a simple table or return for direct use
      return { url: base64, error: null };
    } catch (err: any) {
      console.error('Backup photo upload error:', err);
      return { url: null, error: err.message };
    }
  };

  // Primary upload with fallback
  const uploadPhoto = async (file: File) => {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file (JPG, PNG, GIF, etc.)');
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Image must be smaller than 10MB');
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${user?.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `profile-photos/${fileName}`;

      console.log('Attempting primary upload:', { fileName, filePath, fileSize: file.size, fileType: file.type });

      // Try primary storage upload
      const { error: uploadError, data } = await supabase.storage
        .from('photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.warn('Primary upload failed, trying backup method:', uploadError);
        
        // Fallback to base64 if storage fails
        if (file.size <= 2 * 1024 * 1024) { // Only for files under 2MB
          console.log('Using backup base64 upload method');
          return await uploadPhotoBackup(file);
        } else {
          throw new Error('Storage not configured and file too large for backup method. Please contact support.');
        }
      }

      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

      console.log('Primary upload successful:', { publicUrl });
      return { url: publicUrl, error: null };
    } catch (err: any) {
      console.error('Photo upload error:', err);
      
      // Provide helpful error messages
      if (err.message.includes('not found')) {
        return { url: null, error: 'Storage not configured. Using backup method...' };
      } else if (err.message.includes('policy')) {
        return { url: null, error: 'Upload permission denied. Please try logging out and back in.' };
      } else if (err.message.includes('pattern')) {
        return { url: null, error: 'Storage configuration issue. Please contact support.' };
      } else {
        return { url: null, error: err.message };
      }
    }
  };

  const addPhoto = async (photoUrl: string) => {
    if (!profile) return { error: 'No profile found' };

    const updatedPhotos = [...(profile.photos || []), photoUrl];
    return await updateProfile({ photos: updatedPhotos });
  };

  const removePhoto = async (photoUrl: string) => {
    if (!profile) return { error: 'No profile found' };

    const updatedPhotos = profile.photos.filter((url) => url !== photoUrl);
    return await updateProfile({ photos: updatedPhotos });
  };

  return {
    profile,
    loading,
    error,
    createProfile,
    updateProfile,
    uploadPhoto,
    uploadPhotoBackup,
    addPhoto,
    removePhoto,
    refetch: fetchProfile,
  };
}