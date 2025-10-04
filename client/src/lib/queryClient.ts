import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { api } from "./api-adapter";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// API request function that routes to Supabase adapter
export async function apiRequest(
  url: string,
  options?: {
    method?: string;
    body?: string;
  }
): Promise<any> {
  const method = options?.method || 'GET';
  const body = options?.body ? JSON.parse(options.body) : undefined;

  // Route API calls to Supabase adapter
  if (url === '/api/browse/profiles') {
    return api.getBrowseProfiles(body);
  } else if (url === '/api/browse/like') {
    return api.likeProfile(body.likedProfileId);
  } else if (url === '/api/browse/pass') {
    return api.passProfile(body.passedProfileId);
  } else if (url === '/api/matches') {
    return api.getMatches();
  } else if (url.startsWith('/api/messages/')) {
    const matchId = url.split('/').pop();
    if (method === 'POST') {
      return api.sendMessage(matchId!, body.content);
    }
    return api.getMessages(matchId!);
  } else if (url === '/api/profile') {
    if (method === 'GET') {
      return api.getCurrentProfile();
    } else if (method === 'PUT' || method === 'PATCH') {
      return api.updateProfile(body);
    }
  }

  // Fallback to regular fetch for other endpoints
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const [url, ...params] = queryKey;
    
    try {
      // Use apiRequest which routes to Supabase adapter
      return await apiRequest(url as string, { method: 'GET' });
    } catch (error: any) {
      if (unauthorizedBehavior === "returnNull" && error.message?.includes('401')) {
        return null;
      }
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
