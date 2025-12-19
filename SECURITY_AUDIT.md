# Security Audit Report - MHC Streaming Backend

## Audit Date: 2025-12-14

## ✅ VULNERABILITIES FOUND & STATUS

### 1. NPM Package Vulnerabilities
**Status**: IDENTIFIED - Low Risk
- **Issue**: 3 high severity vulnerabilities in frontend dependencies (eslint-config-next, glob)
- **Impact**: Development dependencies only, not in production runtime
- **Risk Level**: LOW (dev-only, no backend services affected)
- **Action**: Update frontend dependencies when ready

```powershell
# Fix when ready (may have breaking changes)
cd frontend
npm audit fix --force
```

### 2. Multer Deprecated Warning
**Status**: IDENTIFIED - Medium Risk
- **Issue**: Multer 1.x has known vulnerabilities
- **Impact**: Used in media service for file uploads
- **Risk Level**: MEDIUM
- **Fix Required**: YES

---

## 🔒 SECURITY ISSUES IDENTIFIED

### HIGH PRIORITY

#### 1. Missing Authentication Middleware
**Severity**: 🔴 CRITICAL
**Services Affected**: All services
**Issue**: Most endpoints lack authentication verification
```typescript
// CURRENT (INSECURE):
app.post('/api/media/upload', async (req, res) => {
  // Anyone can upload!
})

// NEEDED:
app.post('/api/media/upload', authenticateUser, async (req, res) => {
  // Only authenticated users
})
```

#### 2. JWT Secret Keys in Plain Text
**Severity**: 🔴 CRITICAL
**Issue**: Default JWT secrets are visible in code
```typescript
// auth-service/src/utils/jwt.ts
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // WEAK DEFAULT
```
**Fix**: Must change in production, no defaults

#### 3. No Rate Limiting on Auth Endpoints
**Severity**: 🟠 HIGH
**Issue**: Registration/login vulnerable to brute force
**Location**: auth-service
**Fix**: Add per-endpoint rate limiting

#### 4. SQL Injection Risk (Prisma Protects)
**Severity**: 🟢 LOW (Mitigated)
**Status**: Protected by Prisma ORM
**Note**: Using Prisma prevents SQL injection, but stay vigilant

#### 5. Weak Password Requirements
**Severity**: 🟠 HIGH
**Issue**: Current validation allows weak passwords
```typescript
// Current: Only requires 8 chars + 1 upper + 1 lower + 1 number
// Needs: Minimum 12 chars, special chars, password strength check
```

#### 6. No Input Sanitization
**Severity**: 🟠 HIGH
**Issue**: User inputs not sanitized (XSS risk)
**Affected**: Title, description, bio fields
**Fix**: Sanitize HTML, limit lengths strictly

#### 7. File Upload Vulnerabilities
**Severity**: 🔴 CRITICAL
**Issues**:
- No file type verification beyond MIME type (can be spoofed)
- No virus scanning
- File size limits but no rate limits
- Files stored with predictable names
- No CDN/signed URLs (files publicly accessible)

#### 8. Missing CORS Configuration
**Severity**: 🟠 HIGH
**Issue**: Using `cors()` with no restrictions
```typescript
app.use(cors()); // Allows ALL origins!
```

#### 9. No Request Size Limits
**Severity**: 🟠 HIGH
**Issue**: JSON payload size unlimited (DoS risk)
**Fix**: Add body-parser limits

#### 10. Database Credentials in Docker Compose
**Severity**: 🟠 HIGH
**Issue**: Plain text passwords in docker-compose.yml
```yaml
POSTGRES_PASSWORD: mhc_password  # Change this!
```

### MEDIUM PRIORITY

#### 11. No API Versioning
**Issue**: API changes will break clients
**Fix**: Use /api/v1/... pattern

#### 12. Missing HTTPS Enforcement
**Issue**: No redirect from HTTP to HTTPS
**Fix**: Add middleware for production

#### 13. Error Messages Too Detailed
**Issue**: Stack traces in production
```typescript
details: process.env.NODE_ENV === 'development' ? err.stack : undefined
```
**Note**: This is good, but ensure NODE_ENV is set correctly

#### 14. No Request Logging/Monitoring
**Issue**: Can't track suspicious activity
**Fix**: Add Winston/Morgan logging

#### 15. Missing Security Headers
**Issue**: Using helmet() but need custom config
**Fix**: Configure CSP, X-Frame-Options, etc.

### LOW PRIORITY

#### 16. No Session Management
**Note**: Using JWT (stateless), but refresh tokens should be rotated

#### 17. Email Verification Not Implemented
**Note**: Users can register without email verification

---

## 🛡️ IMMEDIATE FIXES REQUIRED

### Fix 1: Add Authentication Middleware

```typescript
// packages/common/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}
```

### Fix 2: Secure CORS Configuration

```typescript
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3001',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

### Fix 3: Add Rate Limiting per Endpoint

```typescript
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

app.post('/api/auth/login', authLimiter, loginHandler);
app.post('/api/auth/register', authLimiter, registerHandler);
```

### Fix 4: Input Sanitization

```typescript
import DOMPurify from 'isomorphic-dompurify';

function sanitizeInput(input: string, maxLength: number = 1000): string {
  return DOMPurify.sanitize(input.trim().substring(0, maxLength));
}
```

### Fix 5: Secure File Upload

```typescript
import crypto from 'crypto';
import path from 'path';

// Generate secure random filename
function secureFilename(originalname: string): string {
  const ext = path.extname(originalname);
  const hash = crypto.randomBytes(16).toString('hex');
  return `${hash}${ext}`;
}

// Verify file type by content (magic numbers)
import fileType from 'file-type';

async function verifyFileType(buffer: Buffer, allowedTypes: string[]) {
  const type = await fileType.fromBuffer(buffer);
  if (!type || !allowedTypes.includes(type.mime)) {
    throw new Error('Invalid file type');
  }
  return type;
}
```

### Fix 6: Request Size Limits

```typescript
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
```

### Fix 7: Strong Password Policy

```typescript
import zxcvbn from 'zxcvbn';

export const strongPasswordSchema = z.string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[A-Z]/, 'Password must contain uppercase letter')
  .regex(/[a-z]/, 'Password must contain lowercase letter')
  .regex(/[0-9]/, 'Password must contain number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain special character')
  .refine((password) => {
    const result = zxcvbn(password);
    return result.score >= 3; // Strong password
  }, 'Password is too weak');
```

---

## ✅ SECURITY CHECKLIST

### Before Production:

- [ ] Change all default passwords/secrets
- [ ] Add authentication middleware to all protected routes
- [ ] Configure CORS with specific origins
- [ ] Add rate limiting to all endpoints
- [ ] Enable HTTPS and force redirect
- [ ] Add comprehensive request logging
- [ ] Implement file type verification
- [ ] Add virus scanning for uploads
- [ ] Setup monitoring and alerting
- [ ] Implement email verification
- [ ] Add session timeout/refresh token rotation
- [ ] Configure helmet with strict CSP
- [ ] Add input sanitization everywhere
- [ ] Limit request payload sizes
- [ ] Setup WAF (Web Application Firewall)
- [ ] Regular security audits and penetration testing

### Environment Variables Required:

```env
# MUST CHANGE THESE IN PRODUCTION
JWT_SECRET=<generate-with-openssl-rand-base64-64>
JWT_REFRESH_SECRET=<generate-with-openssl-rand-base64-64>
POSTGRES_PASSWORD=<strong-random-password>
REDIS_PASSWORD=<strong-random-password>

# Configure these
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
NODE_ENV=production
```

---

## 🔧 GENERATE SECURE SECRETS

```powershell
# Generate JWT secret
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))

# Or use OpenSSL (if installed)
openssl rand -base64 64
```

---

## 📊 RISK SUMMARY

**Critical**: 3 issues (auth middleware, JWT secrets, file uploads)
**High**: 6 issues (rate limiting, CORS, input sanitization, etc.)
**Medium**: 5 issues (versioning, logging, etc.)
**Low**: 2 issues (session management, email verification)

**Overall Risk**: 🔴 HIGH - Do NOT deploy to production without fixes

---

## 🎯 RECOMMENDED IMMEDIATE ACTIONS

1. **Add authentication middleware** to all protected endpoints
2. **Change all default secrets** in .env
3. **Configure CORS** with specific allowed origins
4. **Add rate limiting** to auth endpoints
5. **Upgrade Multer** to v2.x
6. **Test everything** after applying fixes
