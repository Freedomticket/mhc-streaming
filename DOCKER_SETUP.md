# Docker Setup Guide

## Current Status

✅ **Completed:**
- Docker and Docker Compose installed
- `docker-compose.yml` configured with all services
- Dockerfiles created for all services
- PostgreSQL and Redis containers running successfully
- `.dockerignore` file created

❌ **Issue:** Network timeout when building service containers (npm install failing)

## Troubleshooting Network Issues

### Option 1: Configure Docker Desktop Network Settings

1. Open Docker Desktop
2. Go to Settings → Resources → Network
3. Try switching between:
   - **NAT** (Network Address Translation)
   - **Bridge** mode
4. Restart Docker Desktop

### Option 2: Configure NPM Registry Mirror (if behind firewall/proxy)

If you're behind a corporate firewall or proxy, you may need to configure npm:

Add this to your Dockerfiles before `RUN npm install`:
```dockerfile
RUN npm config set registry https://registry.npmjs.org/
RUN npm config set strict-ssl false
```

### Option 3: Check Windows Firewall

1. Open Windows Defender Firewall
2. Allow Docker Desktop through the firewall
3. Restart Docker Desktop

### Option 4: Use Alternative Development Setup (Recommended for Now)

Run services locally without Docker:

```powershell
# 1. Start infrastructure services only (PostgreSQL + Redis)
docker-compose up -d postgres redis

# 2. Install dependencies locally
npm install

# 3. Generate Prisma client
npm run db:generate --workspace=@mhc/database

# 4. Push database schema
npm run db:push --workspace=@mhc/database

# 5. Build shared packages
npm run build --workspace=@mhc/database
npm run build --workspace=@mhc/common

# 6. Start services locally
npm run dev:gateway     # API Gateway on port 3000
npm run dev --workspace=@mhc/auth-service  # Auth on port 3001
```

## Full Docker Commands (once network issues resolved)

```powershell
# Build and start all services
docker-compose up -d --build

# Start specific services
docker-compose up -d postgres redis auth-service

# View logs
docker-compose logs -f auth-service

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

## Services Configuration

| Service | Port | Dependencies |
|---------|------|--------------|
| postgres | 5432 | - |
| redis | 6379 | - |
| auth-service | 3001 | postgres, redis |
| api-gateway | 3000 | redis, auth-service |
| media-service | 3002 | postgres, redis |
| stream-service | 3003, 1935 | postgres, redis |
| payment-service | 3004 | postgres, redis |
| analytics-service | 3005 | postgres, redis |

## Environment Variables

Copy `.env.example` to `.env` and update values:
```powershell
Copy-Item .env.example .env
```

Then edit `.env` with your actual values for:
- JWT secrets
- Stripe keys
- AWS credentials
