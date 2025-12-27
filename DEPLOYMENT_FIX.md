# MHC Streaming - Deployment Fix Guide

## Problem
The auth service on Render.com is returning 500 errors because Prisma Client is not being generated during deployment.

## Root Cause
The `build` script in `services/auth-service/package.json` and `services/payment-service/package.json` was missing `prisma generate` command.

## Solution Applied

### 1. Fixed Build Scripts
Updated both service package.json files to include:
```json
"scripts": {
  "build": "prisma generate && tsc",
  "postinstall": "prisma generate"
}
```

### 2. Created render.yaml
Added Infrastructure-as-Code configuration for Render.com deployment.

## Deployment Steps for Render.com

### Option A: Using render.yaml (Recommended)
1. Push these changes to GitHub
2. In Render dashboard, go to "Blueprints"
3. Click "New Blueprint Instance"
4. Connect your mhc-streaming repository
5. Render will automatically create all services from render.yaml

### Option B: Manual Update (Quick Fix)
For your existing auth service:
1. Go to Render dashboard → mhc-auth-service
2. Go to "Environment" tab
3. Verify these environment variables exist:
   - `DATABASE_URL` (should point to your Postgres instance)
   - `JWT_SECRET` (any random 32+ character string)
   - `JWT_REFRESH_SECRET` (different random string)
4. Go to "Settings" tab
5. Update "Build Command" to:
   ```
   npm install && npm run build
   ```
6. Click "Manual Deploy" → "Deploy latest commit"

### Required Environment Variables

#### Auth Service
- `NODE_ENV=production`
- `PORT=10000` (Render assigns this)
- `DATABASE_URL` (from Render Postgres)
- `REDIS_URL` (from Render Redis)
- `JWT_SECRET` (generate: `openssl rand -hex 32`)
- `JWT_REFRESH_SECRET` (generate: `openssl rand -hex 32`)
- `ALLOWED_ORIGINS=https://your-frontend.onrender.com,http://localhost:3000`

#### Payment Service
- Same as Auth Service, plus:
- `STRIPE_SECRET_KEY` (from Stripe dashboard)
- `STRIPE_WEBHOOK_SECRET` (from Stripe webhook settings)

## Database Setup

After deployment, run migrations:
```bash
# From your local machine with DATABASE_URL set
cd packages/database
npx prisma migrate deploy
```

Or use Render Shell:
1. Go to service → "Shell" tab
2. Run:
```bash
cd packages/database
npx prisma migrate deploy
```

## Testing

After redeployment:
```bash
# Test auth service
curl https://mhc-auth-service.onrender.com/health

# Test registration
curl -X POST https://mhc-auth-service.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "TestPassword123!"
  }'
```

## Common Issues

### "Prisma Client not found"
- Solution: Redeploy with updated build command

### "Database connection failed"
- Check DATABASE_URL is set correctly
- Verify Postgres instance is running
- Check if IP whitelist is blocking connection

### "JWT_SECRET is not defined"
- Add JWT_SECRET environment variable
- Redeploy service

## Local Development

To run services locally:
```bash
# Terminal 1 - Auth Service
cd services/auth-service
npm install
npm run dev

# Terminal 2 - Payment Service  
cd services/payment-service
npm install
npm run dev

# Terminal 3 - Frontend
cd frontend
npm install
npm run dev
```

Make sure `.env` file exists at root with:
```
DATABASE_URL="postgresql://user:password@localhost:5432/mhc_streaming"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-secret-key-at-least-32-characters-long"
JWT_REFRESH_SECRET="different-secret-key-also-32-characters"
```
