# Supabase API Connection Fix Guide

## Executive Summary

Your application has the basic Supabase setup but is missing several critical components for full backend connectivity. This guide provides a complete step-by-step solution.

---

## 🔴 Critical Issues Identified

### 1. **Missing Storage Bucket Policies**
- Storage bucket `photos` needs proper RLS policies
- Current schema only has table policies, not storage policies

### 2. **Incomplete Environment Configuration**
- `.env` file has placeholder `DATABASE_URL`
- Missing service role key for backend operations

### 3. **No Backend API Routes**
- `server/routes.ts` is empty
- No API endpoints for Supabase operations
- Frontend has no backend proxy for secure operations

### 4. **Missing Auth Configuration**
- No email templates configured
- No redirect URLs set up
- No auth hooks for profile creation

### 5. **Incomplete RLS Policies**
- Missing policies for interests table
- Storage policies not implemented
- Some edge cases not covered

---

## 📋 Complete Backend Connection Checklist

### ✅ What You Have
- [x] Supabase client initialized (`client/src/lib/supabase.ts`)
- [x] Auth hooks (`useAuth.tsx`)
- [x] Profile hooks (`useProfile.tsx`)
- [x] Database schema with tables
- [x] Basic RLS policies for tables
- [x] Auth context providers

### ❌ What's Missing
- [ ] Storage bucket RLS policies
- [ ] Backend API routes for secure operations
- [ ] Service role key configuration
- [ ] Email auth configuration
- [ ] Auth hooks for automatic profile creation
- [ ] Backend Supabase client (for admin operations)
- [ ] API endpoints for:
  - Profile operations
  - Match operations
  - Message operations
  - Swipe operations
  - Storage operations
- [ ] Error handling middleware
- [ ] Rate limiting
- [ ] CORS configuration

---

## 🔧 Step-by-Step Implementation Guide

### Step 1: Complete Supabase Dashboard Configuration

#### 1.1 Get Service Role Key
1. Go to Supabase Dashboard → Settings → API
2. Copy the **service_role** key (starts with `eyJ...`)
3. ⚠️ **IMPORTANT**: This key bypasses RLS - keep it secret!

#### 1.2 Configure Authentication
1. Go to Authentication → Settings
2. **Site URL**: Set to your production URL (e.g., `https://yourapp.com`)
3. **Redirect URLs**: Add:
   - `http://localhost:5000/**` (development)
   - `https://yourapp.com/**` (production)
4. **Email Templates**: Customize these templates:
   - Confirmation email
   - Password reset
   - Magic link

#### 1.3 Create Storage Bucket (if not exists)
1. Go to Storage
2. Create bucket named `photos`
3. Make it **public**
4. Set max file size to 5MB

#### 1.4 Add Storage Policies
Go to Storage → photos → Policies and run these SQL commands:

```sql
-- Policy 1: Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Allow public read access
CREATE POLICY "Public can view photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'photos');

-- Policy 3: Allow users to delete their own photos
CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Allow users to update their own photos
CREATE POLICY "Users can update their own photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

#### 1.5 Add Missing Table Policies

Run this SQL to add missing policies:

```sql
-- Interests table policies (currently missing)
CREATE POLICY "Anyone can view interests"
ON interests FOR SELECT
TO public
USING (true);

-- Allow reading messages for match participants
CREATE POLICY "Users can mark messages as read"
ON messages FOR UPDATE
USING (
  match_id IN (
    SELECT id FROM matches WHERE
    user1_id = (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
    user2_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  )
)
WITH CHECK (
  match_id IN (
    SELECT id FROM matches WHERE
    user1_id = (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
    user2_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  )
);

-- Allow users to view reports they created
CREATE POLICY "Users can view their own reports"
ON reports FOR SELECT
USING (reporter_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));
```

#### 1.6 Create Auth Hook for Automatic Profile Creation

Go to Database → Functions and create this function:

```sql
-- Function to create profile automatically on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, age, bio, location)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'New User'),
    COALESCE((NEW.raw_user_meta_data->>'age')::integer, 18),
    '',
    ''
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

### Step 2: Update Environment Variables

Update your `.env` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://hvafquyruidsvteerdwf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2YWZxdXlydWlkc3Z0ZWVyZHdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MzQ3ODcsImV4cCI6MjA3NTExMDc4N30.Eu74Afz66mSLrEJK1B2g4WG3OoOTL4dT55LABL_Eu0s

# Backend Supabase Configuration (for server-side operations)
SUPABASE_URL=https://hvafquyruidsvteerdwf.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Database Configuration (optional - only if using direct DB connection)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.hvafquyruidsvteerdwf.supabase.co:5432/postgres

# Server Configuration
PORT=5000
NODE_ENV=development

# Session Secret (generate a random string)
SESSION_SECRET=your_random_session_secret_here
```

**To get your DATABASE_URL:**
1. Go to Supabase Dashboard → Settings → Database
2. Copy the connection string
3. Replace `[YOUR-PASSWORD]` with your database password

---

### Step 3: Create Backend Supabase Client

Create a new file for server-side Supabase operations:

```typescript
// server/supabase.ts
import { createClient } from '@supabase/supabase-js';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase environment variables for backend');
}

// Admin client with service role (bypasses RLS)
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Regular client for user operations
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY!
);
```

---

### Step 4: Create Backend API Routes

Update `server/routes.ts` with complete API endpoints:

```typescript
// server/routes.ts
import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { supabaseAdmin, supabase } from "./supabase";

// Middleware to verify Supabase JWT
async function authenticateUser(req: Request, res: Response, next: Function) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.substring(7);
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ==================== PROFILE ROUTES ====================
  
  // Get current user's profile
  app.get('/api/profile', authenticateUser, async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('user_id', req.user.id)
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create profile
  app.post('/api/profile', authenticateUser, async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .insert([{
          user_id: req.user.id,
          ...req.body
        }])
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update profile
  app.put('/api/profile', authenticateUser, async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .update(req.body)
        .eq('user_id', req.user.id)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== DISCOVERY ROUTES ====================
  
  // Get profiles for discovery
  app.get('/api/discovery', authenticateUser, async (req, res) => {
    try {
      const { data: currentProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('user_id', req.user.id)
        .single();

      if (!currentProfile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      // Get profiles excluding:
      // - Current user
      // - Already swiped profiles
      // - Blocked users
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .neq('user_id', req.user.id)
        .not('id', 'in', `(
          SELECT swiped_id FROM swipes WHERE swiper_id = '${currentProfile.id}'
        )`)
        .not('id', 'in', `(
          SELECT blocked_id FROM blocks WHERE blocker_id = '${currentProfile.id}'
        )`)
        .limit(20);

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== SWIPE ROUTES ====================
  
  // Create a swipe
  app.post('/api/swipe', authenticateUser, async (req, res) => {
    try {
      const { swiped_id, action } = req.body;

      const { data: currentProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('user_id', req.user.id)
        .single();

      if (!currentProfile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      const { data, error } = await supabaseAdmin
        .from('swipes')
        .insert([{
          swiper_id: currentProfile.id,
          swiped_id,
          action
        }])
        .select()
        .single();

      if (error) throw error;

      // Check if it's a match
      if (action === 'like') {
        const { data: reverseSwipe } = await supabaseAdmin
          .from('swipes')
          .select('*')
          .eq('swiper_id', swiped_id)
          .eq('swiped_id', currentProfile.id)
          .eq('action', 'like')
          .single();

        if (reverseSwipe) {
          res.json({ ...data, isMatch: true });
          return;
        }
      }

      res.json({ ...data, isMatch: false });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== MATCH ROUTES ====================
  
  // Get all matches
  app.get('/api/matches', authenticateUser, async (req, res) => {
    try {
      const { data: currentProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('user_id', req.user.id)
        .single();

      if (!currentProfile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      const { data, error } = await supabaseAdmin
        .from('matches')
        .select(`
          *,
          user1:profiles!matches_user1_id_fkey(*),
          user2:profiles!matches_user2_id_fkey(*)
        `)
        .or(`user1_id.eq.${currentProfile.id},user2_id.eq.${currentProfile.id}`)
        .order('matched_at', { ascending: false });

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== MESSAGE ROUTES ====================
  
  // Get messages for a match
  app.get('/api/messages/:matchId', authenticateUser, async (req, res) => {
    try {
      const { matchId } = req.params;

      const { data, error } = await supabaseAdmin
        .from('messages')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Send a message
  app.post('/api/messages', authenticateUser, async (req, res) => {
    try {
      const { match_id, content, type = 'text' } = req.body;

      const { data: currentProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('user_id', req.user.id)
        .single();

      if (!currentProfile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      const { data, error } = await supabaseAdmin
        .from('messages')
        .insert([{
          match_id,
          sender_id: currentProfile.id,
          content,
          type
        }])
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Mark message as read
  app.put('/api/messages/:messageId/read', authenticateUser, async (req, res) => {
    try {
      const { messageId } = req.params;

      const { data, error } = await supabaseAdmin
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== BLOCK ROUTES ====================
  
  // Block a user
  app.post('/api/block', authenticateUser, async (req, res) => {
    try {
      const { blocked_id } = req.body;

      const { data: currentProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('user_id', req.user.id)
        .single();

      if (!currentProfile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      const { data, error } = await supabaseAdmin
        .from('blocks')
        .insert([{
          blocker_id: currentProfile.id,
          blocked_id
        }])
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Unblock a user
  app.delete('/api/block/:blockedId', authenticateUser, async (req, res) => {
    try {
      const { blockedId } = req.params;

      const { data: currentProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('user_id', req.user.id)
        .single();

      if (!currentProfile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      const { error } = await supabaseAdmin
        .from('blocks')
        .delete()
        .eq('blocker_id', currentProfile.id)
        .eq('blocked_id', blockedId);

      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== REPORT ROUTES ====================
  
  // Report a user
  app.post('/api/report', authenticateUser, async (req, res) => {
    try {
      const { reported_id, reason } = req.body;

      const { data: currentProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('user_id', req.user.id)
        .single();

      if (!currentProfile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      const { data, error } = await supabaseAdmin
        .from('reports')
        .insert([{
          reporter_id: currentProfile.id,
          reported_id,
          reason
        }])
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== INTERESTS ROUTES ====================
  
  // Get all interests
  app.get('/api/interests', async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('interests')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}
```

---

### Step 5: Update Server Index

Update `server/index.ts` to include proper middleware:

```typescript
// server/index.ts
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS configuration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    log(`Error: ${message}`);
    res.status(status).json({ error: message });
  });

  // Setup Vite or static serving
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, "0.0.0.0", () => {
    log(`Server running on port ${PORT}`);
  });
})();
```

---

### Step 6: Install Missing Dependencies

```bash
npm install @supabase/supabase-js
```

---

### Step 7: Update Frontend to Use Backend API

Create a new API client for backend calls:

```typescript
// client/src/lib/api.ts
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
```

---

## 🧪 Testing Checklist

### 1. Authentication Testing
- [ ] Sign up with email/password
- [ ] Verify email confirmation works
- [ ] Sign in with credentials
- [ ] Sign out
- [ ] Password reset flow
- [ ] Session persistence

### 2. Profile Testing
- [ ] Create profile after signup
- [ ] Upload profile photos
- [ ] Update profile information
- [ ] View own profile
- [ ] Profile photos display correctly

### 3. Storage Testing
- [ ] Upload photos to storage
- [ ] Photos are accessible via public URL
- [ ] Delete photos
- [ ] Storage policies prevent unauthorized access

### 4. Discovery Testing
- [ ] View profiles in discovery
- [ ] Profiles exclude already swiped users
- [ ] Profiles exclude blocked users
- [ ] Swipe left (pass)
- [ ] Swipe right (like)
- [ ] Super like

### 5. Matching Testing
- [ ] Match created when two users like each other
- [ ] View all matches
- [ ] Matches display correct profile info

### 6. Messaging Testing
- [ ] Send text message
- [ ] Receive messages in real-time
- [ ] Mark messages as read
- [ ] Message history loads correctly

### 7. Safety Features Testing
- [ ] Block user
- [ ] Unblock user
- [ ] Report user
- [ ] Blocked users don't appear in discovery

### 8. RLS Policy Testing
- [ ] Users can only see their own profile data
- [ ] Users can't access other users' messages
- [ ] Storage policies work correctly
- [ ] Users can't modify other users' data

---

## 🐛 Troubleshooting Guide

### Issue: "Missing Supabase environment variables"
**Cause**: Environment variables not loaded
**Solution**:
1. Check `.env` file exists in root directory
2. Restart development server after adding variables
3. Verify variable names match exactly (case-sensitive)

### Issue: "Failed to fetch" or CORS errors
**Cause**: CORS not configured properly
**Solution**:
1. Check CORS middleware in `server/index.ts`
2. Verify API routes are prefixed with `/api`
3. Check browser console for specific CORS error

### Issue: "Invalid token" or 401 errors
**Cause**: Authentication token not being sent
**Solution**:
1. Check `api.ts` includes Authorization header
2. Verify token is being retrieved from Supabase session
3. Check token hasn't expired (sign out and sign in again)

### Issue: "Row Level Security policy violation"
**Cause**: RLS policies not configured correctly
**Solution**:
1. Run all SQL commands from Step 1.4 and 1.5
2. Check policies in Supabase Dashboard → Authentication → Policies
3. Verify user is authenticated before making requests

### Issue: Photos not uploading
**Cause**: Storage policies or bucket configuration
**Solution**:
1. Verify `photos` bucket exists and is public
2. Run storage policy SQL from Step 1.4
3. Check file size is under 5MB
4. Verify file path format: `profile-photos/{userId}/{filename}`

### Issue: No profiles in discovery
**Cause**: Not enough test data or RLS blocking
**Solution**:
1. Create multiple test accounts
2. Complete profiles for test accounts
3. Check RLS policies allow profile viewing
4. Verify discovery query in backend

### Issue: Messages not appearing in real-time
**Cause**: Realtime not enabled or subscriptions not working
**Solution**:
1. Enable Realtime in Supabase Dashboard → Database → Replication
2. Check subscription code in frontend
3. Verify WebSocket connection in browser dev tools

### Issue: "Service role key" errors
**Cause**: Missing or incorrect service role key
**Solution**:
1. Get service role key from Supabase Dashboard → Settings → API
2. Add to `.env` as `SUPABASE_SERVICE_ROLE_KEY`
3. Never commit this key to version control
4. Restart server after adding

---

## 🔒 Security Best Practices

### 1. Environment Variables
- ✅ Never commit `.env` files
- ✅ Use different keys for development/production
- ✅ Rotate service role key if exposed
- ✅ Keep service role key on backend only

### 2. Row Level Security
- ✅ Enable RLS on all tables
- ✅ Test policies thoroughly
- ✅ Use service role only on backend
- ✅ Never expose service role key to frontend

### 3. Authentication
- ✅ Enforce email verification
- ✅ Use strong password requirements
- ✅ Implement rate limiting
- ✅ Add CAPTCHA for signup

### 4. Data Validation
- ✅ Validate all inputs on backend
- ✅ Sanitize user-generated content
- ✅ Check file types and sizes
- ✅ Prevent SQL injection

### 5. User Safety
- ✅ Implement blocking feature
- ✅ Add reporting system
- ✅ Age verification (18+)
- ✅ Content moderation

---

## 📊 Performance Optimization

### 1. Database Indexes
Already included in schema:
- Profile location index for geo queries
- Message timestamp index for sorting
- Foreign key indexes for joins

### 2. Caching
Consider adding:
- Redis for session storage
- CDN for profile photos
- Query result caching

### 3. Query Optimization
- Use `select()` to limit returned fields
- Add pagination for large result sets
- Use database functions for complex queries

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] All environment variables set in production
- [ ] Database schema applied
- [ ] Storage buckets created
- [ ] RLS policies enabled
- [ ] Auth configuration complete
- [ ] Email templates customized

### Production Environment Variables
```env
VITE_SUPABASE_URL=your_production_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_URL=your_production_url
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
DATABASE_URL=your_production_database_url
SESSION_SECRET=your_production_session_secret
NODE_ENV=production
```

### Post-Deployment
- [ ] Test all authentication flows
- [ ] Verify file uploads work
- [ ] Check real-time messaging
- [ ] Monitor error logs
- [ ] Set up monitoring/alerts

---

## 📚 Additional Resources

### Supabase Documentation
- [Authentication](https://supabase.com/docs/guides/auth)
- [Database](https://supabase.com/docs/guides/database)
- [Storage](https://supabase.com/docs/guides/storage)
- [Realtime](https://supabase.com/docs/guides/realtime)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

### Best Practices
- [Security Best Practices](https://supabase.com/docs/guides/auth/auth-helpers/security)
- [Performance Tips](https://supabase.com/docs/guides/database/performance)
- [Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)

---

## 🎯 Quick Start Summary

1. **Get credentials** from Supabase Dashboard
2. **Run SQL scripts** for storage policies and missing table policies
3. **Update `.env`** with all required variables
4. **Create backend files**: `server/supabase.ts`, update `server/routes.ts`
5. **Create API client**: `client/src/lib/api.ts`
6. **Test everything** using the testing checklist
7. **Deploy** with production environment variables

---

## ✅ Completion Verification

Run through this checklist to verify everything is working:

1. **Backend Connection**
   - [ ] Server starts without errors
   - [ ] `/api/health` endpoint returns 200
   - [ ] Backend can connect to Supabase

2. **Authentication**
   - [ ] Can create new account
   - [ ] Receive confirmation email
   - [ ] Can sign in
   - [ ] Session persists on refresh

3. **Profile**
   - [ ] Profile created automatically on signup
   - [ ] Can update profile
   - [ ] Can upload photos
   - [ ] Photos display correctly

4. **Core Features**
   - [ ] Discovery shows profiles
   - [ ] Swiping works
   - [ ] Matches created correctly
   - [ ] Can send messages
   - [ ] Messages appear in real-time

5. **Security**
   - [ ] RLS policies prevent unauthorized access
   - [ ] Can't access other users' data
   - [ ] Storage policies work
   - [ ] Blocking works

---

## 🆘 Getting Help

If you encounter issues:

1. Check browser console for errors
2. Check server logs for backend errors
3. Verify all SQL scripts ran successfully
4. Check Supabase Dashboard logs
5. Review this guide's troubleshooting section

---

**Last Updated**: 2025-10-04
**Version**: 1.0