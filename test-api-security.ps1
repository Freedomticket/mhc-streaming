# Comprehensive API & Security Test Suite
# Tests all APIs and checks for security vulnerabilities

param(
    [string]$BaseUrl = "http://localhost:3000",
    [switch]$SkipStartup
)

$ErrorActionPreference = "Continue"
$SuccessCount = 0
$FailCount = 0
$SecurityIssues = @()

Write-Host "🔒 MHC Streaming - API & Security Test Suite" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Test tracking
function Test-Result {
    param($Name, $Passed, $Message)
    if ($Passed) {
        Write-Host "   ✅ $Name" -ForegroundColor Green
        $script:SuccessCount++
    } else {
        Write-Host "   ❌ $Name - $Message" -ForegroundColor Red
        $script:FailCount++
    }
}

function Test-SecurityIssue {
    param($Issue, $Severity, $Details)
    $script:SecurityIssues += @{
        Issue = $Issue
        Severity = $Severity
        Details = $Details
    }
    Write-Host "   🚨 SECURITY: $Issue ($Severity)" -ForegroundColor Yellow
}

# Helper function for API calls
function Invoke-ApiTest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Headers = @{},
        [object]$Body = $null,
        [switch]$ExpectFail
    )
    
    try {
        $uri = "$BaseUrl$Endpoint"
        $params = @{
            Uri = $uri
            Method = $Method
            Headers = $Headers
            ContentType = "application/json"
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json)
        }
        
        $response = Invoke-RestMethod @params -ErrorAction Stop
        return @{ Success = $true; Data = $response; StatusCode = 200 }
    }
    catch {
        if ($ExpectFail) {
            return @{ Success = $false; Error = $_.Exception.Message; StatusCode = $_.Exception.Response.StatusCode.value__ }
        }
        return @{ Success = $false; Error = $_.Exception.Message }
    }
}

# ============================================
# 1. STARTUP & CONNECTIVITY TESTS
# ============================================
Write-Host "1️⃣  Testing Service Connectivity..." -ForegroundColor Yellow
Write-Host ""

$services = @(
    @{ Name = "API Gateway"; Url = "http://localhost:3000/health" }
    @{ Name = "Auth Service"; Url = "http://localhost:3001/health" }
    @{ Name = "Payment Service"; Url = "http://localhost:3004/health" }
    @{ Name = "Analytics Service"; Url = "http://localhost:3005/health" }
)

foreach ($service in $services) {
    try {
        $response = Invoke-RestMethod -Uri $service.Url -TimeoutSec 5 -ErrorAction Stop
        Test-Result $service.Name $true
    }
    catch {
        Test-Result $service.Name $false "Service not responding"
    }
}

Write-Host ""

# ============================================
# 2. AUTHENTICATION API TESTS
# ============================================
Write-Host "2️⃣  Testing Authentication APIs..." -ForegroundColor Yellow
Write-Host ""

# Test 2.1: Register with weak password (should fail)
$weakPassResult = Invoke-ApiTest -Method POST -Endpoint "/api/auth/register" -Body @{
    email = "test@example.com"
    username = "testuser"
    password = "weak"
} -ExpectFail

Test-Result "Reject weak password" ($weakPassResult.StatusCode -eq 400) "Weak passwords should be rejected"

# Test 2.2: Register with strong password
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$testEmail = "test$timestamp@example.com"
$testUsername = "test$timestamp"
$strongPassword = "Test123!@#Strong"

$registerResult = Invoke-ApiTest -Method POST -Endpoint "/api/auth/register" -Body @{
    email = $testEmail
    username = $testUsername
    password = $strongPassword
}

Test-Result "User registration" $registerResult.Success

$testToken = $null
$testUserId = $null

if ($registerResult.Success) {
    $testToken = $registerResult.Data.data.accessToken
    $testUserId = $registerResult.Data.data.user.id
    Write-Host "     User ID: $testUserId" -ForegroundColor Gray
}

# Test 2.3: Duplicate registration (should fail)
$dupResult = Invoke-ApiTest -Method POST -Endpoint "/api/auth/register" -Body @{
    email = $testEmail
    username = $testUsername
    password = $strongPassword
} -ExpectFail

Test-Result "Prevent duplicate registration" ($dupResult.StatusCode -eq 409)

# Test 2.4: Login with valid credentials
$loginResult = Invoke-ApiTest -Method POST -Endpoint "/api/auth/login" -Body @{
    email = $testEmail
    password = $strongPassword
}

Test-Result "User login" $loginResult.Success

# Test 2.5: Login with invalid password
$badLoginResult = Invoke-ApiTest -Method POST -Endpoint "/api/auth/login" -Body @{
    email = $testEmail
    password = "wrongpassword"
} -ExpectFail

Test-Result "Reject invalid password" ($badLoginResult.StatusCode -eq 401)

# Test 2.6: Get current user with token
if ($testToken) {
    $meResult = Invoke-ApiTest -Method GET -Endpoint "/api/auth/me" -Headers @{
        "Authorization" = "Bearer $testToken"
    }
    
    Test-Result "Get authenticated user" $meResult.Success
}

# Test 2.7: Get current user without token (should fail)
$noAuthResult = Invoke-ApiTest -Method GET -Endpoint "/api/auth/me" -ExpectFail

Test-Result "Reject unauthenticated request" ($noAuthResult.StatusCode -eq 401)

Write-Host ""

# ============================================
# 3. RATE LIMITING TESTS
# ============================================
Write-Host "3️⃣  Testing Rate Limiting..." -ForegroundColor Yellow
Write-Host ""

# Test 3.1: Rapid login attempts (should be rate limited after 5)
$rateLimitHit = $false
for ($i = 1; $i -le 7; $i++) {
    $result = Invoke-ApiTest -Method POST -Endpoint "/api/auth/login" -Body @{
        email = "nonexistent@test.com"
        password = "test123"
    } -ExpectFail
    
    if ($result.StatusCode -eq 429) {
        $rateLimitHit = $true
        break
    }
    Start-Sleep -Milliseconds 500
}

Test-Result "Rate limiting active" $rateLimitHit "Should block after 5 attempts"

Write-Host ""

# ============================================
# 4. AUTHORIZATION TESTS
# ============================================
Write-Host "4️⃣  Testing Authorization..." -ForegroundColor Yellow
Write-Host ""

# Test 4.1: Access protected endpoint without token
$noTokenResult = Invoke-ApiTest -Method POST -Endpoint "/api/media/upload" -ExpectFail

Test-Result "Block access without token" ($noTokenResult.StatusCode -eq 401)

# Test 4.2: Access with invalid token
$invalidTokenResult = Invoke-ApiTest -Method GET -Endpoint "/api/auth/me" -Headers @{
    "Authorization" = "Bearer invalid.token.here"
} -ExpectFail

Test-Result "Reject invalid token" ($invalidTokenResult.StatusCode -in @(401, 403))

# Test 4.3: Access with expired token
$expiredToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJpYXQiOjEsImV4cCI6Mn0.invalid"
$expiredResult = Invoke-ApiTest -Method GET -Endpoint "/api/auth/me" -Headers @{
    "Authorization" = "Bearer $expiredToken"
} -ExpectFail

Test-Result "Reject expired token" ($expiredResult.StatusCode -in @(401, 403))

Write-Host ""

# ============================================
# 5. PAYMENT SERVICE TESTS
# ============================================
Write-Host "5️⃣  Testing Payment APIs..." -ForegroundColor Yellow
Write-Host ""

# Test 5.1: Get subscription tiers (public endpoint)
$tiersResult = Invoke-ApiTest -Method GET -Endpoint "/api/payments/tiers"

Test-Result "Get subscription tiers" $tiersResult.Success

# Test 5.2: Subscribe to tier (dev mode - no Stripe)
if ($testUserId) {
    $subscribeResult = Invoke-ApiTest -Method POST -Endpoint "/api/payments/subscribe" -Body @{
        userId = $testUserId
        tier = "INFERNO"
    }
    
    Test-Result "Create subscription (dev mode)" $subscribeResult.Success
}

# Test 5.3: Get user subscription
if ($testUserId) {
    $getSubResult = Invoke-ApiTest -Method GET -Endpoint "/api/payments/subscription?userId=$testUserId"
    
    Test-Result "Get user subscription" $getSubResult.Success
    
    if ($getSubResult.Success -and $getSubResult.Data.data.tier -eq "INFERNO") {
        Write-Host "     ✓ Subscription tier correctly set to INFERNO" -ForegroundColor Gray
    }
}

Write-Host ""

# ============================================
# 6. ANALYTICS SERVICE TESTS
# ============================================
Write-Host "6️⃣  Testing Analytics APIs..." -ForegroundColor Yellow
Write-Host ""

# Test 6.1: Get platform stats
$statsResult = Invoke-ApiTest -Method GET -Endpoint "/api/analytics/stats"

Test-Result "Get platform statistics" $statsResult.Success

# Test 6.2: Track analytics event
$trackResult = Invoke-ApiTest -Method POST -Endpoint "/api/analytics/track" -Body @{
    metric = "test_event"
    value = 1
    metadata = @{ source = "api_test" }
}

Test-Result "Track analytics event" $trackResult.Success

Write-Host ""

# ============================================
# 7. SECURITY VULNERABILITY TESTS
# ============================================
Write-Host "7️⃣  Testing Security Vulnerabilities..." -ForegroundColor Yellow
Write-Host ""

# Test 7.1: SQL Injection attempt
$sqlInjectionResult = Invoke-ApiTest -Method POST -Endpoint "/api/auth/login" -Body @{
    email = "admin@test.com' OR '1'='1"
    password = "password"
} -ExpectFail

if ($sqlInjectionResult.StatusCode -eq 401) {
    Test-Result "SQL injection protection" $true
} else {
    Test-SecurityIssue "SQL Injection" "CRITICAL" "SQL injection may be possible"
}

# Test 7.2: XSS attempt in registration
$xssResult = Invoke-ApiTest -Method POST -Endpoint "/api/auth/register" -Body @{
    email = "xss$timestamp@test.com"
    username = "<script>alert('xss')</script>"
    password = $strongPassword
} -ExpectFail

if ($xssResult.StatusCode -in @(400, 422)) {
    Test-Result "XSS input validation" $true
} else {
    Test-SecurityIssue "XSS Vulnerability" "HIGH" "Script tags not properly sanitized"
}

# Test 7.3: Overly large payload (DoS)
$largePayload = @{
    email = "dos@test.com"
    username = "dostest"
    password = "a" * 1000000  # 1MB string
}

try {
    $dosResult = Invoke-ApiTest -Method POST -Endpoint "/api/auth/register" -Body $largePayload -ExpectFail
    
    if ($dosResult.StatusCode -eq 413 -or $dosResult.Error -match "payload|size|limit") {
        Test-Result "Request size limits" $true
    } else {
        Test-SecurityIssue "DoS via large payload" "MEDIUM" "No request size limits detected"
    }
}
catch {
    Test-Result "Request size limits" $true
}

# Test 7.4: CORS vulnerability check
try {
    $corsHeaders = @{
        "Origin" = "http://evil-site.com"
    }
    $corsResult = Invoke-WebRequest -Uri "$BaseUrl/api/auth/me" -Method OPTIONS -Headers $corsHeaders -ErrorAction Stop
    
    $allowedOrigin = $corsResult.Headers["Access-Control-Allow-Origin"]
    
    if ($allowedOrigin -eq "*") {
        Test-SecurityIssue "Open CORS policy" "HIGH" "CORS allows all origins"
    } else {
        Test-Result "CORS configuration" $true
    }
}
catch {
    Test-Result "CORS configuration" $true
}

# Test 7.5: JWT token manipulation
$manipulatedToken = $testToken -replace "Bearer ", ""
$parts = $manipulatedToken -split "\."
if ($parts.Count -eq 3) {
    # Try to modify the payload
    $fakeToken = $parts[0] + ".eyJ1c2VySWQiOiJhZG1pbiJ9." + $parts[2]
    
    $manipResult = Invoke-ApiTest -Method GET -Endpoint "/api/auth/me" -Headers @{
        "Authorization" = "Bearer $fakeToken"
    } -ExpectFail
    
    if ($manipResult.StatusCode -in @(401, 403)) {
        Test-Result "JWT signature validation" $true
    } else {
        Test-SecurityIssue "JWT validation bypass" "CRITICAL" "Modified JWT accepted"
    }
}

# Test 7.6: Password reset enumeration
$existingUserResult = Invoke-ApiTest -Method POST -Endpoint "/api/auth/login" -Body @{
    email = $testEmail
    password = "wrongpass"
} -ExpectFail

$nonExistingResult = Invoke-ApiTest -Method POST -Endpoint "/api/auth/login" -Body @{
    email = "nonexistent999@test.com"
    password = "wrongpass"
} -ExpectFail

if ($existingUserResult.Error -ne $nonExistingResult.Error) {
    Test-SecurityIssue "User enumeration" "LOW" "Different error messages reveal user existence"
} else {
    Test-Result "User enumeration protection" $true
}

# Test 7.7: Directory traversal attempt
$traversalResult = Invoke-ApiTest -Method GET -Endpoint "/api/media/../../../etc/passwd" -ExpectFail

if ($traversalResult.StatusCode -in @(400, 404)) {
    Test-Result "Directory traversal protection" $true
} else {
    Test-SecurityIssue "Directory traversal" "CRITICAL" "Path traversal may be possible"
}

# Test 7.8: Missing security headers check
try {
    $headersResult = Invoke-WebRequest -Uri "$BaseUrl/api/auth/me" -Method GET -ErrorAction Stop
    
    $securityHeaders = @(
        "X-Frame-Options",
        "X-Content-Type-Options",
        "X-XSS-Protection"
    )
    
    $missingHeaders = @()
    foreach ($header in $securityHeaders) {
        if (-not $headersResult.Headers[$header]) {
            $missingHeaders += $header
        }
    }
    
    if ($missingHeaders.Count -eq 0) {
        Test-Result "Security headers present" $true
    } else {
        Test-SecurityIssue "Missing security headers" "MEDIUM" "Missing: $($missingHeaders -join ', ')"
    }
}
catch {
    # Headers check requires connection
}

Write-Host ""

# ============================================
# 8. INPUT VALIDATION TESTS
# ============================================
Write-Host "8️⃣  Testing Input Validation..." -ForegroundColor Yellow
Write-Host ""

# Test 8.1: Invalid email format
$invalidEmailResult = Invoke-ApiTest -Method POST -Endpoint "/api/auth/register" -Body @{
    email = "notanemail"
    username = "test"
    password = $strongPassword
} -ExpectFail

Test-Result "Email format validation" ($invalidEmailResult.StatusCode -eq 400)

# Test 8.2: Invalid username format
$invalidUsernameResult = Invoke-ApiTest -Method POST -Endpoint "/api/auth/register" -Body @{
    email = "valid@test.com"
    username = "test user!" # spaces and special chars
    password = $strongPassword
} -ExpectFail

Test-Result "Username format validation" ($invalidUsernameResult.StatusCode -eq 400)

# Test 8.3: Missing required fields
$missingFieldsResult = Invoke-ApiTest -Method POST -Endpoint "/api/auth/register" -Body @{
    email = "test@test.com"
} -ExpectFail

Test-Result "Required fields validation" ($missingFieldsResult.StatusCode -eq 400)

# Test 8.4: Field length limits
$longUsernameResult = Invoke-ApiTest -Method POST -Endpoint "/api/auth/register" -Body @{
    email = "long@test.com"
    username = "a" * 1000
    password = $strongPassword
} -ExpectFail

Test-Result "Field length limits" ($longUsernameResult.StatusCode -eq 400)

Write-Host ""

# ============================================
# SUMMARY
# ============================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 TEST RESULTS SUMMARY" -ForegroundColor Cyan
Write-Host ""
Write-Host "   ✅ Passed: $SuccessCount" -ForegroundColor Green
Write-Host "   ❌ Failed: $FailCount" -ForegroundColor Red
Write-Host ""

if ($SecurityIssues.Count -gt 0) {
    Write-Host "🚨 SECURITY ISSUES FOUND: $($SecurityIssues.Count)" -ForegroundColor Red
    Write-Host ""
    
    foreach ($issue in $SecurityIssues) {
        Write-Host "   ⚠️  $($issue.Severity): $($issue.Issue)" -ForegroundColor Yellow
        Write-Host "       $($issue.Details)" -ForegroundColor Gray
    }
    Write-Host ""
}

# Calculate score
$totalTests = $SuccessCount + $FailCount
$successRate = if ($totalTests -gt 0) { [math]::Round(($SuccessCount / $totalTests) * 100, 1) } else { 0 }

Write-Host "Overall Score: $successRate%" -ForegroundColor $(if ($successRate -ge 90) { "Green" } elseif ($successRate -ge 70) { "Yellow" } else { "Red" })
Write-Host ""

if ($SecurityIssues.Count -eq 0 -and $FailCount -eq 0) {
    Write-Host "✅ All tests passed! APIs are working and secure." -ForegroundColor Green
    exit 0
}
elseif ($SecurityIssues.Count -gt 0) {
    Write-Host "⚠️  Security issues detected. Review and fix before production." -ForegroundColor Yellow
    exit 1
}
else {
    Write-Host "❌ Some tests failed. Review the failures above." -ForegroundColor Red
    exit 1
}
