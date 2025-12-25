# 🚂 Railway.app Deployment Guide

## ⚡ Quick Deploy (5 Minutes)

### Step 1: Sign Up for Railway (1 minute)
1. Go to https://railway.app/
2. Click **"Login"** → **"Login with GitHub"**
3. Authorize Railway to access your GitHub
4. You get **$5 free credit** (no credit card needed to start!)

---

### Step 2: Create New Project (30 seconds)
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose **`Freedomticket/mhc-streaming`**
4. Railway will detect your services automatically

---

### Step 3: Add Database (30 seconds)
1. In your project, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway creates database automatically
4. Copy the **DATABASE_URL** (it will look like: `postgresql://postgres:password@host:5432/railway`)

---

### Step 4: Add Redis (30 seconds)
1. Click **"+ New"** again
2. Select **"Database"** → **"Add Redis"**
3. Copy the **REDIS_URL** (looks like: `redis://default:password@host:6379`)

---

### Step 5: Deploy Services (2 minutes)

For EACH service, you'll need to:

#### A. Auth Service
1. Click **"+ New"** → **"GitHub Repo"** → Select your repo
2. Click **"Settings"** → **"Environment"**
3. Add these variables:
   ```
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=[paste from Step 3]
   REDIS_URL=[paste from Step 4]
   JWT_SECRET=[generate random string]
   JWT_REFRESH_SECRET=[generate random string]
   ```
4. Click **"Settings"** → **"Build"**
5. Set **Root Directory**: `services/auth-service`
6. Click **"Deploy"**

#### B. Media Service
1. Click **"+ New"** → **"GitHub Repo"**
2. Add environment variables:
   ```
   NODE_ENV=production
   PORT=3002
   DATABASE_URL=[same as above]
   REDIS_URL=[same as above]
   AWS_REGION=us-east-1
   S3_BUCKET=mhc-media-bucket
   ```
3. Set **Root Directory**: `services/media-service`
4. Deploy

#### C. Payment Service
1. Click **"+ New"** → **"GitHub Repo"**
2. Add environment variables:
   ```
   NODE_ENV=production
   PORT=3004
   DATABASE_URL=[same as above]
   REDIS_URL=[same as above]
   STRIPE_SECRET_KEY=[your Stripe key]
   STRIPE_WEBHOOK_SECRET=[your Stripe webhook secret]
   ```
3. Set **Root Directory**: `services/payment-service`
4. Deploy

#### D. Royalty Service
1. Click **"+ New"** → **"GitHub Repo"**
2. Add environment variables:
   ```
   NODE_ENV=production
   PORT=3007
   DATABASE_URL=[same as above]
   REDIS_URL=[same as above]
   STRIPE_SECRET_KEY=[your Stripe key]
   ```
3. Set **Root Directory**: `services/royalty-service`
4. Deploy

---

### Step 6: Get Service URLs (30 seconds)

After each service deploys, Railway generates a public URL:
- Click each service → **"Settings"** → **"Generate Domain"**
- Copy each URL (e.g., `https://auth-service-production.up.railway.app`)

You'll need these for your frontend!

---

### Step 7: Update Frontend (1 minute)

Update `frontend/.env.local`:
```bash
NEXT_PUBLIC_AUTH_URL=https://your-auth-service.up.railway.app
NEXT_PUBLIC_MEDIA_URL=https://your-media-service.up.railway.app
NEXT_PUBLIC_PAYMENT_URL=https://your-payment-service.up.railway.app
NEXT_PUBLIC_ROYALTY_URL=https://your-royalty-service.up.railway.app

# Stripe (get from https://dashboard.stripe.com)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_...
```

---

### Step 8: Deploy Frontend (Vercel - Free!)

1. Go to https://vercel.com
2. Login with GitHub
3. Click **"New Project"**
4. Select `mhc-streaming`
5. Set **Root Directory**: `frontend`
6. Add environment variables from Step 7
7. Click **"Deploy"**

**DONE! Your app is LIVE! 🎉**

---

## 💰 Pricing Estimate

| Service | Cost |
|---------|------|
| Railway (4 services + DB) | $10-20/month |
| Vercel (Frontend) | **FREE** |
| **Total** | **$10-20/month** |

With free credits:
- Railway: $5 free
- Vercel: Unlimited free for personal use

**First month = ALMOST FREE!**

---

## 🔧 Generate Secrets

For JWT_SECRET and JWT_REFRESH_SECRET, run this in PowerShell:
```powershell
# Generate JWT Secret
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})

# Generate JWT Refresh Secret
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

---

## ✅ After Deployment

Your backend will be live at:
- Auth: `https://auth-service-xxx.up.railway.app`
- Media: `https://media-service-xxx.up.railway.app`
- Payment: `https://payment-service-xxx.up.railway.app`
- Royalty: `https://royalty-service-xxx.up.railway.app`

Your frontend will be live at:
- `https://mhc-streaming.vercel.app` (or your custom domain!)

---

## 🎯 Next Steps

1. **Test registration** - Sign up a user
2. **Upload music** - Test media service
3. **Test payments** - Use Stripe test mode
4. **Add custom domain** - Buy domain and connect to Vercel ($12/year)

---

## 🆘 Troubleshooting

### Service won't start?
- Check logs: Click service → "Deployments" → "View Logs"
- Verify DATABASE_URL and REDIS_URL are set

### Database connection error?
- Make sure DATABASE_URL includes `/railway` at the end
- Check database is running (should show green status)

### Frontend can't connect to backend?
- Verify service URLs in frontend .env.local
- Make sure you generated public domains for each service

---

## 🚀 Auto-Deploy

Railway automatically redeploys when you push to GitHub!

```bash
git add .
git commit -m "Update backend"
git push
```

Services rebuild in 1-2 minutes! 🎉
