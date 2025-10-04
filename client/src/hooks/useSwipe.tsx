import { useState } from 'react';
import { supabase, Profile } from '@/lib/supabase';
import { useProfile } from './useProfile';

export function useSwipe() {
  const { profile } = useProfile();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const swipe = async (
    swipedProfile: Profile,
    action: 'like' | 'pass' | 'superlike'
  ) => {
    if (!profile) {
      return { error: 'No profile found' };
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('swipes')
        .insert([
          {
            swiper_id: profile.id,
            swiped_id: swipedProfile.id,
            action,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Check if this creates a match
      const { data: matchData } = await supabase
        .from('swipes')
        .select('*')
        .eq('swiper_id', swipedProfile.id)
        .eq('swiped_id', profile.id)
        .eq('action', 'like')
        .single();

      const isMatch = !!matchData && action === 'like';

      return { data, error: null, isMatch };
    } catch (err: any) {
      setError(err.message);
      return { data: null, error: err.message, isMatch: false };
    } finally {
      setLoading(false);
    }
  };

  const like = (swipedProfile: Profile) => swipe(swipedProfile, 'like');
  const pass = (swipedProfile: Profile) => swipe(swipedProfile, 'pass');
  const superlike = (swipedProfile: Profile) => swipe(swipedProfile, 'superlike');

  return {
    like,
    pass,
    superlike,
    loading,
    error,
  };
}