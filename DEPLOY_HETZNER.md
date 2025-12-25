# 🚀 Deploy to Hetzner Cloud (Skip Docker Hell!)

## Why Hetzner?
- ✅ Docker actually works on Linux
- ✅ $5-10/month (way cheaper than frustration)
- ✅ Fast servers in US/EU
- ✅ Simple setup
- ✅ Your backend running in 10 minutes

---

## Step 1: Create Hetzner Account (2 min)

1. Go to: https://www.hetzner.com/cloud
2. Sign up (free account)
3. Add payment method (they need it, won't charge yet)

---

## Step 2: Create Server (3 min)

### In Hetzner Console:

1. **Create New Project** → "MHC Streaming"
2. **Add Server:**
   - **Location:** Ashburn, VA (closest to you) or Hillsboro, OR
   - **Image:** Ubuntu 22.04
   - **Type:** CPX21 ($7.50/month) or CPX31 ($13/month)
     - CPX21: 3 vCPU, 4GB RAM (good for testing)
     - CPX31: 4 vCPU, 8GB RAM (better for production)
   - **Name:** mhc-backend

3. **Add SSH Key** (Important!)
   ```powershell
   # Generate SSH key if you don't have one
   ssh-keygen -t ed25519 -C "mhc-backend"
   # Just hit Enter 3 times for defaults
   
   # Copy public key
   Get-Content ~/.ssh/id_ed25519.pub
   ```
   Paste this into Hetzner "SSH Key" field

4. Click **Create & Buy Now**

5. **Copy the IP address** shown (e.g., 123.45.67.89)

---

## Step 3: Deploy Your Backend (5 min)

### SSH into server:
```powershell
ssh root@YOUR_SERVER_IP
```

### Run deployment script:
```bash
# Update system
apt update && apt upgrade -y

# Install Docker (actually works on Linux!)
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose -y

# Clone your repo
cd /opt
git clone https://github.com/Freedomticket/mhc-streaming.git
cd mhc-streaming

# Copy environment variables
cp .env.example .env
nano .env  # Edit with your real values

# Start everything!
docker-compose up -d

# Check it's running
docker-compose ps
```

---

## Step 4: Update Frontend to Use Hetzner (2 min)

### Update frontend/.env.local:
```env
NEXT_PUBLIC_API_URL=http://YOUR_SERVER_IP:3000
NEXT_PUBLIC_AUTH_URL=http://YOUR_SERVER_IP:3001
NEXT_PUBLIC_MEDIA_URL=http://YOUR_SERVER_IP:3002
NEXT_PUBLIC_PAYMENT_URL=http://YOUR_SERVER_IP:3004
```

---

## Step 5: Test It Works! (1 min)

```powershell
# Test from your Windows machine:
curl http://YOUR_SERVER_IP:3001/health
curl http://YOUR_SERVER_IP:3002/health

# Should both return {"status":"ok"}
```

---

## 🎯 DONE! Your backend is now running on real Linux!

### What's Working:
- ✅ Postgres database
- ✅ Redis cache
- ✅ Auth service (port 3001)
- ✅ Media service (port 3002)
- ✅ Payment service (port 3004)
- ✅ All other services

### Frontend on Windows:
- Runs locally: `npm run dev --prefix frontend`
- Connects to Hetzner backend via IP

---

## 🔒 Security (Do Later, Optional for Testing)

### Add Domain & SSL:
1. Point domain to server IP (A record)
2. Install Nginx + Let's Encrypt
3. Use HTTPS instead of HTTP

### Firewall:
```bash
# Allow only necessary ports
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw allow 3001  # Auth service
ufw allow 3002  # Media service
ufw allow 3004  # Payment service
ufw enable
```

---

## 💰 Cost Breakdown

### Hetzner CPX21 Server:
- **$7.50/month** for backend
- Includes:
  - 3 vCPU cores
  - 4 GB RAM
  - 80 GB SSD
  - 20 TB traffic

### Total Monthly Cost:
- **Hetzner:** $7.50
- **Domain (optional):** $12/year = $1/month
- **Total:** ~$8-9/month

**VS Fighting Docker on Windows:** PRICELESS! 😄

---

## 🆘 Troubleshooting

### Can't SSH:
```powershell
# Check SSH key is added
ssh-add ~/.ssh/id_ed25519
```

### Services won't start:
```bash
# Check logs
docker-compose logs -f

# Restart
docker-compose restart
```

### Out of memory:
Upgrade to CPX31 (8GB RAM) for $13/month

---

## 🎉 Next Steps After Deployed

1. ✅ Backend running on Hetzner
2. Test registration works
3. Build payment checkout endpoint
4. Wire up upload form
5. You're DONE!

**No more Docker Windows hell!** 🔥

---

## Alternative: Even Simpler Options

### Option A: Railway.app
- Even easier than Hetzner
- Auto-deploys from GitHub
- ~$10-20/month
- https://railway.app

### Option B: DigitalOcean
- Similar to Hetzner
- Slightly more expensive
- Good if you prefer their UI

### Option C: Render.com
- Free tier available!
- Auto-deploy from GitHub
- Good for testing

**But Hetzner is best price/performance!**
