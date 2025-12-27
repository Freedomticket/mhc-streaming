# Local Development - Quick Start

## Run Backend Locally (While Render Deploys)

You can test registration/login locally right now instead of waiting 40 minutes.

### 1. Set up local .env file

Create `.env` in project root:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/mhc_streaming"
JWT_SECRET="local-dev-secret-key-at-least-32-characters-long"
JWT_REFRESH_SECRET="different-local-dev-secret-also-32-chars"
REDIS_URL="redis://localhost:6379"
```

### 2. Start PostgreSQL (if not running)

**Option A: Docker (Recommended)**
```bash
docker run --name mhc-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=mhc_streaming -p 5432:5432 -d postgres:15
```

**Option B: Use existing local Postgres**
Just create the database:
```sql
CREATE DATABASE mhc_streaming;
```

### 3. Run migrations

```bash
cd packages/database
npx prisma migrate dev
# Or if migrations exist:
npx prisma migrate deploy
```

### 4. Start Auth Service

```bash
cd services/auth-service
npm install
npm run dev
```

It will start on http://localhost:3001

### 5. Update Frontend .env.local

In `frontend/.env.local`, temporarily change:
```env
NEXT_PUBLIC_AUTH_URL=http://localhost:3001
```

### 6. Start Frontend

```bash
cd frontend
npm run dev
```

### 7. Test Registration

Go to http://localhost:3000/register and create an account!

---

## When Render Finishes Deploying

Just change `frontend/.env.local` back to:
```env
NEXT_PUBLIC_AUTH_URL=https://mhc-auth-service.onrender.com
```

And restart the frontend dev server.

---

## Quick Health Check

Test if local auth service is working:
```bash
curl http://localhost:3001/health
```

Should return:
```json
{"status":"ok","service":"auth-service","timestamp":"..."}
```

Test registration:
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"TestPassword123!"}'
```
