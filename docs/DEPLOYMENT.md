# MHC Streaming - Deployment Guide

Complete guide for deploying the MHC Streaming platform to Google Cloud Platform (GCP) with Vercel frontend.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Infrastructure Deployment](#infrastructure-deployment)
4. [Database Setup](#database-setup)
5. [Backend Services Deployment](#backend-services-deployment)
6. [Frontend Deployment](#frontend-deployment)
7. [Post-Deployment Configuration](#post-deployment-configuration)
8. [Monitoring and Operations](#monitoring-and-operations)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Tools

- **Node.js** 18+ and npm 9+
- **Terraform** 1.6+
- **gcloud CLI** (Google Cloud SDK)
- **Docker** (for local builds)
- **Git**

### Required Accounts

- **GCP Account** with billing enabled
- **Vercel Account** (for frontend deployment)
- **GitHub Account** (for CI/CD)
- **Stripe Account** (for payments)

### Required Permissions

GCP IAM roles needed:
- `roles/owner` or combination of:
  - `roles/compute.admin`
  - `roles/container.admin`
  - `roles/storage.admin`
  - `roles/cloudsql.admin`
  - `roles/redis.admin`
  - `roles/pubsub.admin`
  - `roles/iam.serviceAccountAdmin`

## Initial Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-org/mhc-streaming.git
cd mhc-streaming
```

### 2. Install Dependencies

```bash
# Root dependencies
npm install

# Frontend dependencies
cd frontend
npm install
cd ..

# Service dependencies (repeat for each service)
cd services/api-gateway
npm install
cd ../..
```

### 3. Configure GCP Project

```bash
# Set your GCP project ID
export GCP_PROJECT_ID="your-project-id"

# Login to GCP
gcloud auth login

# Set project
gcloud config set project $GCP_PROJECT_ID

# Enable billing
gcloud alpha billing accounts list
gcloud alpha billing projects link $GCP_PROJECT_ID --billing-account=BILLING_ACCOUNT_ID
```

### 4. Create Service Account

```bash
# Create service account for CI/CD
gcloud iam service-accounts create mhc-deploy \
  --display-name="MHC Streaming Deploy"

# Grant necessary roles
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:mhc-deploy@$GCP_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/owner"

# Generate key
gcloud iam service-accounts keys create ~/mhc-deploy-key.json \
  --iam-account=mhc-deploy@$GCP_PROJECT_ID.iam.gserviceaccount.com
```

## Infrastructure Deployment

### 1. Initialize Terraform

```bash
cd terraform

# Create state bucket
gsutil mb gs://$GCP_PROJECT_ID-tfstate

# Initialize
terraform init
```

### 2. Configure Variables

Create `terraform/terraform.tfvars`:

```hcl
project_id       = "your-project-id"
primary_region   = "us-central1"
domain_name      = "your-domain.com"
environment      = "production"
enable_gpu_nodes = true
enable_cloud_armor = true
enable_cloud_cdn = true
```

### 3. Plan and Apply

```bash
# Review plan
terraform plan -out=tfplan

# Apply infrastructure
terraform apply tfplan
```

This will create:
- VPC network and subnets
- GKE cluster with node pools (web, workers, GPU)
- Cloud SQL PostgreSQL instance
- Cloud Memorystore Redis
- Cloud Storage buckets
- Load Balancer with Cloud CDN and Cloud Armor
- Pub/Sub topics and subscriptions

**Expected time: 20-30 minutes**

### 4. Verify Infrastructure

```bash
# Check GKE cluster
gcloud container clusters list

# Check Cloud SQL
gcloud sql instances list

# Check buckets
gsutil ls

# Get load balancer IP
gcloud compute addresses list
```

## Database Setup

### 1. Connect to Cloud SQL

```bash
# Get connection name
gcloud sql instances describe mhc-streaming-db --format="value(connectionName)"

# Connect using Cloud SQL Proxy
cloud_sql_proxy -instances=CONNECTION_NAME=tcp:5432 &

# Or use gcloud
gcloud sql connect mhc-streaming-db --user=postgres
```

### 2. Run Schema Migration

```bash
# Set database URL
export DATABASE_URL="postgresql://mhc_app:PASSWORD@localhost:5432/mhc_streaming"

# Run schema
psql $DATABASE_URL < database/schema.sql
```

### 3. Insert Initial Data

```bash
# Create subscription plans
psql $DATABASE_URL <<EOF
INSERT INTO subscription_plans (name, description, price, billing_interval, features)
VALUES 
  ('Free', 'Basic streaming access', 0.00, 'monthly', '{"maxStreams": 1, "quality": "480p", "ads": true}'),
  ('Premium', 'Ad-free HD streaming', 9.99, 'monthly', '{"maxStreams": 3, "quality": "1080p", "ads": false, "downloads": true}'),
  ('Artist', 'Upload and monetize content', 29.99, 'monthly', '{"maxStreams": 5, "quality": "1080p", "ads": false, "downloads": true, "uploads": true, "analytics": true}');
EOF
```

## Backend Services Deployment

### 1. Build Docker Images

Each service needs a Dockerfile. Create `services/{service-name}/Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### 2. Deploy to GKE via Cloud Run

```bash
# Deploy each service
for service in api-gateway user-service media-service artist-service stream-service payment-service merch-service digitalstore-service chat-service notification-service search-service admin-service; do
  
  # Build image
  gcloud builds submit \
    --tag gcr.io/$GCP_PROJECT_ID/$service \
    services/$service
  
  # Deploy to Cloud Run
  gcloud run deploy $service \
    --image gcr.io/$GCP_PROJECT_ID/$service \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --set-env-vars DATABASE_URL=$DATABASE_URL,REDIS_URL=$REDIS_URL \
    --memory 512Mi \
    --min-instances 1 \
    --max-instances 10
    
done
```

### 3. Configure Service URLs

Update API Gateway environment with service URLs:

```bash
gcloud run services update api-gateway \
  --set-env-vars USER_SERVICE_URL=https://user-service-xxx.run.app \
  --set-env-vars MEDIA_SERVICE_URL=https://media-service-xxx.run.app \
  # ... add all service URLs
```

## Frontend Deployment

### 1. Configure Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Link project
cd frontend
vercel link
```

### 2. Set Environment Variables in Vercel

Via Vercel dashboard or CLI:

```bash
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://your-api-gateway-url

vercel env add NEXT_PUBLIC_WS_URL production
# Enter: wss://your-chat-service-url
```

### 3. Deploy

```bash
# Deploy to production
vercel --prod
```

### 4. Configure Custom Domain

In Vercel dashboard:
1. Go to project settings
2. Add custom domain
3. Update DNS records as instructed

## Post-Deployment Configuration

### 1. Configure DNS

Point your domain to:
- **Frontend**: Vercel CNAME (provided by Vercel)
- **API**: GCP Load Balancer IP

```bash
# Get load balancer IP
gcloud compute addresses describe mhc-streaming-ip --global --format="value(address)"
```

Add DNS records:
```
A     @           -> LOAD_BALANCER_IP
CNAME api         -> LOAD_BALANCER_IP
CNAME www         -> vercel-domain.vercel.app
```

### 2. Enable HTTPS

SSL certificates are automatically provisioned:
- **Vercel**: Automatic via Let's Encrypt
- **GCP**: Managed SSL certificate (configured in Terraform)

Wait 15-30 minutes for certificate provisioning.

### 3. Configure Stripe Webhooks

1. Go to Stripe Dashboard
2. Add webhook endpoint: `https://api.your-domain.com/api/payments/webhook`
3. Select events: `payment_intent.succeeded`, `customer.subscription.updated`, etc.
4. Copy webhook secret to GitHub secrets

### 4. Set GitHub Secrets

In GitHub repository settings → Secrets and variables → Actions:

```
# GCP
GCP_PROJECT_ID=your-project-id
GCP_SA_KEY=<paste service account JSON>

# Vercel
VERCEL_TOKEN=<from Vercel settings>
VERCEL_ORG_ID=<from Vercel settings>
VERCEL_PROJECT_ID=<from Vercel settings>

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379

# Application
JWT_SECRET=<generate secure random string>
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXT_PUBLIC_WS_URL=wss://api.your-domain.com

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Domain
DOMAIN_NAME=your-domain.com
```

## Monitoring and Operations

### 1. Access Cloud Monitoring

```bash
# View logs
gcloud logging read "resource.type=cloud_run_revision" --limit 50

# Open monitoring dashboard
gcloud monitoring dashboards list
```

### 2. Set Up Alerts

Create alert policies in Cloud Monitoring:
- Error rate > 1%
- Response latency > 1s
- Resource utilization > 80%

### 3. Database Backups

Backups are automatic (configured in Terraform):
- Daily automated backups
- 30-day retention
- Point-in-time recovery enabled

Manual backup:

```bash
gcloud sql backups create --instance=mhc-streaming-db
```

### 4. Scale Services

```bash
# Scale Cloud Run service
gcloud run services update SERVICE_NAME \
  --min-instances 2 \
  --max-instances 20

# Scale GKE node pool
gcloud container clusters resize gke-core \
  --node-pool nodepool-web \
  --num-nodes 3
```

## Troubleshooting

### Service Not Responding

```bash
# Check service status
gcloud run services describe SERVICE_NAME --region us-central1

# View recent logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=SERVICE_NAME" \
  --limit 100 \
  --format=json
```

### Database Connection Issues

```bash
# Test connection
gcloud sql connect mhc-streaming-db --user=mhc_app

# Check private IP configuration
gcloud sql instances describe mhc-streaming-db \
  --format="value(ipAddresses[0].ipAddress)"
```

### Frontend Build Failures

```bash
# Check Vercel deployment logs
vercel logs

# Test build locally
cd frontend
npm run build
```

### SSL Certificate Issues

```bash
# Check certificate status
gcloud compute ssl-certificates describe mhc-ssl-cert --global

# List all certificates
gcloud compute ssl-certificates list
```

### High Costs

Check resource usage:
```bash
# View billing
gcloud billing accounts list
gcloud billing projects describe $GCP_PROJECT_ID

# Optimize:
# - Use preemptible nodes for workers
# - Reduce min instances for Cloud Run
# - Set lifecycle policies on Storage buckets
```

## Rollback Procedure

### Rollback Frontend

```bash
cd frontend
vercel rollback
```

### Rollback Backend Service

```bash
# List revisions
gcloud run revisions list --service=SERVICE_NAME

# Roll back to previous revision
gcloud run services update-traffic SERVICE_NAME \
  --to-revisions=REVISION_NAME=100
```

### Rollback Infrastructure

```bash
cd terraform
terraform plan -destroy -out=destroy.tfplan
# Review carefully before applying
```

## Additional Resources

- [GCP Documentation](https://cloud.google.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Terraform GCP Provider](https://registry.terraform.io/providers/hashicorp/google/latest/docs)

## Support

For issues or questions:
- GitHub Issues: https://github.com/your-org/mhc-streaming/issues
- Email: devops@your-domain.com
