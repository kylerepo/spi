import { useState, useEffect, useCallback } from 'react';
import { useAuthNeon } from './useAuthNeon';

interface Profile {
  id: string;
  userId: string;
  accountType: 'single' | 'couple';
  profileType: 'single_profile' | 'couple_profile';
  displayName: string;
  age?: number;
  bio?: string;
  location?: string;
  gender?: string;
  orientation?: string;
  interests: string[];
  photos: string[];
  isProfileComplete: boolean;
  isVisible: boolean;
  verificationStatus: string;
  membershipType: string;
  createdAt: string;
  updatedAt: string;
}

interface CoupleProfile {
  partner1Name?: string;
  partner1Gender?: string;
  partner1Age?: number;
  partner1Bio?: string;
  partner2Name?: string;
  partner2Gender?: string;
  partner2Age?: number;
  partner2Bio?: string;
}

interface ProfilePreferences {
  softSwap: boolean;
  fullSwap: boolean;
  groupActivities: boolean;
  voyeurism: boolean;
  exhibitionism: boolean;
  bdsm: boolean;
  rolePlay: boolean;
  customPreferences?: string;
}

interface ProfileBoundaries {
  noAnalSex: boolean;
  noOralSex: boolean;
  noBdsm: boolean;
  noGroupActivities: boolean;
  customBoundaries?: string;
}

interface ProfileSafeSex {
  condomUse: boolean;
  dentalDamUse: boolean;
  regularTesting: boolean;
  lastTestDate?: string;
  customPractices?: string;
}

interface CreateProfileData {
  accountType: 'single' | 'couple';
  displayName: string;
  age: number;
  bio: string;
  location: string;
  gender?: string;
  orientation?: string;
  interests: string[];
  photos?: string[];
}

interface UploadResult {
  url: string;
  storagePath: string;
}

export function useProfileNeon() {
  const { user } = useAuthNeon();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [coupleProfile, setCoupleProfile] = useState<CoupleProfile | null>(null);
  const [preferences, setPreferences] = useState<ProfilePreferences | null>(null);
  const [boundaries, setBoundaries] = useState<ProfileBoundaries | null>(null);
  const [safeSex, setSafeSex] = useState<ProfileSafeSex | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }, []);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/profile', {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          // Profile doesn't exist yet
          setProfile(null);
        } else {
          throw new Error('Failed to fetch profile');
        }
      } else {
        const profileData = await response.json();
        setProfile(profileData);
        
        // Fetch related data
        if (profileData.accountType === 'couple') {
          await fetchCoupleProfile(profileData.id);
        }
        await fetchPreferences(profileData.id);
        await fetchBoundaries(profileData.id);
        await fetchSafeSex(profileData.id);
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [user, getAuthHeaders]);

  const fetchCoupleProfile = async (profileId: string) => {
    try {
      const response = await fetch(`/api/profile/couple/${profileId}`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setCoupleProfile(data);
      }
    } catch (error) {
      console.error('Error fetching couple profile:', error);
    }
  };

  const fetchPreferences = async (profileId: string) => {
    try {
      const response = await fetch(`/api/profile/preferences/${profileId}`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const fetchBoundaries = async (profileId: string) => {
    try {
      const response = await fetch(`/api/profile/boundaries/${profileId}`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setBoundaries(data);
      }
    } catch (error) {
      console.error('Error fetching boundaries:', error);
    }
  };

  const fetchSafeSex = async (profileId: string) => {
    try {
      const response = await fetch(`/api/profile/safe-sex/${profileId}`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setSafeSex(data);
      }
    } catch (error) {
      console.error('Error fetching safe sex info:', error);
    }
  };

  const createProfile = async (profileData: CreateProfileData) => {
    try {
      setError(null);

      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create profile');
      }

      const newProfile = await response.json();
      setProfile(newProfile);
      return { success: true, profile: newProfile };
    } catch (error: any) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const updateProfile = async (updates: Partial<CreateProfileData>) => {
    if (!profile) {
      return { success: false, error: 'No profile to update' };
    }

    try {
      setError(null);

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile');
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      return { success: true, profile: updatedProfile };
    } catch (error: any) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const completeProfileSetup = async (data: {
    profileData: Partial<CreateProfileData>;
    coupleProfileData?: CoupleProfile;
    preferences?: ProfilePreferences;
    boundaries?: ProfileBoundaries;
    safeSex?: ProfileSafeSex;
  }) => {
    if (!profile) {
      return { success: false, error: 'No profile to complete' };
    }

    try {
      setError(null);

      const response = await fetch('/api/profile/complete', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to complete profile');
      }

      const completedProfile = await response.json();
      setProfile(completedProfile);
      return { success: true, profile: completedProfile };
    } catch (error: any) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const uploadPhoto = async (file: File): Promise<{ url: string; error?: string }> => {
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const response = await fetch('/api/profile/photos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload photo');
      }

      const result: UploadResult = await response.json();
      return { url: result.url };
    } catch (error: any) {
      return { url: '', error: error.message };
    }
  };

  const uploadMultiplePhotos = async (files: File[]): Promise<{ urls: string[]; error?: string }> => {
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('photos', file));

      const response = await fetch('/api/profile/photos/multiple', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload photos');
      }

      const results: UploadResult[] = await response.json();
      return { urls: results.map(r => r.url) };
    } catch (error: any) {
      return { urls: [], error: error.message };
    }
  };

  const deletePhoto = async (photoId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/profile/photos/${photoId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting photo:', error);
      return false;
    }
  };

  const getAllInterests = async () => {
    try {
      const response = await fetch('/api/interests');
      
      if (!response.ok) {
        throw new Error('Failed to fetch interests');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching interests:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    coupleProfile,
    preferences,
    boundaries,
    safeSex,
    loading,
    error,
    createProfile,
    updateProfile,
    completeProfileSetup,
    uploadPhoto,
    uploadMultiplePhotos,
    deletePhoto,
    getAllInterests,
    refetch: fetchProfile,
  };
}