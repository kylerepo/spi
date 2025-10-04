# SPICE Dating App - Deployment Guide

## Deployment Options

This guide covers deploying the SPICE dating app to various platforms.

---

## Option 1: Vercel (Recommended)

Vercel is the easiest and fastest way to deploy this app.

### Prerequisites
- GitHub account
- Vercel account (free tier works)
- Supabase project set up

### Steps

#### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### 2. Import to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect the settings

#### 3. Configure Environment Variables
In Vercel dashboard, add these environment variables:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

#### 4. Deploy
Click "Deploy" and wait for the build to complete (~2 minutes)

#### 5. Custom Domain (Optional)
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### Vercel Configuration

The `vercel.json` file is already configured with:
- Static file serving
- SPA routing
- Environment variable handling

---

## Option 2: Netlify

### Steps

#### 1. Create netlify.toml
```toml
[build]
  command = "npm run build"
  publish = "dist/client"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

#### 2. Deploy via Netlify CLI
```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

#### 3. Set Environment Variables
In Netlify dashboard:
1. Go to Site Settings → Environment Variables
2. Add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

---

## Option 3: Railway

### Steps

#### 1. Install Railway CLI
```bash
npm install -g @railway/cli
```

#### 2. Login and Initialize
```bash
railway login
railway init
```

#### 3. Add Environment Variables
```bash
railway variables set VITE_SUPABASE_URL=your-url
railway variables set VITE_SUPABASE_ANON_KEY=your-key
```

#### 4. Deploy
```bash
railway up
```

---

## Option 4: AWS (Advanced)

### Using AWS Amplify

#### 1. Install Amplify CLI
```bash
npm install -g @aws-amplify/cli
amplify configure
```

#### 2. Initialize Amplify
```bash
amplify init
```

#### 3. Add Hosting
```bash
amplify add hosting
amplify publish
```

### Using AWS S3 + CloudFront

#### 1. Build the App
```bash
npm run build
```

#### 2. Create S3 Bucket
```bash
aws s3 mb s3://spice-dating-app
aws s3 website s3://spice-dating-app --index-document index.html
```

#### 3. Upload Files
```bash
aws s3 sync dist/client s3://spice-dating-app
```

#### 4. Set Up CloudFront
- Create CloudFront distribution
- Point to S3 bucket
- Configure SSL certificate

---

## Option 5: Docker Deployment

### Create Dockerfile
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist/client /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Create nginx.conf
```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Build and Run
```bash
docker build -t spice-app .
docker run -p 80:80 \
  -e VITE_SUPABASE_URL=your-url \
  -e VITE_SUPABASE_ANON_KEY=your-key \
  spice-app
```

---

## Environment Variables

### Required Variables
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### Optional Variables
```env
NODE_ENV=production
PORT=5000
```

---

## Post-Deployment Checklist

### 1. Verify Deployment
- [ ] App loads correctly
- [ ] All assets load (images, fonts)
- [ ] No console errors
- [ ] Authentication works
- [ ] Profile creation works
- [ ] Swiping works
- [ ] Messaging works

### 2. Configure Domain
- [ ] Set up custom domain
- [ ] Configure SSL certificate
- [ ] Update CORS settings in Supabase

### 3. Performance
- [ ] Enable compression
- [ ] Configure CDN
- [ ] Set up caching headers
- [ ] Optimize images

### 4. Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Configure analytics (Google Analytics)
- [ ] Set up uptime monitoring
- [ ] Configure alerts

### 5. Security
- [ ] Enable HTTPS
- [ ] Configure CSP headers
- [ ] Set up rate limiting
- [ ] Review Supabase RLS policies

---

## Supabase Configuration for Production

### 1. Update Allowed URLs
In Supabase dashboard:
1. Go to Authentication → URL Configuration
2. Add your production URL to:
   - Site URL
   - Redirect URLs

### 2. Configure Email Templates
1. Go to Authentication → Email Templates
2. Customize email templates
3. Update redirect URLs

### 3. Set Up Custom SMTP (Optional)
For better email deliverability:
1. Go to Project Settings → Auth
2. Configure custom SMTP settings

### 4. Enable Realtime
Ensure Realtime is enabled for:
- `matches` table
- `messages` table

---

## Performance Optimization

### 1. Enable Compression
Most platforms enable this by default, but verify:
- Gzip/Brotli compression
- Asset minification

### 2. CDN Configuration
- Use CDN for static assets
- Configure cache headers
- Enable HTTP/2

### 3. Image Optimization
- Use WebP format where possible
- Implement lazy loading
- Use responsive images

### 4. Code Splitting
Already configured in Vite, but verify:
- Route-based splitting
- Component lazy loading

---

## Monitoring and Analytics

### Recommended Tools

#### Error Tracking
- **Sentry**: Real-time error tracking
- **LogRocket**: Session replay

#### Analytics
- **Google Analytics**: User behavior
- **Mixpanel**: Event tracking
- **Hotjar**: Heatmaps and recordings

#### Performance
- **Lighthouse**: Performance audits
- **WebPageTest**: Detailed performance analysis
- **New Relic**: Application monitoring

---

## Scaling Considerations

### Database
- Monitor Supabase usage
- Upgrade plan as needed
- Consider read replicas for high traffic

### Storage
- Monitor storage usage
- Implement image compression
- Consider CDN for images

### Realtime
- Monitor concurrent connections
- Upgrade Supabase plan if needed
- Implement connection pooling

---

## Backup Strategy

### Database Backups
Supabase provides automatic backups, but also:
1. Set up manual backup schedule
2. Export data regularly
3. Test restore procedures

### Storage Backups
1. Regularly backup storage bucket
2. Implement versioning
3. Test restore procedures

---

## Rollback Plan

### Quick Rollback
Most platforms support instant rollback:

**Vercel:**
```bash
vercel rollback
```

**Netlify:**
- Go to Deploys
- Click "Publish deploy" on previous version

**Railway:**
```bash
railway rollback
```

---

## Troubleshooting

### Build Fails
- Check Node.js version (18+)
- Verify all dependencies installed
- Check environment variables

### App Loads but Features Don't Work
- Verify environment variables
- Check Supabase connection
- Review browser console errors

### Slow Performance
- Enable compression
- Configure CDN
- Optimize images
- Check database queries

### Authentication Issues
- Verify Supabase URL configuration
- Check redirect URLs
- Review RLS policies

---

## Cost Estimation

### Vercel (Recommended)
- **Free Tier**: Good for development/testing
- **Pro ($20/month)**: Suitable for small apps
- **Enterprise**: For large-scale apps

### Supabase
- **Free Tier**: 500MB database, 1GB storage
- **Pro ($25/month)**: 8GB database, 100GB storage
- **Team/Enterprise**: Custom pricing

### Total Estimated Cost
- **Development**: $0/month (free tiers)
- **Small Production**: ~$45/month
- **Medium Production**: ~$100-200/month
- **Large Scale**: Custom pricing

---

## Support

For deployment issues:
1. Check platform-specific documentation
2. Review error logs
3. Check Supabase status page
4. Contact platform support

---

## Next Steps After Deployment

1. Set up monitoring and alerts
2. Configure analytics
3. Implement A/B testing
4. Set up CI/CD pipeline
5. Create staging environment
6. Document deployment process
7. Train team on deployment procedures

---

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [Supabase Documentation](https://supabase.com/docs)
- [Railway Documentation](https://docs.railway.app)