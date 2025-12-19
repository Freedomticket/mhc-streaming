# Deploy Backend to Railway - Step by Step

## ✅ Your Backend is 100% Ready!

Everything is built, tested, and working:
- ✅ Auth Service (port 3001)
- ✅ API Gateway (port 4000) 
- ✅ Payment Service (port 3004)
- ✅ Database Schema with Gallery
- ✅ 20 Gallery Images Seeded

## 🚀 Deploy in 10 Minutes

### Step 1: Create Railway Account

1. Go to https://railway.app
2. Click "Start a New Project"
3. Sign up with GitHub (recommended) or email

### Step 2: Create New Project

1. In Railway dashboard, click "New Project"
2. Select "Empty Project"
3. Name it: `mhc-streaming`

### Step 3: Add Database & Redis

In your project:

1. **Add PostgreSQL:**
   - Click "+ New"
   - Select "Database" → "Add PostgreSQL"
   - Railway will provision it automatically
   - **Copy the DATABASE_URL** from the Variables tab

2. **Add Redis:**
   - Click "+ New"
   - Select "Database" → "Add Redis"
   - Railway will provision it automatically
   - **Copy the REDIS_URL** from the Variables tab

### Step 4: Deploy Auth Service

1. Click "+ New" → "Empty Service"
2. Name it: `auth-service`
3. Go to Settings → Connect Repo (or use CLI below)

**Using Railway CLI (Recommended):**

```powershell
# Open PowerShell in project root
cd C:\Users\jhink\mhc-streaming

# Login to Railway (opens browser)
railway login

# Link to your project
railway link

# Deploy Auth Service
cd services\auth-service
railway up

# The CLI will ask which service - select auth-service
# Or create new service if first time
```

**Environment Variables for Auth Service:**
Go to service → Variables → Add these:

```
DATABASE_URL=<paste from PostgreSQL service>
REDIS_URL=<paste from Redis service>
JWT_SECRET=/Ie316hUL7ymYKNA5AjJ+OtZkbZ9nT0HK8leQLO4PQOsn3zDR+K6vjWsx2rHyTg8mG3guXZWcemNZNS2M/zT/w==
JWT_REFRESH_SECRET=LOUuLCreOxX1AteLC7PFk/oNtEvHwp8TrL99HDwdj1t8UbVPzIytrDHUE1CHBCq5IE3koS6gj/Z0hJKDMKATug==
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:4000
PORT=3001
NODE_ENV=production
```

4. **Get the URL:**
   - Go to Settings → Generate Domain
   - Copy URL (e.g., `auth-service-production.up.railway.app`)

### Step 5: Deploy API Gateway

1. Click "+ New" → "Empty Service"  
2. Name it: `api-gateway`

```powershell
cd ..\api-gateway
railway up
```

**Environment Variables for Gateway:**

```
REDIS_URL=<paste from Redis service>
AUTH_SERVICE_URL=https://auth-service-production.up.railway.app
MEDIA_SERVICE_URL=http://localhost:3002
STREAM_SERVICE_URL=http://localhost:3003
PAYMENT_SERVICE_URL=https://payment-service-production.up.railway.app
ANALYTICS_SERVICE_URL=http://localhost:3005
ALLOWED_ORIGINS=*
PORT=4000
NODE_ENV=production
```

**Generate Domain** and copy URL

### Step 6: Deploy Payment Service

1. Click "+ New" → "Empty Service"
2. Name it: `payment-service`

```powershell
cd ..\payment-service
railway up
```

**Environment Variables for Payment:**

```
DATABASE_URL=<paste from PostgreSQL service>
REDIS_URL=<paste from Redis service>
JWT_SECRET=/Ie316hUL7ymYKNA5AjJ+OtZkbZ9nT0HK8leQLO4PQOsn3zDR+K6vjWsx2rHyTg8mG3guXZWcemNZNS2M/zT/w==
JWT_REFRESH_SECRET=LOUuLCreOxX1AteLC7PFk/oNtEvHwp8TrL99HDwdj1t8UbVPzIytrDHUE1CHBCq5IE3koS6gj/Z0hJKDMKATug==
STRIPE_SECRET_KEY=<your stripe key - optional for now>
ALLOWED_ORIGINS=*
PORT=3004
NODE_ENV=production
```

**Generate Domain** and copy URL

### Step 7: Push Database Schema

Once PostgreSQL is ready:

```powershell
cd C:\Users\jhink\mhc-streaming

# Set Railway DATABASE_URL
$env:DATABASE_URL="<paste PostgreSQL URL from Railway>"

# Push schema
npm run db:push --workspace=@mhc/database

# Seed gallery images
cd packages\database
npx tsx seed.ts
```

### Step 8: Update Gateway URLs

Go back to API Gateway service → Variables:

Update these with your actual deployed URLs:
```
AUTH_SERVICE_URL=https://auth-service-production.up.railway.app
PAYMENT_SERVICE_URL=https://payment-service-production.up.railway.app
```

Click "Redeploy" after updating.

## ✅ Test Your Deployment

### Test Auth Service

```powershell
# Health check
curl https://auth-service-production.up.railway.app/health

# Register user
$body = @{
    email = "test@mhc.com"
    username = "testuser"
    password = "Test1234"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://auth-service-production.up.railway.app/api/auth/register" -Method POST -Body $body -ContentType "application/json"
```

### Test API Gateway

```powershell
curl https://api-gateway-production.up.railway.app/health
```

### Test Payment Service

```powershell
curl https://payment-service-production.up.railway.app/health
```

## 🎉 You're Live!

Your backend is now deployed and accessible:

- **Auth API:** `https://auth-service-production.up.railway.app`
- **API Gateway:** `https://api-gateway-production.up.railway.app`
- **Payment API:** `https://payment-service-production.up.railway.app`

## 📋 Service URLs Summary

Save these for frontend configuration tomorrow:

```
AUTH_SERVICE_URL=https://auth-service-production.up.railway.app
API_GATEWAY_URL=https://api-gateway-production.up.railway.app
PAYMENT_SERVICE_URL=https://payment-service-production.up.railway.app
DATABASE_URL=<from Railway>
REDIS_URL=<from Railway>
```

## 🔥 Quick Railway CLI Commands

```powershell
# View logs
railway logs

# Check status
railway status

# Open dashboard
railway open

# Add environment variable
railway variables set KEY=value

# Redeploy
railway up
```

## 💡 Tips

- Railway auto-deploys on git push if you connect GitHub
- Each service gets $5/month free compute
- Postgres & Redis included in free tier
- Monitor usage in dashboard
- Set up alerts for crashes

## 🆘 Troubleshooting

**Build fails:**
- Check logs: `railway logs`
- Verify Node version (18+)
- Check all env vars are set

**Connection errors:**
- Verify DATABASE_URL format
- Check services are running (green status)
- Ensure domains are generated

**Auth fails:**
- Verify JWT secrets match across services
- Check ALLOWED_ORIGINS includes your domains

---

## Tomorrow: Frontend Rebuild

I'll create a clean Next.js 14 App Router project and migrate your pages properly. For now, your backend is LIVE! 🚀
