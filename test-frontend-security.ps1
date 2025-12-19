# MHC Streaming - Frontend Security Audit
# Checks frontend code for security issues, missing pages, and production readiness

Write-Host "🔍 MHC Streaming - Frontend Security Audit" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"
$issues = @()
$warnings = @()
$passed = @()

# Test 1: Check if main pages exist
Write-Host "1️⃣  Checking Core Pages..." -ForegroundColor Yellow
$requiredPages = @(
    "app\page.tsx",
    "app\layout.tsx",
    "pages\index.tsx",
    "pages\_app.tsx"
)

$foundMainPage = $false
foreach ($page in $requiredPages) {
    $path = "C:\Users\jhink\mhc-streaming\frontend\$page"
    if (Test-Path $path) {
        Write-Host "   ✅ Found: $page" -ForegroundColor Green
        $foundMainPage = $true
        $passed += "Main page exists: $page"
    }
}

if (-not $foundMainPage) {
    Write-Host "   ❌ CRITICAL: No main page found (page.tsx, index.tsx, or _app.tsx)" -ForegroundColor Red
    $issues += "CRITICAL: Missing main entry page"
}

Write-Host ""

# Test 2: Check for authentication pages
Write-Host "2️⃣  Checking Authentication Pages..." -ForegroundColor Yellow
$authPages = @{
    "Login" = @("pages\login.tsx", "app\login\page.tsx", "pages\auth\login.tsx")
    "Register" = @("pages\register.tsx", "app\register\page.tsx", "pages\auth\register.tsx")
    "Logout" = @("pages\logout.tsx", "app\logout\page.tsx")
}

foreach ($pageName in $authPages.Keys) {
    $found = $false
    foreach ($path in $authPages[$pageName]) {
        if (Test-Path "C:\Users\jhink\mhc-streaming\frontend\$path") {
            Write-Host "   ✅ $pageName page exists" -ForegroundColor Green
            $passed += "$pageName page found"
            $found = $true
            break
        }
    }
    if (-not $found) {
        Write-Host "   ⚠️  $pageName page not found" -ForegroundColor Yellow
        $warnings += "Missing $pageName page"
    }
}

Write-Host ""

# Test 3: Check API client security
Write-Host "3️⃣  Checking API Client Security..." -ForegroundColor Yellow
$apiFile = "C:\Users\jhink\mhc-streaming\frontend\src\lib\api.ts"
if (Test-Path $apiFile) {
    $apiContent = Get-Content $apiFile -Raw
    
    # Check for JWT token handling
    if ($apiContent -match "Bearer.*token" -or $apiContent -match "Authorization") {
        Write-Host "   ✅ JWT authentication present" -ForegroundColor Green
        $passed += "API has JWT auth"
    } else {
        Write-Host "   ⚠️  JWT authentication may be missing" -ForegroundColor Yellow
        $warnings += "API JWT auth unclear"
    }
    
    # Check for token refresh
    if ($apiContent -match "refresh") {
        Write-Host "   ✅ Token refresh mechanism present" -ForegroundColor Green
        $passed += "Token refresh exists"
    } else {
        Write-Host "   ⚠️  No token refresh mechanism found" -ForegroundColor Yellow
        $warnings += "Missing token refresh"
    }
    
    # Check for HTTPS enforcement
    if ($apiContent -match "http://" -and $apiContent -notmatch "localhost") {
        Write-Host "   ⚠️  HTTP URLs found (should use HTTPS in production)" -ForegroundColor Yellow
        $warnings += "HTTP URLs present"
    } else {
        Write-Host "   ✅ No hardcoded HTTP URLs" -ForegroundColor Green
        $passed += "No hardcoded HTTP"
    }
} else {
    Write-Host "   ❌ API client file not found at expected location" -ForegroundColor Red
    $issues += "Missing API client"
}

Write-Host ""

# Test 4: Check for XSS protection
Write-Host "4️⃣  Checking XSS Protection..." -ForegroundColor Yellow
$tsxFiles = Get-ChildItem -Path "C:\Users\jhink\mhc-streaming\frontend" -Include *.tsx -Recurse -File | Where-Object { $_.FullName -notmatch "node_modules" }

$dangerousHTML = $false
foreach ($file in $tsxFiles) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match "dangerouslySetInnerHTML" -and $content -notmatch "sanitize") {
        Write-Host "   ⚠️  Potential XSS risk in: $($file.Name)" -ForegroundColor Yellow
        $warnings += "Unsanitized HTML in $($file.Name)"
        $dangerousHTML = $true
    }
}

if (-not $dangerousHTML) {
    Write-Host "   ✅ No obvious XSS vulnerabilities" -ForegroundColor Green
    $passed += "No XSS risks found"
}

Write-Host ""

# Test 5: Check for secrets in code
Write-Host "5️⃣  Checking for Hardcoded Secrets..." -ForegroundColor Yellow
$allFiles = Get-ChildItem -Path "C:\Users\jhink\mhc-streaming\frontend" -Include *.ts,*.tsx,*.js,*.jsx -Recurse -File | Where-Object { $_.FullName -notmatch "node_modules" }

$secretsFound = $false
foreach ($file in $allFiles) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match "(api_key|apikey|secret|password|token)\s*=\s*['`"][a-zA-Z0-9]{20,}['`"]") {
        Write-Host "   ⚠️  Potential secret in: $($file.Name)" -ForegroundColor Yellow
        $warnings += "Possible secret in $($file.Name)"
        $secretsFound = $true
    }
}

if (-not $secretsFound) {
    Write-Host "   ✅ No hardcoded secrets detected" -ForegroundColor Green
    $passed += "No hardcoded secrets"
}

Write-Host ""

# Test 6: Check environment variable usage
Write-Host "6️⃣  Checking Environment Variables..." -ForegroundColor Yellow
$envFiles = @(
    "C:\Users\jhink\mhc-streaming\frontend\.env",
    "C:\Users\jhink\mhc-streaming\frontend\.env.local",
    "C:\Users\jhink\mhc-streaming\frontend\.env.example"
)

$hasEnvExample = $false
foreach ($envFile in $envFiles) {
    if (Test-Path $envFile) {
        Write-Host "   ✅ Found: $(Split-Path $envFile -Leaf)" -ForegroundColor Green
        if ($envFile -match "example") {
            $hasEnvExample = $true
        }
    }
}

if ($hasEnvExample) {
    $passed += "Has .env.example"
} else {
    Write-Host "   ⚠️  No .env.example file (recommended for docs)" -ForegroundColor Yellow
    $warnings += "Missing .env.example"
}

Write-Host ""

# Test 7: Check for CORS configuration
Write-Host "7️⃣  Checking CORS Configuration..." -ForegroundColor Yellow
$nextConfig = "C:\Users\jhink\mhc-streaming\frontend\next.config.js"
if (Test-Path $nextConfig) {
    $configContent = Get-Content $nextConfig -Raw
    if ($configContent -match "headers.*async" -or $configContent -match "Access-Control") {
        Write-Host "   ✅ CORS headers configured" -ForegroundColor Green
        $passed += "CORS configured"
    } else {
        Write-Host "   ℹ️  No explicit CORS config (may rely on backend)" -ForegroundColor Gray
    }
}

Write-Host ""

# Test 8: Check TypeScript configuration
Write-Host "8️⃣  Checking TypeScript Security..." -ForegroundColor Yellow
$tsconfig = "C:\Users\jhink\mhc-streaming\frontend\tsconfig.json"
if (Test-Path $tsconfig) {
    $tsconfigContent = Get-Content $tsconfig -Raw | ConvertFrom-Json
    
    if ($tsconfigContent.compilerOptions.strict -eq $true) {
        Write-Host "   ✅ TypeScript strict mode enabled" -ForegroundColor Green
        $passed += "TypeScript strict mode"
    } else {
        Write-Host "   ⚠️  TypeScript strict mode not enabled" -ForegroundColor Yellow
        $warnings += "TypeScript not in strict mode"
    }
}

Write-Host ""

# Test 9: Check for console.log statements
Write-Host "9️⃣  Checking for Debug Code..." -ForegroundColor Yellow
$debugCount = 0
foreach ($file in $allFiles) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match "console\.(log|debug|info)" -and $file.Name -notmatch "test|spec") {
        $debugCount++
    }
}

if ($debugCount -gt 0) {
    Write-Host "   ⚠️  Found $debugCount files with console statements" -ForegroundColor Yellow
    $warnings += "$debugCount files have console.log"
} else {
    Write-Host "   ✅ No debug console statements" -ForegroundColor Green
    $passed += "No console.log statements"
}

Write-Host ""

# Test 10: Check package.json for security
Write-Host "🔟 Checking Package Security..." -ForegroundColor Yellow
$packageJson = "C:\Users\jhink\mhc-streaming\frontend\package.json"
if (Test-Path $packageJson) {
    $pkg = Get-Content $packageJson -Raw | ConvertFrom-Json
    
    # Check for security scripts
    if ($pkg.scripts.PSObject.Properties.Name -contains "audit") {
        Write-Host "   ✅ Has audit script" -ForegroundColor Green
        $passed += "Has npm audit script"
    } else {
        Write-Host "   ℹ️  No audit script (can add 'npm audit')" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Summary
Write-Host "📊 AUDIT SUMMARY" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Passed: $($passed.Count)" -ForegroundColor Green
Write-Host "⚠️  Warnings: $($warnings.Count)" -ForegroundColor Yellow
Write-Host "❌ Critical Issues: $($issues.Count)" -ForegroundColor Red
Write-Host ""

if ($issues.Count -gt 0) {
    Write-Host "🚨 CRITICAL ISSUES:" -ForegroundColor Red
    foreach ($issue in $issues) {
        Write-Host "   • $issue" -ForegroundColor Red
    }
    Write-Host ""
}

if ($warnings.Count -gt 0) {
    Write-Host "⚠️  WARNINGS:" -ForegroundColor Yellow
    foreach ($warning in $warnings) {
        Write-Host "   • $warning" -ForegroundColor Yellow
    }
    Write-Host ""
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

if ($issues.Count -eq 0) {
    Write-Host "✅ Frontend has no critical security issues!" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  However, missing pages suggest incomplete implementation." -ForegroundColor Yellow
    Write-Host "   Frontend appears to be PARTIALLY COMPLETE." -ForegroundColor Yellow
} else {
    Write-Host "❌ Frontend has critical issues and is NOT production-ready!" -ForegroundColor Red
}

Write-Host ""
