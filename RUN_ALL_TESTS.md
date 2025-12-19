# 🧪 Run All Tests - MHC Streaming

## Quick Start Guide

### Step 1: Start Services

```powershell
# Start database services
docker-compose up postgres redis -d

# Wait for databases to be ready
Start-Sleep -Seconds 15

# Generate Prisma client (if not done already)
npm run db:generate --workspace=@mhc/database

# Push database schema
npm run db:push --workspace=@mhc/database

# Generate secure secrets for testing
$jwtSecret = [Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))
$jwtRefresh = [Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))

# Create .env file
@"
DATABASE_URL=postgresql://mhc_user:mhc_password@localhost:5432/mhc_streaming
REDIS_URL=redis://localhost:6379
JWT_SECRET=$jwtSecret
JWT_REFRESH_SECRET=$jwtRefresh
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
NODE_ENV=development
"@ | Set-Content .env

# Start backend services (in separate terminal or background)
npm run dev
```

### Step 2: Run Tests

Wait about 30 seconds for services to fully start, then run:

```powershell
# Run security audit tests
.\test-security.ps1

# Run API and penetration tests
.\test-api-security.ps1
```

---

## Test Suites

### 1. Security Audit (`test-security.ps1`)
**Tests code-level security implementations**

✅ Tests:
- TypeScript compilation
- Environment configuration
- Password validation strength
- Authentication middleware presence
- Rate limiting configuration
- CORS security
- Request size limits
- JWT security (no fallback defaults)
- File upload security

**Expected Result:** All tests pass ✅

---

### 2. API & Security Tests (`test-api-security.ps1`)
**Tests runtime behavior and security vulnerabilities**

#### Tested APIs:

**Authentication:**
- ✅ User registration (strong password)
- ❌ Weak password rejection
- ✅ User login
- ❌ Invalid credentials rejection
- ✅ Token-based authentication
- ❌ Unauthorized access blocking
- ❌ Duplicate registration prevention

**Rate Limiting:**
- ✅ Login rate limiting (5 attempts/15min)
- ❌ Excessive requests blocked

**Authorization:**
- ✅ Protected endpoint access control
- ❌ Invalid token rejection
- ❌ Expired token rejection
- ❌ Missing token rejection

**Payment Service:**
- ✅ Get subscription tiers
- ✅ Subscribe to tier (dev mode)
- ✅ Get user subscription

**Analytics Service:**
- ✅ Get platform statistics
- ✅ Track analytics events

#### Security Vulnerability Tests:

**1. SQL Injection**
- Tests: `admin@test.com' OR '1'='1`
- Expected: ✅ Blocked (Prisma ORM protection)

**2. XSS (Cross-Site Scripting)**
- Tests: `<script>alert('xss')</script>` in username
- Expected: ✅ Rejected by validation

**3. DoS (Denial of Service)**
- Tests: 1MB payload
- Expected: ✅ Blocked by size limits

**4. CORS Policy**
- Tests: Requests from unauthorized origins
- Expected: ✅ Restricted origins only

**5. JWT Manipulation**
- Tests: Modified JWT tokens
- Expected: ✅ Signature validation rejects

**6. User Enumeration**
- Tests: Different error messages for existing/non-existing users
- Expected: ✅ Same error messages

**7. Directory Traversal**
- Tests: `/../../../etc/passwd`
- Expected: ✅ Blocked by Express

**8. Security Headers**
- Tests: X-Frame-Options, X-Content-Type-Options, etc.
- Expected: ✅ Present (Helmet.js)

**9. Input Validation**
- Tests: Invalid email, username format, missing fields
- Expected: ✅ All validated with Zod

---

## Expected Test Results

### ✅ Perfect Score (100%)
```
📊 TEST RESULTS SUMMARY

   ✅ Passed: 35+
   ❌ Failed: 0

Overall Score: 100%

✅ All tests passed! APIs are working and secure.
```

### 🚨 If Security Issues Found
```
🚨 SECURITY ISSUES FOUND: X

   ⚠️  CRITICAL: SQL Injection
       SQL injection may be possible

   ⚠️  HIGH: Open CORS policy
       CORS allows all origins
```

**Action:** Review and fix issues in `SECURITY_AUDIT.md`

---

## Common Issues & Solutions

### Services Not Starting

**Problem:** Services fail to start
```
Error: Cannot find module '@mhc/database'
```

**Solution:**
```powershell
# Rebuild packages
npm run build --workspace=@mhc/common
npm run db:generate --workspace=@mhc/database
```

### Database Connection Failed

**Problem:** Cannot connect to PostgreSQL
```
Error: Connection refused
```

**Solution:**
```powershell
# Check if Docker is running
docker ps

# Restart database
docker-compose restart postgres

# Check logs
docker logs mhc-postgres
```

### JWT Secret Not Configured

**Problem:** Services crash on startup
```
Error: JWT_SECRET and JWT_REFRESH_SECRET must be set
```

**Solution:**
```powershell
# Generate and add to .env
$jwt = [Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))
Add-Content .env "JWT_SECRET=$jwt"
```

### Rate Limiting Not Working

**Problem:** Rate limit tests fail

**Solution:**
- Ensure you're testing against a fresh instance
- Wait 15 minutes between rate limit tests
- Check if Redis is running: `docker ps | findstr redis`

### Port Already in Use

**Problem:** Cannot start service on port 3000

**Solution:**
```powershell
# Find process using port
netstat -ano | findstr :3000

# Kill process (replace PID)
taskkill /PID <PID> /F
```

---

## Continuous Testing

### Before Every Commit
```powershell
.\test-security.ps1
```

### Before Every Deployment
```powershell
.\test-security.ps1
.\test-api-security.ps1
```

### After Major Changes
```powershell
# Full suite
.\test-security.ps1
.\test-api-security.ps1

# Manual penetration testing
# Use tools like:
# - OWASP ZAP
# - Burp Suite
# - Postman
```

---

## Test Coverage

### ✅ Covered
- Authentication & Authorization
- Rate Limiting
- Input Validation
- SQL Injection
- XSS
- CORS
- JWT Security
- Request Size Limits
- File Upload Security
- Security Headers

### 🟡 Partial Coverage
- Session Management
- Password Reset Flow
- Email Verification
- 2FA

### ⚪ Not Covered (Requires Manual Testing)
- Load Testing
- Stress Testing
- Performance Testing
- Browser Compatibility
- Mobile App Testing
- Third-party Integration Testing

---

## Next Steps

1. ✅ Run both test scripts
2. ✅ Fix any failing tests
3. ✅ Fix any security issues
4. ✅ Run tests again
5. ✅ Document any custom tests needed
6. 🚀 Deploy with confidence!

---

## Support

- **Security Audit:** `SECURITY_AUDIT.md`
- **Security Hardening:** `SECURITY_HARDENED.md`
- **Test Results:** `TEST_RESULTS.md`
- **Getting Started:** `GETTING_STARTED.md`
