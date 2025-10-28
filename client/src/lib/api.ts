import { supabase } from './supabase';

async function getAuthToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
}

async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = await getAuthToken();
  
  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API call failed');
  }

  return response.json();
}

export const api = {
  // Profile
  getProfile: () => apiCall('/profile'),
  createProfile: (data: any) => apiCall('/profile', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateProfile: (data: any) => apiCall('/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // Discovery
  getDiscoveryProfiles: () => apiCall('/discovery'),

  // Swipes
  swipe: (swipedId: string, action: 'like' | 'pass' | 'superlike') => 
    apiCall('/swipe', {
      method: 'POST',
      body: JSON.stringify({ swiped_id: swipedId, action }),
    }),

  // Matches
  getMatches: () => apiCall('/matches'),

  // Messages
  getMessages: (matchId: string) => apiCall(`/messages/${matchId}`),
  sendMessage: (matchId: string, content: string, type = 'text') =>
    apiCall('/messages', {
      method: 'POST',
      body: JSON.stringify({ match_id: matchId, content, type }),
    }),
  markMessageRead: (messageId: string) =>
    apiCall(`/messages/${messageId}/read`, { method: 'PUT' }),

  // Block
  blockUser: (blockedId: string) =>
    apiCall('/block', {
      method: 'POST',
      body: JSON.stringify({ blocked_id: blockedId }),
    }),
  unblockUser: (blockedId: string) =>
    apiCall(`/block/${blockedId}`, { method: 'DELETE' }),

  // Report
  reportUser: (reportedId: string, reason: string) =>
    apiCall('/report', {
      method: 'POST',
      body: JSON.stringify({ reported_id: reportedId, reason }),
    }),

  // Interests
  getInterests: () => apiCall('/interests'),
};