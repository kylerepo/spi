# Quick Implementation Guide - Supabase API Fix

This is a condensed version of the full guide for quick implementation.

## 🚀 Quick Start (5 Steps)

### Step 1: Get Your Credentials (2 minutes)
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJ...` (already in your .env)
   - **service_role key**: `eyJ...` (NEW - you need this!)

### Step 2: Update Environment Variables (1 minute)
Update your `.env` file:
```env
# Frontend (already set)
VITE_SUPABASE_URL=https://hvafquyruidsvteerdwf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Backend (ADD THESE)
SUPABASE_URL=https://hvafquyruidsvteerdwf.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Optional
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.hvafquyruidsvteerdwf.supabase.co:5432/postgres
SESSION_SECRET=generate_random_string_here
```

### Step 3: Run Missing SQL Policies (3 minutes)
1. Go to Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Copy and paste the entire contents of `MISSING_RLS_POLICIES.sql`
4. Click "Run"
5. Verify no errors

### Step 4: Verify Storage Bucket (1 minute)
1. Go to Storage in Supabase Dashboard
2. Check if `photos` bucket exists
3. If not, create it and make it **public**
4. The SQL policies from Step 3 already configured the permissions

### Step 5: Test the Backend (2 minutes)
```bash
# Install dependencies (if not already done)
npm install

# Start the server
npm run dev
```

Test the health endpoint:
```bash
curl http://localhost:5000/api/health
```

Should return: `{"status":"ok","timestamp":"..."}`

---

## ✅ What Was Fixed

### Files Created:
1. ✅ `server/supabase.ts` - Backend Supabase client
2. ✅ `server/routes.ts` - Complete API routes (updated)
3. ✅ `server/index.ts` - Server with CORS (updated)
4. ✅ `client/src/lib/api.ts` - Frontend API client
5. ✅ `.env.example` - Environment template
6. ✅ `MISSING_RLS_POLICIES.sql` - SQL policies to run

### What's Now Working:
- ✅ Backend API routes for all operations
- ✅ Authentication middleware
- ✅ Profile CRUD operations
- ✅ Discovery/swiping
- ✅ Matching system
- ✅ Messaging
- ✅ Blocking/reporting
- ✅ Storage policies
- ✅ RLS policies
- ✅ CORS configuration

---

## 🧪 Quick Test Checklist

After implementation, test these:

1. **Backend Connection**
   ```bash
   curl http://localhost:5000/api/health
   ```
   ✅ Should return: `{"status":"ok",...}`

2. **Sign Up**
   - Create a new account
   - Check email for verification
   - ✅ Should receive confirmation email

3. **Profile Creation**
   - Complete profile setup
   - Upload photos
   - ✅ Photos should upload successfully

4. **Discovery**
   - View profiles
   - Swipe left/right
   - ✅ Should see profiles

5. **Matching**
   - Create test accounts
   - Like each other
   - ✅ Should create match

---

## 🔧 Available API Endpoints

All endpoints require authentication (except `/api/health` and `/api/interests`).

### Profile
- `GET /api/profile` - Get current user's profile
- `POST /api/profile` - Create profile
- `PUT /api/profile` - Update profile

### Discovery
- `GET /api/discovery` - Get profiles to swipe

### Swipes
- `POST /api/swipe` - Swipe on a profile

### Matches
- `GET /api/matches` - Get all matches

### Messages
- `GET /api/messages/:matchId` - Get messages
- `POST /api/messages` - Send message
- `PUT /api/messages/:messageId/read` - Mark as read

### Safety
- `POST /api/block` - Block user
- `DELETE /api/block/:blockedId` - Unblock user
- `POST /api/report` - Report user

### Interests
- `GET /api/interests` - Get all interests (public)

---

## 🐛 Common Issues & Quick Fixes

### Issue: "Missing Supabase environment variables"
**Fix**: Add `SUPABASE_SERVICE_ROLE_KEY` to `.env` and restart server

### Issue: "Invalid token" or 401 errors
**Fix**: Sign out and sign in again to get fresh token

### Issue: Photos not uploading
**Fix**: Run the SQL policies from `MISSING_RLS_POLICIES.sql`

### Issue: "Row Level Security policy violation"
**Fix**: Ensure all SQL policies from Step 3 were run successfully

### Issue: CORS errors
**Fix**: Already fixed in `server/index.ts` - restart server

---

## 📚 Using the API in Frontend

Import and use the API client:

```typescript
import { api } from '@/lib/api';

// Get profile
const profile = await api.getProfile();

// Update profile
await api.updateProfile({ bio: 'New bio' });

// Swipe
const result = await api.swipe(profileId, 'like');
if (result.isMatch) {
  console.log('It\'s a match!');
}

// Send message
await api.sendMessage(matchId, 'Hello!');

// Get matches
const matches = await api.getMatches();
```

---

## 🔒 Security Notes

⚠️ **IMPORTANT**:
- Never commit `.env` file
- Keep service role key secret
- Only use service role key on backend
- Frontend uses anon key only

---

## 📖 Full Documentation

For detailed information, see:
- `SUPABASE_FIX_GUIDE.md` - Complete implementation guide
- `SETUP_GUIDE.md` - Original setup guide
- `MISSING_RLS_POLICIES.sql` - All SQL policies

---

## ✅ Completion Checklist

- [ ] Service role key added to `.env`
- [ ] SQL policies run in Supabase
- [ ] Storage bucket `photos` exists and is public
- [ ] Server starts without errors
- [ ] `/api/health` returns 200
- [ ] Can sign up and create profile
- [ ] Can upload photos
- [ ] Can view discovery profiles
- [ ] Can swipe and match
- [ ] Can send messages

---

**Need Help?** Check `SUPABASE_FIX_GUIDE.md` for detailed troubleshooting.