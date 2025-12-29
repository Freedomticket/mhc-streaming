# Render Configuration - Step by Step Guide

## 🎯 Goal
Configure the API Gateway on Render so frontend can use it instead of calling auth-service directly.

---

## 📋 Steps to Complete on Render Dashboard

### Step 1: Login to Render
1. Go to https://dashboard.render.com
2. Login with your account

---

### Step 2: Find API Gateway Service
1. In the dashboard, look for service named **`mhc-api-gateway`**
2. Click on it to open

---

### Step 3: Check Current Environment Variables
1. Click the **"Environment"** tab (left sidebar)
2. Scroll through the list and check if you see these variables:
   - `AUTH_SERVICE_URL`
   - `MEDIA_SERVICE_URL`
   - `PAYMENT_SERVICE_URL`

**If you see them:** ✅ Skip to Step 5  
**If you DON'T see them:** ❌ Continue to Step 4

---

### Step 4: Add Missing Environment Variables

For EACH variable below, do this:

1. Click **"Add Environment Variable"** button
2. Enter the **Key** (left field)
3. Enter the **Value** (right field)
4. Click the checkmark to save

#### Variables to Add:

```
Key: AUTH_SERVICE_URL
Value: https://mhc-auth-service.onrender.com

Key: MEDIA_SERVICE_URL
Value: https://mhc-media-service.onrender.com

Key: PAYMENT_SERVICE_URL
Value: https://mhc-payment-service.onrender.com

Key: STREAM_SERVICE_URL
Value: https://mhc-stream-service.onrender.com

Key: ANALYTICS_SERVICE_URL
Value: https://mhc-analytics-service.onrender.com

Key: ALLOWED_ORIGINS
Value: https://mhc-streaming.vercel.app,http://localhost:3000
```

5. After adding all variables, scroll to bottom and click **"Save Changes"**

---

### Step 5: Wait for Redeploy
1. Render will automatically redeploy the service
2. You'll see "Deploying..." status
3. **Wait 2-3 minutes** for deployment to complete
4. Status should turn green and say "Live"

---

### Step 6: Check Logs (Optional but Recommended)
1. Click the **"Logs"** tab
2. Look for lines like:
   ```
   🚪 API Gateway running on port 10000
   Routing to services:
     - Auth: https://mhc-auth-service.onrender.com
     - Media: https://mhc-media-service.onrender.com
     ...
   ```
3. If you see these, the environment variables are working! ✅

---

### Step 7: Test API Gateway

Open PowerShell on your computer and run:

```powershell
curl https://mhc-api-gateway.onrender.com/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "service": "api-gateway",
  "timestamp": "2025-12-29T...",
  "services": {
    "auth": "https://mhc-auth-service.onrender.com",
    ...
  }
}
```

If you see the service URLs listed, it's working! ✅

---

### Step 8: Redeploy Auth Service (IMPORTANT!)

The auth service code was just updated to fix the `/me` endpoint bug. You need to trigger a redeploy:

1. Go back to Render dashboard
2. Click on **`mhc-auth-service`**
3. Click **"Manual Deploy"** button (top right)
4. Select **"Clear build cache & deploy"**
5. Wait 2-3 minutes for deployment

---

### Step 9: Test Full Login Flow

Back on your computer:

```powershell
cd frontend
npm run health:check
```

**Expected Output:**
```
✅ Auth Service - HEALTHY
✅ Payment Service - HEALTHY
✅ Media Service - HEALTHY
✅ API Gateway - HEALTHY

✅ All services are healthy!
```

---

### Step 10: Update Frontend to Use API Gateway

Once API Gateway is verified working:

1. Open `frontend/.env.local` in your code editor
2. Change this line:
   ```
   NEXT_PUBLIC_API_URL=https://mhc-auth-service.onrender.com
   ```
   To:
   ```
   NEXT_PUBLIC_API_URL=https://mhc-api-gateway.onrender.com
   ```
3. Save the file

---

### Step 11: Test Login with API Gateway

1. **IMPORTANT:** Restart your dev server:
   ```powershell
   # Stop current server (Ctrl+C)
   npm run dev
   ```

2. Go to http://localhost:3000/login

3. Try logging in

4. **It should work!** ✅

---

## 🎉 Success Checklist

- [ ] API Gateway has all environment variables configured
- [ ] API Gateway shows service URLs in logs
- [ ] Health check passes for all services
- [ ] Auth service redeployed with `/me` endpoint fix
- [ ] Frontend `.env.local` updated to use API Gateway
- [ ] Login works through API Gateway
- [ ] Dashboard loads user data successfully

---

## 🚨 Troubleshooting

### If API Gateway still returns 404:
1. Check the **Logs** tab - look for errors
2. Verify environment variables are saved (check Environment tab)
3. Try **Manual Deploy** → **Clear build cache & deploy**

### If login fails after switching to API Gateway:
1. Check browser console for errors (F12)
2. Look for CORS errors
3. Verify `ALLOWED_ORIGINS` includes `http://localhost:3000`

### If dashboard doesn't load user data:
1. Check if auth service was redeployed (Step 8)
2. Open browser console and check for 401 errors
3. Verify access token is in localStorage: `localStorage.getItem('access_token')`

---

## 📞 Need Help?

Run the health check and share the output:
```powershell
cd frontend
npm run health:check
```

This will show exactly which services are having issues.

---

## ✅ Once Everything Works

Commit the frontend change:

```powershell
git add frontend/.env.local
git commit -m "Switch to API Gateway for all API calls

All backend services configured and verified on Render.

Co-Authored-By: Warp <agent@warp.dev>"
git push origin master
```

🎉 **DONE! Your API architecture is now properly configured!**
