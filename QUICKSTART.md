# MHC Streaming - Quick Start Guide

## What You Now Have

A **complete, Google-free streaming platform** with:
- ✅ Music streaming (Navidrome - Spotify-like)
- ✅ Video streaming (PeerTube - YouTube-like)
- ✅ Social/chat (Matrix + Element - Telegram-like)
- ✅ Object storage (MinIO - replaces Google Cloud Storage)
- ✅ Decentralized backup (IPFS)
- ✅ Your existing microservices (auth, API gateway, media, etc.)

## First-Time Setup

### 1. Start All Services

```powershell
# From mhc-streaming directory
docker-compose up -d
```

This starts **16 services** in the background. First run takes 5-10 minutes to download images.

### 2. Watch Startup Progress

```powershell
docker-compose logs -f
```

Press `Ctrl+C` to stop watching logs.

### 3. Check Service Health

```powershell
docker-compose ps
```

All services should show "healthy" or "running" after 2-3 minutes.

## Access Your Services

### Core Services
- **API Gateway**: http://localhost:3000
- **Auth Service**: http://localhost:3001

### Streaming Services
- **Navidrome (Music)**: http://localhost:4533
  - First user to register becomes admin
  - Place MP3/FLAC files in `media/music/` folder

- **PeerTube (Video)**: http://localhost:9002
  - Admin email: `admin@mhc.local`
  - Check MailDev for registration email

- **Element Chat**: http://localhost:8080
  - Register a new account
  - Server: `mhc.local` (auto-configured)

### Infrastructure Services
- **MinIO Console**: http://localhost:9001
  - Username: `mhc_admin`
  - Password: `mhc_minio_password_change_me`

- **IPFS Gateway**: http://localhost:8081/ipfs/
- **MailDev (Email Testing)**: http://localhost:1080

### Unified Access (via Caddy)
- **All services**: http://localhost/
  - `/api/*` → API Gateway
  - `/music/*` → Navidrome
  - `/videos/*` → PeerTube
  - `/_matrix/*` → Matrix Synapse
  - `/chat/*` → Element
  - `/ipfs/*` → IPFS

## Adding Content

### Music
1. Copy MP3/FLAC files to `media/music/`
2. Navidrome auto-scans every hour (or trigger manually in UI)

### Videos
1. Open PeerTube: http://localhost:9002
2. Register account
3. Upload videos via web interface

## Stopping Services

```powershell
# Stop all services
docker-compose down

# Stop AND remove all data (reset everything)
docker-compose down -v
```

## Troubleshooting

### Service Won't Start
```powershell
# Check logs for specific service
docker-compose logs navidrome
docker-compose logs peertube
docker-compose logs synapse
```

### Port Already in Use
If port 80, 443, 3000, etc. are taken:
1. Edit `docker-compose.yml`
2. Change port mappings: `"8080:80"` → `"8090:80"`

### Database Issues
```powershell
# Restart postgres
docker-compose restart postgres

# View postgres logs
docker-compose logs postgres
```

## Next Steps

### Integration with Your Services
1. Update `media-service` to use MinIO instead of Cloud Storage
2. Connect frontend to Navidrome API for music playback
3. Embed PeerTube videos in your gallery
4. Add Matrix chat rooms to community features

### Production Deployment
See `DEPLOYMENT.md` for:
- Hetzner server setup
- IPFS pinning with Pinata
- Tor hidden service configuration
- Multi-region clustering

## Google-Free Architecture

### What We Replaced
- ❌ Google Cloud Storage → ✅ MinIO
- ❌ Google Cloud SQL → ✅ PostgreSQL
- ❌ Google Cloud Run → ✅ Docker Compose (local) / k3s (production)
- ❌ Firebase → ✅ Direct database access
- ❌ Google Analytics → ✅ Self-hosted analytics (add Plausible later)

### Decentralization Features
- **IPFS**: Static assets can be pinned to decentralized network
- **Matrix**: Federated chat (can connect to other Matrix servers)
- **PeerTube**: Can federate with other PeerTube instances
- **Tor Ready**: Add Tor hidden service in production

## Service Ports Reference

| Service | Port | Purpose |
|---------|------|---------|
| Caddy | 80, 443 | Reverse proxy |
| API Gateway | 3000 | Main API |
| Auth | 3001 | Authentication |
| Media | 3002 | Media management |
| Stream | 3003 | Streaming |
| Payment | 3004 | Payments |
| Analytics | 3005 | Analytics |
| Navidrome | 4533 | Music streaming |
| Synapse | 8008 | Matrix homeserver |
| Element | 8080 | Chat UI |
| MinIO | 9000, 9001 | Object storage |
| PeerTube | 9002 | Video platform |
| MailDev | 1080, 1025 | Email testing |
| IPFS | 4001, 5001, 8081 | Decentralized storage |
| Postgres | 5432 | Database |
| Redis | 6379 | Cache |

## Support

Check the plan document for full architecture details and deployment strategy.
