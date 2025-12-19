# MHC STREAMING
## MOST HIGH CREATION STREAMING

A decentralized, artist-first streaming platform with Dante-inspired visual realms and zero dependency on proprietary cloud platforms.

## 🔥 System Architecture

### Frontend
- **Framework**: Next.js 14+ with TypeScript
- **Styling**: Dante Realm System (Inferno, Purgatorio, Paradiso)
- **Deployment**: Vercel
- **Features**: 
  - Triad Gallery (three-realm visual system)
  - Offline-first architecture
  - Real-time updates via WebSocket
  - Progressive Web App (PWA)

### Backend Microservices
All services deployed to GCP Cloud Run:
- **API Gateway**: Central routing, auth, rate limiting
- **User Service**: Authentication, profiles, subscriptions
- **Content Service**: Media upload, processing, streaming
- **Payment Service**: Subscription billing, artist royalties
- **Analytics Service**: Usage tracking, performance metrics
- **Moderation Service**: Content scanning, legal compliance
- **WebSocket Service**: Real-time notifications and chat

### Infrastructure
- **Cloud Provider**: Google Cloud Platform (GCP)
- **IaC**: Terraform
- **Database**: Cloud SQL (PostgreSQL)
- **Storage**: Cloud Storage (media, backups)
- **Messaging**: Cloud Pub/Sub
- **CDN**: Cloud CDN

### Key Features
- ✅ **No AWS, Firebase, Azure dependencies**
- ✅ **Offline failover architecture**
- ✅ **Artist royalty calculation engine**
- ✅ **Subscription-based feature gating**
- ✅ **Forensic logging and compliance**
- ✅ **Content moderation AI**
- ✅ **Backward-compatible APIs**
- ✅ **Mobile, web, and admin support**

## 🎨 Dante Realm Visual System

### Inferno (Hell)
- **Colors**: Black (#000000), White (#FFFFFF), Ash (#333333)
- **Style**: Heavy shadows, etched lines, harsh geometry
- **UI**: Grid layouts, flickering animations, despair motifs

### Purgatorio (Purgatory)
- **Colors**: Grayscale gradients (#808080 → #D3D3D3)
- **Style**: Mist, smoke, vertical ascent
- **UI**: Parallax scrolling, SVG noise masks, purification fire

### Paradiso (Heaven)
- **Colors**: Near-white (#FAFAFA), Silver (#C0C0C0)
- **Style**: Minimal, geometric perfection, constellations
- **UI**: Radial/spiral navigation, light flares, orbit animations

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- Terraform 1.0+
- GCP account with billing enabled
- Vercel account

### Installation

```bash
# Install dependencies
npm install

# Initialize Terraform
npm run infra:init

# Start development environment
npm run dev
```

### Environment Variables

Create `.env.local` files in respective services:

```env
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=ws://localhost:8081

# Services
DATABASE_URL=postgresql://user:pass@localhost:5432/mhc
GCP_PROJECT_ID=your-project-id
GCP_REGION=us-central1
JWT_SECRET=your-secret
CONTENT_MODERATION_API_KEY=your-key
```

## 📦 Deployment

### Frontend to Vercel
```bash
npm run deploy:frontend
```

### Backend to Cloud Run
```bash
npm run deploy:services
```

### Infrastructure
```bash
npm run infra:plan
npm run infra:apply
```

## 🔒 Security & Compliance

### Content Moderation
- Automated AI classification
- Hash-based illegal content database
- Human moderation queue
- Forensic logging of all violations

### Legal Compliance
- DMCA takedown support
- GDPR/CCPA compliance
- Age verification
- Geographic content restrictions

### Artist Protection
- Royalty calculation and distribution
- Content ownership verification
- Revenue transparency
- Fair use detection

## 🛠️ Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Type Checking
```bash
npm run typecheck
```

## 📚 Documentation

- [Architecture Overview](./docs/ARCHITECTURE.md)
- [Security Whitepaper](./docs/SECURITY.md)
- [API Documentation](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Triad Gallery Guide](./docs/TRIAD_GALLERY.md)

## 🎯 System Directives

### Global Compatibility
All new components must be:
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

## 📄 License

UNLICENSED - Proprietary Software
