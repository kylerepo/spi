# ✅ Correct Environment Configuration

## Your Supabase Project Details

Based on your `.env` file, you have:
- **Project URL**: `https://hvafquyruidsvteerdwf.supabase.co`
- **Anon Key**: Already configured correctly

You need to get the missing credentials for YOUR project.

---

## 🎯 What You Need to Get

### 1. Service Role Key (Required for Backend)
### 2. Database URL (Required for Drizzle)
### 3. Session Secret (Required for Security)

---

## 🔐 Step 1: Get Your Service Role Key

### Go to Supabase Dashboard:
1. Visit [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Find your project with URL: `https://hvafquyruidsvteerdwf.supabase.co`
3. Click on your project
4. Go to **Settings** → **API**
5. Look for **service_role** key (NOT the anon key)
6. Copy the service role key (starts with `eyJ...`)

---

## 🗄️ Step 2: Get Your Database Connection Details

### Method 1: From Supabase Dashboard
1. In your Supabase project, go to **Settings** → **Database**
2. Look for **Connection string** or **URI**
3. Copy the connection string for **psql**
4. It should look like: `postgresql://postgres:[PASSWORD]@db.hvafquyruidsvteerdwf.supabase.co:5432/postgres`

### Method 2: From Connection Pooling (If Available)
1. Go to **Settings** → **Database**
2. Look for **Connection pooling** section
3. Copy the connection string for your region
4. It might look like: `postgresql://postgres:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres`

---

## 🔑 Step 3: Generate Session Secret

Run this command to generate a secure session secret:

```bash
# On Mac/Linux:
openssl rand -base64 32

# On Windows (PowerShell):
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString() + [System.Guid]::NewGuid().ToString()))
```

Or use Node.js:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 📝 Step 4: Update Your .env File

Update your `.env` file with the correct information:

```env
# Supabase Configuration (Frontend)
VITE_SUPABASE_URL=https://hvafquyruidsvteerdwf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2YWZxdXlydWlkc3Z0ZWVyZHdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MzQ3ODcsImV4cCI6MjA3NTExMDc4N30.Eu74Afz66mSLrEJK1B2g4WG3OoOTL4dT55LABL_Eu0s

# Backend Supabase Configuration (Server-side operations)
SUPABASE_URL=https://hvafquyruidsvteerdwf.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[YOUR_SERVICE_ROLE_KEY_HERE]

# Database Configuration (for Drizzle - optional if using Supabase exclusively)
DATABASE_URL=postgresql://postgres:[YOUR_DATABASE_PASSWORD]@db.hvafquyruidsvteerdwf.supabase.co:5432/postgres

# Server Configuration
PORT=5000
NODE_ENV=development
SESSION_SECRET=[YOUR_RANDOM_SESSION_SECRET_HERE]
```

---

## 🧪 Step 5: Test Your Configuration

### Test Locally:
```bash
# Start your app
npm run dev

# Test health endpoint
curl http://localhost:5000/api/health

# Should return: {"status":"ok","timestamp":"..."}
```

### Test Database Connection:
```bash
# Create a simple test script
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://hvafquyruidsvteerdwf.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2YWZxdXlydWlkc3Z0ZWVyZHdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MzQ3ODcsImV4cCI6MjA3NTExMDc4N30.Eu74Afz66mSLrEJK1B2g4WG3OoOTL4dT55LABL_Eu0s');
const { data, error } = await supabase.from('profiles').select('*').limit(1);
console.log('Connection test:', error ? 'Failed' : 'Success');
"
```

---

## 🚀 Step 6: Deploy to Vercel

### For Vercel Deployment:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to Settings → Environment Variables
4. Add all variables from your `.env` file
5. Click "Save" and then "Redeploy"

### Environment Variables to Add:
```
VITE_SUPABASE_URL=https://hvafquyruidsvteerdwf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2YWZxdXlydWlkc3Z0ZWVyZHdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MzQ3ODcsImV4cCI6MjA3NTExMDc4N30.Eu74Afz66mSLrEJK1B2g4WG3OoOTL4dT55LABL_Eu0s
SUPABASE_URL=https://hvafquyruidsvteerdwf.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[YOUR_SERVICE_ROLE_KEY]
DATABASE_URL=postgresql://postgres:[YOUR_DATABASE_PASSWORD]@db.hvafquyruidsvteerdwf.supabase.co:5432/postgres
NODE_ENV=production
SESSION_SECRET=[YOUR_RANDOM_SESSION_SECRET]
```

---

## ✅ Verification Checklist

### Local Development:
- [ ] Server starts without errors
- [ ] Health endpoint returns 200
- [ ] Database connection works
- [ ] All API endpoints work

### Vercel Deployment:
- [ ] Environment variables set
- [ ] Deployment successful
- [ ] Production URL accessible
- [ ] API endpoints working

---

## 🔍 Finding Your Credentials

### Where to Find Each Credential:

1. **Service Role Key**: Supabase Dashboard → Settings → API → service_role
2. **Database Password**: Supabase Dashboard → Settings → Database → Reset password
3. **Database Connection String**: Supabase Dashboard → Settings → Database → Connection string
4. **Session Secret**: Generate yourself (see Step 3)

---

## 🐛 Common Issues

### Issue: "Service role key not found"
**Fix**: Go to Supabase Dashboard → Settings → API → Copy service_role key (not anon key)

### Issue: "Database connection failed"
**Fix**: 
1. Check DATABASE_URL format
2. Verify password is correct
3. Test connection locally first

### Issue: "Environment variable not found"
**Fix**: 
1. Check variable names match exactly
2. Verify all environments (Production, Preview, Development)
3. Redeploy after adding variables

---

## 📚 Related Documentation

- `MISSING_RLS_POLICIES.sql` - SQL policies to run
- `VERCEL_DEPLOYMENT_GUIDE.md` - Complete deployment guide
- `QUICK_DEPLOY.md` - Quick deployment steps
- `ENVIRONMENT_SETUP.md` - Environment setup guide

---

## 🎯 Next Steps

1. **Get your credentials** from Supabase Dashboard
2. **Update your `.env` file** with the correct values
3. **Test locally** to ensure everything works
4. **Deploy to Vercel** with the updated environment variables
5. **Test production** to verify deployment

---

**Last Updated**: 2025-10-05  
**Status**: Ready for configuration ✅