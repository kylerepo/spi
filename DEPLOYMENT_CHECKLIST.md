# 🚀 Vercel Deployment Checklist

Quick reference checklist for deploying to Vercel.

---

## ✅ Pre-Deployment Checklist

### Local Setup Complete:
- [ ] App runs locally without errors
- [ ] All Supabase SQL policies run
- [ ] Storage bucket configured
- [ ] Service role key added to `.env`
- [ ] All features tested locally
- [ ] Latest code pushed to GitHub

### Supabase Configuration:
- [ ] Service role key obtained
- [ ] Database password known
- [ ] Storage bucket `photos` exists and is public
- [ ] All RLS policies applied
- [ ] Auth hooks configured

### Code Ready:
- [ ] `vercel.json` exists and configured
- [ ] Build scripts in `package.json` correct
- [ ] Production build tested locally (`npm run build`)
- [ ] No console errors in production build

---

## 🌐 Vercel Setup Checklist

### Account & Project:
- [ ] Vercel account created
- [ ] GitHub connected to Vercel
- [ ] Repository imported to Vercel
- [ ] Project settings configured

### Build Configuration:
- [ ] Framework: Other
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist/public`
- [ ] Install Command: `npm install`
- [ ] Node.js Version: 18.x or 20.x

---

## 🔐 Environment Variables Checklist

### Frontend Variables:
- [ ] `VITE_SUPABASE_URL` = `https://hvafquyruidsvteerdwf.supabase.co`
- [ ] `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Backend Variables:
- [ ] `SUPABASE_URL` = `https://hvafquyruidsvteerdwf.supabase.co`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = `[YOUR_SERVICE_ROLE_KEY]`
- [ ] `DATABASE_URL` = `postgresql://postgres:[PASSWORD]@db.hvafquyruidsvteerdwf.supabase.co:5432/postgres`
- [ ] `NODE_ENV` = `production` (Production only)
- [ ] `SESSION_SECRET` = `[RANDOM_32_CHAR_STRING]`

### Environment Settings:
- [ ] All variables set for Production
- [ ] All variables set for Preview
- [ ] All variables set for Development

---

## 🚀 Deployment Checklist

### Initial Deployment:
- [ ] Click "Deploy" in Vercel
- [ ] Wait for build to complete (2-3 minutes)
- [ ] Check for build errors
- [ ] Deployment shows "Ready" status
- [ ] Production URL generated

### Post-Deployment:
- [ ] Note production URL
- [ ] Update Supabase redirect URLs
- [ ] Clear browser cache

---

## 🧪 Testing Checklist

### API Testing:
- [ ] Health endpoint works: `curl https://your-app.vercel.app/api/health`
- [ ] Returns: `{"status":"ok","timestamp":"..."}`
- [ ] Interests endpoint works: `curl https://your-app.vercel.app/api/interests`

### Frontend Testing:
- [ ] Landing page loads
- [ ] No console errors
- [ ] Images load correctly
- [ ] Navigation works

### Authentication Testing:
- [ ] Sign up form works
- [ ] Email verification sent
- [ ] Email verification link works
- [ ] Sign in works
- [ ] Sign out works
- [ ] Session persists on refresh

### Profile Testing:
- [ ] Profile creation works
- [ ] Profile update works
- [ ] Photo upload works
- [ ] Photos display correctly
- [ ] Profile data saves

### Core Features Testing:
- [ ] Discovery shows profiles
- [ ] Swiping works (left/right)
- [ ] Matches created correctly
- [ ] Match notifications appear
- [ ] Messaging works
- [ ] Messages send/receive
- [ ] Real-time updates work

### Safety Features Testing:
- [ ] Block user works
- [ ] Unblock user works
- [ ] Report user works
- [ ] Blocked users don't appear

### Mobile Testing:
- [ ] Test on iPhone
- [ ] Test on Android
- [ ] Responsive design works
- [ ] Touch interactions work

### Browser Testing:
- [ ] Chrome/Edge
- [ ] Safari
- [ ] Firefox
- [ ] Mobile browsers

---

## 🔒 Security Checklist

### Environment Security:
- [ ] Service role key not in frontend code
- [ ] `.env` file not committed
- [ ] Secrets not in logs
- [ ] HTTPS enabled (automatic)

### Supabase Security:
- [ ] RLS policies enabled on all tables
- [ ] Storage policies configured
- [ ] Auth redirect URLs updated
- [ ] Database password secure

### Application Security:
- [ ] CORS configured correctly
- [ ] JWT authentication working
- [ ] Input validation working
- [ ] Error messages don't expose secrets

---

## 🌍 Custom Domain Checklist (Optional)

### Domain Configuration:
- [ ] Domain purchased
- [ ] Domain added in Vercel
- [ ] DNS records configured
- [ ] SSL certificate provisioned
- [ ] Domain redirects to HTTPS

### Supabase Update:
- [ ] Custom domain added to redirect URLs
- [ ] Email templates updated with domain
- [ ] Test authentication with custom domain

---

## 📊 Monitoring Checklist

### Vercel Monitoring:
- [ ] Analytics enabled
- [ ] Deployment notifications configured
- [ ] Error tracking reviewed
- [ ] Performance metrics checked

### Application Monitoring:
- [ ] Error logs reviewed
- [ ] API response times checked
- [ ] Database performance monitored
- [ ] Storage usage tracked

---

## 🔄 Continuous Deployment Checklist

### Git Workflow:
- [ ] Main branch deploys to production
- [ ] Feature branches create previews
- [ ] Pull requests create previews
- [ ] Automatic deployments working

### Testing Workflow:
- [ ] Test locally before pushing
- [ ] Review preview deployments
- [ ] Test before merging to main
- [ ] Monitor production after deploy

---

## 📈 Performance Checklist

### Optimization:
- [ ] Images optimized
- [ ] Caching configured
- [ ] Compression enabled
- [ ] CDN working

### Monitoring:
- [ ] Page load times acceptable
- [ ] API response times fast
- [ ] No memory leaks
- [ ] Database queries optimized

---

## 🆘 Troubleshooting Checklist

### If Build Fails:
- [ ] Check build logs in Vercel
- [ ] Test build locally: `npm run build`
- [ ] Verify all dependencies installed
- [ ] Check Node.js version

### If API Fails:
- [ ] Check environment variables
- [ ] Test health endpoint
- [ ] Review function logs
- [ ] Verify database connection

### If Auth Fails:
- [ ] Check Supabase redirect URLs
- [ ] Verify environment variables
- [ ] Clear browser cache
- [ ] Test in incognito mode

### If Photos Fail:
- [ ] Check storage bucket exists
- [ ] Verify storage policies
- [ ] Test file size (max 5MB)
- [ ] Check CORS settings

---

## ✅ Final Verification

### Production Ready When:
- [ ] All tests pass
- [ ] No console errors
- [ ] All features work
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Monitoring configured
- [ ] Documentation updated
- [ ] Team notified

---

## 🎯 Quick Commands

### Test Production:
```bash
# Health check
curl https://your-app.vercel.app/api/health

# Test interests
curl https://your-app.vercel.app/api/interests
```

### Deploy from CLI:
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### View Logs:
```bash
# Recent logs
vercel logs

# Follow logs
vercel logs --follow
```

---

## 📞 Support Resources

### Documentation:
- `VERCEL_DEPLOYMENT_GUIDE.md` - Complete guide
- `SUPABASE_FIX_GUIDE.md` - Supabase setup
- `TROUBLESHOOTING.md` - Common issues

### External Resources:
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Vercel Support](https://vercel.com/support)

---

## 🎉 Success Criteria

Your deployment is successful when:
- ✅ Production URL accessible
- ✅ All API endpoints working
- ✅ Authentication flow complete
- ✅ All features functional
- ✅ No critical errors
- ✅ Performance acceptable
- ✅ Security verified

---

**Print this checklist and check off items as you complete them!**

**Last Updated**: 2025-10-04  
**Version**: 1.0