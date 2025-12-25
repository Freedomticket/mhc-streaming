# 🚀 Render.com Deployment (EASIEST!)

## ⚡ One-Click Deploy (2 Minutes!)

Render has a **Blueprint** feature - one file deploys EVERYTHING at once!

---

## **Step 1: Sign Up** (30 seconds)
1. Go to: **https://render.com/**
2. Click **"Get Started for Free"**
3. **"Sign in with GitHub"**
4. Authorize Render

---

## **Step 2: Deploy with Blueprint** (1 minute)
1. Click **"New +"** (top right)
2. Select **"Blueprint"**
3. Select your repo: **`Freedomticket/mhc-streaming`**
4. Render finds `render.yaml` automatically
5. Click **"Apply"**

**That's it!** Render deploys:
- ✅ PostgreSQL database
- ✅ Redis cache
- ✅ Auth service
- ✅ Media service
- ✅ Payment service
- ✅ Royalty service

All at once!

---

## **Step 3: Wait for Deployment** (5-10 minutes)

Watch the dashboard - services will turn green one by one:
- Databases start first (1-2 min)
- Then services build and deploy (3-5 min each)

---

## **Step 4: Add Stripe Key** (30 seconds)

After deployment, add your Stripe key:
1. Click **"mhc-payment-service"**
2. Go to **"Environment"**
3. Add:
   ```
   STRIPE_SECRET_KEY = sk_test_your_stripe_key
   ```
4. Click **"Save Changes"** → Service redeploys automatically

---

## **Step 5: Get Service URLs** (30 seconds)

Each service gets a public URL like:
- `https://mhc-auth-service.onrender.com`
- `https://mhc-media-service.onrender.com`
- `https://mhc-payment-service.onrender.com`
- `https://mhc-royalty-service.onrender.com`

Copy these URLs - you'll need them for your frontend!

---

## **Step 6: Deploy Frontend to Vercel** (2 minutes)

1. Go to: **https://vercel.com**
2. Login with GitHub
3. **"New Project"** → Select `mhc-streaming`
4. Set **Root Directory**: `frontend`
5. Add environment variables:
   ```
   NEXT_PUBLIC_AUTH_URL=https://mhc-auth-service.onrender.com
   NEXT_PUBLIC_MEDIA_URL=https://mhc-media-service.onrender.com
   NEXT_PUBLIC_PAYMENT_URL=https://mhc-payment-service.onrender.com
   NEXT_PUBLIC_ROYALTY_URL=https://mhc-royalty-service.onrender.com
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```
6. Click **"Deploy"**

**DONE! Your app is LIVE!** 🎉

---

## 💰 Pricing

| Service | Cost |
|---------|------|
| Render (4 services + DB + Redis) | **$7/month** (Starter plan) |
| Vercel (Frontend) | **FREE** |
| **Total** | **$7/month** |

**First 90 days = FREE** (Render free tier)

---

## ✅ Advantages Over Railway

1. **Blueprint = One-Click Deploy** (vs manual service setup)
2. **Free tier = 750 hours/month** (enough for 1 service 24/7)
3. **Better monorepo support** (handles workspaces automatically)
4. **Free SSL certificates** (automatic HTTPS)
5. **Better logs & monitoring** (easier debugging)

---

## 🆘 Troubleshooting

### Build failed?
- Check **"Logs"** tab on the failed service
- Usually a missing dependency or build command issue
- Click **"Manual Deploy"** to retry

### Service crashed?
- Click service → **"Logs"** → Look for errors
- Check database URL is set correctly
- Verify all environment variables are present

### Can't connect to database?
- Make sure services finished deploying
- Database takes 1-2 minutes to fully start
- Check **"Environment"** tab for DATABASE_URL

---

## 🚀 Auto-Deploy

Render auto-deploys on every GitHub push!

```bash
git add .
git commit -m "Update backend"
git push
```

Services rebuild automatically! 🎉

---

## 🎯 Next Steps

1. **Test registration** at your Vercel URL
2. **Upload music** - test media service
3. **Test payments** with Stripe test mode
4. **Add custom domain** ($12/year)

---

## 📊 Monitoring

Render Dashboard shows:
- ✅ Service status (green = running)
- 📈 CPU/Memory usage
- 📋 Live logs
- 🔔 Deploy notifications

Much easier than Railway! 🚀
