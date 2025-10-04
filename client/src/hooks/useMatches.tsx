import { useState, useEffect } from 'react';
import { supabase, Match, Profile } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';

export function useMatches() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [matches, setMatches] = useState<(Match & { profile: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      fetchMatches();
      subscribeToMatches();
    }
  }, [profile]);

  const fetchMatches = async () => {
    if (!profile) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          user1:profiles!matches_user1_id_fkey(*),
          user2:profiles!matches_user2_id_fkey(*)
        `)
        .or(`user1_id.eq.${profile.id},user2_id.eq.${profile.id}`)
        .order('matched_at', { ascending: false });

      if (error) throw error;

      // Transform data to include the other user's profile
      const transformedMatches = data.map((match: any) => ({
        ...match,
        profile: match.user1_id === profile.id ? match.user2 : match.user1,
      }));

      setMatches(transformedMatches);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMatches = () => {
    if (!profile) return;

    const subscription = supabase
      .channel('matches')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `user1_id=eq.${profile.id},user2_id=eq.${profile.id}`,
        },
        () => {
          fetchMatches();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  return {
    matches,
    loading,
    error,
    refetch: fetchMatches,
  };
}