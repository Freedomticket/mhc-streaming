# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Overview

MHC STREAMING (MOST HIGH CREATION STREAMING) is a decentralized, artist-first streaming platform with Dante-inspired visual realms (Inferno, Purgatorio, Paradiso) and zero dependency on proprietary cloud platforms outside of GCP.

**Key Architecture:**
- Frontend: Next.js 14+ (TypeScript) deployed to Vercel
- Backend: Microservices on GCP Cloud Run
- Database: Cloud SQL (PostgreSQL)
- Storage: Cloud Storage (GCS) with S3/local fallback
- Messaging: Cloud Pub/Sub
- Infrastructure: Terraform-managed GCP resources

## Core Development Commands

### Development
```bash
# Start full development environment (frontend + gateway + websocket)
npm run dev

# Start individual services
npm run dev:frontend
npm run dev:gateway
npm run dev:websocket
```

### Building
```bash
# Build all workspaces
npm run build

# Build frontend only
npm run build:frontend

# Build all backend services
npm run build:services
```

### Testing & Quality
```bash
# Run tests across all workspaces
npm test

# Lint all workspaces
npm run lint

# Type check all workspaces
npm run typecheck
```

### Deployment
```bash
# Deploy frontend to Vercel
npm run deploy:frontend

# Deploy backend services to Cloud Run
npm run deploy:services

# Infrastructure management
npm run infra:init    # Initialize Terraform
npm run infra:plan    # Preview infrastructure changes
npm run infra:apply   # Apply infrastructure changes
npm run infra:destroy # Destroy infrastructure (use with caution)
```

## Repository Structure

This is a monorepo using npm workspaces:

```
mhc-streaming/
├── frontend/              # Next.js application
│   └── src/
│       └── styles/       # Dante realm CSS (Inferno/Purgatorio/Paradiso)
├── services/             # Backend microservices
│   ├── premium-gen/      # Fal.ai SDXL image generation service (BullMQ + Redis)
│   ├── pod/              # Print-on-demand + Stripe payment service
│   └── media-service/    # (other services as they're built)
├── database/             # PostgreSQL schemas and migrations
├── docs/                 # Documentation
│   └── DEPLOYMENT.md    # Complete deployment guide
└── terraform/            # Infrastructure as Code
```

## Dante Realm Visual System

The UI is themed around Dante's Divine Comedy with three distinct visual realms. All styling uses Tailwind CSS with custom realm classes.

### Custom Realm Colors (Tailwind Config)
- **infernoDark**: `#000000` (black)
- **purgatorioGray**: `#C7C7C7` (light gray)
- **paradisoWhite**: `#FFFFFF` (white)

### Realm Classes (in `frontend/src/styles/globals.css`)
- `.realm-inferno` - Dark, harsh, geometric (black backgrounds, white text, etched typography)
- `.realm-purgatorio` - Grayscale gradients, mist effects, vertical ascent parallax
- `.realm-paradiso` - Minimal white/silver, geometric perfection, radial animations

### Realm-Specific Utilities
- Text: `.text-etched`, `.text-ascend`, `.text-divine`
- Borders: `.border-harsh`, `.border-mist`, `.border-light`
- Effects: `.shadow-deep`, `.glow-radial`
- Layouts: `.gallery-grid-inferno`, `.gallery-grid-purgatorio`, `.gallery-grid-paradiso`

**Important:** All new components must maintain realm aesthetic consistency and use the realm class system.

## Premium Generation Service (Fal.ai SDXL)

Location: `services/premium-gen/`

**Architecture:**
- Redis-backed BullMQ queue for async job processing
- Synchronous POST to `https://fal.run/{model_slug}` (e.g., `fal-ai/fast-sdxl`)
- Supports JSON output URLs or direct binary image responses
- Multi-storage backend: GCS, S3, or local filesystem

**Key Files:**
- `index.js` - Express server + BullMQ worker
- `storage-adapters.js` - Upload handlers for GCS/S3/local

**Endpoints:**
- `POST /generate` - Create generation job (requires `x-artist-id` header)
- `GET /status/:id` - Check job status and retrieve results

**Example Request Body:**
```json
{
  "prompt": "High-contrast monochrome engraving of ruins...",
  "negative_prompt": "color, watermark, text",
  "width": 1024,
  "height": 1024,
  "steps": 28,
  "cfg_scale": 7.5
}
```

**Required Headers for Fal.ai:**
```
Authorization: Key <FAL_KEY>
Content-Type: application/json
```

## POD/Stripe Service

Location: `services/pod/`

**Purpose:** Handles Stripe payments and print-on-demand fulfillment via Printful/Printify.

**Endpoints:**
- `POST /create-payment-intent` - Create Stripe payment intent
- `POST /webhook` - Stripe webhook handler (validates signature, processes `payment_intent.succeeded`)
- `POST /pod/webhook` - POD provider webhook handler

**Important:** Stripe webhook endpoint must use `bodyParser.raw()` for signature verification.

## Environment Variables

### Required for All Services
```bash
# GCP
GCP_PROJECT_ID=your-project-id
GCP_REGION=us-central1
ARTIFACT_REGISTRY_REPOSITORY=us-central1-docker.pkg.dev/PROJECT/REPO

# Database & Cache
DATABASE_URL=postgresql://user:pass@host:5432/mhc_streaming
REDIS_URL=redis://localhost:6379

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=ws://localhost:8081

# Authentication
JWT_SECRET=your-secret-key
```

### Premium Generation Service
```bash
FAL_KEY=<your-fal-api-key>
FAL_MODEL_SLUG=fal-ai/fast-sdxl
STORAGE_TYPE=gcs          # or s3, local
STORAGE_BUCKET=inferno-generated
PUBLIC_BASE_URL=https://your-domain.com
OUT_DIR=/tmp/generation_results
PORT=8081
```

### POD Service
```bash
STRIPE_SECRET=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
PORT=8082
```

### S3 Storage (if STORAGE_TYPE=s3)
```bash
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
```

### Vercel Deployment
```bash
VERCEL_TOKEN=...
VERCEL_ORG_ID=...
VERCEL_PROJECT_ID=...
```

## Monetization Features

### Artist Royalties
- Artists keep 70% of revenue (industry average is 30%)
- Transparent royalty calculation engine
- Real-time revenue tracking

### Revenue Streams
1. **Subscription Tiers** (Free, Premium, Artist)
2. **IPFS Decentralized Storage** - Pin content across Pinata, Infura, 3Box, or custom nodes
3. **Physical Merch Fulfillment** - Drop-ship via Printful/Printify with profit share
4. **Ads (Optional Mode)** - Only on free tier, black/white monochrome banners, NEVER interrupt audio/video

## System Directives

### Global Compatibility Requirements
All new components MUST be:
1. Fully compatible with existing components
2. Backward-compatible with all APIs
3. Security-reviewed
4. Subscription-aware
5. Real-time compatible
6. Performance-benchmarked
7. Dante realm styled
8. Logged and auditable

### Legal Requirements
- NO illegal content allowed
- ALL uploads must pass moderation
- HARD BLOCK on violations
- Forensic preservation of incidents

## Infrastructure (GCP)

### Core Resources
- **Cloud Run** - All backend microservices
- **Cloud SQL (PostgreSQL)** - Primary database with private IP
- **Memorystore (Redis)** - Job queue and caching
- **Cloud Storage** - Media files, backups, generated images
- **Cloud Pub/Sub** - Event messaging
- **Cloud CDN** - Content delivery
- **Artifact Registry** - Docker image storage

### IAM Requirements for CI/CD
Service account needs:
- `roles/run.admin`
- `roles/storage.admin`
- `roles/cloudsql.client`
- `roles/artifactregistry.writer`
- `roles/iam.serviceAccountUser`

## CI/CD Workflows

GitHub Actions handles deployment:
1. Push to `main` triggers Vercel frontend deployment
2. Backend services build Docker images → Artifact Registry
3. Images deployed to Cloud Run with environment variables
4. Database migrations run via Cloud SQL Auth Proxy

## Testing Strategy

- Unit tests for business logic
- Integration tests for API endpoints
- E2E tests for critical user flows (upload → purchase → generation)
- Use existing test framework discovered in the codebase (check README/package.json for test scripts)

## Working with Cloud SQL

Connect to database:
```bash
# Via gcloud CLI
gcloud sql connect mhc-streaming-db --user=postgres

# Via Cloud SQL Proxy (for local development)
cloud_sql_proxy -instances=CONNECTION_NAME=tcp:5432

# Run migrations
psql $DATABASE_URL < database/schema.sql
```

## Monitoring & Operations

- Cloud Monitoring for Cloud Run metrics
- Alert policies: error rate >1%, latency >1s, resource utilization >80%
- Daily automated backups with 30-day retention
- Point-in-time recovery enabled

## Critical: Render Deployment Configuration (DO NOT BREAK)

### Node.js Version (package.json)
- **MUST** stay pinned to `20.x` (Node 20 LTS)
- **DO NOT** use unbounded ranges like `>=18.0.0`
- **Reason:** Node 25+ has npm bugs that break Render builds
- **Last working commit:** `c078120` (2026-01-02)

### Service Build Scripts (render.yaml)
- **ALL services** (auth, payment, royalty) MUST use bash build scripts
- **Pattern:** `buildCommand: bash services/{service-name}/render-build.sh`
- **Reason:** Bash scripts handle monorepo workspace dependencies correctly
- **Last known working:** `8deba56` (2026-01-02)

### Build Script Requirements
**CRITICAL:** Build scripts MUST use npm workspace commands, NOT individual package installs.

**CORRECT pattern (working):**
```bash
cd "$REPO_ROOT"
npm install  # Install all workspace dependencies at root
npm run build --workspace=@mhc/common
npm run build --workspace=@mhc/database
npm run build --workspace=@mhc/{service-name}
```

**INCORRECT pattern (breaks TypeScript compilation):**
```bash
cd "$REPO_ROOT/packages/common"
npm install --include=dev  # DON'T DO THIS
npm run build  # @types packages won't be available
```

**Why this matters:**
- Individual `npm install` in subdirectories breaks workspace linking
- TypeScript can't find `@types` packages (e.g., `@types/cors`, `@types/jsonwebtoken`)
- Results in "Cannot find module" errors during build
- Using `npm run build --workspace=` respects monorepo structure

### Service Start Commands
- **Auth/Payment/Royalty:** `cd services/{service} && node dist/index.js`
- Run from service directory to maintain correct working directory
- Node resolves workspace dependencies from root `node_modules`

### Known Issues Fixed (2026-01-02)
1. **Node 25.2.1 npm bug** - Fixed by pinning to Node 20.x
2. **Module resolution errors** - Fixed by using workspace build commands
3. **Royalty service schema mismatch** - Simplified service to use existing schema fields
4. **TypeScript @types not found** - Fixed by removing individual npm installs

### CRITICAL RULE: DO NOT BREAK WORKING SERVICES
**IF A SERVICE IS WORKING, DO NOT TOUCH IT UNDER ANY CIRCUMSTANCES**

When fixing one service:
1. **ONLY modify the broken service** - never touch working services
2. Test your changes on ONLY the broken service
3. If your fix requires changes to shared code, STOP and ask user first
4. Auth and Royalty services are WORKING - their build scripts are LOCKED
5. Any attempt to "unify" or "improve" working services will be rejected

### Working Service Build Scripts (LOCKED - DO NOT MODIFY)
- **Auth service**: Uses pattern from commit `c078120` - individual npm installs in subdirectories
- **Royalty service**: Uses pattern from commit `88e5b6d` - individual npm installs in subdirectories
- These patterns work. Do not try to "fix" them.

### Before Modifying Render Config
1. Ask user for explicit approval FIRST
2. Test changes locally if possible
3. Only change ONE service at a time - NEVER modify working services
4. Document what changed and why
5. If build fails, immediately revert to last known working commit
6. NEVER modify bash build scripts for working services

## Important Notes

- **No AWS, Firebase, Azure dependencies** - GCP only (except S3 as storage fallback)
- **Offline-first architecture** - Frontend must gracefully handle backend unavailability
- **Content moderation** - All uploads pass AI classification before going live
- **Subscription gating** - Features are tier-locked (Free/Premium/Artist)
- **Realm consistency** - Maintain black/white/grayscale aesthetic across all new UI

## Additional Documentation

- [Architecture Overview](./docs/ARCHITECTURE.md)
- [API Documentation](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Security Whitepaper](./docs/SECURITY.md)
- [Triad Gallery Guide](./docs/TRIAD_GALLERY.md)
