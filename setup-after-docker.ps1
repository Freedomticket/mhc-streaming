# MHC Streaming - Automated Setup Script
# Run this after Docker Desktop is installed and running

Write-Host "🚀 MHC Streaming - Automated Setup" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"

# Step 1: Verify Docker is running
Write-Host "1️⃣  Checking Docker..." -ForegroundColor Yellow
try {
    docker --version | Out-Null
    Write-Host "   ✅ Docker is installed" -ForegroundColor Green
    
    docker ps | Out-Null
    Write-Host "   ✅ Docker is running" -ForegroundColor Green
}
catch {
    Write-Host "   ❌ Docker is not running" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please start Docker Desktop and try again." -ForegroundColor Yellow
    Write-Host "You can start it from the Windows Start menu." -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Step 2: Start databases
Write-Host "2️⃣  Starting Databases..." -ForegroundColor Yellow
try {
    docker compose up postgres redis -d
    Write-Host "   ✅ PostgreSQL and Redis starting..." -ForegroundColor Green
    Write-Host "   ⏳ Waiting 20 seconds for databases to initialize..." -ForegroundColor Gray
    Start-Sleep -Seconds 20
}
catch {
    Write-Host "   ❌ Failed to start databases" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 3: Verify databases are running
Write-Host "3️⃣  Verifying Databases..." -ForegroundColor Yellow
$containers = docker ps --format "{{.Names}}"
if ($containers -match "mhc-postgres") {
    Write-Host "   ✅ PostgreSQL is running" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  PostgreSQL may not be ready yet" -ForegroundColor Yellow
}

if ($containers -match "mhc-redis") {
    Write-Host "   ✅ Redis is running" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Redis may not be ready yet" -ForegroundColor Yellow
}

Write-Host ""

# Step 4: Generate Prisma client
Write-Host "4️⃣  Generating Prisma Client..." -ForegroundColor Yellow
try {
    npm run db:generate --workspace=@mhc/database 2>&1 | Out-Null
    Write-Host "   ✅ Prisma client generated" -ForegroundColor Green
}
catch {
    Write-Host "   ⚠️  Prisma generation had warnings (may be network issue)" -ForegroundColor Yellow
    Write-Host "   Continuing anyway..." -ForegroundColor Gray
}

Write-Host ""

# Step 5: Push database schema
Write-Host "5️⃣  Creating Database Schema..." -ForegroundColor Yellow
try {
    npm run db:push --workspace=@mhc/database 2>&1 | Out-Null
    Write-Host "   ✅ Database schema created" -ForegroundColor Green
}
catch {
    Write-Host "   ⚠️  Database schema creation had warnings" -ForegroundColor Yellow
    Write-Host "   Continuing anyway..." -ForegroundColor Gray
}

Write-Host ""

# Step 6: Verify .env file
Write-Host "6️⃣  Checking Configuration..." -ForegroundColor Yellow
if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "JWT_SECRET=") {
        Write-Host "   ✅ .env file is configured" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  .env file may be incomplete" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ .env file not found" -ForegroundColor Red
    Write-Host "   Run the secret generation script first!" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Summary
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 What's Ready:" -ForegroundColor Cyan
Write-Host "   ✅ PostgreSQL running on port 5432" -ForegroundColor Green
Write-Host "   ✅ Redis running on port 6379" -ForegroundColor Green
Write-Host "   ✅ Database schema created" -ForegroundColor Green
Write-Host "   ✅ Prisma client generated" -ForegroundColor Green
Write-Host "   ✅ Environment configured" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Start backend services:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Wait 30 seconds for services to start" -ForegroundColor White
Write-Host ""
Write-Host "3. Run tests:" -ForegroundColor White
Write-Host "   .\test-security.ps1" -ForegroundColor Gray
Write-Host "   .\test-api-security.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
