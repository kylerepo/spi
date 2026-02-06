# Neon Database Migration & Deployment Guide

## Overview
This guide walks you through migrating from Supabase to Neon database for your swingers dating app. The migration includes:
- Complete database schema setup
- Authentication system migration
- File storage with Vercel Blob
- Updated frontend hooks and components

## Prerequisites
- Neon database account (sign up at neon.tech)
- Vercel account for blob storage
- Node.js 18+ installed

## Step 1: Set up Neon Database

### 1.1 Create Neon Project
1. Go to [neon.tech](https://neon.tech) and create an account
2. Create a new project named "spice-dating-app"
3. Copy the database connection string:
   ```
   postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/spice?sslmode=require
   ```

### 1.2 Update Environment Variables
Update your `.env` file with the new Neon credentials:

```bash
# Neon Database Configuration
DATABASE_URL=postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/spice?sslmode=require
DIRECT_URL=postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/spice?sslmode=require

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Storage Configuration (Vercel Blob)
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token

# Server Configuration
PORT=5000
NODE_ENV=development
SESSION_SECRET=your-random-session-secret-here

# App Configuration
APP_URL=http://localhost:5173
API_URL=http://localhost:5000
```

### 1.3 Install Dependencies
```bash
npm install
```

## Step 2: Database Migration

### 2.1 Push Schema to Neon
```bash
npm run db:push
```

This will create all tables, indexes, and triggers in your Neon database.

### 2.2 Verify Migration
```bash
npm run dev
```

The app should start with the new Neon database.

## Step 3: Set up Vercel Blob Storage

### 3.1 Get Vercel Blob Token
1. Go to [vercel.com](https://vercel.com)
2. Navigate to your project settings
3. Go to "Storage" tab
4. Create a new Blob store
5. Copy the read-write token
6. Add to your environment variables as `BLOB_READ_WRITE_TOKEN`

## Step 4: Update Frontend Components

### 4.1 Update Authentication
The new authentication system uses:
- `useAuthNeon` hook instead of Supabase auth
- JWT tokens stored in localStorage
- Custom backend authentication

### 4.2 Update Profile Setup
The ProfileSetup component now uses:
- `useProfileNeon` hook
- Vercel Blob for photo uploads
- Direct API calls to the Neon backend

## Step 5: Deploy to Vercel

### 5.1 Update Vercel Configuration
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/client/dist/$1"
    }
  ],
  "env": {
    "DATABASE_URL": "@database-url",
    "DIRECT_URL": "@direct-url",
    "JWT_SECRET": "@jwt-secret",
    "BLOB_READ_WRITE_TOKEN": "@blob-token"
  }
}
```

### 5.2 Deploy Commands
```bash
# Build the frontend
npm run build

# Deploy to Vercel
vercel --prod
```

## Step 6: Testing

### 6.1 Test Authentication
1. Register a new account
2. Verify email (if implemented)
3. Login with credentials

### 6.2 Test Profile Setup
1. Navigate to profile setup
2. Fill in basic information
3. Select interests
4. Upload photos (test with multiple files)
5. Complete profile

### 6.3 Test Photo Uploads
1. Upload single photo
2. Upload multiple photos (up to 6)
3. Delete photos
4. Set profile photo

### 6.4 Test Discovery
1. Create multiple profiles
2. Test swiping functionality
3. Check for matches
4. Send messages between matched users

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Profile Management
- `GET /api/profile` - Get current user's profile
- `POST /api/profile` - Create new profile
- `PUT /api/profile` - Update profile
- `POST /api/profile/complete` - Complete profile setup

### Photo Management
- `POST /api/profile/photos` - Upload single photo
- `POST /api/profile/photos/multiple` - Upload multiple photos
- `GET /api/profile/photos` - Get profile photos
- `DELETE /api/profile/photos/:photoId` - Delete photo
- `POST /api/profile/photos/:photoId/set-profile` - Set profile photo

### Discovery
- `GET /api/interests` - Get all interests
- `GET /api/discovery` - Get profiles for discovery
- `POST /api/swipe` - Swipe on a profile

### Matches & Messages
- `GET /api/matches` - Get user's matches
- `GET /api/matches/:matchId/messages` - Get messages for match
- `POST /api/matches/:matchId/messages` - Send message
- `POST /api/matches/:matchId/messages/read` - Mark messages as read

## Database Schema

### Core Tables
- `users` - User accounts and authentication
- `profiles` - User profiles and preferences
- `couple_profiles` - Additional info for couple accounts
- `profile_photos` - User photos and metadata
- `profile_interests` - User interests and hobbies

### Discovery Tables
- `swipes` - User swipes and actions
- `matches` - Mutual matches between users
- `messages` - Messages between matched users

### Preferences Tables
- `profile_preferences` - User preferences and desires
- `profile_boundaries` - User boundaries and limits
- `profile_safe_sex` - Safe sex practices

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify DATABASE_URL in environment variables
   - Check if Neon database is accessible
   - Ensure SSL is enabled: `?sslmode=require`

2. **Photo Uploads Not Working**
   - Verify BLOB_READ_WRITE_TOKEN is set
   - Check file size limits (5MB)
   - Ensure file types are images

3. **Authentication Issues**
   - Check JWT_SECRET is set
   - Verify token expiration settings
   - Clear browser localStorage and try again

4. **CORS Errors**
   - Ensure API_URL and APP_URL match your deployment URLs
   - Check CORS configuration in server

### Debug Commands
```bash
# Check database connection
npx tsx server/neon-db.ts

# Test API endpoints
curl http://localhost:5000/api/health

# Check environment variables
vercel env ls
```

## Production Considerations

### Security
- Use strong JWT_SECRET (256-bit key)
- Enable HTTPS everywhere
- Implement rate limiting
- Add input validation and sanitization

### Performance
- Add database connection pooling
- Implement caching for expensive queries
- Use CDN for static assets
- Optimize photo sizes and formats

### Monitoring
- Set up error tracking (Sentry)
- Add database monitoring
- Monitor API response times
- Set up alerts for critical errors

## Support
For issues or questions:
1. Check the troubleshooting section above
2. Review the API logs in Vercel dashboard
3. Test locally before deploying
4. Create GitHub issues for bugs