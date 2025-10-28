import { useState, useEffect } from 'react';
import { supabase, Profile } from '@/lib/supabase';
import { useAuth } from './useAuth';

export function useProfile() {
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

  const uploadPhoto = async (file: File) => {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file (JPG, PNG, GIF, etc.)');
      }

      // Validate file size (5MB limit for emergency fix)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image must be smaller than 5MB');
      }

      console.log('Starting photo upload:', { fileSize: file.size, fileType: file.type });

      // EMERGENCY FIX: Try to create bucket first if it doesn't exist
      try {
        const { data: buckets } = await supabase.storage.listBuckets();
        const photosBucket = buckets?.find(bucket => bucket.name === 'photos');
        
        if (!photosBucket) {
          console.log('Photos bucket not found, attempting to create...');
          const { error: createError } = await supabase.storage.createBucket('photos', {
            public: true,
            allowedMimeTypes: ['image/*'],
            fileSizeLimit: 10485760 // 10MB
          });
          
          if (createError) {
            console.warn('Could not create bucket:', createError);
          } else {
            console.log('Successfully created photos bucket');
          }
        }
      } catch (bucketError) {
        console.warn('Bucket check/creation failed:', bucketError);
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${user?.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `profile-photos/${fileName}`;

      console.log('Attempting upload:', { fileName, filePath });

      const { error: uploadError, data } = await supabase.storage
        .from('photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Storage upload failed:', uploadError);
        
        // EMERGENCY FALLBACK: Use base64 encoding for small images
        if (file.size <= 2 * 1024 * 1024) { // 2MB limit for base64
          console.log('Using emergency base64 fallback');
          
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          
          console.log('Base64 conversion successful');
          return { url: base64, error: null };
        }
        
        // Provide specific error messages
        if (uploadError.message.includes('not found') || uploadError.message.includes('does not exist')) {
          throw new Error('Storage not configured. Using emergency backup method failed - file too large.');
        } else if (uploadError.message.includes('policy') || uploadError.message.includes('permission')) {
          throw new Error('Upload permission denied. Storage policies need to be configured.');
        } else if (uploadError.message.includes('pattern')) {
          throw new Error('Storage configuration error. Please contact support.');
        } else {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }
      }

      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

      console.log('Upload successful:', { publicUrl });
      return { url: publicUrl, error: null };
    } catch (err: any) {
      console.error('Photo upload error:', err);
      return { url: null, error: err.message };
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
    addPhoto,
    removePhoto,
    refetch: fetchProfile,
  };
}