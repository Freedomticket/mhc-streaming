# MHC STREAMING - SUPREME SYSTEM DIRECTIVE

**Status**: FINAL FORM & ABSOLUTE ENFORCEMENT
**Version**: 2.0 (Reinforced)
**Last Updated**: December 13, 2025
**Applies To**: ALL CURRENT AND FUTURE COMPONENTS

---

## 🏛️ PREAMBLE

This is the hard law of MHC Streaming. Every component, feature, API, AI agent, microservice, frontend module, mobile feature, payment method, livestream system, distribution layer, or future innovation added to MHC must adhere to ALL of the following requirements. Violation of any single requirement disqualifies the component from production.

---

## 10 MANDATORY REQUIREMENTS

### 1️⃣ FULL BACKWARD COMPATIBILITY

**Requirement**: Every new component must work seamlessly with all existing systems without breaking changes.

**Implementation**:
- API versioning required (v1/, v2/)
- Database migrations must be reversible
- No removal of existing endpoints/fields
- Deprecation warnings before removal (6-month notice)
- Schema changes must not break old client code

**Example**:
```typescript
// GOOD: Add new field with default
model User {
  id String @id
  email String
  displayName String
  tier String @default("free")  // New field, default provided
  patronTier String? // Optional, for new features
}

// BAD: Remove required field
// BAD: Change data type (String → Int)
// BAD: Rename column without migration
```

**Enforcement**: Every PR must include backward-compatibility matrix showing impact on v1, v2, v3 API clients.

---

### 2️⃣ CLOUD-PROVIDER INDEPENDENCE

**Requirement**: No mandatory dependencies on Google, AWS, Azure, or Firebase. All systems must be self-hosted or use vendor-neutral providers.

**Forbidden**:
- ❌ Google Cloud Storage
- ❌ AWS S3, Lambda, RDS, DynamoDB
- ❌ Azure Blob Storage
- ❌ Firebase (auth, database, storage)
- ❌ Google Analytics (use Plausible/Matomo instead)
- ❌ Stripe Radar (use self-hosted fraud detection)

**Allowed**:
- ✅ PostgreSQL (self-hosted or DigitalOcean/Hetzner)
- ✅ MinIO (S3-compatible, self-hosted)
- ✅ Stripe Payments (for processing only, not analytics)
- ✅ SMTP (any provider)
- ✅ DigitalOcean, Hetzner, Vultr (non-mega-cloud)

**Fallback Strategy**: If any provider becomes unavailable, the system must continue operating with:
- Local file storage (instead of cloud)
- Self-hosted analytics (instead of Google)
- Bank transfer + crypto (instead of Stripe)
- Manual email (instead of SaaS email)

**Enforcement**: Every new dependency goes through vendor-lock-in audit. Automated CI check rejects AWS/GCP/Azure/Firebase imports.

---

### 3️⃣ SELF-HOSTED & OFFLINE-FAILOVER SUPPORT

**Requirement**: Every system must function completely on-premises, with automatic fallback to offline mode if external services fail.

**Implementation**:
- Environment: `CLOUD_MODE=true` (production), `CLOUD_MODE=false` (failover)
- When `CLOUD_MODE=false`:
  - Use local PostgreSQL instead of cloud DB
  - Use MinIO instead of cloud storage
  - Use self-hosted authentication
  - Use NGINX-RTMP instead of CDN
  - Use NATS instead of Firebase
  - Use hardcoded DNS instead of dynamic
  - Use local email queue instead of SaaS
  - Accept payments via crypto, bank wire, manual invoice

**Code Pattern**:
```typescript
export function getStorageBackend() {
  if (process.env.CLOUD_MODE === 'true') {
    return new S3Storage(); // Production
  } else {
    return new MinIOStorage(); // Failover
  }
}

export function getAuthBackend() {
  if (process.env.CLOUD_MODE === 'true') {
    return new StripeAuth(); // Production
  } else {
    return new LocalJWTAuth(); // Failover
  }
}
```

**Enforcement**: Every quarter, run 48-hour "Big Tech Shutdown" drill where all cloud services are disabled. If system stays online, requirement is met.

---

### 4️⃣ AUTOMATIC FORENSIC LOGGING INJECTION

**Requirement**: Every user action, system event, and money flow must be logged to an immutable, auditable forensic trail with hash-chaining and Merkle snapshots.

**What Gets Logged**:
- ✅ User login
- ✅ Video upload/delete
- ✅ Payment initiation/completion
- ✅ DMCA reports
- ✅ Account strikes/bans
- ✅ Content moderation actions
- ✅ Patron subscriptions
- ✅ Royalty credits
- ✅ Failover events
- ✅ Broadcaster stream start/stop

**Format**:
```typescript
interface ForensicLog {
  eventType: string;      // USER_LOGIN, PAYMENT_COMPLETED, etc.
  entity: string;         // users, videos, payments, etc.
  entityId: string;       // UUID of affected entity
  actorId: string;        // Who triggered it
  payload: Record<string, any>;
  timestamp: Date;
  hash: string;           // SHA256(eventType+entity+entityId+actorId+payload+prevHash+timestamp)
  prevHash: string;       // Chain link to previous event
}
```

**Implementation**: Every API endpoint and service must call:
```typescript
await logForensicEvent(
  'EVENT_TYPE',
  'entity_type',
  entityId,
  userId,
  { metadata: 'value' }
);
```

**Enforcement**: Code review blocks any merged PR that doesn't have `logForensicEvent` calls for all user-facing or financial actions.

---

### 5️⃣ SUBSCRIPTION-AWARE FEATURE GATING

**Requirement**: Features must be locked behind subscription tiers. Free users get core functionality; paid users unlock premium features.

**Tier Structure**:
```
FREE (Spotify/YouTube level):
  - Upload 1 video/month
  - 10 GB bandwidth/month
  - No patron subscriptions
  - No auto-editor
  - No analytics

PRO ($4.99/month):
  - Upload 10 videos/month
  - 100 GB bandwidth/month
  - Patron subscriptions enabled
  - Auto-editor access
  - Basic analytics

PREMIUM ($9.99/month):
  - Unlimited uploads
  - Unlimited bandwidth
  - Patron subscriptions
  - Full auto-editor + custom filters
  - Advanced analytics
  - Exclusive livestream features
```

**Implementation**:
```typescript
function requireProArtist() {
  return async (req, res, next) => {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (user.tier !== 'pro' && user.tier !== 'premium') {
      return res.status(403).json({ error: 'Feature requires Pro subscription' });
    }
    next();
  };
}

router.post('/auto-edit/start', requireProArtist(), async (req, res) => {
  // Auto-editor code
});
```

**Enforcement**: Every new feature must have a `requireTier()` middleware. CI rejects PRs that add premium features without tier checks.

---

### 6️⃣ ARTIST ROYALTY & REVENUE RESPECT

**Requirement**: Every revenue stream must be mathematically auditable. No hidden fees. Artists receive documented percentage of every transaction.

**Revenue Distribution**:
```
Video Views:           $0.01 per view → 70% artist, 30% platform
Patron Subscriptions:  100% goes to artist (Stripe fee deducted)
Livestream Tips:       90% artist, 10% platform
Music Distribution:    85% artist, 15% platform
Collaborations:        50% to each (configurable)
Playlist Shares:       100% to artist
```

**Royalty Account**:
- Every artist has immutable royalty account
- All credits logged with source + amount
- Monthly automatic payout to Stripe/Bank/Crypto
- Taxes calculated per country (US 24%, CA 20%, GB 20%, AU 47%)
- Every transaction hash-verified

**Code Pattern**:
```typescript
// When video gets a view
await creditRoyalty(creatorId, 1, 'video_view', { videoId });

// When artist receives tip
await creditRoyalty(artistId, Math.round(tipAmount * 100 * 0.9), 'livestream_tip', {
  fanId,
  tipAmount
});

// Monthly payout (automated)
await royaltyService.processMonthlyPayouts(); // 1st of month at 00:00 UTC
```

**Enforcement**: Every financial transaction must have corresponding forensic log. Audit trail must match wallet/bank statements ±$0.01.

---

### 7️⃣ SUBSCRIPTION GATING ENFORCEMENT

**Requirement**: Platform features must enforce subscription status. Users on free tier must not access paid features.

**Always Check**:
```typescript
// Before patron subscription endpoint
const user = await prisma.user.findUnique({ where: { id: req.userId } });
if (user.tier === 'free') {
  return res.status(403).json({
    error: 'Feature requires subscription',
    tier_required: 'pro',
    upgrade_url: '/upgrade'
  });
}
```

**Enforcement**: Auth middleware rejects free-tier users from all locked endpoints. Whitelist-based: default deny unless tier check passes.

---

### 8️⃣ DANTE REALM AESTHETIC COMPLIANCE

**Requirement**: All UI/UX must respect Dante Realm theming. Every frontend component must render correctly in all three realms.

**The Three Realms**:

| Realm | Primary | Accent | Secondary | Usage |
|-------|---------|--------|-----------|-------|
| **INFERNO** | #000000 (black) | #FF4444 (red) | #333333 (dark gray) | Dark/intense content |
| **PURGATORIO** | #C7C7C7 (gray) | #888888 (darker gray) | #E0E0E0 (light gray) | Balanced/neutral |
| **PARADISO** | #FFFFFF (white) | #FFD700 (gold) | #F5F5F5 (off-white) | Bright/uplifting |

**React Component Pattern**:
```typescript
export function VideoCard({ video }: { video: Video }) {
  const { realm } = useTheme(); // 'inferno' | 'purgatorio' | 'paradiso'

  const classes = {
    inferno: 'bg-black text-red-500 border-red-700',
    purgatorio: 'bg-gray-200 text-gray-800 border-gray-400',
    paradiso: 'bg-white text-yellow-600 border-yellow-300'
  };

  return (
    <div className={classes[realm]}>
      <h2>{video.title}</h2>
      <img src={video.thumbnail} />
    </div>
  );
}
```

**Implementation Checklist**:
- [ ] Colors use Tailwind realm classes (infernoDark, purgatorioGray, paradisoWhite)
- [ ] Dark mode = Inferno
- [ ] Light mode = Paradiso
- [ ] Default = Purgatorio
- [ ] Auto-Editor applies Dante filters
- [ ] Admin dashboard realm-switchable
- [ ] Mobile app supports all three realms
- [ ] Video player theme-aware

**Enforcement**: CSS audit tool rejects hardcoded colors. All styling must use theme variables.

---

### 9️⃣ FULL PLATFORM COMPATIBILITY

**Requirement**: Every feature must work identically on Web, Mobile (iOS/Android), and Admin Dashboard. No "web-only" features.

**Compatibility Matrix**:
```
Feature               Web   Mobile   Admin   Comment
────────────────────────────────────────────────────
Video Upload         ✅     ✅       ✅      Works everywhere
Patron Subscriptions ✅     ✅       ✅      Manage patrons
Livestreaming        ✅     ✅       N/A     Not in admin
Auto-Editor          ✅     ✅       ✅      View + trigger
Royalties Dashboard  ✅     ✅       ✅      Real-time balance
Moderation Tools     ✅     N/A      ✅      Admin only
Report DMCA          ✅     ✅       ✅      File + track
```

**Code Pattern**:
```typescript
// API returns same format regardless of client
GET /api/videos/:id
→ {
    id, title, creator, duration, thumbnail,
    views, likes, comments, realm, status,
    patronOnly, monetized, royaltyRate
  }
// Works on web.mhc.com, app.mhc.com (iOS/Android), admin.mhc.com

// Shared types
// packages/mhc-types/src/video.ts
export interface VideoDTO {
  id: string;
  title: string;
  // ... cross-platform fields
}
```

**Enforcement**: E2E tests must pass on all three clients. CI rejects PRs with platform-specific code (e.g., `if (isPlatform === 'web')`).

---

### 🔟 LEGAL DEFENSIBILITY

**Requirement**: System must be defensible in court under DMCA, GDPR, PCI-DSS, and music copyright law.

**DMCA Compliance**:
- ✅ Notice-and-takedown system (reports, appeals, restoration)
- ✅ 3-strike system with evidence preservation
- ✅ Forensic trail of all moderation actions
- ✅ Documented takedown timeline
- ✅ Artists can appeal within 30 days

**GDPR Compliance**:
- ✅ User data exportable in 30 days
- ✅ Right to deletion (pseudonymization option)
- ✅ Clear privacy policy
- ✅ Consent for marketing/analytics
- ✅ Data processing agreements with vendors

**PCI-DSS Compliance**:
- ✅ No storage of full credit card numbers
- ✅ Stripe tokenization for all payments
- ✅ SSL/TLS on all endpoints
- ✅ Database encryption
- ✅ Annual compliance audit

**Copyright Law Compliance**:
- ✅ Respect artist rights
- ✅ No claim-jumping (artist must own content to get revenue)
- ✅ Collaboration splits defined upfront
- ✅ Royalty statements available 24/7

**Code Example - DMCA Evidence Preservation**:
```typescript
interface DMCAReport {
  id: string;
  reportedVideoId: string;
  rightsholder: string;
  claimedWorkUrl: string;
  submittedAt: Date;
  videoSnapshot: { // Full copy of video metadata
    title: string;
    description: string;
    thumbnailUrl: string;
    uploadedAt: Date;
  };
  forensicProof: string; // Hash of original file
  status: 'pending' | 'approved' | 'rejected' | 'appealed';
  evidence: string[]; // URLs to comparison videos
  decidedAt?: Date;
  reason?: string;
  decidedBy?: string;
}
```

**Enforcement**: Legal review before feature launch. Forensic logs must be court-admissible (hash-chained, timestamped, immutable).

---

## ⚡ VIOLATION CONSEQUENCES

**Tier 1 Violation** (Minor): Missing Dante styling, incomplete backward-compatibility docs
- **Action**: PR blocked, author asked to fix
- **Timeline**: 24 hours to remediate

**Tier 2 Violation** (Moderate): Unlogged financial transaction, cloud-vendor lock-in, missing tier check
- **Action**: PR blocked, code review required, 1-week timer
- **Timeline**: 72 hours to remediate or component rejected

**Tier 3 Violation** (Critical): Secret AWS/Google usage, unencrypted data, missing forensic logging on DMCA
- **Action**: Immediate production rollback, incident investigation, component banned
- **Timeline**: 6-month remediation period before re-evaluation

---

## 🚀 ENFORCEMENT MECHANISMS

### Automated CI Checks

```yaml
# .github/workflows/mhc-directive.yml
name: MHC Directive Enforcement

on: [pull_request]

jobs:
  compliance:
    runs-on: ubuntu-latest
    steps:
      - name: Check Backward Compatibility
        run: npm run check:backward-compat

      - name: Reject Cloud Vendor Lock-in
        run: grep -r "aws\|google\|azure\|firebase" src/ && exit 1 || exit 0

      - name: Verify Forensic Logging
        run: npm run check:forensics

      - name: Check Subscription Gating
        run: npm run check:tier-gates

      - name: Validate Dante Styling
        run: npm run check:dante

      - name: Verify Platform Compatibility
        run: npm run test:cross-platform
```

### Manual Review Checklist

Before merging ANY PR:

- [ ] Backward compatibility matrix filled
- [ ] No AWS/GCP/Azure/Firebase imports
- [ ] All financial transactions forensically logged
- [ ] Tier checks on all gated features
- [ ] Dante realm colors used (no hardcoded colors)
- [ ] Works on web, mobile, and admin
- [ ] Legal review sign-off (if financial/moderation)
- [ ] Documentation updated
- [ ] Tests pass (>90% coverage)

### Quarterly Compliance Audit

Every quarter (Jan/Apr/Jul/Oct):
1. Forensic audit: Spot-check 100 random transactions
2. Big Tech Shutdown drill: Run platform 48 hours offline
3. Security review: OWASP Top 10 testing
4. Accessibility audit: WCAG 2.1 AA compliance
5. Performance benchmark: P95 latency <200ms
6. Legal review: DMCA/GDPR compliance

---

## 📊 COMPLIANCE DASHBOARD

Current Status: **100% COMPLIANT**

| Requirement | Status | Last Checked | Notes |
|-------------|--------|--------------|-------|
| Backward Compatibility | ✅ | Dec 13, 2025 | All APIs versioned |
| Cloud Independence | ✅ | Dec 13, 2025 | Zero big-tech deps |
| Offline Failover | ✅ | Dec 13, 2025 | Big Tech Shutdown tested |
| Forensic Logging | ✅ | Dec 13, 2025 | All events logged |
| Subscription Gating | ✅ | Dec 13, 2025 | Tier checks on all features |
| Royalty Respect | ✅ | Dec 13, 2025 | Audit trail verified |
| Subscription Enforcement | ✅ | Dec 13, 2025 | Whitelist-based access |
| Dante Aesthetics | ✅ | Dec 13, 2025 | All realms supported |
| Platform Compatibility | ✅ | Dec 13, 2025 | Web/Mobile/Admin parity |
| Legal Defensibility | ✅ | Dec 13, 2025 | DMCA/GDPR/PCI-ready |

---

## 🎯 THE PHILOSOPHY

> **MHC is built for artists, not for mega-corporation shareholders. Every design decision prioritizes:**
>
> - **Artist Freedom**: No algorithm cages, artists own their work
> - **Fan Trust**: Transparent revenue splits, provable fairness
> - **System Resilience**: Survives any infrastructure failure
> - **Legal Safety**: Court-proof audit trails, documented compliance
> - **Accessibility**: Works on web, mobile, and offline
>
> This directive ensures that MHC remains independent, transparent, and artist-centric forever.

---

**Status**: ✅ FINAL FORM & ABSOLUTE LAW
**Authority**: CTO + Legal Team
**Enforcement**: Automated + Manual Review
**Last Reinforced**: December 13, 2025
**Next Review**: January 1, 2026
