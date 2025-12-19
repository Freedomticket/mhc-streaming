# Deploy MHC Streaming RIGHT NOW 🚀

## What You Have Working
✅ Auth Service
✅ API Gateway  
✅ Payment Service
✅ PostgreSQL (local Docker)
✅ Redis (local Docker)

## Fastest Path to Live (5-10 minutes)

### Option 1: Railway (EASIEST - Recommended)

```powershell
# 1. Login to Railway
railway login
# This will open browser - sign up/in with GitHub

# 2. Create new project
railway init
# Enter project name: mhc-streaming

# 3. Add Postgres & Redis
railway add postgresql
railway add redis

# 4. Deploy Auth Service
cd services/auth-service
railway up
# Railway will auto-detect Node.js and deploy

# 5. Get the Auth Service URL
railway domain
# Copy the URL (e.g., https://auth-service-production-xxxx.up.railway.app)

# 6. Deploy API Gateway
cd ../api-gateway
railway up

# 7. Deploy Payment Service
cd ../payment-service
railway up

# 8. Set environment variables
railway variables
# Add:
# JWT_SECRET=<copy from .env>
# JWT_REFRESH_SECRET=<copy from .env>
# DATABASE_URL=<auto-set by Railway>
# REDIS_URL=<auto-set by Railway>

# 9. DONE! Test it
curl https://your-auth-service.up.railway.app/health
```

### Option 2: Render (Also Easy, Free Tier)

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repo (or upload manually)
4. Configure:
   - **Name:** mhc-auth-service
   - **Environment:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`
   - **Instance Type:** Free
5. Add environment variables
6. Click "Create Web Service"
7. Repeat for API Gateway and Payment Service

### Option 3: Quick Test Deploy (Vercel - Frontend Only)

While fixing backend deployment, you can at least get frontend up:

```powershell
cd frontend

# Quick fix for build
$env:SKIP_ENV_VALIDATION="true"

# Deploy
vercel --prod

# When prompted:
# - Project name: mhc-streaming-frontend
# - Framework: Next.js
# - Build settings: Default
```

## What To Do RIGHT NOW

**I recommend Railway because:**
- Automatic Postgres & Redis provisioning
- No credit card needed for trial
- Simple CLI
- Works with monorepos
- Free $5/month credit

**Steps:**
1. Run `railway login` 
2. Create project
3. Deploy services one by one
4. Add environment variables from your `.env`
5. Test endpoints

**Frontend will need fixing before deploy**, but your backend API will be LIVE and accessible!

## After Backend is Live

1. Test with Postman/Insomnia:
```
POST https://your-auth-service.railway.app/api/auth/register
{
  "email": "test@example.com",
  "username": "testuser",
  "password": "Test1234"
}
```

2. Fix frontend build (I can help)
3. Deploy frontend to Vercel pointing to Railway backend
4. 🎉 FULL STACK LIVE

## Current Blockers

- Frontend has React hooks build errors (fixable in 10 min)
- Media/Stream services incomplete (optional - not needed for MVP)

## Want Me To Deploy It?

Tell me to proceed and I'll:
1. Walk you through Railway login
2. Deploy each service
3. Configure everything
4. Give you live URLs
5. Test the endpoints

Ready? Say "deploy it" and let's go live! 🚀
