# 🚀 Vercel Deployment Guide - Step by Step

Complete guide to deploy your Supabase dating app to Vercel with zero downtime.

---

## 📋 Prerequisites

Before deploying, ensure you have:
- ✅ Completed local setup (see `QUICK_IMPLEMENTATION.md`)
- ✅ Supabase service role key
- ✅ All SQL policies run in Supabase
- ✅ Storage bucket configured
- ✅ App tested locally and working
- ✅ GitHub repository up to date

---

## 🎯 Deployment Overview

### What We'll Do:
1. Prepare the application for production
2. Create Vercel account and project
3. Configure environment variables
4. Deploy the application
5. Configure custom domain (optional)
6. Test production deployment
7. Set up continuous deployment

**Total Time**: 15-20 minutes

---

## 📦 Step 1: Prepare Application for Production (5 minutes)

### 1.1 Verify Build Configuration

Check that `vercel.json` exists and is configured correctly:

```bash
cd spi
cat vercel.json
```

Your `vercel.json` should look like this:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": null,
  "outputDirectory": "dist/public",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 1.2 Verify Package.json Scripts

Check your build scripts:

```bash
cat package.json | grep -A 5 '"scripts"'
```

Should include:
```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist/server",
    "vercel-build": "npm run build",
    "start": "NODE_ENV=production node dist/server/index.js"
  }
}
```

### 1.3 Test Production Build Locally

```bash
# Build the application
npm run build

# Check if build succeeded
ls -la dist/

# You should see:
# dist/public/    - Frontend files
# dist/server/    - Backend files
```

### 1.4 Commit Any Pending Changes

```bash
# Check status
git status

# Add any changes
git add .

# Commit
git commit -m "Prepare for Vercel deployment"

# Push to GitHub
git push origin main
```

---

## 🌐 Step 2: Create Vercel Account & Project (3 minutes)

### 2.1 Sign Up for Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your GitHub account

### 2.2 Import Your Repository

1. On Vercel Dashboard, click "Add New..." → "Project"
2. Find your repository: `TheMagicMannn/spi`
3. Click "Import"

### 2.3 Configure Project Settings

**Framework Preset**: Select "Other" (we have custom configuration)

**Root Directory**: Leave as `.` (root)

**Build Command**: 
```bash
npm run build
```

**Output Directory**:
```
dist/public
```

**Install Command**:
```bash
npm install
```

**Development Command**:
```bash
npm run dev
```

---

## 🔐 Step 3: Configure Environment Variables (5 minutes)

### 3.1 Add Environment Variables in Vercel

In the Vercel project settings, go to "Environment Variables" and add these:

#### Frontend Variables:
```
Name: VITE_SUPABASE_URL
Value: https://hvafquyruidsvteerdwf.supabase.co
Environment: Production, Preview, Development
```

```
Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2YWZxdXlydWlkc3Z0ZWVyZHdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MzQ3ODcsImV4cCI6MjA3NTExMDc4N30.Eu74Afz66mSLrEJK1B2g4WG3OoOTL4dT55LABL_Eu0s
Environment: Production, Preview, Development
```

#### Backend Variables:
```
Name: SUPABASE_URL
Value: https://hvafquyruidsvteerdwf.supabase.co
Environment: Production, Preview, Development
```

```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: [YOUR_SERVICE_ROLE_KEY_HERE]
Environment: Production, Preview, Development
```

```
Name: DATABASE_URL
Value: postgresql://postgres:[YOUR-PASSWORD]@db.hvafquyruidsvteerdwf.supabase.co:5432/postgres
Environment: Production, Preview, Development
```

```
Name: NODE_ENV
Value: production
Environment: Production
```

```
Name: SESSION_SECRET
Value: [GENERATE_RANDOM_STRING]
Environment: Production, Preview, Development
```

### 3.2 Generate Session Secret

Generate a secure random string for SESSION_SECRET:

```bash
# On Mac/Linux:
openssl rand -base64 32

# Or use Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output and use it as your SESSION_SECRET value.

### 3.3 Get Your Database Password

If you don't have your database password:
1. Go to Supabase Dashboard → Settings → Database
2. Click "Reset database password"
3. Copy the new password
4. Update DATABASE_URL with the password

---

## 🚀 Step 4: Deploy the Application (2 minutes)

### 4.1 Initial Deployment

1. After adding environment variables, click "Deploy"
2. Vercel will:
   - Clone your repository
   - Install dependencies
   - Build the application
   - Deploy to production

**Wait for deployment to complete** (usually 2-3 minutes)

### 4.2 Check Deployment Status

You'll see:
- ✅ Building
- ✅ Deploying
- ✅ Ready

### 4.3 Get Your Production URL

Once deployed, you'll get a URL like:
```
https://spi-xxxxx.vercel.app
```

---

## 🧪 Step 5: Test Production Deployment (5 minutes)

### 5.1 Test Health Endpoint

```bash
curl https://your-app.vercel.app/api/health
```

Expected response:
```json
{"status":"ok","timestamp":"2025-10-04T..."}
```

### 5.2 Test Frontend

1. Open your Vercel URL in browser
2. You should see the landing page
3. Check browser console for errors

### 5.3 Test Authentication Flow

1. Click "Sign Up"
2. Create a test account
3. Check email for verification
4. Verify email
5. Complete profile setup
6. Upload photos
7. Test discovery/swiping

### 5.4 Test API Endpoints

```bash
# Replace with your actual URL
export API_URL="https://your-app.vercel.app"

# Test health
curl $API_URL/api/health

# Test interests (public endpoint)
curl $API_URL/api/interests
```

---

## 🌍 Step 6: Configure Custom Domain (Optional - 5 minutes)

### 6.1 Add Custom Domain

1. In Vercel Dashboard, go to your project
2. Click "Settings" → "Domains"
3. Click "Add Domain"
4. Enter your domain (e.g., `myapp.com`)

### 6.2 Configure DNS

Vercel will provide DNS records. Add these to your domain registrar:

**For root domain (myapp.com):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 6.3 Wait for DNS Propagation

- Usually takes 5-60 minutes
- Vercel will automatically provision SSL certificate
- You'll get HTTPS automatically

### 6.4 Update Supabase Redirect URLs

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your custom domain to redirect URLs:
   ```
   https://myapp.com/**
   https://www.myapp.com/**
   ```

---

## 🔄 Step 7: Set Up Continuous Deployment (Already Done!)

### 7.1 Automatic Deployments

Vercel automatically deploys when you push to GitHub:

- **Push to `main`** → Deploys to production
- **Push to other branches** → Creates preview deployment
- **Pull requests** → Creates preview deployment

### 7.2 Test Continuous Deployment

```bash
# Make a small change
echo "# Test deployment" >> README.md

# Commit and push
git add README.md
git commit -m "Test continuous deployment"
git push origin main

# Check Vercel dashboard - new deployment should start automatically
```

### 7.3 Preview Deployments

Every pull request gets a unique preview URL:
```
https://spi-git-branch-name-username.vercel.app
```

---

## 🔧 Step 8: Configure Production Settings (Optional)

### 8.1 Environment-Specific Settings

In Vercel Dashboard → Settings → Environment Variables:

**Production Only:**
- Set `NODE_ENV=production`
- Use production database credentials
- Enable error tracking

**Preview/Development:**
- Can use staging database
- Enable debug logging

### 8.2 Build & Development Settings

In Vercel Dashboard → Settings → General:

**Node.js Version**: 18.x or 20.x
**Install Command**: `npm install`
**Build Command**: `npm run build`
**Output Directory**: `dist/public`

### 8.3 Function Settings

In Vercel Dashboard → Settings → Functions:

**Function Region**: Choose closest to your users
**Max Duration**: 10s (free tier) or 60s (pro)

---

## 📊 Step 9: Monitor Your Deployment

### 9.1 Check Deployment Logs

1. Go to Vercel Dashboard → Deployments
2. Click on latest deployment
3. View build logs and runtime logs

### 9.2 Monitor Performance

Vercel provides:
- Real-time analytics
- Performance metrics
- Error tracking
- Usage statistics

### 9.3 Set Up Alerts (Optional)

1. Go to Settings → Notifications
2. Configure:
   - Deployment notifications
   - Error alerts
   - Performance alerts

---

## 🐛 Troubleshooting

### Issue: Build Fails

**Check:**
1. Build logs in Vercel dashboard
2. Ensure all dependencies in package.json
3. Verify build command is correct
4. Check Node.js version compatibility

**Fix:**
```bash
# Test build locally first
npm run build

# If it works locally, check Vercel logs
```

### Issue: Environment Variables Not Working

**Check:**
1. All variables are set in Vercel
2. Variables are set for correct environment
3. Variable names match exactly (case-sensitive)
4. No extra spaces in values

**Fix:**
1. Go to Vercel → Settings → Environment Variables
2. Verify each variable
3. Redeploy after changes

### Issue: API Routes Return 404

**Check:**
1. `vercel.json` rewrites configuration
2. API routes are in correct location
3. Build output includes server files

**Fix:**
Ensure `vercel.json` has:
```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api"
    }
  ]
}
```

### Issue: Database Connection Fails

**Check:**
1. DATABASE_URL is correct
2. Database password is correct
3. Supabase allows connections from Vercel IPs

**Fix:**
1. Verify DATABASE_URL format
2. Test connection from Vercel function
3. Check Supabase connection pooling settings

### Issue: CORS Errors

**Check:**
1. CORS middleware in server/index.ts
2. Allowed origins configuration

**Fix:**
Already configured in `server/index.ts`:
```typescript
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});
```

### Issue: Authentication Not Working

**Check:**
1. Supabase redirect URLs include Vercel domain
2. Environment variables are correct
3. JWT tokens are being sent

**Fix:**
1. Add Vercel URL to Supabase redirect URLs
2. Clear browser cache and cookies
3. Test in incognito mode

### Issue: Photos Not Uploading

**Check:**
1. Storage bucket exists and is public
2. Storage policies are configured
3. File size limits

**Fix:**
1. Verify storage bucket in Supabase
2. Run SQL policies from `MISSING_RLS_POLICIES.sql`
3. Check file size (max 5MB)

---

## 🔒 Security Checklist

### Before Going Live:

- [ ] All environment variables set correctly
- [ ] Service role key not exposed in frontend
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Supabase RLS policies enabled
- [ ] Storage policies configured
- [ ] Rate limiting considered
- [ ] Error messages don't expose sensitive info
- [ ] CORS configured properly
- [ ] Session secrets are strong and unique
- [ ] Database credentials secure

---

## 📈 Performance Optimization

### 1. Enable Edge Functions (Optional)

For better performance, consider Vercel Edge Functions:
1. Go to Settings → Functions
2. Enable Edge Functions
3. Deploy to edge locations worldwide

### 2. Configure Caching

Add caching headers for static assets:
```typescript
// In server/index.ts
app.use(express.static('dist/public', {
  maxAge: '1y',
  etag: true
}));
```

### 3. Enable Compression

Already enabled in Vercel by default for:
- Gzip compression
- Brotli compression

### 4. Optimize Images

Use Vercel Image Optimization:
```typescript
// In your image URLs
<img src="/_next/image?url=/photo.jpg&w=800&q=75" />
```

---

## 🎯 Post-Deployment Checklist

### Immediate (Required):
- [ ] Test health endpoint
- [ ] Test authentication flow
- [ ] Test profile creation
- [ ] Test photo upload
- [ ] Test discovery/swiping
- [ ] Test messaging
- [ ] Verify all API endpoints work

### Short Term (Recommended):
- [ ] Set up custom domain
- [ ] Configure monitoring
- [ ] Set up error tracking
- [ ] Test on mobile devices
- [ ] Test in different browsers
- [ ] Create test accounts
- [ ] Verify email delivery

### Long Term (Optional):
- [ ] Set up analytics
- [ ] Configure CDN
- [ ] Implement caching strategy
- [ ] Set up backup system
- [ ] Create staging environment
- [ ] Document deployment process
- [ ] Set up CI/CD pipeline

---

## 🔄 Updating Your Deployment

### For Code Changes:

```bash
# Make your changes
git add .
git commit -m "Your changes"
git push origin main

# Vercel automatically deploys
```

### For Environment Variables:

1. Go to Vercel Dashboard → Settings → Environment Variables
2. Update the variable
3. Redeploy (click "Redeploy" button)

### For Database Schema Changes:

1. Run SQL in Supabase Dashboard
2. Test locally first
3. Deploy to production
4. Verify changes work

---

## 📊 Monitoring & Analytics

### Vercel Analytics

1. Go to your project → Analytics
2. View:
   - Page views
   - Unique visitors
   - Performance metrics
   - Error rates

### Custom Monitoring

Consider adding:
- Sentry for error tracking
- LogRocket for session replay
- Google Analytics for user behavior
- Mixpanel for product analytics

---

## 💰 Vercel Pricing

### Free Tier (Hobby):
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Preview deployments
- ✅ Analytics
- ⚠️ 10s function timeout
- ⚠️ 1 concurrent build

### Pro Tier ($20/month):
- ✅ Everything in Free
- ✅ 1 TB bandwidth/month
- ✅ 60s function timeout
- ✅ 10 concurrent builds
- ✅ Team collaboration
- ✅ Password protection
- ✅ Advanced analytics

**Recommendation**: Start with Free tier, upgrade when needed

---

## 🆘 Getting Help

### Vercel Support:
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [Vercel Support](https://vercel.com/support)

### Your Documentation:
- `SUPABASE_FIX_GUIDE.md` - Complete setup guide
- `QUICK_IMPLEMENTATION.md` - Quick start
- `TROUBLESHOOTING.md` - Common issues

---

## 🎉 Success!

Your app is now deployed to Vercel! 🚀

### Next Steps:
1. Share your app URL
2. Invite beta testers
3. Gather feedback
4. Iterate and improve

### Your Production URL:
```
https://your-app.vercel.app
```

---

## 📝 Quick Reference

### Useful Commands:

```bash
# Deploy from CLI (optional)
npm i -g vercel
vercel login
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs

# Pull environment variables
vercel env pull
```

### Important URLs:
- Vercel Dashboard: https://vercel.com/dashboard
- Your Project: https://vercel.com/[username]/spi
- Supabase Dashboard: https://supabase.com/dashboard
- Your App: https://your-app.vercel.app

---

**Last Updated**: 2025-10-04  
**Version**: 1.0  
**Status**: Production Ready ✅