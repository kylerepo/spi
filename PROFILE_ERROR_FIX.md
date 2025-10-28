# 🔧 "Error checking profile" Fix

## 🔍 Issue Identified

**Error**: "Error checking profile"  
**Location**: After successful authentication, during profile verification  
**Cause**: Database connection or RLS policy issue preventing profile lookup

---

## 🎯 Root Causes & Solutions

### 1. **Missing RLS Policies** (Most Likely)

**Problem**: Profile table doesn't have proper RLS policies  
**Solution**: Run the missing SQL policies

#### Fix: Run SQL Policies in Supabase
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `zjyoxxqcdzxwtkmqamas`
3. Go to **SQL Editor**
4. Run this SQL:

```sql
-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (user_id = auth.uid());

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (user_id = auth.uid());
```

### 2. **Database Connection Issue**

**Problem**: Backend can't connect to database  
**Solution**: Verify environment variables

#### Check Environment Variables:
```env
SUPABASE_URL=https://zjyoxxqcdzxwtkmqamas.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqeW9xeHFjZHp4d3RrbXFhbWFzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTU1NTc0NiwiZXhwIjoyMDc1MTMxNzQ2fQ.5IM0f3MfJWN03mfwEXn1IzWh0REZWgakrCzUblGiwgY
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.zjyoxxqcdzxwtkmqamas.supabase.co:5432/postgres
```

### 3. **Profile Table Doesn't Exist**

**Problem**: Profile table not created  
**Solution**: Create the profiles table

#### Create Profiles Table:
```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  profile_type VARCHAR(10) CHECK (profile_type IN ('single', 'couple')) NOT NULL DEFAULT 'single',
  name VARCHAR(100) NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 18),
  bio TEXT,
  location VARCHAR(200),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  gender VARCHAR(20),
  orientation VARCHAR(50),
  looking_for TEXT[],
  interests TEXT[] DEFAULT '{}',
  photos TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE,
  partner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🔧 Quick Fix Steps

### Step 1: Run Complete SQL Setup (2 minutes)
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the entire contents of `MISSING_RLS_POLICIES.sql`
3. Click "Run"
4. Verify no errors

### Step 2: Verify Environment Variables (1 minute)
Check your Vercel environment variables include:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- All other required variables

### Step 3: Test Again (1 minute)
1. Try to sign in again
2. Check browser console for detailed error
3. Verify profile check completes

---

## 🔍 Enhanced Error Handling

Let me also improve the error handling to provide better debugging:

### Updated handleLogin with Better Error Handling:

```typescript
const handleLogin = async (email: string, password: string) => {
  try {
    console.log('🔐 Starting login process...');
    
    const { data, error } = await signIn(email, password);
    
    if (error) {
      console.error('❌ Login error:', error);
      alert(error.message || 'Failed to login');
      return;
    }
    
    console.log('✅ Login successful!', data);
    
    // Check if user has a profile
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('❌ No user found after login');
      alert('Login failed - no user found');
      return;
    }
    
    console.log('👤 User found:', user.id);
    
    try {
      // Check for existing profile with better error handling
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      console.log('🏠 Profile check result:', { profile, profileError });
      
      if (profileError) {
        if (profileError.code === 'PGRST116') {
          // No profile found - this is expected for new users
          console.log('📝 No profile found (new user), redirecting to profile setup');
          alert('Welcome! Please complete your profile...');
          setLocation("/profile-setup");
          return;
        } else {
          // Actual error
          console.error('❌ Profile check error:', profileError);
          alert(`Error checking profile: ${profileError.message}`);
          return;
        }
      }
      
      if (profile) {
        console.log('✅ Profile found, redirecting to browse');
        alert('Welcome back! Redirecting to browse...');
        setLocation("/browse");
      } else {
        console.log('📝 No profile found, redirecting to profile setup');
        alert('Welcome! Please complete your profile...');
        setLocation("/profile-setup");
      }
      
    } catch (profileCheckError) {
      console.error('💥 Profile check exception:', profileCheckError);
      alert('Error checking profile. Please try again.');
    }
    
  } catch (error) {
    console.error('💥 Login exception:', error);
    alert('An error occurred during login');
  }
};
```

---

## 🧪 Debugging Steps

### 1. Check Browser Console
Look for these specific errors:
- `Profile check error:` - Shows the exact database error
- `RLS policy violation` - Indicates missing policies
- `relation "profiles" does not exist` - Table not created

### 2. Test Database Connection
```sql
-- Test in Supabase SQL Editor
SELECT * FROM profiles LIMIT 1;
```

### 3. Verify RLS Policies
```sql
-- Check existing policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'profiles';
```

---

## 🎯 Most Likely Solution

Based on the error, the most likely issue is **missing RLS policies**. Run this complete SQL in Supabase:

```sql
-- Complete RLS setup for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (user_id = auth.uid());

-- Also enable for other tables if they exist
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
```

---

## ✅ Verification

After running the SQL policies, test:
1. Sign in should work without "Error checking profile"
2. New users should go to profile setup
3. Existing users should go to browse
4. Console should show detailed logs

---

**Time to fix**: 5 minutes  
**Most likely cause**: Missing RLS policies  
**Solution**: Run SQL policies in Supabase Dashboard