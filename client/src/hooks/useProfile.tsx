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
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${Math.random()}.${fileExt}`;
      const filePath = `profile-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

      return { url: publicUrl, error: null };
    } catch (err: any) {
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