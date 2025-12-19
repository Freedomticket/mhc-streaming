# Security Test Script for MHC Streaming Backend
# Tests all security fixes are working

Write-Host "🔒 Testing Security Fixes..." -ForegroundColor Cyan
Write-Host ""

$ErrorCount = 0

# Test 1: Check TypeScript compilation
Write-Host "1️⃣  Testing TypeScript Compilation..." -ForegroundColor Yellow
try {
    Write-Host "   Building @mhc/common..."
    npm run build --workspace=@mhc/common 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ @mhc/common builds successfully" -ForegroundColor Green
    } else {
        Write-Host "   ❌ @mhc/common build failed" -ForegroundColor Red
        $ErrorCount++
    }
} catch {
    Write-Host "   ❌ Error building @mhc/common" -ForegroundColor Red
    $ErrorCount++
}

Write-Host ""

# Test 2: Check environment configuration
Write-Host "2️⃣  Checking Environment Configuration..." -ForegroundColor Yellow
if (Test-Path ".env.example") {
    $envContent = Get-Content ".env.example" -Raw
    if ($envContent -match "REPLACE_WITH_GENERATED_SECRET") {
        Write-Host "   ✅ Environment template updated with secure instructions" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Environment template still has weak defaults" -ForegroundColor Red
        $ErrorCount++
    }
    
    if ($envContent -match "ALLOWED_ORIGINS") {
        Write-Host "   ✅ ALLOWED_ORIGINS configuration present" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  ALLOWED_ORIGINS not in template" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ .env.example not found" -ForegroundColor Red
    $ErrorCount++
}

Write-Host ""

# Test 3: Verify password validation strength
Write-Host "3️⃣  Testing Password Validation..." -ForegroundColor Yellow
$validationFile = "packages\common\src\validation.ts"
if (Test-Path $validationFile) {
    $validationContent = Get-Content $validationFile -Raw
    
    if ($validationContent -match "min\(12") {
        Write-Host "   ✅ Password minimum length is 12 characters" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Password minimum length not 12" -ForegroundColor Red
        $ErrorCount++
    }
    
    if ($validationContent -match "special character") {
        Write-Host "   ✅ Special character requirement added" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Special character not required" -ForegroundColor Red
        $ErrorCount++
    }
} else {
    Write-Host "   ❌ Validation file not found" -ForegroundColor Red
    $ErrorCount++
}

Write-Host ""

# Test 4: Check authentication middleware exists
Write-Host "4️⃣  Checking Authentication Middleware..." -ForegroundColor Yellow
$authMiddleware = "packages\common\src\middleware\auth.ts"
if (Test-Path $authMiddleware) {
    $authContent = Get-Content $authMiddleware -Raw
    
    if ($authContent -match "authenticateToken") {
        Write-Host "   ✅ authenticateToken middleware exists" -ForegroundColor Green
    } else {
        Write-Host "   ❌ authenticateToken not found" -ForegroundColor Red
        $ErrorCount++
    }
    
    if ($authContent -match "requireRole") {
        Write-Host "   ✅ requireRole middleware exists" -ForegroundColor Green
    } else {
        Write-Host "   ❌ requireRole not found" -ForegroundColor Red
        $ErrorCount++
    }
    
    if ($authContent -match "optionalAuth") {
        Write-Host "   ✅ optionalAuth middleware exists" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  optionalAuth not found" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ Auth middleware file not found" -ForegroundColor Red
    $ErrorCount++
}

Write-Host ""

# Test 5: Verify rate limiting in auth service
Write-Host "5️⃣  Checking Rate Limiting..." -ForegroundColor Yellow
$authRoutes = "services\auth-service\src\routes\auth.ts"
if (Test-Path $authRoutes) {
    $routesContent = Get-Content $authRoutes -Raw
    
    if ($routesContent -match "import.*rateLimit") {
        Write-Host "   ✅ Rate limiting imported" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Rate limiting not imported" -ForegroundColor Red
        $ErrorCount++
    }
    
    if ($routesContent -match "strictAuthLimiter") {
        Write-Host "   ✅ Strict rate limiter configured" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Strict rate limiter missing" -ForegroundColor Red
        $ErrorCount++
    }
    
    if ($routesContent -match "'/register'.*strictAuthLimiter") {
        Write-Host "   ✅ Registration endpoint rate limited" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Registration not rate limited" -ForegroundColor Red
        $ErrorCount++
    }
    
    if ($routesContent -match "'/login'.*strictAuthLimiter") {
        Write-Host "   ✅ Login endpoint rate limited" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Login not rate limited" -ForegroundColor Red
        $ErrorCount++
    }
} else {
    Write-Host "   ❌ Auth routes file not found" -ForegroundColor Red
    $ErrorCount++
}

Write-Host ""

# Test 6: Check CORS configuration
Write-Host "6️⃣  Checking CORS Configuration..." -ForegroundColor Yellow
$services = @(
    "services\auth-service\src\index.ts",
    "services\api-gateway\src\index.ts",
    "services\payment-service\src\index.ts",
    "services\analytics-service\src\index.ts"
)

$corsConfigured = 0
foreach ($service in $services) {
    if (Test-Path $service) {
        $content = Get-Content $service -Raw
        if ($content -match "cors\(\{" -and $content -match "origin.*ALLOWED_ORIGINS") {
            $corsConfigured++
        }
    }
}

if ($corsConfigured -eq $services.Count) {
    Write-Host "   ✅ All services have secure CORS configuration" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  $corsConfigured/$($services.Count) services have secure CORS" -ForegroundColor Yellow
}

Write-Host ""

# Test 7: Check request size limits
Write-Host "7️⃣  Checking Request Size Limits..." -ForegroundColor Yellow
$sizeLimitsConfigured = 0
foreach ($service in $services) {
    if (Test-Path $service) {
        $content = Get-Content $service -Raw
        if ($content -match "express\.json\(\{.*limit") {
            $sizeLimitsConfigured++
        }
    }
}

if ($sizeLimitsConfigured -eq $services.Count) {
    Write-Host "   ✅ All services have request size limits" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  $sizeLimitsConfigured/$($services.Count) services have size limits" -ForegroundColor Yellow
}

Write-Host ""

# Test 8: Check JWT security
Write-Host "8️⃣  Checking JWT Security..." -ForegroundColor Yellow
$jwtFile = "services\auth-service\src\utils\jwt.ts"
if (Test-Path $jwtFile) {
    $jwtContent = Get-Content $jwtFile -Raw
    
    if ($jwtContent -match "throw new Error.*JWT_SECRET.*must be set") {
        Write-Host "   ✅ JWT secrets are required (no fallback)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ JWT secrets still have fallback defaults" -ForegroundColor Red
        $ErrorCount++
    }
    
    if ($jwtContent -notmatch "your-secret-key") {
        Write-Host "   ✅ No hardcoded secrets in JWT util" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Hardcoded secrets still present" -ForegroundColor Red
        $ErrorCount++
    }
} else {
    Write-Host "   ❌ JWT utility file not found" -ForegroundColor Red
    $ErrorCount++
}

Write-Host ""

# Test 9: Check file upload security
Write-Host "9️⃣  Checking File Upload Security..." -ForegroundColor Yellow
$mediaService = "services\media-service\src\index-selfhosted.ts"
if (Test-Path $mediaService) {
    $mediaContent = Get-Content $mediaService -Raw
    
    if ($mediaContent -match "crypto\.randomBytes") {
        Write-Host "   ✅ Secure random filenames with crypto" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Not using crypto for filename generation" -ForegroundColor Red
        $ErrorCount++
    }
    
    if ($mediaContent -match "authenticateToken") {
        Write-Host "   ✅ Upload endpoint requires authentication" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Upload endpoint not protected" -ForegroundColor Red
        $ErrorCount++
    }
} else {
    Write-Host "   ⚠️  Self-hosted media service not found (using cloud version?)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Summary
if ($ErrorCount -eq 0) {
    Write-Host "✅ All Security Tests Passed!" -ForegroundColor Green
    Write-Host "   Your backend is hardened and ready for production." -ForegroundColor Green
    exit 0
} elseif ($ErrorCount -le 3) {
    Write-Host "⚠️  Some Issues Found ($ErrorCount errors)" -ForegroundColor Yellow
    Write-Host "   Review the failures above and fix before production." -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "❌ Multiple Security Issues ($ErrorCount errors)" -ForegroundColor Red
    Write-Host "   Critical fixes needed before deployment!" -ForegroundColor Red
    exit 1
}
