import { useState, useEffect } from 'react';
import { supabase, Profile } from '@/lib/supabase';
import { useProfile } from './useProfile';

interface DiscoveryFilters {
  minAge?: number;
  maxAge?: number;
  maxDistance?: number;
  profileTypes?: ('single' | 'couple')[];
  interests?: string[];
}

export function useDiscovery(filters?: DiscoveryFilters) {
  const { profile } = useProfile();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      fetchProfiles();
    }
  }, [profile, filters]);

  const fetchProfiles = async () => {
    if (!profile) return;

    try {
      setLoading(true);

      // Get profiles that the user hasn't swiped on yet
      const { data: swipedIds } = await supabase
        .from('swipes')
        .select('swiped_id')
        .eq('swiper_id', profile.id);

      const swipedProfileIds = swipedIds?.map((s) => s.swiped_id) || [];

      // Get profiles that haven't blocked the user
      const { data: blockedByIds } = await supabase
        .from('blocks')
        .select('blocker_id')
        .eq('blocked_id', profile.id);

      const blockedByProfileIds = blockedByIds?.map((b) => b.blocker_id) || [];

      // Get profiles that the user hasn't blocked
      const { data: blockedIds } = await supabase
        .from('blocks')
        .select('blocked_id')
        .eq('blocker_id', profile.id);

      const blockedProfileIds = blockedIds?.map((b) => b.blocked_id) || [];

      // Combine all excluded IDs
      const excludedIds = [
        profile.id,
        ...swipedProfileIds,
        ...blockedByProfileIds,
        ...blockedProfileIds,
      ];

      // Build query
      let query = supabase
        .from('profiles')
        .select('*')
        .not('id', 'in', `(${excludedIds.join(',')})`)
        .limit(50);

      // Apply filters
      if (filters?.minAge) {
        query = query.gte('age', filters.minAge);
      }
      if (filters?.maxAge) {
        query = query.lte('age', filters.maxAge);
      }
      if (filters?.profileTypes && filters.profileTypes.length > 0) {
        query = query.in('profile_type', filters.profileTypes);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Filter by interests if specified
      let filteredData = data || [];
      if (filters?.interests && filters.interests.length > 0) {
        filteredData = filteredData.filter((p) =>
          filters.interests!.some((interest) => p.interests.includes(interest))
        );
      }

      // Calculate distance if location is available
      if (profile.latitude && profile.longitude) {
        filteredData = filteredData.map((p) => {
          if (p.latitude && p.longitude) {
            const distance = calculateDistance(
              profile.latitude!,
              profile.longitude!,
              p.latitude,
              p.longitude
            );
            return { ...p, distance };
          }
          return p;
        });

        // Filter by max distance if specified
        if (filters?.maxDistance) {
          filteredData = filteredData.filter(
            (p: any) => !p.distance || p.distance <= filters.maxDistance!
          );
        }

        // Sort by distance
        filteredData.sort((a: any, b: any) => {
          if (!a.distance) return 1;
          if (!b.distance) return -1;
          return a.distance - b.distance;
        });
      }

      setProfiles(filteredData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Haversine formula to calculate distance between two coordinates
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return {
    profiles,
    loading,
    error,
    refetch: fetchProfiles,
  };
}