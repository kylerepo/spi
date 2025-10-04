import { useState, useEffect } from 'react';
import { supabase, Message } from '@/lib/supabase';
import { useProfile } from './useProfile';

export function useMessages(matchId: string) {
  const { profile } = useProfile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (matchId && profile) {
      fetchMessages();
      subscribeToMessages();
    }
  }, [matchId, profile]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark messages as read
      if (profile) {
        await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('match_id', matchId)
          .neq('sender_id', profile.id)
          .eq('is_read', false);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const subscription = supabase
      .channel(`messages:${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          setMessages((current) => [...current, payload.new as Message]);
          
          // Mark as read if not sent by current user
          if (profile && payload.new.sender_id !== profile.id) {
            supabase
              .from('messages')
              .update({ is_read: true })
              .eq('id', payload.new.id);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const sendMessage = async (content: string, type: 'text' | 'image' = 'text') => {
    if (!profile) {
      return { error: 'No profile found' };
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            match_id: matchId,
            sender_id: profile.id,
            content,
            type,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const uploadImage = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile?.id}/${Date.now()}.${fileExt}`;
      const filePath = `chat-images/${fileName}`;

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

  const sendImageMessage = async (file: File) => {
    const { url, error: uploadError } = await uploadImage(file);
    if (uploadError || !url) {
      return { error: uploadError };
    }
    return await sendMessage(url, 'image');
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
    sendImageMessage,
    refetch: fetchMessages,
  };
}