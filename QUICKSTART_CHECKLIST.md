# Quick Start Checklist - MHC Streaming Platform

Print this out or use it as a reference while setting up!

## Phase 1: Environment Setup (30 minutes)

- [ ] **Install PostgreSQL**
  - [ ] Download from postgresql.org/download/windows
  - [ ] Run installer with strong password
  - [ ] Verify: `pg_isready -h localhost -p 5432`

- [ ] **Install Redis**
  - [ ] Option 1: Docker - `docker run -d -p 6379:6379 redis:latest`
  - [ ] Option 2: Windows build - Download from github.com/microsoftarchive/redis/releases
  - [ ] Verify: `redis-cli ping` (should return PONG)

- [ ] **Create Database**
  ```powershell
  psql -U postgres -h localhost
  # In psql:
  CREATE DATABASE mhc;
  CREATE USER mhc_user WITH PASSWORD 'your_secure_password';
  GRANT ALL PRIVILEGES ON DATABASE mhc TO mhc_user;
  \q
  ```

## Phase 2: Backend Configuration (15 minutes)

- [ ] **Generate JWT Secrets**
  ```powershell
  # In PowerShell, run this twice and save outputs
  $secret = [Convert]::ToBase64String((1..32 | ForEach-Object {Get-Random -Maximum 256}))
  Write-Host $secret
  ```

- [ ] **Configure .env File**
  - [ ] Edit `C:\Users\jhink\mhc-streaming\backend\.env`
  - [ ] Set DATABASE_URL with your password
  - [ ] Set JWT_SECRET (first generated value)
  - [ ] Set JWT_REFRESH_SECRET (second generated value)
  - [ ] Set STRIPE_SECRET (from Stripe dashboard)
  - [ ] Set STRIPE_WEBHOOK_SECRET (from Stripe dashboard)
  - [ ] Keep other values as defaults

- [ ] **Install Dependencies**
  ```powershell
  cd C:\Users\jhink\mhc-streaming\backend
  npm install --ignore-scripts
  ```

## Phase 3: Database Setup (10 minutes)

- [ ] **Initialize Prisma**
  ```powershell
  npx prisma generate
  npx prisma db push
  # Answer "yes" when asked to create tables
  ```

## Phase 4: Start Development (5 minutes)

- [ ] **Open Terminal #1 - Backend**
  ```powershell
  cd C:\Users\jhink\mhc-streaming\backend
  npm run dev
  # Should see: 🔥 MHC Backend running on 4000
  ```

- [ ] **Open Terminal #2 - Test API**
  ```powershell
  # Test health
  curl http://localhost:4000/health
  
  # Test register
  $body = @{
      email = "test@example.com"
      password = "TestPassword123"
      username = "testuser"
  } | ConvertTo-Json
  
  curl -X POST http://localhost:4000/api/auth/register `
    -ContentType "application/json" `
    -Body $body
  ```

## Phase 5: Verify Everything Works ✅

- [ ] Health check returns 200
- [ ] Register endpoint creates user
- [ ] Login returns JWT tokens
- [ ] Video feed endpoint works
- [ ] Database has data (check with `npx prisma studio`)

## Phase 6: Troubleshooting Checklist

If something doesn't work:

- [ ] **Backend won't start?**
  - Check PostgreSQL is running: `pg_isready -h localhost`
  - Check Redis is running: `redis-cli ping`
  - Check .env file is configured
  - Check port 4000 is free: `netstat -ano | findstr :4000`

- [ ] **Database errors?**
  - Delete `.env` and recopy from `.env.example`
  - Verify password in DATABASE_URL matches
  - Run: `npx prisma generate` then `npx prisma db push`

- [ ] **bcrypt errors?**
  - You already ran: `npm install --ignore-scripts`
  - This uses prebuilt binaries, should work

- [ ] **TypeScript errors?**
  - Run: `npx tsc --noEmit`
  - If errors, check they match those already noted

## Quick Command Reference

```powershell
# Start development
npm run dev

# Check for errors
npx tsc --noEmit

# Build for production
npm run build

# Database tools
npx prisma studio         # Visual data browser
npx prisma generate      # Generate client
npx prisma db push       # Push schema

# Testing
curl http://localhost:4000/health

# Logs
# Check logs in terminal where npm run dev is running
# Increase verbosity: LOG_LEVEL=DEBUG npm run dev
```

## Important Files

- **Backend code**: `C:\Users\jhink\mhc-streaming\backend\src\`
- **Configuration**: `C:\Users\jhink\mhc-streaming\backend\.env`
- **Database schema**: `C:\Users\jhink\mhc-streaming\backend\prisma\schema.prisma`
- **API reference**: `C:\Users\jhink\mhc-streaming\backend\DEVELOPMENT.md`
- **Setup guide**: `C:\Users\jhink\mhc-streaming\SETUP_GUIDE.md`

## What's Running

Once everything is up:

| Service | URL | Check |
|---------|-----|-------|
| Backend API | http://localhost:4000 | curl http://localhost:4000/health |
| PostgreSQL | localhost:5432 | `psql -U mhc_user -d mhc -h localhost` |
| Redis | localhost:6379 | `redis-cli ping` |
| Frontend | http://localhost:3000 | Phase 2 (not yet) |

## Next: Phase 2 Frontend

Once backend is working, start Phase 2:

```powershell
cd C:\Users\jhink\mhc-streaming\frontend
npx create-next-app@latest . --typescript --tailwind
npm install
npm run dev
# Frontend runs on http://localhost:3000
```

---

**Total Setup Time**: ~1 hour (first time only)

**Status**: Ready for development ✅

**Questions?** See SETUP_GUIDE.md for detailed instructions
