# MHC SYSTEM INTEGRITY DIRECTIVE
## Reinforced Global Standard for All Future Development

This directive is **AUTOMATICALLY EMBEDDED** into every AI-driven change, component addition, and architectural decision.

---

## 🔒 Core Requirements (NON-NEGOTIABLE)

Every new component, service, or feature MUST:

### 1. **Be Backward-Compatible**
- Never break existing APIs
- Maintain database schema compatibility
- Support gradual rollouts
- Document breaking changes (if unavoidable)

### 2. **Work with Web, Mobile & Admin Apps**
- API-first architecture
- Works across platforms
- No platform-specific hardcoding
- Responsive design principles

### 3. **Require NO Google, AWS, Firebase, or Azure**
- ✅ Self-hosted alternatives only
- ✅ PostgreSQL (not managed services)
- ✅ Redis (not ElastiCache)
- ✅ S3-compatible (MinIO, Backblaze, Storj)
- ✅ SMTP (not SES)
- ✅ Own CDN (Cloudflare or Bunny)
- ❌ NO Google Analytics → Plausible or self-hosted
- ❌ NO Firebase → Postgres + custom auth
- ❌ NO AWS Lambda → Bull queue + workers
- ❌ NO Azure Storage → MinIO

### 4. **Pass Forensic Logging Injection**
- Every action logged with:
  - User ID
  - Timestamp
  - Action type
  - Resource
  - Changes made
  - IP address
  - User agent
  - Success/failure status
- Logs immutable for 90 days
- Queryable for compliance audits
- GDPR/CCPA compliant

### 5. **Respect Artist Royalties**
- Never modify royalty calculations
- Every transaction tracked
- Automatic crediting on views/tips/patron revenue
- Monthly payouts guaranteed
- Transparent fee structure (platform fee only)
- No hidden deductions
- Artist always owns their content

### 6. **Respect Subscription Gating**
- Patron-only content enforcement
- Access control checks on all endpoints
- Subscription status verified
- Graceful degradation for expired subs
- No unauthorized access to premium content
- Audit trail for access attempts

### 7. **Respect Offline Failover Architecture**
- Must work without external APIs
- Must work with local-only deployments
- Must support mesh networks
- Must support satellite fallback
- Graceful degradation prioritized
- No mandatory cloud dependencies

### 8. **Maintain Dante Realm Styling**
- Three aesthetic themes:
  - **INFERNO** (#000000 dark, red accents, burned effects)
  - **PURGATORIO** (#C7C7C7 gray, desaturated, ethereal)
  - **PARADISO** (#FFFFFF white, golden, heavenly)
- CSS classes: `.inferno`, `.purgatorio`, `.paradiso`
- Tailwind extensions respected
- Visual consistency across all realms
- No hardcoded colors

---

## 🏗️ Architecture Standards

### Required Failover Layers
```
Layer 1: CDN          (Cloudflare/Bunny - Primary)
Layer 2: Edge Relays  (Community VPS - Backup)
Layer 3: Local Mesh   (WiFi/LoRa - Offline-first)
Layer 4: Satellite    (Starlink/OneWeb - Doomsday)
```

### Required Components
- ✅ Error handling with custom error classes
- ✅ Input validation and sanitization
- ✅ Rate limiting on all endpoints
- ✅ Authentication checks where needed
- ✅ Logging to logger.ts
- ✅ Audit trail for compliance
- ✅ Documentation with JSDoc
- ✅ TypeScript with strict mode
- ✅ No `any` types
- ✅ Test coverage

### Forbidden Patterns
- ❌ Vendor lock-in dependencies
- ❌ Hardcoded API keys
- ❌ Magic strings (use constants)
- ❌ Missing error handling
- ❌ Unvalidated user input
- ❌ Unlogged database changes
- ❌ Missing authentication checks
- ❌ Unclear type definitions
- ❌ No fallback for external APIs

---

## 🚨 Big Tech Shutdown Mode

If external services become unavailable, system MUST:

### Automatically Enable Shutdown Mode
```typescript
// Embedded in disaster-recovery.ts
const shutdownMode = new BigTechShutdownMode();
await shutdownMode.enable();
```

### Switch To:
| Service | Normal | Shutdown Mode |
|---------|--------|---------------|
| Payments | Stripe | Crypto, Bank Wire, Manual |
| DNS | External | Static IP |
| CDN | External | On-prem NGINX |
| Livestream | External | NGINX-RTMP |
| Chat | External | NATS |
| Auth | JWT (works offline) | JWT (unchanged) |
| Database | PostgreSQL (local) | PostgreSQL (unchanged) |
| Cache | Redis (local) | Redis (unchanged) |

---

## 📋 Component Compatibility Checklist

Before ANY code is added or changed:

### Code Quality
- [ ] TypeScript strict mode passes
- [ ] No `any` types
- [ ] All functions have JSDoc
- [ ] Error handling implemented
- [ ] Input validation on all endpoints
- [ ] Output sanitized
- [ ] Tests written

### Logging & Audit
- [ ] Uses logger from utils/logger.ts
- [ ] Calls logger.audit() for user actions
- [ ] Sensitive data never logged
- [ ] Error context included
- [ ] Performance metrics tracked

### Security
- [ ] Authentication checks where required
- [ ] Authorization checks for admin actions
- [ ] Rate limiting enabled
- [ ] No hardcoded secrets
- [ ] Environment variables for config
- [ ] Content filtering for illegal content

### Architecture
- [ ] Works offline
- [ ] Works without external APIs
- [ ] Database migrations included
- [ ] Backwards compatible
- [ ] Documented in DEVELOPMENT.md
- [ ] Failover tested
- [ ] Cross-platform (web/mobile/admin)

### Compliance
- [ ] GDPR/CCPA compliant
- [ ] Artist royalties respected
- [ ] Subscription gating enforced
- [ ] Audit trail immutable
- [ ] Data retention policies followed
- [ ] User data exportable
- [ ] Account deletion supported

---

## 🔄 Automatic Backups & Recovery

### Database
- **Schedule**: Daily at 2 AM UTC
- **Command**: `pg_dump mhc > /backups/mhc_$(date +%F).sql`
- **Retention**: 30 days
- **Verification**: Backup tested monthly
- **Restore**: `psql mhc < /backups/mhc_YYYY-MM-DD.sql`

### Uploads (Cold Storage)
- **Schedule**: Nightly at 3 AM UTC
- **Command**: `rsync -av /uploads /coldstorage/uploads`
- **Retention**: Indefinite (cold storage)
- **Restore**: `rsync -av /coldstorage/uploads /uploads`

### System Integrity
- **Check**: Every startup + hourly
- **Verifies**: Database, Redis, backup dirs, uploads
- **Action**: Alert if any check fails
- **Recovery**: Automatic failover to backup

---

## 🚀 Integration Points

All new systems must integrate with:

- **Authentication** → src/middleware/auth.middleware.ts
- **Logging** → src/utils/logger.ts
- **Errors** → src/utils/errors.ts
- **Validation** → src/utils/validation.ts
- **Database** → Prisma ORM
- **Caching** → Redis
- **Auth Tokens** → JWT (no vendor lock-in)
- **Payments** → Stripe + Crypto + Bank
- **Realtime** → Socket.io (can use NATS)
- **Storage** → S3-compatible (MinIO/Backblaze)
- **CDN** → Cloudflare or Bunny (can switch)

---

## 📝 Documentation Requirements

Every new component must include:

1. **README Section** in DEVELOPMENT.md
   - What it does
   - Why it exists
   - How to use
   - Configuration

2. **JSDoc Comments**
   - Function purpose
   - Parameters with types
   - Return value with type
   - Throws what errors

3. **Database Schema**
   - Prisma model if applicable
   - Migrations if schema changes
   - Relationships documented

4. **API Endpoints**
   - Path and method
   - Authentication required
   - Request/response schemas
   - Example curl commands

5. **Error Scenarios**
   - What can fail
   - How to handle
   - Recovery steps

---

## 🛡️ No Exceptions

This directive applies to:
- ✅ New services
- ✅ New routes
- ✅ New middleware
- ✅ Database changes
- ✅ API modifications
- ✅ Utility additions
- ✅ Third-party integrations
- ✅ Frontend components
- ✅ Mobile apps
- ✅ Admin tools

**THERE ARE NO EXCEPTIONS.**

---

## 📞 Enforcement

### For AI Agents
Before generating code:
1. Check this directive
2. Verify all requirements
3. Run compatibility checklist
4. Test failover scenarios
5. Verify audit trail

If any requirement is violated → **REJECT AND REPORT**

### For Human Developers
Before merging code:
1. Run `npm run lint` and `npx tsc --noEmit`
2. Verify all checklist items
3. Test offline mode
4. Verify audit logs
5. Check documentation

---

## 🎯 Philosophy

> **Artists own their content. Fans own their support. The platform owns nothing.**

Every line of code must respect this principle.

---

**Status**: ✅ ACTIVE AND ENFORCED  
**Last Updated**: December 13, 2025  
**Applies To**: All current and future development  
**Violations**: Automatically flagged and require executive approval to override
