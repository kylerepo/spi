# SPICE Dating App - Supabase Setup Guide

## Prerequisites
- Node.js 18+ installed
- A Supabase account (free tier works)
- Git installed

## Step 1: Supabase Project Setup

### 1.1 Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - Project name: `spice-dating-app`
   - Database password: (save this securely)
   - Region: Choose closest to your users
5. Wait for project to be created (~2 minutes)

### 1.2 Get Your Project Credentials
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## Step 2: Database Setup

### 2.1 Run the Database Schema
1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `supabase-schema.sql` from this repository
4. Paste into the SQL editor
5. Click "Run" to execute the schema

This will create:
- All necessary tables (profiles, matches, messages, swipes, etc.)
- Indexes for performance
- Row Level Security (RLS) policies
- Automatic triggers for matching
- Default interests

### 2.2 Set Up Storage Buckets
1. In Supabase dashboard, go to **Storage**
2. Click "Create a new bucket"
3. Name it: `photos`
4. Make it **Public** (so profile photos can be accessed)
5. Click "Create bucket"

### 2.3 Configure Storage Policies
1. Click on the `photos` bucket
2. Go to **Policies** tab
3. Add these policies:

**Policy 1: Allow authenticated users to upload**
```sql
CREATE POLICY "Authenticated users can upload photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'photos');
```

**Policy 2: Allow public read access**
```sql
CREATE POLICY "Public can view photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'photos');
```

**Policy 3: Allow users to delete their own photos**
```sql
CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## Step 3: Local Development Setup

### 3.1 Clone and Install
```bash
# Clone the repository
git clone https://github.com/TheMagicMannn/Spiceapp.git
cd Spiceapp

# Install dependencies
npm install
```

### 3.2 Configure Environment Variables
1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and add your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3.3 Start Development Server
```bash
npm run dev
```

The app should now be running at `http://localhost:5000`

## Step 4: Testing the Application

### 4.1 Create Your First Account
1. Open the app in your browser
2. Click "Sign Up"
3. Fill in your details (must be 18+)
4. Check your email for verification link
5. Click the verification link
6. Complete your profile setup:
   - Choose profile type (single/couple)
   - Add basic info
   - Write a bio
   - Select interests
   - Upload at least 2 photos

### 4.2 Test Core Features
1. **Discovery**: Swipe through profiles
2. **Matching**: Like profiles to create matches
3. **Messaging**: Send messages to matches
4. **Profile**: View and edit your profile

## Step 5: Deployment

### 5.1 Vercel Deployment (Recommended)
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy!

### 5.2 Environment Variables for Production
Make sure to add the same environment variables in your deployment platform:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Troubleshooting

### Issue: "Missing Supabase environment variables"
**Solution**: Make sure your `.env` file exists and contains the correct values. Restart the dev server after adding them.

### Issue: "Failed to create profile"
**Solution**: 
1. Check that the database schema was run successfully
2. Verify RLS policies are enabled
3. Check browser console for specific errors

### Issue: Photos not uploading
**Solution**:
1. Verify the `photos` storage bucket exists
2. Check that storage policies are configured
3. Ensure the bucket is set to public

### Issue: No profiles showing in discovery
**Solution**:
1. Create multiple test accounts
2. Make sure profiles are completed
3. Check that RLS policies allow profile viewing

## Security Notes

### Important Security Considerations:
1. **Never commit `.env` files** - They're in `.gitignore` for a reason
2. **Use Row Level Security** - Already configured in the schema
3. **Validate user input** - Client and server-side validation
4. **Age verification** - Enforced at signup (18+)
5. **Report/Block features** - Available for user safety

## Database Schema Overview

### Main Tables:
- **profiles**: User profile information
- **swipes**: Track likes/passes
- **matches**: Mutual likes create matches
- **messages**: Chat messages between matches
- **blocks**: User blocking functionality
- **reports**: User reporting for safety

### Key Features:
- Automatic match creation when two users like each other
- Real-time messaging with Supabase Realtime
- Distance-based discovery
- Interest-based filtering
- Couple profile support

## API Hooks Reference

### Authentication
- `useAuth()`: Sign up, sign in, sign out, password reset

### Profile Management
- `useProfile()`: Get, create, update profile, upload photos

### Discovery
- `useDiscovery(filters)`: Get profiles based on filters

### Matching
- `useSwipe()`: Like, pass, superlike profiles
- `useMatches()`: Get all matches

### Messaging
- `useMessages(matchId)`: Send/receive messages in real-time

## Support

For issues or questions:
1. Check this guide first
2. Review Supabase documentation: [https://supabase.com/docs](https://supabase.com/docs)
3. Check the code comments for implementation details

## Next Steps

After basic setup:
1. Customize the design to match your brand
2. Add premium features (subscriptions)
3. Implement push notifications
4. Add more filters and preferences
5. Create admin dashboard for moderation
6. Add analytics and monitoring

## License

This project is for educational purposes. Make sure to comply with all applicable laws and regulations when deploying a dating application.