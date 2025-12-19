# MHC STREAMING - GLOBAL SYSTEM DIRECTIVE

**Status**: ACTIVE AND ENFORCED
**Last Updated**: December 13, 2025
**Applies To**: Every component, service, API, database model, and frontend module

---

## 🛡️ MANDATORY REQUIREMENTS

Every new addition to MHC Streaming must satisfy ALL of the following:

### 1. **FULLY COMPATIBLE WITH EXISTING COMPONENTS**

- ✅ Must not break or modify existing database tables
- ✅ Must not change existing API endpoint signatures
- ✅ Must not conflict with existing service logic
- ✅ Must integrate seamlessly with auth, logging, validation systems
- ✅ Must respect existing error handling patterns
- ✅ Must use existing utility functions and middleware

**Verification**:
```bash
npm run build          # Must compile with zero errors
npm run typecheck      # Must pass strict TypeScript
npm run lint          # Must follow code style
```

---

### 2. **BACKWARD-COMPATIBLE WITH ALL EXISTING APIS**

- ✅ Existing endpoints must work unchanged
- ✅ Request/response schemas must not be modified
- ✅ New fields must be optional (never required on old payloads)
- ✅ Deprecated fields must remain for 2+ versions
- ✅ Version old APIs if breaking changes unavoidable (v2 endpoints)
- ✅ Provide migration guide if data structure changes

**Example - Backward Compatible**:
```typescript
// ✅ GOOD - Old API still works, new field optional
POST /api/videos
Body: {
  title: "...",
  url: "...",
  isPublic?: true,        // NEW - optional
  trendingScore?: 0       // NEW - optional
}

// ❌ BAD - Breaks existing clients
POST /api/videos
Body: {
  title: "...",          // CHANGED TYPE
  url: "...",
  rankScore: 0           // NEW - required
}
```

---

### 3. **SECURITY-REVIEWED AGAINST EXISTING SECURITY WHITEPAPER**

Before any new component can be deployed, it must pass security review:

**Required Checks**:
- ✅ No hardcoded secrets or API keys
- ✅ All user input validated and sanitized
- ✅ All database queries use parameterized statements (Prisma)
- ✅ Authentication required on protected endpoints
- ✅ Authorization checks for admin/artist-only features
- ✅ Rate limiting on public endpoints
- ✅ No SQL injection, XSS, CSRF vulnerabilities
- ✅ Sensitive data never logged in plain text
- ✅ HTTPS enforced in production
- ✅ No direct file system access without sandboxing

**Security Checklist**:
```
[ ] No secrets in code or config
[ ] Input validation on all endpoints
[ ] Auth/authz checks present
[ ] Rate limiting configured
[ ] Error messages don't leak info
[ ] Sensitive data masked in logs
[ ] Dependencies up-to-date
[ ] No known CVEs in packages
```

---

### 4. **SUBSCRIPTION-AWARE FOR FEATURE GATING**

All features must respect subscription tiers:

**Subscription Levels**:
- **FREE**: Basic viewing, limited uploads
- **BRONZE** ($4.99/mo): 10 uploads/day, basic stats
- **SILVER** ($9.99/mo): Unlimited uploads, detailed analytics
- **GOLD** ($24.99/mo): Custom branding, priority support
- **PLATINUM** ($99.99/mo): Enterprise features, API access

**Feature Gating Pattern**:
```typescript
// Check subscription tier
const tier = await getSubscriptionTier(userId);

if (!hasFeature(tier, 'CUSTOM_BRANDING')) {
  return res.status(403).json({ error: 'Feature requires GOLD tier' });
}

// Or middleware
router.post('/custom-branding', subscriptionTier('GOLD'), handler);
```

**Rules**:
- ✅ Premium features must check tier before processing
- ✅ Free users must see upgrade prompts
- ✅ Tier changes must not break existing usage
- ✅ Trial periods must work for all tiers
- ✅ Downgrading must gracefully degrade features

---

### 5. **REALTIME-COMPATIBLE WITH EXISTING WEBSOCKET INFRASTRUCTURE**

All features must work with Socket.io and real-time updates:

**Real-Time Requirements**:
- ✅ State changes must emit Socket.io events
- ✅ No polling-only implementations
- ✅ Must handle client reconnection gracefully
- ✅ Must work with Redis pub/sub for multi-instance
- ✅ Must include room/namespace isolation
- ✅ Must implement acknowledgment handling

**Socket.io Event Pattern**:
```typescript
// Broadcast state change
io.to(room).emit('resource-updated', {
  resourceId: '...',
  data: {...},
  timestamp: new Date()
});

// Include ack for reliability
socket.emit('resource-updated', data, (ack) => {
  logger.info('Client received update', { ack });
});
```

**Existing Infrastructure**:
- Socket.io on same server (port 4000)
- Rooms: `livestream-${streamId}`, `user-${userId}`
- Namespaces: `/livestream`, `/notifications`
- Redis adapter for scaling across instances

---

### 6. **PERFORMANCE-BENCHMARKED AGAINST CURRENT PRODUCTION LOAD**

No new feature may degrade performance:

**Performance Targets**:
- API response time: < 200ms (p95)
- Database query time: < 50ms (p95)
- Socket.io message latency: < 100ms
- Page load time: < 2s
- Memory usage: No unbounded growth

**Benchmarking Requirements**:
```bash
# Load test new endpoint
npx autocannon -c 100 -d 30s http://localhost:4000/api/new-endpoint

# Memory profile
node --inspect dist/server.js
# Chrome DevTools > Memory > Heap Snapshot

# Database query time
QUERY_LOG=true npm run dev
# Check logs for slow queries
```

**Rules**:
- ✅ Complex queries must use indexes
- ✅ Pagination required for large result sets
- ✅ Caching must be implemented for reads
- ✅ Async operations must not block event loop
- ✅ Batch operations for bulk updates
- ✅ Connection pooling for databases

---

### 7. **STYLED USING DANTE REALM VISUAL SYSTEM**

All frontend and API responses must support Dante Realm theming:

**Three Realms**:
- **INFERNO** (#000000): Dark, intense, red accents, burned effects
- **PURGATORIO** (#C7C7C7): Gray, desaturated, ethereal, transitional
- **PARADISO** (#FFFFFF): White, golden, heavenly, luminous

**CSS Class Pattern**:
```css
/* Realm-aware styling */
.card.inferno {
  background: #1a1a1a;
  border: 1px solid #cc0000;
  color: #fff;
}

.card.purgatorio {
  background: #e8e8e8;
  border: 1px solid #999;
  color: #333;
}

.card.paradiso {
  background: #fff;
  border: 1px solid #daa520;
  color: #000;
}
```

**Tailwind Extension**:
```typescript
// tailwind.config.js
theme: {
  colors: {
    infernoDark: '#000000',
    purgatorioGray: '#C7C7C7',
    paradisoWhite: '#FFFFFF',
    infernoRed: '#CC0000',
    paradisoGold: '#DAA520',
  }
}
```

**Rules**:
- ✅ All UI must support all three realms
- ✅ Theme switching must be seamless
- ✅ No hardcoded colors in components
- ✅ Use CSS variables for colors
- ✅ Include dark/light mode detection
- ✅ Realm preference stored per user

---

### 8. **LOGGED AND AUDITABLE UNDER COMPLIANCE FRAMEWORK**

All actions must be recorded for regulatory compliance:

**Logging Requirements**:
- ✅ Use `logger.audit()` for user actions
- ✅ Include user ID, action, resource, timestamp
- ✅ Log authentication/authorization checks
- ✅ Log data modifications (before/after)
- ✅ Log admin actions with reason
- ✅ Log external API calls
- ✅ Never log sensitive data (passwords, tokens, SSNs)

**Audit Log Pattern**:
```typescript
// Every user action
logger.audit(userId, 'ACTION_NAME', 'resource-type', resourceId, 'success', {
  changes: { field: oldValue, newValue },
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
  reason: 'user request'
});

// Admin action
logger.audit(adminId, 'DELETE_USER', 'user', targetUserId, 'success', {
  changes: { status: 'active' },
  reason: 'Repeated ToS violations'
});
```

**Compliance Requirements**:
- ✅ GDPR: User can request data export
- ✅ CCPA: User can request deletion
- ✅ HIPAA: If health data present
- ✅ SOC2: Audit trail immutable
- ✅ Retention: Logs kept 90 days minimum
- ✅ Encryption: Sensitive fields encrypted at rest

**Audit Trail Queries**:
```typescript
// Get user's activity
const logs = logger.getAuditLogs({ userId, since: 7 days ago });

// Get admin actions
const logs = logger.getAuditLogs({ action: 'DELETE_CONTENT' });

// Get modifications to specific resource
const logs = logger.getAuditLogs({ resource: 'user', resourceId });
```

---

## 📋 IMPLEMENTATION CHECKLIST

Before committing ANY new code:

### Code Quality
- [ ] TypeScript strict mode passes (`npx tsc --noEmit`)
- [ ] No `any` types (use `unknown` and narrow)
- [ ] All functions have JSDoc comments
- [ ] Error handling on all async operations
- [ ] Input validation on all endpoints
- [ ] Output sanitized before returning

### Security
- [ ] No hardcoded secrets
- [ ] All DB queries parameterized
- [ ] Auth/authz checks present
- [ ] Rate limiting configured
- [ ] Errors don't leak information
- [ ] Logs don't contain secrets

### Database
- [ ] New tables have proper indexes
- [ ] Foreign key constraints present
- [ ] Cascade delete configured where needed
- [ ] Migrations created
- [ ] No N+1 query patterns

### API
- [ ] Request/response schemas validated
- [ ] Backward compatible
- [ ] Paginated if returning lists
- [ ] Proper HTTP status codes
- [ ] Error messages helpful

### Real-Time
- [ ] Socket.io events emitted on changes
- [ ] Room/namespace isolation
- [ ] Connection handling robust
- [ ] No race conditions

### Performance
- [ ] Queries < 50ms (p95)
- [ ] Responses < 200ms (p95)
- [ ] No unbounded memory growth
- [ ] Caching implemented
- [ ] Load tested

### Compliance
- [ ] Audit logging on user actions
- [ ] Subscription tier checks
- [ ] GDPR/CCPA compliant
- [ ] No vendor lock-in
- [ ] Offline capable

### Styling
- [ ] Supports all three realms
- [ ] Uses CSS variables/Tailwind
- [ ] No hardcoded colors
- [ ] Responsive design
- [ ] Accessible (WCAG AA)

---

## 🚫 FORBIDDEN PATTERNS

The following are NEVER allowed:

```typescript
// ❌ Hardcoded secrets
const API_KEY = "sk_live_abc123";

// ❌ Missing auth checks
app.delete('/api/user/:id', (req, res) => {
  // No authentication!
});

// ❌ SQL injection risk
db.query(`SELECT * FROM users WHERE id = ${userId}`);

// ❌ Unvalidated user input
const email = req.body.email; // No validation!

// ❌ Sensitive data in logs
logger.info('User login', { email, password });

// ❌ No error handling
const result = await someAsyncOperation(); // Could throw!

// ❌ Vendor lock-in
const s3 = new AWS.S3(); // Hard dependency on AWS

// ❌ No Dante styling
const style = { color: '#FF0000' }; // Hardcoded color!

// ❌ No audit trail
await db.delete('users', { id }); // No logging!

// ❌ Breaking API change
// Old: POST /api/videos { title, url }
// New: POST /api/videos { title, url, required_rankScore }
```

---

## ✅ ENFORCEMENT

### For Developers
1. Run checklist before committing
2. Self-review against this directive
3. Request code review from maintainers
4. All checks must pass in CI/CD

### For Code Review
1. Verify all 8 requirements met
2. Check checklist items
3. Test backward compatibility
4. Performance test if significant
5. Security review new endpoints
6. Approve only if all pass

### For CI/CD Pipeline
```yaml
# Required checks before merge
- TypeScript compilation
- Lint and format
- Security scanning (SAST)
- Unit tests
- Integration tests
- Performance benchmarks
- Dependency audit
- License compliance
```

---

## 📞 ESCALATION

If a new requirement conflicts with this directive:

1. **Document the conflict** clearly
2. **Propose alternative** that satisfies directive
3. **Get explicit approval** from architecture committee
4. **Update directive** if truly necessary
5. **Never bypass checks**

---

## 🎯 PHILOSOPHY

> **Every line of code must earn its place through compliance, security, and respect for the artist.**

Artists own their content. Fans own their support. The platform owns nothing.

Every feature must:
- Protect artists' IP and earnings
- Respect users' privacy
- Maintain legal compliance
- Perform reliably
- Scale sustainably
- Remain maintainable

---

**This directive is NON-NEGOTIABLE and applies to ALL future development.**

**Status**: ✅ ACTIVE
**Enforcement**: STRICT
**Violations**: Automatic rejection
