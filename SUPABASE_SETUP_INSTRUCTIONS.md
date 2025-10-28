# Supabase Setup Instructions for SPICE Dating App

This guide will help you set up Supabase for your SPICE dating app with proper authentication, database, and storage configuration.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. Your project already has the Supabase client configured

## Step 1: Database Setup

### 1.1 Create Database Schema

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase-complete-schema.sql` into the SQL editor
4. Click **Run** to execute the schema

This will create all necessary tables, indexes, functions, triggers, and RLS policies.

### 1.2 Verify Tables

After running the schema, verify these tables were created:
- `profiles`
- `couple_profiles`
- `profile_photos`
- `profile_preferences`
- `profile_interests`
- `profile_activities`
- `profile_boundaries`
- `profile_safe_sex`
- `swipes`
- `matches`
- `messages`
- `blocks`
- `reports`
- `user_verifications`
- `interest_categories`
- `interests`

## Step 2: Storage Setup

### 2.1 Create Storage Buckets

1. Go to **Storage** in your Supabase dashboard
2. Run the SQL from `supabase-storage-setup.sql` in the SQL Editor to create buckets and policies

Or manually create buckets:

**Profile Photos Bucket:**
- Name: `profile-photos`
- Public: Yes
- File size limit: 10MB
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`

**Verification Documents Bucket:**
- Name: `verification-documents`
- Public: No
- File size limit: 20MB
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`

### 2.2 Storage Policies

The storage setup SQL will create the necessary RLS policies for:
- Users can upload/manage their own photos
- Users can view public profile photos
- Users can manage their own verification documents
- Admins can view all verification documents

## Step 3: Edge Functions Setup

### 3.1 Install Supabase CLI

```bash
npm install -g supabase
```

### 3.2 Login to Supabase

```bash
supabase login
```

### 3.3 Link Your Project

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### 3.4 Deploy Edge Functions

Deploy each edge function:

```bash
# Create profile
supabase functions deploy create-profile

# Create couple profile
supabase functions deploy create-couple-profile

# Upload profile photo
supabase functions deploy upload-profile-photo

# Save profile preferences
supabase functions deploy save-profile-preferences

# Save profile interests
supabase functions deploy save-profile-interests

# Save profile boundaries
supabase functions deploy save-profile-boundaries

# Save profile safe sex practices
supabase functions deploy save-profile-safe-sex

# Complete profile
supabase functions deploy complete-profile
```

### 3.5 Set Environment Variables

Set these environment variables in your Supabase project:

1. Go to **Settings** > **Edge Functions**
2. Add these environment variables:
   - `SUPABASE_URL`: Your project URL
   - `SUPABASE_ANON_KEY`: Your anon key

## Step 4: Update Your Code

### 4.1 Replace ProfileSetup Component

Replace your existing `ProfileSetup.tsx` with `ProfileSetupUpdated.tsx`:

```bash
cp client/src/components/ProfileSetupUpdated.tsx client/src/components/ProfileSetup.tsx
```

### 4.2 Update Environment Variables

Make sure your `.env` file has the correct Supabase configuration:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Step 5: Test the Setup

### 5.1 Test Profile Creation

1. Start your development server
2. Navigate to the profile setup page
3. Fill out the form step by step
4. Verify data is saved to the database

### 5.2 Test Photo Upload

1. Try uploading profile photos
2. Verify photos appear in the Supabase Storage bucket
3. Check that photo records are created in the `profile_photos` table

### 5.3 Test Edge Functions

You can test edge functions directly:

```bash
# Test create profile
curl -X POST 'https://your-project-ref.supabase.co/functions/v1/create-profile' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"display_name": "Test User", "age": 25, "gender": "male", "sexuality": "straight", "relationship_status": "single"}'
```

## Step 6: Production Considerations

### 6.1 Security

- Review all RLS policies to ensure they meet your security requirements
- Consider adding additional validation in edge functions
- Set up proper CORS policies for your domain

### 6.2 Performance

- Monitor database performance and add indexes as needed
- Consider implementing caching for frequently accessed data
- Set up monitoring for edge function performance

### 6.3 Backup

- Set up automated database backups
- Consider implementing data retention policies
- Test restore procedures

## Troubleshooting

### Common Issues

1. **RLS Policy Errors**: Make sure all tables have proper RLS policies
2. **Storage Upload Failures**: Check bucket permissions and file size limits
3. **Edge Function Timeouts**: Increase timeout limits if needed
4. **CORS Issues**: Ensure proper CORS headers are set

### Debug Steps

1. Check Supabase logs in the dashboard
2. Use browser developer tools to inspect network requests
3. Verify environment variables are correctly set
4. Test edge functions individually using curl or Postman

## Support

If you encounter issues:

1. Check the Supabase documentation
2. Review the edge function logs
3. Verify your database schema matches the provided schema
4. Ensure all environment variables are correctly configured

## Next Steps

After completing this setup:

1. Test all functionality thoroughly
2. Set up monitoring and alerts
3. Consider implementing additional features like:
   - Real-time notifications
   - Advanced matching algorithms
   - Admin dashboard
   - Analytics and reporting

Your SPICE dating app should now be fully functional with Supabase backend!