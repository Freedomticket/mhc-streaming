# Render API Gateway Environment Variables

## Required Environment Variables

Go to https://dashboard.render.com → Select **mhc-api-gateway** service → **Environment** tab

Add these environment variables:

```
NODE_ENV=production
PORT=10000

# Service URLs - CRITICAL for routing
AUTH_SERVICE_URL=https://mhc-auth-service.onrender.com
MEDIA_SERVICE_URL=https://mhc-media-service.onrender.com  
PAYMENT_SERVICE_URL=https://mhc-payment-service.onrender.com
STREAM_SERVICE_URL=https://mhc-stream-service.onrender.com
ANALYTICS_SERVICE_URL=https://mhc-analytics-service.onrender.com

# CORS Configuration
ALLOWED_ORIGINS=https://mhc-streaming.vercel.app,http://localhost:3000
```

## How to Add:

1. Go to https://dashboard.render.com
2. Click on **mhc-api-gateway** service
3. Go to **Environment** tab
4. For each variable above:
   - Click **Add Environment Variable**
   - Enter **Key** (e.g., `AUTH_SERVICE_URL`)
   - Enter **Value** (e.g., `https://mhc-auth-service.onrender.com`)
   - Click **Save**
5. Click **Save Changes** at the bottom
6. Service will automatically redeploy (~2-3 minutes)

## Verification

After deployment, test the API Gateway:

```bash
# Test health endpoint
curl https://mhc-api-gateway.onrender.com/health

# Should return service URLs in response
```

Or run the health check script:
```bash
cd frontend
npm run health:check
```

## Current Status

According to render.yaml lines 44-69, these are already configured in the blueprint.

**If API Gateway was deployed via Blueprint:** ✅ Already configured  
**If API Gateway was deployed manually:** ❌ Needs manual configuration

Check the API Gateway logs in Render dashboard to see what service URLs it's using on startup.
