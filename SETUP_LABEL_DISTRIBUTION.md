# LABEL DISTRIBUTION & WEB3 SETUP GUIDE

**Last Updated**: December 13, 2025
**Status**: ✅ Ready to Deploy

---

## 🚀 QUICK START (15 minutes)

### Step 1: Copy & Configure Environment Variables

```bash
# Backend
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```bash
# Set minimum required variables:
ENABLE_LABEL_DISTRIBUTION=true
ENABLE_AUTO_BACKUPS=true

# OPTIONAL: Configure SFTP (add real credentials before production)
SPOTIFY_SFTP_USER=your_spotify_username
SPOTIFY_SFTP_PASS=your_spotify_password
APPLE_SFTP_USER=your_apple_username
APPLE_SFTP_PASS=your_apple_password
```

### Step 2: Run Prisma Migration

```bash
cd backend
npx prisma migrate dev --name add_distribution_web3
```

This creates 6 new tables:
- `DistributionMetadata` - Track ISRC/UPC
- `LabelDistribution` - Per-platform distribution
- `RoyaltyBatch` - DSP royalty imports
- `RoyaltyBatchEntry` - Individual entries
- `Web3RoyaltyLedger` - Blockchain ledger (optional)
- `Web3ContractState` - Blockchain sync state

### Step 3: Start Backend

```bash
cd backend
npm run dev
```

Expected logs:
```
[Royalty] Service initialized
[Distribution] Service initialized
[Web3] Initialized 3 blockchain configurations
[DR] Backup schedules initialized
```

### Step 4: Run E2E Tests

```bash
cd backend
npm run test -- tests/e2e-distribution-royalty.test.ts
```

Should see:
```
✅ End-to-End: Label Distribution & Royalty Flow (PASS)
  ✓ Step 1: Create Distribution Metadata
  ✓ Step 2: Validate Rights Before Distribution
  ✓ Step 3: Distribute to Platforms
  ✓ Step 4: Import Royalty Batch from DSP
  ✓ Step 5: Calculate Royalty Breakdown
  ✓ Step 6: Automatic Monthly Payout
  ✓ Step 7: Web3 Ledger (Optional)
```

---

## 📋 DETAILED SETUP

### Prerequisites

- Node.js 18+ LTS
- PostgreSQL 15+
- Redis 7+
- Stripe account (for payouts)

### Database Setup

#### 1. Create PostgreSQL Database

```bash
createdb mhc_streaming
```

#### 2. Create Standby Database (Optional but Recommended)

```bash
createdb mhc_streaming_standby
# Setup replication from primary to standby
```

#### 3. Run Migrations

```bash
cd backend
npx prisma migrate deploy
```

### Stripe Configuration

#### 1. Create Stripe Account

Go to https://dashboard.stripe.com and sign up.

#### 2. Create Products & Prices

```
Product 1: MHC Streaming - Free Tier
  Price: Free (no charges)

Product 2: MHC Streaming - Fan ($5/mo)
  Price ID: price_1234...

Product 3: MHC Streaming - Pro ($15/mo)
  Price ID: price_5678...

Product 4: MHC Streaming - Studio ($49/mo)
  Price ID: price_90ab...
```

#### 3. Configure Webhook

1. Go to Webhooks in Stripe Dashboard
2. Click "Add endpoint"
3. URL: `https://yourdomain.com/api/v1/billing/webhook`
4. Events: Select:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Copy webhook secret to `.env`

#### 4. Add Credentials to .env

```bash
STRIPE_SECRET_KEY=sk_live_51234567890...
STRIPE_PUBLISHABLE_KEY=pk_live_09876543...
STRIPE_WEBHOOK_SECRET=whsec_1234567890...
STRIPE_PRICE_FAN=price_1234567890...
STRIPE_PRICE_PRO=price_0987654321...
STRIPE_PRICE_STUDIO=price_1357924680...
```

### Label Distribution Setup (SFTP)

#### 1. Spotify

1. Create Spotify for Artists account
2. Request SFTP access: https://artists.spotify.com/distributing-your-music/upload-your-music
3. Receive SFTP credentials
4. Add to `.env`:

```bash
SPOTIFY_SFTP_HOST=sftp.spotify.com
SPOTIFY_SFTP_USER=your_username
SPOTIFY_SFTP_PASS=your_password
```

#### 2. Apple Music

1. Create Apple ID
2. Request Music Delivery Program access: https://www.apple.com/apple-music-for-artists/
3. Receive SFTP credentials
4. Add to `.env`:

```bash
APPLE_SFTP_HOST=sftp.apple.com
APPLE_SFTP_USER=your_username
APPLE_SFTP_PASS=your_password
```

#### 3. Tidal

1. Create Tidal for Artists account
2. Request distribution: https://tidal.com/artist
3. Receive SFTP credentials
4. Add to `.env`:

```bash
TIDAL_SFTP_HOST=sftp.tidal.com
TIDAL_SFTP_USER=your_username
TIDAL_SFTP_PASS=your_password
```

#### 4. Deezer

1. Create Deezer for Artists account
2. Request music delivery
3. Receive SFTP credentials
4. Add to `.env`:

```bash
DEEZER_SFTP_HOST=sftp.deezer.com
DEEZER_SFTP_USER=your_username
DEEZER_SFTP_PASS=your_password
```

### Web3 Setup (Optional)

#### Option A: Use Polygon (Recommended - Cheapest)

1. Deploy contract to Polygon (no cost, free testnet gas)
2. Get RPC endpoint: https://rpc.polygonscan.com
3. Add to `.env`:

```bash
ENABLE_WEB3=true
POLYGON_RPC_URL=https://rpc.polygonscan.com
POLYGON_CONTRACT_ADDRESS=0x...  # From deployment
```

#### Option B: Use Ethereum (Most Secure)

1. Deploy contract to Ethereum mainnet ($100-500 gas)
2. Get RPC endpoint: https://eth.llamarpc.com
3. Generate private key for contract operations
4. Add to `.env`:

```bash
ENABLE_WEB3=true
ETHEREUM_RPC_URL=https://eth.llamarpc.com
ETHEREUM_CONTRACT_ADDRESS=0x...
ETHEREUM_PRIVATE_KEY=0x...
```

#### Option C: Local Hyperledger Besu (Self-Hosted)

```bash
# Install Besu
docker pull hyperledger/besu:latest

# Start local blockchain
docker run -d \
  -p 8545:8545 \
  hyperledger/besu:latest \
  --network=dev \
  --miner-enabled
```

Add to `.env`:

```bash
LOCAL_BLOCKCHAIN_URL=http://localhost:8545
```

#### Deploy Smart Contract

See `SMART_CONTRACT.sol` (will be provided):

```solidity
pragma solidity ^0.8.0;

contract ArtistRoyalty {
  mapping(address => uint256) public balances;
  
  function credit(address artist, uint256 amount) public payable {
    balances[artist] += amount;
  }
  
  function withdraw(uint256 amount) public {
    require(balances[msg.sender] >= amount);
    (bool success,) = payable(msg.sender).call{value: amount}("");
    require(success);
    balances[msg.sender] -= amount;
  }
}
```

Deploy using Remix or Hardhat:

```bash
# Compile
npx hardhat compile

# Deploy to Polygon
npx hardhat run scripts/deploy.js --network polygon

# Copy contract address to .env
```

### Disaster Recovery Setup

#### 1. Enable Automatic Backups

```bash
ENABLE_AUTO_BACKUPS=true
BACKUP_DIR=/backups/mhc-streaming
```

Create backup directory:

```bash
mkdir -p /backups/mhc-streaming
chmod 755 /backups/mhc-streaming
```

#### 2. Setup Standby Database

PostgreSQL:

```bash
# On primary server, enable replication
sudo vi /etc/postgresql/15/main/postgresql.conf

# Add:
wal_level = replica
max_wal_senders = 10
hot_standby = on

# Restart
sudo systemctl restart postgresql

# On standby server:
pg_basebackup -h primary-db -D /var/lib/postgresql/15/main -U replication
```

#### 3. Configure Automatic Failover

```bash
AUTO_FAILOVER_ENABLED=true
STANDBY_DATABASE_URL=postgresql://user:pass@standby-db:5432/mhc_streaming
```

### Verify Installation

#### 1. Check Services Started

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Should see:
# ✓ Express server running on port 3000
# ✓ Prisma connected to PostgreSQL
# ✓ Redis connected
# ✓ Royalty Service initialized
# ✓ Distribution Service initialized
# ✓ Backup schedules initialized
```

#### 2. Test ISRC Generation

```bash
curl http://localhost:3000/api/v1/distribution/test-isrc
```

Response:

```json
{
  "isrc": "USMHC25ABCDE",
  "upc": "000010001234X",
  "valid": true
}
```

#### 3. Test Royalty Calculation

```bash
curl http://localhost:3000/api/v1/royalty/balance/artist-id
```

Response:

```json
{
  "totalEarned": 0,
  "totalPaid": 0,
  "pendingPayout": 0
}
```

#### 4. Test Web3 (if enabled)

```bash
curl http://localhost:3000/api/v1/web3/status
```

Response:

```json
{
  "polygon": {
    "blockchainType": "polygon",
    "isHealthy": true,
    "lastSyncedBlock": 45123456
  },
  "ethereum": {
    "blockchainType": "ethereum",
    "isHealthy": true,
    "lastSyncedBlock": 18234567
  },
  "local": {
    "blockchainType": "local",
    "isHealthy": true,
    "lastSyncedBlock": 125
  }
}
```

---

## 🧪 MANUAL TESTING

### Test 1: Upload → ISRC Generation

```bash
# 1. Create artist account
POST /api/v1/auth/register
{
  "email": "artist@test.com",
  "username": "artist_test",
  "password": "securepass123"
}

# 2. Upload video
POST /api/v1/videos/upload
Headers: Authorization: Bearer <token>
Body: FormData {
  video: <file>,
  title: "My Song",
  description: "Test track"
}

# 3. Check ISRC was auto-generated
GET /api/v1/distribution/metadata/{videoId}
Response: { isrc: "USMHC25...", upc: "000010...", status: "pending" }
```

### Test 2: Import Royalties

```bash
# Import mock royalty batch from Spotify
POST /api/v1/distribution/royalties/import
{
  "platform": "spotify",
  "period": "2025-01",
  "entries": [
    {
      "isrc": "USMHC25ABC123",
      "title": "My Song",
      "streams": 150000,
      "amount": 45.67
    }
  ]
}

# Check artist account updated
GET /api/v1/royalty/balance/{artistId}
Response: { pendingPayout: 45.67, totalEarned: 45.67 }
```

### Test 3: Process Payout

```bash
# Trigger monthly payout (normally automatic on 1st)
POST /api/v1/royalty/payout/process
Response: { 
  processed: 5,
  totalAmount: 250.50,
  results: [...]
}

# Check artist received funds
GET /api/v1/royalty/history/{artistId}
Response: [{ payoutId: "STRIPE_...", amount: 45.67, status: "completed" }]
```

### Test 4: Web3 Ledger (Optional)

```bash
# Create ledger entry
POST /api/v1/web3/ledger/create
{
  "artistId": "...",
  "walletAddress": "0x1234567890123456789012345678901234567890",
  "amount": 100,
  "blockchain": "polygon"
}

# Check sync status (runs every 5 min automatically)
GET /api/v1/web3/ledger/{entryId}/status
Response: { status: "pending", txHash: null, synced: false }

# After 5 minutes, should see:
# { status: "submitted", txHash: "0x...", synced: true }
```

---

## 🚨 TROUBLESHOOTING

### Issue: "Cannot connect to PostgreSQL"

```bash
# Check if PostgreSQL is running
psql -U postgres -d mhc_streaming -c "SELECT 1"

# If failed, start PostgreSQL
sudo systemctl start postgresql

# Check connection string in .env
DATABASE_URL=postgresql://user:pass@localhost:5432/mhc_streaming
```

### Issue: "SFTP credentials not working"

```bash
# Test SFTP manually
sftp -P 22 username@sftp.spotify.com

# If failed:
1. Verify credentials with platform (Spotify/Apple/Tidal/Deezer)
2. Check firewall allows port 22
3. Verify .env has correct credentials (no quotes)
```

### Issue: "Stripe webhook not firing"

```bash
# Test webhook locally
stripe trigger customer.subscription.created

# Or use Stripe CLI to forward webhooks
stripe listen --forward-to localhost:3000/api/v1/billing/webhook

# Check webhook endpoint exists:
curl http://localhost:3000/api/v1/billing/webhook -X POST
```

### Issue: "Web3 ledger not syncing"

```bash
# Check blockchain is healthy
curl {POLYGON_RPC_URL} -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# If RPC is down, switch to backup
POLYGON_RPC_URL=https://polygon-rpc.com

# Check contract address is valid
POLYGON_CONTRACT_ADDRESS=0x... # Must be deployed contract
```

---

## 📊 MONITORING

### Logs to Watch

```bash
# Label Distribution
[Distribution] Created manifest for {videoId}
[Distribution] Distributed {isrc} to spotify
[Distribution] Imported 15 royalty entries from spotify

# Royalty Processing
[Royalty] Credited $45.67 to {artistId} from distribution_ISRC
[Royalty] Processing monthly payouts...
[Royalty] Payout {payoutId} processed

# Web3 Sync
[Web3] Syncing 10 pending entries...
[Web3] Synced entry {entryId} with tx: 0x...

# Disaster Recovery
[DR] Starting hourly backup...
[DR] Backup created: db-1702566000.sql.gz
[DR] Primary health check passed
```

### Metrics to Track

```bash
# Number of videos distributed
SELECT COUNT(*) FROM "DistributionMetadata" WHERE createdAt > NOW() - INTERVAL '30 days'

# Pending payouts
SELECT SUM("pendingPayout") FROM "RoyaltyAccount"

# Web3 sync status
SELECT COUNT(*) FROM "Web3RoyaltyLedger" WHERE synced = true

# Distribution status
SELECT platform, COUNT(*) FROM "LabelDistribution" GROUP BY platform
```

---

## ✅ DEPLOYMENT CHECKLIST

Before going live:

- [ ] All SFTP credentials configured for Spotify, Apple, Tidal, Deezer
- [ ] Stripe API keys and webhook secret set
- [ ] PostgreSQL backup directory created and verified
- [ ] Standby database replication configured
- [ ] Web3 contract deployed (if using)
- [ ] E2E tests passing
- [ ] Manual tests completed (upload → payout flow)
- [ ] Monitoring alerts configured
- [ ] Admin dashboard tested
- [ ] SSL/TLS certificates valid
- [ ] Rate limiting enabled
- [ ] CORS configured for frontend domain
- [ ] Logging and alerting setup

---

**Status**: ✅ Ready to Deploy

When deployment is complete, refer to LABEL_DISTRIBUTION_WEB3_STATUS.md for operational documentation.
