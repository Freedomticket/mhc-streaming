# Getting Started with MHC Streaming Backend

## Prerequisites

- **Node.js 18+** and **npm 9+**
- **Docker Desktop** (for PostgreSQL and Redis)
- **Git** (optional)

## Quick Start (5 minutes)

### 1. Install Dependencies

```powershell
npm install
```

This installs all dependencies for the monorepo and all packages/services.

### 2. Start Database

```powershell
docker-compose up postgres redis -d
```

This starts PostgreSQL and Redis in the background.

### 3. Setup Environment

```powershell
# Copy environment template
Copy-Item .env.example .env

# Edit .env if needed (the defaults work for local development)
```

### 4. Setup Database

```powershell
# Generate Prisma client
npm run db:generate --workspace=@mhc/database

# Push schema to database
npm run db:push --workspace=@mhc/database
```

### 5. Start Services

```powershell
# Start all services
npm run dev
```

Or start individual services:
```powershell
npm run dev:gateway     # API Gateway (port 3000)
npm run dev --workspace=@mhc/auth-service      # Auth (port 3001)
```

## Access the API

- **API Gateway**: http://localhost:3000
- **Auth Service**: http://localhost:3001/api/auth
- **Media Service**: http://localhost:3002/api/media
- **Stream Service**: http://localhost:3003/api/streams
- **Payment Service**: http://localhost:3004/api/payments
- **Analytics Service**: http://localhost:3005/api/analytics

## Test the API

### Register a User

```powershell
$body = @{
    email = "test@example.com"
    username = "testuser"
    password = "Test1234"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/auth/register" -Method POST -Body $body -ContentType "application/json"
```

### Login

```powershell
$body = @{
    email = "test@example.com"
    password = "Test1234"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method POST -Body $body -ContentType "application/json"
$token = $response.data.accessToken
```

### Subscribe to a Tier (Dev Mode - No Payment)

```powershell
$body = @{
    userId = $response.data.user.id
    tier = "INFERNO"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3004/api/payments/subscribe" -Method POST -Body $body -ContentType "application/json"
```

## Database Management

### View Database in Browser

```powershell
npm run db:studio --workspace=@mhc/database
```

Opens Prisma Studio at http://localhost:5555

### Create Migration

```powershell
npm run db:migrate --workspace=@mhc/database
```

### Reset Database

```powershell
# Stop services first
docker-compose down -v

# Start fresh
docker-compose up postgres redis -d
npm run db:push --workspace=@mhc/database
```

## Troubleshooting

### Port Already in Use

```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Database Connection Issues

```powershell
# Check if PostgreSQL is running
docker ps

# View database logs
docker logs mhc-postgres

# Restart database
docker-compose restart postgres
```

### Prisma Client Not Found

```powershell
# Regenerate Prisma client
npm run db:generate --workspace=@mhc/database

# Rebuild all packages
npm run build --workspaces
```

## Next Steps

1. **Connect Frontend** - The frontend can now call these APIs
2. **Add Stripe** - For production payments, add your Stripe keys to `.env`
3. **Setup File Storage** - For production, configure MinIO or cloud storage
4. **Enable Live Streaming** - Add nginx-rtmp for RTMP streaming
5. **Deploy** - Use Docker Compose or deploy services individually

## Self-Hosted vs Cloud

**Currently Using (Self-Hosted)**:
- ✅ PostgreSQL (local)
- ✅ Redis (local)
- ✅ File system storage (local)
- ✅ Payment (dev mode, no Stripe needed)

**Optional Cloud Services**:
- Stripe (payments) - only when you're ready to charge users
- AWS S3/MinIO (media storage) - for production scaling
- Deployment server - when going public

You can run everything locally without any external services!

## Architecture

```
┌─────────────────┐
│  API Gateway    │ :3000
│  (Entry Point)  │
└────────┬────────┘
         │
         ├──────► Auth Service      :3001
         ├──────► Media Service     :3002
         ├──────► Stream Service    :3003
         ├──────► Payment Service   :3004
         └──────► Analytics Service :3005
                  
                  PostgreSQL :5432
                  Redis      :6379
```

## Support

Check `BACKEND_README.md` for detailed API documentation.
