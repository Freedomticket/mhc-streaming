# MHC Streaming Platform - Setup Guide for Windows

This guide walks you through setting up the complete development environment on Windows.

## Prerequisites Check ✅

You have:
- Node.js v24.11.1 ✅
- npm v8.19.3 ✅
- PowerShell v7.4.13 ✅
- Windows 10/11 ✅

## Step 1: Install PostgreSQL (Windows)

### Option A: Download and Install (Recommended)

1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run the installer
3. During installation:
   - **Password**: Set a strong password for the `postgres` user (remember this!)
   - **Port**: Keep default 5432
   - **Locale**: Select your locale
   - **Check**: Include pgAdmin (database management GUI)

4. After installation, open PowerShell as Administrator:
```powershell
# Verify PostgreSQL is running
pg_isready -h localhost -p 5432
# Should output: "accepting connections"
```

### Option B: Windows Subsystem for Linux (WSL2)

If you prefer containerized approach:
```powershell
# Install Docker Desktop
# Then:
docker run --name postgres-mhc \
  -e POSTGRES_PASSWORD=your_secure_password \
  -e POSTGRES_DB=mhc \
  -p 5432:5432 \
  -d postgres:15-alpine
```

### Option C: PostgreSQL Portable (No Installation)

Download from https://www.enterprisedb.com/postgresql-tutorials/postgresql-portable-windows and extract.

## Step 2: Create Database and User

Once PostgreSQL is running:

```powershell
# Connect to PostgreSQL
psql -U postgres -h localhost

# In psql shell, run:
CREATE DATABASE mhc;
CREATE USER mhc_user WITH PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE mhc TO mhc_user;

# Verify
\l
# Should show mhc database

# Exit
\q
```

## Step 3: Install Redis (Windows)

### Option A: Windows Subsystem for Linux (Recommended)

```powershell
# Using WSL2 and Docker
docker run --name redis-mhc \
  -p 6379:6379 \
  -d redis:7-alpine
```

### Option B: Redis for Windows

1. Download from https://github.com/microsoftarchive/redis/releases
2. Extract and run `redis-server.exe`
3. Verify it's running:

```powershell
redis-cli ping
# Should output: PONG
```

### Option C: Using Docker Desktop

```powershell
# If you have Docker installed
docker run -d -p 6379:6379 redis:latest
```

## Step 4: Configure Environment Variables

In `C:\Users\jhink\mhc-streaming\backend\.env`:

```bash
# Server
PORT=4000
NODE_ENV=development

# Database (adjust password to what you set)
DATABASE_URL=postgresql://mhc_user:secure_password_here@localhost:5432/mhc

# Redis (if running locally)
REDIS_URL=redis://localhost:6379

# Authentication (generate these)
JWT_SECRET=your_generated_secret_here
JWT_REFRESH_SECRET=your_generated_refresh_secret_here

# Stripe (get from https://dashboard.stripe.com)
STRIPE_SECRET=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Logging
LOG_LEVEL=INFO
SERVICE_NAME=mhc-backend

# Storage
STORAGE_BASE_URL=https://storage.example.com
APP_URL=http://localhost:3000
```

### Generate JWT Secrets

In PowerShell:

```powershell
# Generate secure random secret
$secret = [Convert]::ToBase64String((1..32 | ForEach-Object {Get-Random -Maximum 256}))
Write-Host $secret

# Run this twice and copy the output to JWT_SECRET and JWT_REFRESH_SECRET
```

## Step 5: Install bcrypt (Windows)

Since you're on Windows, bcrypt requires compilation. Choose one:

### Option A: Skip Build (Fastest)

```powershell
cd C:\Users\jhink\mhc-streaming\backend
npm install --ignore-scripts
```

This uses prebuilt binaries and is usually sufficient for development.

### Option B: Install Build Tools (Full Setup)

If you need native compilation:

1. Install Visual Studio Build Tools:
   - Download: https://visualstudio.microsoft.com/visual-cpp-build-tools/
   - Run installer
   - Select "Desktop development with C++"
   - Complete installation

2. Install bcrypt:
```powershell
npm install bcrypt
```

### Option C: Use Prebuild Binary

```powershell
cd C:\Users\jhink\mhc-streaming\backend
npm install
# If bcrypt fails, npm automatically tries prebuilt binaries
```

## Step 6: Initialize Database Schema

```powershell
cd C:\Users\jhink\mhc-streaming\backend

# Generate Prisma client
npx prisma generate

# Create database schema
npx prisma db push
# Answer "yes" when asked to create tables

# (Optional) Seed database with test data
npx prisma db seed
```

## Step 7: Start Development Server

```powershell
cd C:\Users\jhink\mhc-streaming\backend
npm run dev
```

You should see:
```
✓ Compiled successfully
🔥 MHC Backend running on 4000
✅ Redis connected
```

## Step 8: Test the API

Open PowerShell in a new window:

### Test 1: Health Check
```powershell
curl http://localhost:4000/health
```

### Test 2: Register a User
```powershell
$body = @{
    email = "test@example.com"
    password = "TestPassword123"
    username = "testuser"
} | ConvertTo-Json

curl -X POST http://localhost:4000/api/auth/register `
  -ContentType "application/json" `
  -Body $body
```

Expected response:
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "test@example.com",
    "username": "testuser",
    "role": "USER",
    "createdAt": "2025-12-13T..."
  }
}
```

### Test 3: Login
```powershell
$body = @{
    email = "test@example.com"
    password = "TestPassword123"
} | ConvertTo-Json

curl -X POST http://localhost:4000/api/auth/login `
  -ContentType "application/json" `
  -Body $body
```

Expected response:
```json
{
  "access": "eyJhbGc...",
  "refresh": "eyJhbGc...",
  "user": { ... }
}
```

### Test 4: Get Video Feed (No Auth Required)
```powershell
curl http://localhost:4000/api/videos/feed
```

## Troubleshooting

### "Cannot find module '@prisma/client'"
```powershell
npx prisma generate
```

### "PostgreSQL connection refused"
```powershell
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432

# If not, start it (Windows Service):
# Services -> PostgreSQL Server -> Start
# Or manually: pg_ctl -D "C:\Program Files\PostgreSQL\15\data" start
```

### "Redis connection refused"
```powershell
# Check if Redis is running
redis-cli ping

# If not, start it:
# redis-server.exe (if using Windows build)
# Or: docker start redis-mhc (if using Docker)
```

### Port 4000 Already in Use
```powershell
# Find process on port 4000
$proc = Get-NetTCPConnection -LocalPort 4000 -ErrorAction SilentlyContinue
if ($proc) { Stop-Process -Id $proc.OwningProcess -Force }

# Or change PORT in .env
```

### bcrypt Compilation Fails
```powershell
# Use prebuilt binaries instead
npm install --ignore-scripts

# This uses Node.js prebuilt binaries, not native compilation
```

## Using Postman/Insomnia for Testing

### Import Collection

Create a file `postman_collection.json`:

```json
{
  "info": { "name": "MHC Streaming API", "version": "1.0" },
  "item": [
    {
      "name": "Register",
      "request": {
        "method": "POST",
        "url": "http://localhost:4000/api/auth/register",
        "header": [{ "key": "Content-Type", "value": "application/json" }],
        "body": {
          "mode": "raw",
          "raw": "{\"email\":\"user@example.com\",\"password\":\"Password123\",\"username\":\"testuser\"}"
        }
      }
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "url": "http://localhost:4000/api/auth/login",
        "header": [{ "key": "Content-Type", "value": "application/json" }],
        "body": {
          "mode": "raw",
          "raw": "{\"email\":\"user@example.com\",\"password\":\"Password123\"}"
        }
      }
    },
    {
      "name": "Get Video Feed",
      "request": {
        "method": "GET",
        "url": "http://localhost:4000/api/videos/feed"
      }
    }
  ]
}
```

Import this into Postman/Insomnia.

## Next: Frontend Setup (Phase 2)

Once the backend is running:

```powershell
cd C:\Users\jhink\mhc-streaming\frontend

# Create frontend (you'll do this in Phase 2)
npx create-next-app@latest . --typescript --tailwind

# Install dependencies
npm install

# Start frontend
npm run dev
# Will run on http://localhost:3000
```

## Environment Summary

| Service | Status | Port | Check |
|---------|--------|------|-------|
| Node.js | ✅ | - | `node --version` |
| npm | ✅ | - | `npm --version` |
| PostgreSQL | Setup | 5432 | `pg_isready -h localhost` |
| Redis | Setup | 6379 | `redis-cli ping` |
| Backend | Ready | 4000 | `npm run dev` |
| Frontend | Ready | 3000 | Phase 2 |

## Quick Reference Commands

```powershell
# Start everything (4 terminal windows)
# Terminal 1: PostgreSQL
# If WSL/Docker: docker start postgres-mhc
# If native: Services -> PostgreSQL -> Start

# Terminal 2: Redis
# If WSL/Docker: docker start redis-mhc
# If native: redis-server.exe

# Terminal 3: Backend
cd C:\Users\jhink\mhc-streaming\backend
npm run dev

# Terminal 4: Tests
curl http://localhost:4000/health

# Database tools
psql -U mhc_user -d mhc -h localhost      # Connect to database
npx prisma studio                          # GUI data browser
redis-cli                                  # Redis CLI
```

## Getting Help

1. Check `backend/DEVELOPMENT.md` for API reference
2. Check `backend/README.md` for features
3. Check `SYSTEM_OVERVIEW.md` for architecture
4. Check logs with `LOG_LEVEL=DEBUG npm run dev`

---

**Last Updated:** December 13, 2025
**Platform:** Windows PowerShell 7.4.13
**Status:** Ready for development ✅
