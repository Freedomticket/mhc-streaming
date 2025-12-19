# MHC Streaming - Vercel Deployment Guide

## ✅ What's Ready
- Backend services (Auth, API Gateway, Payment) built and tested
- Database schema ready
- Frontend Next.js app (needs build fixes before deploy)

## 🚀 Quick Deployment Steps

### Step 1: Deploy Backend Services to Vercel

Since Vercel is primarily for frontend, we'll use **Vercel Serverless Functions** for the backend API or deploy backend separately.

**Option A: Backend on Vercel (Recommended for simplicity)**

1. **Create separate Vercel projects for each service:**

```powershell
# Deploy API Gateway
cd services/api-gateway
vercel --prod

# Deploy Auth Service  
cd ../auth-service
vercel --prod

# Deploy Payment Service
cd ../payment-service
vercel --prod
```

2. **Set environment variables in Vercel dashboard:**
   - Go to https://vercel.com/dashboard
   - For each project, add environment variables:
     - `DATABASE_URL`
     - `REDIS_URL` 
     - `JWT_SECRET`
     - `JWT_REFRESH_SECRET`
     - `ALLOWED_ORIGINS`

**Option B: Backend on Railway/Render (Better for long-running services)**

```powershell
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy each service
cd services/auth-service
railway up

cd ../api-gateway
railway up

cd ../payment-service
railway up
```

### Step 2: Set Up Database

**Option A: Vercel Postgres (Easiest)**
1. Go to Vercel dashboard → Storage → Create Database → Postgres
2. Copy connection string
3. Run migrations:
```powershell
$env:DATABASE_URL="<your-vercel-postgres-url>"
npm run db:push --workspace=@mhc/database
```

**Option B: External Postgres (More control)**
- Use [Supabase](https://supabase.com) (free tier)
- Use [Neon](https://neon.tech) (free tier)
- Use [Railway](https://railway.app) Postgres

**Option C: Keep Docker locally and expose**
- Use [ngrok](https://ngrok.com) or similar to expose local Docker Postgres
- Not recommended for production

### Step 3: Set Up Redis

**Options:**
1. **Upstash Redis** (Vercel-recommended, serverless):
   ```powershell
   # Go to https://upstash.com
   # Create Redis database
   # Copy REDIS_URL
   ```

2. **Redis Cloud** (free tier):
   - https://redis.com/try-free/

3. **Railway Redis**:
   ```powershell
   railway add redis
   ```

### Step 4: Fix Frontend Build

The frontend has React hooks issues in static generation. Two approaches:

**Quick Fix (Deploy as is with dynamic rendering):**

```powershell
cd frontend

# Add this to each problematic page at the top (after imports):
# export const dynamic = 'force-dynamic'

# Or update next.config.js to disable static optimization:
```

Add to `frontend/next.config.js`:
```javascript
experimental: {
  runtime: 'nodejs',
},
```

**Better Fix (Fix the actual issues):**
- The build errors are from trying to use React Context during static generation
- Need to move client-side logic to client components properly

### Step 5: Deploy Frontend

```powershell
cd frontend

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

During deployment, Vercel will ask:
1. **Set up and deploy?** → Yes
2. **Which scope?** → Your account
3. **Link to existing project?** → No
4. **Project name?** → mhc-streaming-frontend
5. **Directory?** → ./
6. **Override settings?** → Yes
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### Step 6: Configure Environment Variables

In Vercel dashboard for frontend project:

```
NEXT_PUBLIC_API_URL=https://your-api-gateway.vercel.app
DATABASE_URL=<your-postgres-url>
REDIS_URL=<your-redis-url>
JWT_SECRET=<your-jwt-secret>
JWT_REFRESH_SECRET=<your-refresh-secret>
```

### Step 7: Connect Services

Update API Gateway environment variables to point to deployed services:

```
AUTH_SERVICE_URL=https://auth-service.vercel.app
MEDIA_SERVICE_URL=https://media-service.vercel.app
PAYMENT_SERVICE_URL=https://payment-service.vercel.app
```

## 🔧 Alternative: All-in-One Deployment

**Railway (Recommended for full-stack):**

1. Create `railway.toml` in project root:
```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm run dev"
```

2. Deploy:
```powershell
railway login
railway init
railway up
```

Railway automatically:
- Detects monorepo structure
- Provisions Postgres & Redis
- Handles environment variables
- Provides domains

## ⚡ Current Status

### ✅ Working Locally
- PostgreSQL & Redis (Docker)
- Auth Service (port 3001)
- API Gateway (port 4000)
- Payment Service (port 3004)

### 🔧 Needs Fixing Before Deploy
- Frontend build errors (React hooks in static pages)
- Media & Stream services (incomplete/have cloud dependencies)
- Analytics service (untested)

### 📋 Deployment Checklist

- [ ] Choose database hosting (Vercel Postgres / Supabase / Neon)
- [ ] Choose Redis hosting (Upstash / Redis Cloud / Railway)
- [ ] Deploy Auth Service
- [ ] Deploy API Gateway
- [ ] Deploy Payment Service
- [ ] Configure environment variables
- [ ] Fix frontend build issues
- [ ] Deploy frontend
- [ ] Test end-to-end flow
- [ ] Set up custom domain (optional)
- [ ] Configure SSL (automatic on Vercel)

## 🎯 Recommended Next Steps

1. **Keep it simple first:**
   - Deploy backend to Railway (easier for Node services)
   - Use Railway Postgres & Redis (automatic provisioning)
   - Fix frontend build
   - Deploy frontend to Vercel (best for Next.js)

2. **Test the deployment:**
   ```powershell
   # Test auth
   curl https://your-auth-service.railway.app/health
   
   # Test registration
   curl -X POST https://your-auth-service.railway.app/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@test.com","username":"testuser","password":"Test1234"}'
   ```

3. **Go live:**
   - Point frontend to production API
   - Test all user flows
   - Monitor logs in Vercel/Railway dashboards

## 💡 Pro Tips

- Use Vercel's preview deployments for testing
- Set up GitHub integration for auto-deploy on push
- Use Railway's database backups
- Monitor with Vercel Analytics
- Set up error tracking (Sentry)

## 🆘 Need Help?

Check logs:
```powershell
# Vercel logs
vercel logs

# Railway logs
railway logs
```

Common issues:
1. **Build fails:** Check Node version matches (18+)
2. **Database connection:** Verify DATABASE_URL format
3. **CORS errors:** Update ALLOWED_ORIGINS
4. **Auth failures:** Check JWT secrets match across services

---

**Ready to deploy?** Start with Railway for backend (simplest), then Vercel for frontend once build is fixed!
