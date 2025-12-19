# MHC Streaming Backend

Complete backend infrastructure for the MHC Streaming platform with microservices architecture.

## Architecture

### Services
- **API Gateway** (Port 3000) - Central routing and rate limiting
- **Auth Service** (Port 3001) - User authentication and JWT management
- **Media Service** (Port 3002) - Video upload and storage management
- **Stream Service** (Port 3003) - Live streaming with RTMP/HLS
- **Payment Service** (Port 3004) - Subscription and payment processing
- **Analytics Service** (Port 3005) - Tracking and metrics

### Infrastructure
- **PostgreSQL** - Primary database
- **Redis** - Caching and real-time features
- **Prisma** - Type-safe ORM

## Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- npm 9+

### Installation

1. Install dependencies:
```powershell
npm install
```

2. Generate Prisma client:
```powershell
npm run db:generate --workspace=@mhc/database
```

3. Copy environment file:
```powershell
Copy-Item .env.example .env
```

4. Update `.env` with your configuration

### Development

#### With Docker Compose (Recommended)
```powershell
docker-compose up
```

This starts all services with PostgreSQL and Redis.

#### Local Development
1. Start PostgreSQL and Redis:
```powershell
docker-compose up postgres redis
```

2. Run database migrations:
```powershell
npm run db:push --workspace=@mhc/database
```

3. Start services:
```powershell
# All services
npm run dev

# Individual services
npm run dev:gateway
npm run dev:frontend
```

## Database

### Migrations
```powershell
# Create migration
npm run db:migrate --workspace=@mhc/database

# Deploy migrations (production)
npm run db:migrate:prod --workspace=@mhc/database

# Open Prisma Studio
npm run db:studio --workspace=@mhc/database
```

### Schema
The database schema includes:
- Users & Authentication
- Subscriptions (FREE, INFERNO, PURGATORIO, PARADISO tiers)
- Streams & Videos
- Payments
- Analytics
- Social features (Follows, Views)

## API Endpoints

### Auth Service
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Media Service
- `POST /api/media/upload` - Upload video
- `GET /api/media/videos` - List videos
- `GET /api/media/videos/:id` - Get video details
- `DELETE /api/media/videos/:id` - Delete video

### Stream Service
- `POST /api/streams` - Create stream
- `GET /api/streams` - List streams
- `GET /api/streams/:id` - Get stream details
- `POST /api/streams/:id/start` - Start stream
- `POST /api/streams/:id/end` - End stream

### Payment Service
- `POST /api/payments/subscribe` - Create subscription
- `POST /api/payments/cancel` - Cancel subscription
- `GET /api/payments/subscription` - Get current subscription
- `POST /api/payments/webhook` - Stripe webhook

### Analytics Service
- `POST /api/analytics/track` - Track event
- `GET /api/analytics/stats` - Get statistics
- `GET /api/analytics/views/:videoId` - Get video views

## Subscription Tiers

### FREE
- Basic streaming
- 480p quality
- Limited storage (1GB)
- $0/month

### INFERNO
- HD streaming (1080p)
- Extended storage (10GB)
- No ads
- Custom emotes
- $9.99/month

### PURGATORIO
- 4K streaming
- Large storage (50GB)
- All INFERNO features
- Exclusive content
- Early access
- $19.99/month

### PARADISO
- 4K streaming
- Unlimited storage
- All PURGATORIO features
- Creator revenue share
- Verified badge
- 24/7 priority support
- $49.99/month

## Testing

```powershell
npm test
```

## Deployment

### Build all services
```powershell
npm run build
```

### Deploy to production
```powershell
# Build Docker images
docker-compose -f docker-compose.prod.yml build

# Push to registry
docker-compose -f docker-compose.prod.yml push

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

## Environment Variables

See `.env.example` for all required environment variables.

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - JWT signing secret
- `STRIPE_SECRET_KEY` - Stripe API key
- `AWS_ACCESS_KEY_ID` - AWS credentials for S3

## Monitoring

Health check endpoints:
- Gateway: `http://localhost:3000/health`
- Auth: `http://localhost:3001/health`
- Media: `http://localhost:3002/health`
- Stream: `http://localhost:3003/health`
- Payment: `http://localhost:3004/health`
- Analytics: `http://localhost:3005/health`

## License

UNLICENSED - MHC Streaming Platform
