# 🔧 Environment Variable Setup Guide

## Your Database Connection

I can see you've provided your database connection string. Let me help you set this up properly for both local development and Vercel deployment.

---

## 📋 Your Connection Details

**Database URL**: `postgresql://postgres.zjyoqxqcdzxwtkmqamas:[Nelson?el?1982]@aws-1-us-east-2.pooler.supabase.com:5432/postgres`

**Extracted Information**:
- **Host**: `aws-1-us-east-2.pooler.supabase.com`
- **Port**: `5432`
- **Database**: `postgres`
- **Username**: `postgres.zjyoqxqcdzxwtkmqamas`
- **Password**: `Nelson?el?1982`

---

## 🔐 Security Warning

⚠️ **IMPORTANT**: I can see your database password. For security:
1. Change your database password immediately in Supabase
2. Use the new password in your environment variables
3. Never share connection strings publicly

---

## 🛡️ Step 1: Secure Your Database (Required)

### Change Database Password:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → Database
4. Click "Reset database password"
5. Generate a new strong password
6. Save the new password securely

---

## 📝 Step 2: Update Environment Variables

### For Local Development:

Update your `.env` file:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres.zjyoqxqcdzxwtkmqamas:[YOUR_NEW_PASSWORD]@aws-1-us-east-2.pooler.supabase.com:5432/postgres

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Frontend Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Server Configuration
PORT=5000
NODE_ENV=development
SESSION_SECRET=your_random_session_secret_here
```

### For Vercel Deployment:

Add these to Vercel → Settings → Environment Variables:

```
DATABASE_URL=postgresql://postgres.zjyoqxqcdzxwtkmqamas:[YOUR_NEW_PASSWORD]@aws-1-us-east-2.pooler.supabase.com:5432/postgres
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
NODE_ENV=production
SESSION_SECRET=your_random_session_secret_here
```

---

## 🔍 Step 3: Verify Your Setup

### Test Connection Locally:
```bash
# Update your .env file with the new password
# Then test the connection
npm run dev

# Test database connection
curl http://localhost:5000/api/health
```

### Test in Vercel:
1. Update environment variables in Vercel
2. Redeploy your application
3. Test the production URL

---

## 🌐 Step 4: Get Your Supabase Project Details

Since your database host shows `aws-1-us-east-2.pooler.supabase.com`, you need to find your actual Supabase project URL.

### Find Your Supabase Project:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Note your project URL (it will be like `https://[project-id].supabase.co`)
3. Get your anon key from Settings → API
4. Get your service role key from Settings → API

---

## ⚙️ Complete Environment Configuration

### Your Updated `.env` Should Look Like:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres.zjyoqxqcdzxwtkmqamas:[YOUR_NEW_PASSWORD]@aws-1-us-east-2.pooler.supabase.com:5432/postgres

# Backend Supabase Configuration
SUPABASE_URL=https://[YOUR_PROJECT_ID].supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IltZT1VSX1BST0pFQ1RfSURdIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5OTUzNDc4NywiZXhwIjoyMDc1MTEwNzg3fQ.[YOUR_SERVICE_ROLE_KEY]

# Frontend Supabase Configuration
VITE_SUPABASE_URL=https://[YOUR_PROJECT_ID].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IltZT1VSX1BST0pFQ1RfSURdIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTk1MzQ3ODcsImV4cCI6MjA3NTExMDc4N30.[YOUR_ANON_KEY]

# Server Configuration
PORT=5000
NODE_ENV=development
SESSION_SECRET=your_random_session_secret_here
```

---

## 🔧 Step 5: Generate Session Secret

Create a strong random string:

```bash
# On Mac/Linux:
openssl rand -base64 32

# Or use Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 🧪 Step 6: Test Your Configuration

### Local Test:
```bash
# Start your app
npm run dev

# In another terminal, test health endpoint
curl http://localhost:5000/api/health

# Should return: {"status":"ok","timestamp":"..."}
```

### Database Connection Test:
```bash
# Test database connection
npx tsx -e "
import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://[YOUR_PROJECT_ID].supabase.co', 'your_anon_key');
const { data, error } = await supabase.from('profiles').select('*').limit(1);
console.log('Connection test:', error ? 'Failed' : 'Success');
"
```

---

## 🚀 Step 7: Deploy to Vercel

### Update Vercel Environment Variables:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to Settings → Environment Variables
4. Add all variables from your `.env` file
5. Redeploy your application

---

## ✅ Verification Checklist

### Local Development:
- [ ] Server starts without errors
- [ ] Health endpoint returns 200
- [ ] Database connection works
- [ ] All API endpoints work
- [ ] No database connection errors

### Vercel Deployment:
- [ ] Environment variables set
- [ ] Deployment successful
- [ ] Production URL accessible
- [ ] API endpoints working
- [ ] No environment variable errors

---

## 🔍 Troubleshooting

### Issue: "Database connection failed"
**Check**:
- Database password is correct
- DATABASE_URL format is correct
- Database is accessible from Vercel IPs

**Fix**:
1. Verify password in Supabase
2. Check connection string format
3. Test connection locally first

### Issue: "Invalid connection string format"
**Check**:
- No spaces in the URL
- Special characters properly encoded
- Password doesn't contain problematic characters

**Fix**:
```bash
# Encode special characters in password
# Replace @ with %40, ? with %3F, etc.
```

### Issue: "Service role key not working"
**Check**:
- Using correct service role key
- Not exposing it in frontend code
- Key has correct permissions

**Fix**:
1. Get service role key from Supabase Dashboard
2. Use only on backend
3. Keep it secret

---

## 📚 Related Documentation

- `MISSING_RLS_POLICIES.sql` - SQL policies to run
- `VERCEL_DEPLOYMENT_GUIDE.md` - Complete deployment guide
- `QUICK_DEPLOY.md` - Quick deployment steps
- `SUPABASE_FIX_GUIDE.md` - Complete implementation guide

---

## 🎯 Next Steps

1. **Immediately**: Change your database password
2. **Update**: All environment variables with new password
3. **Test**: Database connection locally
4. **Deploy**: Updated configuration to Vercel
5. **Verify**: Everything works in production

---

## ⚠️ Security Reminder

**CRITICAL**: Change your database password immediately. The connection string you provided should not be used in production.

**Best Practices**:
- Use strong, unique passwords
- Rotate passwords regularly
- Keep service role keys secret
- Use environment variables for all secrets
- Never commit secrets to version control

---

**Last Updated**: 2025-10-05  
**Status**: Ready for secure configuration ✅