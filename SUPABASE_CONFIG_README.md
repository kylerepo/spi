# Supabase Configuration Guide

## Overview

This application is now fully configured to use Supabase for:
- **User Authentication** - Supabase Auth with JWT tokens
- **Database Operations** - PostgreSQL with Row Level Security (RLS)
- **File Storage** - Two storage buckets for profile photos and verification documents

## Environment Variables

Add these to your `.env` file:

```env
# Supabase Configuration
SUPABASE_URL=https://zjyoqxqcdzxwtkmqamas.supabase.co
VITE_SUPABASE_URL=https://zjyoqxqcdzxwtkmqamas.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important:** Replace `your_service_role_key_here` with your actual Supabase service role key from your Supabase project settings.

## Server Files Structure

### 1. `/server/supabase.ts` - Supabase Clients

Creates two Supabase clients:

- **`supabaseAdmin`** - Service role client (bypasses RLS) for backend operations
- **`supabase`** - Anon key client (respects RLS) for user authentication

```typescript
import { supabaseAdmin, supabase } from './supabase';
```

### 2. `/server/db.ts` - Database Service

Type-safe database operations for all tables:

```typescript
import { db } from './db';

// User operations
await db.getUser(userId);
await db.getUserByEmail(email);
await db.updateUser(userId, updates);

// Profile operations
await db.getProfile(profileId);
await db.getProfileByUserId(userId);
await db.createProfile(profileData);
await db.updateProfile(profileId, updates);
await db.deleteProfile(profileId);

// Couple profile operations
await db.getCoupleProfile(profileId);
await db.createCoupleProfile(coupleData);
await db.updateCoupleProfile(profileId, updates);

// Photo operations
await db.getProfilePhotos(profileId);
await db.createProfilePhoto(photoData);
await db.deleteProfilePhoto(photoId);

// Preferences, Boundaries, Safe Sex
await db.getProfilePreferences(profileId);
await db.createProfilePreferences(data);
await db.updateProfilePreferences(profileId, updates);

// Similar methods for boundaries and safe sex...

// Interests
await db.getInterestCategories();
await db.getInterests();
await db.getProfileInterests(profileId);
await db.addProfileInterest(profileId, interestId);
await db.addCustomInterest(profileId, customInterest);

// Verifications
await db.getUserVerifications(userId);
await db.createUserVerification(data);
await db.getPendingVerifications();

// Blocks & Reports
await db.createUserBlock(blockerId, blockedUserId);
await db.deleteUserBlock(blockerId, blockedUserId);
await db.createUserReport(reporterId, reportedUserId, reason);
```

### 3. `/server/storage.ts` - Storage Service

File upload/download operations for two buckets:

```typescript
import { storage, STORAGE_BUCKETS } from './storage';

// Profile Photos (Public bucket, 10MB max, images only)
const result = await storage.uploadProfilePhoto(
  userId, 
  fileBuffer, 
  fileName, 
  contentType
);
// Returns: { path, url, fullPath }

const url = storage.getProfilePhotoUrl(storagePath);
await storage.deleteProfilePhoto(storagePath);
const photos = await storage.listProfilePhotos(userId);

// Verification Documents (Private bucket, 20MB max, images + PDFs)
const result = await storage.uploadVerificationDocument(
  userId, 
  fileBuffer, 
  fileName, 
  contentType
);
// Returns: { path, url (signed URL), fullPath }

const signedUrl = await storage.getVerificationDocumentUrl(storagePath);
await storage.deleteVerificationDocument(storagePath);
const docs = await storage.listVerificationDocuments(userId);

// Batch operations
await storage.deleteAllUserFiles(userId);
await storage.deleteMultipleFiles(bucketName, paths);
```

### 4. `/shared/schema.ts` - TypeScript Types

Comprehensive type definitions for all database tables and operations:

```typescript
import type {
  User,
  Profile,
  CoupleProfile,
  ProfilePhoto,
  ProfilePreferences,
  ProfileBoundaries,
  ProfileSafeSex,
  UserVerification,
  InsertProfile,
  UpdateProfile,
  // ... many more types
} from '@shared/schema';

// Enums
import { 
  AccountType, 
  Gender, 
  MembershipType, 
  VerificationStatus 
} from '@shared/schema';

// Validation schemas
import {
  createProfileSchema,
  updateProfileSchema,
  createPreferencesSchema,
  // ... more schemas
} from '@shared/schema';
```

## Database Schema

### Tables Created:
- `users` - User accounts (extends Supabase auth.users)
- `profiles` - User profiles with preferences
- `couple_profiles` - Additional info for couples
- `profile_photos` - Profile and gallery photos
- `interest_categories` - Interest categories
- `interests` - Available interests
- `profile_interests` - User selected interests
- `profile_preferences` - Sexual preferences
- `profile_boundaries` - Hard boundaries
- `profile_safe_sex` - Safe sex practices
- `user_verifications` - Verification documents
- `user_reports` - User reports
- `user_blocks` - Blocked users
- `app_settings` - Application settings

### Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:
- Users can only view/edit their own data
- Public profiles are visible to all authenticated users
- Moderators/admins have elevated permissions
- Private data (verifications, reports) is restricted

## Storage Buckets

### 1. `profile-photos` (Public Bucket)
- **Purpose:** User profile pictures and gallery photos
- **Access:** Public (anyone can view)
- **Max Size:** 10MB
- **Allowed Types:** `image/jpeg`, `image/png`, `image/webp`
- **Folder Structure:** `{userId}/{uuid}-{filename}.{ext}`

### 2. `verification-documents` (Private Bucket)
- **Purpose:** ID verification and document uploads
- **Access:** Private (requires signed URL)
- **Max Size:** 20MB
- **Allowed Types:** `image/jpeg`, `image/png`, `image/webp`, `application/pdf`
- **Folder Structure:** `{userId}/{uuid}-{filename}.{ext}`

## API Routes

### File Upload Endpoints

```typescript
// Upload profile photo
POST /api/upload/profile-photo
Content-Type: multipart/form-data
Authorization: Bearer {token}
Body: {
  photo: File,
  is_profile: "true" | "false",
  order: "0"
}

// Get profile photos
GET /api/profile-photos
Authorization: Bearer {token}

// Delete profile photo
DELETE /api/profile-photos/:photoId
Authorization: Bearer {token}

// Upload verification document
POST /api/upload/verification
Content-Type: multipart/form-data
Authorization: Bearer {token}
Body: {
  document: File,
  verification_type: "id" | "selfie" | "address"
}

// Get verifications
GET /api/verifications
Authorization: Bearer {token}
```

## Usage Examples

### Backend Example - Profile Creation

```typescript
import { db } from './server/db';
import { storage } from './server/storage';

async function createUserProfile(userId: string, data: any, photoFile: Buffer) {
  // 1. Create profile
  const profile = await db.createProfile({
    user_id: userId,
    account_type: 'single',
    profile_type: 'single_profile',
    display_name: data.displayName,
    bio: data.bio,
    age: data.age,
    is_profile_complete: false,
    is_visible: false,
    verification_status: 'pending',
    membership_type: 'free',
  });

  // 2. Upload profile photo
  const uploadResult = await storage.uploadProfilePhoto(
    userId,
    photoFile,
    'profile.jpg',
    'image/jpeg'
  );

  // 3. Save photo record
  await db.createProfilePhoto({
    profile_id: profile.id,
    url: uploadResult.url,
    storage_path: uploadResult.path,
    is_profile: true,
    order: 0,
    is_verified: false,
  });

  return profile;
}
```

### Backend Example - Verification Upload

```typescript
async function submitVerification(userId: string, documentBuffer: Buffer) {
  // 1. Upload document to private bucket
  const uploadResult = await storage.uploadVerificationDocument(
    userId,
    documentBuffer,
    'id-document.pdf',
    'application/pdf'
  );

  // 2. Create verification record
  const verification = await db.createUserVerification({
    user_id: userId,
    verification_type: 'government_id',
    file_url: uploadResult.url,
    storage_path: uploadResult.path,
    status: 'pending',
  });

  return verification;
}
```

### Frontend Example - File Upload

```typescript
async function uploadProfilePhoto(file: File) {
  const formData = new FormData();
  formData.append('photo', file);
  formData.append('is_profile', 'true');
  formData.append('order', '0');

  const response = await fetch('/api/upload/profile-photo', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    },
    body: formData
  });

  return response.json();
}
```

## Migration Steps

If you have existing data, follow these steps:

1. **Run SQL migrations** in Supabase SQL Editor:
   - `001_initial_schema.sql` - Create tables and types
   - `002_rls_policies.sql` - Set up security policies
   - `003_storage_setup.sql` - Create storage buckets
   - `004_seed_data.sql` - Add interest categories
   - `005_add_preference_fields.sql` - Add preference fields

2. **Verify buckets exist** in Supabase Dashboard > Storage

3. **Add environment variables** to `.env` file

4. **Restart your application**

## Testing

### Test Database Connection:

```bash
curl http://localhost:5000/api/health
```

### Test Authentication:

```bash
# Get your access token from Supabase Auth
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/profile
```

### Test File Upload:

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "photo=@/path/to/image.jpg" \
  -F "is_profile=true" \
  -F "order=0" \
  http://localhost:5000/api/upload/profile-photo
```

## Security Best Practices

1. **Never expose service role key** on the frontend
2. **Always use anon key** for client-side operations
3. **Validate file types and sizes** before upload
4. **Use signed URLs** for private documents
5. **Implement rate limiting** on upload endpoints
6. **Scan uploaded files** for malware (if needed)
7. **Set appropriate CORS policies** in Supabase

## Troubleshooting

### "Missing Supabase environment variables"
- Check that all required env vars are set in `.env`
- Restart your application after updating `.env`

### "Bucket not found"
- Verify buckets exist in Supabase Dashboard > Storage
- Run `003_storage_setup.sql` to create buckets

### "RLS policy error"
- Check that RLS policies are created in Supabase
- Run `002_rls_policies.sql` to set up policies

### "File upload fails"
- Check file size limits (10MB for photos, 20MB for docs)
- Verify file type is allowed
- Check storage bucket permissions

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Storage Guide](https://supabase.com/docs/guides/storage)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
