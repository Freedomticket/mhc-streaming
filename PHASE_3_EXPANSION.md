# PHASE 3 EXPANSION - COMPLETE ROADMAP

**Status**: PLANNING → EXECUTION
**Target**: 100% self-hosted, zero big-tech dependencies
**Compliance**: GDPR, CCPA, DMCA, SOC2, courtroom-admissible

---

## ✅ SYSTEM 1: PI-PROOF FORENSIC AUDIT TRAIL & COMPLIANCE (IN PROGRESS)

### What's Built ✅
- `ForensicLog` model - hash-chained immutable records
- `ForensicSnapshot` model - Merkle root verification
- `ForensicExport` model - court-admissible exports
- `src/services/forensics.service.ts` - Complete hash-chaining logic
  - `logForensicEvent()` - Create tamper-proof records
  - `verifyChainIntegrity()` - Detect tampering
  - `createForensicSnapshot()` - Periodic Merkle verification
  - `exportForensicLogs()` - Export with cryptographic signatures
  - `CRITICAL_EVENTS` - Registry of all loggable events

### What's Next ⏭️
1. Create `src/routes/forensics.routes.ts`
   - GET `/api/forensics/logs` - Query with filters
   - POST `/api/forensics/verify` - Verify chain integrity
   - POST `/api/forensics/snapshot` - Create Merkle snapshot
   - POST `/api/forensics/export` - Export with signature
   - GET `/api/forensics/export/:id/verify` - Verify export

2. Integrate forensics into critical paths:
   - Login → `logForensicEvent('USER_LOGIN', ...)`
   - Payment → `logForensicEvent('PAYMENT_COMPLETED', ...)`
   - DMCA action → `logForensicEvent('DMCA_APPROVED', ...)`
   - Strike issued → `logForensicEvent('USER_STRIKE_ISSUED', ...)`

3. Storage backend (choose one):
   - **ZFS Snapshots** (Linux/BSD) - Built-in immutability
   - **Ceph Object Locks** - Distributed WORM storage
   - **MinIO Object Immutability** - S3-compatible WORM

4. Daily scheduled tasks:
   - `0 2 * * * createForensicSnapshot()` - Create daily Merkle root
   - Export to immutable storage (cold backup)
   - Verify chain integrity daily

### Why This Matters
- **Legal**: Records are court-admissible (hash-chained, tamper-evident)
- **Compliance**: GDPR audit trail, CCPA data deletion proof, DMCA evidence
- **Security**: Impossible to modify or delete without breaking chain
- **Trust**: Artists can verify all their transactions are recorded

---

## 🚀 SYSTEM 2: FULL MOBILE APP (REACT NATIVE - NO FIREBASE)

### Architecture
```
mhc-mobile/
├── App.tsx                 # Navigation root
├── screens/
│   ├── Auth/
│   │   ├── Login.tsx      # JWT login
│   │   ├── Register.tsx
│   │   └── ForgotPassword.tsx
│   ├── Feed/
│   │   ├── DiscoveryFeed.tsx   # TikTok-like infinite scroll
│   │   ├── TrendingFeed.tsx    # Hot videos
│   │   └── FollowingFeed.tsx   # Creator subscriptions
│   ├── Watch/
│   │   ├── VideoPlayer.tsx     # ExoPlayer/AVPlayer
│   │   ├── Comments.tsx        # Socket.io comments
│   │   ├── Tips.tsx            # Send tips
│   │   └── Like.tsx            # Like tracking
│   ├── Live/
│   │   ├── LiveFeed.tsx        # Active streams
│   │   ├── StreamPlayer.tsx    # HLS playback
│   │   └── ChatBox.tsx         # Socket.io livestream chat
│   ├── Upload/
│   │   ├── SelectVideo.tsx     # Pick from device
│   │   ├── EditMetadata.tsx    # Title, desc, realm
│   │   ├── PublishVideo.tsx    # Upload progress
│   │   └── Processing.tsx      # Auto-edit jobs
│   ├── Artist/
│   │   ├── ProfileView.tsx     # Creator page
│   │   ├── Analytics.tsx       # Views, tips, subs
│   │   ├── DashboardView.tsx   # Artist dashboard
│   │   └── Settings.tsx        # Payout method, realm pref
│   └── Account/
│       ├── LoginView.tsx
│       ├── SubscriptionMgmt.tsx
│       ├── PaymentMethods.tsx
│       └── Preferences.tsx
├── services/
│   ├── api.ts                  # Axios instance + endpoints
│   ├── socket.ts               # Socket.io manager
│   ├── storage.ts              # AsyncStorage (JWT, preferences)
│   ├── video.ts                # Video upload/tracking
│   └── analytics.ts            # Event tracking (non-invasive)
├── components/
│   ├── VideoTile.tsx           # Reusable video card
│   ├── StreamCard.tsx          # Live stream card
│   ├── Chat.tsx                # Chat UI
│   └── RealmTheme.tsx          # Inferno/Purgatorio/Paradiso
├── hooks/
│   ├── useAuth.ts              # JWT token management
│   ├── useSocket.ts            # Socket.io connection
│   ├── useVideo.ts             # Video playback state
│   └── useUser.ts              # User data + preferences
├── context/
│   ├── AuthContext.tsx         # Global auth state
│   ├── ThemeContext.tsx        # Realm theme switching
│   └── UserContext.tsx         # User profile/stats
└── package.json                # React Native + Expo

```

### Key Libraries
```json
{
  "react-native": "^0.75.0",
  "expo": "^52.0.0",
  "axios": "^1.6.0",
  "socket.io-client": "^4.7.0",
  "react-native-video": "^6.0.0",
  "react-native-gesture-handler": "^2.14.0",
  "@react-navigation/native": "^6.1.0",
  "@react-navigation/bottom-tabs": "^6.5.0",
  "react-native-safe-area-context": "^4.7.0",
  "zustand": "^4.4.0",
  "nativewind": "^2.0.0"
}
```

### Authentication Flow
```typescript
// Login
POST /api/auth/login
{ email, password }
↓
Response: { access: JWT, refresh: JWT, user: {...} }
↓
AsyncStorage.setItem('token', access)
↓
Set Authorization header: `Bearer ${token}`
```

### Video Playback Integration
```typescript
// When user watches video
POST /api/recommendation/video/:id/view
// Updates views, trending, ranking in real-time

// When video completes
POST /api/recommendation/video/:id/watchtime
{ secondsWatched: 180 }

// When user likes
POST /api/recommendation/video/:id/like
{ liked: true }
```

### Development Timeline
- Week 1-2: Auth, navigation, basic feed
- Week 3: Video player, livestream viewer
- Week 4: Upload flow, artist dashboard
- Week 5-6: Monetization (tips, subscriptions), Socket.io integration
- Week 7-8: Testing, iOS/Android builds, AppStore/PlayStore prep

---

## 🎵 SYSTEM 3: FULL LABEL DISTRIBUTION PIPELINE

### Supported DSPs (Digital Service Providers)
- Spotify
- Apple Music
- Amazon Music
- YouTube Music
- Tidal
- Deezer
- Bandcamp
- SoundCloud

### DDEX Standard XML Flow
```typescript
// Artist uploads song
POST /api/upload

// Backend automatically:
1. Validate audio (MP3, WAV, FLAC)
2. Generate metadata:
   - ISRC (International Standard Recording Code)
   - UPC (Universal Product Code) 
   - ISWC (Musical work ID)
3. Create DDEX Release XML:
   <Release>
     <ReleaseId>${ISRC}</ReleaseId>
     <Title>${title}</Title>
     <Artist>${artist}</Artist>
     <Genre>${genre}</Genre>
     <ReleaseDate>${date}</ReleaseDate>
     <AudioFile>
       <FileHash>${sha256}</FileHash>
       <Duration>${seconds}</Duration>
     </AudioFile>
     <Contributor role="Composer">${artist}</Contributor>
     <Rights>${copyright}</Rights>
   </Release>
4. SFTP to aggregators
5. Track ingestion status (1-2 weeks for distribution)
6. Ingest royalty reports
```

### Distribution Service Architecture
```
src/services/distribution.service.ts
├── generateISRC()              # Auto-generate ISRC
├── generateUPC()               # Auto-generate UPC
├── createDDEXMetadata()        # Build release XML
├── uploadToAggregator()        # SFTP push
├── trackDistributionStatus()   # Poll status
└── ingestRoyaltyReport()       # Parse payouts

src/routes/distribution.routes.ts
├── POST /api/distribution/upload     # Submit for distribution
├── GET /api/distribution/status/:id  # Track ingestion
├── GET /api/distribution/royalties   # View reports
└── POST /api/distribution/withdraw   # Request payout
```

### SFTP Aggregator Configuration
```env
# SFTP credentials (in .env, not committed)
SFTP_HOST=uploads.spotify.com
SFTP_PORT=22
SFTP_USER=${SPOTIFY_SFTP_USER}
SFTP_PASS=${SPOTIFY_SFTP_PASS}

# Repeat for: Apple, Tidal, Deezer, etc.
```

### Royalty Reconciliation
```typescript
// Aggregators send monthly reports via SFTP
// Cron job (monthly on 1st):
1. Download royalty CSV from each DSP
2. Parse and validate
3. Calculate artist share (after platform fee)
4. Create payout records
5. Trigger payment (Stripe/crypto)
6. Log in forensic audit trail

// Artist sees:
GET /api/royalties/statement?month=2025-01
{
  source: "Spotify",
  streams: 1000000,
  royalties: $5000,
  platformFee: -$500,  // 10%
  artistPayout: $4500
}
```

### Timeline
- Week 1: ISRC/UPC generation, DDEX XML builder
- Week 2-3: SFTP integrations (Spotify, Apple, Tidal)
- Week 4: Royalty ingestion parser
- Week 5: Dashboard + distribution status tracking
- Week 6: Testing with real aggregators

---

## ⛓️ SYSTEM 4: WEB3 ROYALTY LEDGER (OPTIONAL)

### Why Optional?
✅ Blockchain adds transparency for artists
❌ But also adds complexity, cost, gas fees
✅ Works with Ethereum, Polygon, or private chain
✅ Our implementation: **DB-backed ledger that mirrors blockchain**

### Architecture
```
Offline-First Strategy:
- Local DB records all royalty transactions
- Optional: Sync to public blockchain (Polygon for low gas)
- Contract only holds actual payouts (not streaming calculations)
- Forensic trail + blockchain = maximum transparency
```

### Smart Contract (Solidity)
```solidity
pragma solidity ^0.8.0;

contract MHCArtistRoyalties {
  // Artist address → available balance
  mapping(address => uint256) public balances;
  
  // Artist address → total earned
  mapping(address => uint256) public totalEarned;
  
  // Event log
  event RoyaltyCredited(address artist, uint256 amount);
  event PayoutProcessed(address artist, uint256 amount);
  
  function creditRoyalty(address artist) external payable {
    require(msg.value > 0, "Amount must be > 0");
    require(msg.sender == owner, "Only platform can credit");
    
    balances[artist] += msg.value;
    totalEarned[artist] += msg.value;
    
    emit RoyaltyCredited(artist, msg.value);
  }
  
  function withdraw(uint256 amount) external {
    require(balances[msg.sender] >= amount, "Insufficient balance");
    
    balances[msg.sender] -= amount;
    payable(msg.sender).transfer(amount);
    
    emit PayoutProcessed(msg.sender, amount);
  }
  
  function getBalance(address artist) external view returns (uint256) {
    return balances[artist];
  }
}
```

### Sync Strategy
```typescript
// Every payout, sync to blockchain (if enabled)
if (BLOCKCHAIN_ENABLED) {
  const tx = await contract.creditRoyalty(artistAddress, {
    value: ethers.utils.parseEther(amount.toString())
  });
  await tx.wait(); // Wait for confirmation
  
  // Log hash
  await prisma.royaltyTransaction.update({
    where: { id },
    data: { blockchainTx: tx.hash }
  });
}

// Check blockchain for transparent verification
GET /api/royalties/:artistId/blockchain
Returns: { ethereumBalance, polygonBalance, totalOnChain }
```

### Timeline (Optional)
- Week 1: Smart contract development + audit
- Week 2: Deploy to Polygon testnet
- Week 3: Sync logic implementation
- Week 4: UI to show blockchain balance
- Week 5: Mainnet deployment + monitoring

---

## 🎟️ SYSTEM 5: LIVESTREAM TICKETING SYSTEM

### Pay-Per-View Model
```
Artist can charge for livestreams:
- $2.99 - Concert/performance
- $9.99 - Workshop/masterclass
- $29.99 - exclusive artist session
- $99.99 - VIP meet & greet (limited)
```

### Ticket Flow
```
1. Artist creates livestream event
   POST /api/live/create
   { title, startTime, price, capacity, replayAccess }

2. Fan purchases ticket
   POST /api/tickets/purchase
   { streamId }
   → Stripe charges card
   → Ticket issued with QR code

3. At stream start, fan validates ticket
   POST /api/tickets/validate
   { ticketId }
   → Grants access to HLS stream
   → Records attendance (forensic log)

4. After stream, fans with replayAccess can watch:
   GET /api/replays/:streamId
   → 7-day replay window
   → Same access control as live
```

### Database Models
```prisma
model LiveTicket {
  id        String   @id @default(uuid())
  userId    String
  streamId  String
  price     Float
  used      Boolean  @default(false)
  usedAt    DateTime?
  qrCode    String   // Unique QR per ticket
  createdAt DateTime @default(now())
  
  user    User       @relation(fields: [userId], references: [id])
  stream  LiveStream @relation(fields: [streamId], references: [id])
  
  @@unique([streamId, userId]) // Only one ticket per user per stream
  @@index([used])
}

model ReplayAccess {
  id          String   @id @default(uuid())
  ticketId    String   @unique
  expiresAt   DateTime // 7 days after stream
  createdAt   DateTime @default(now())
  
  ticket LiveTicket @relation(fields: [ticketId], references: [id])
}
```

### Anti-Fraud Measures
```typescript
// QR codes are unique + single-use
QR = hash(ticketId + streamId + timestamp + secret)

// Validate at stream entry:
1. Check QR hasn't been used (used = false)
2. Verify QR hash is correct
3. Confirm ticket exists and user matches
4. Mark as used + record time
5. Grant RTMP stream key for this user

// Prevent ticket sharing:
- Each QR only valid for 10 minutes
- Rate limit: 1 access per IP per stream
- Geoblock suspicious activity (if > 1000 miles away)
```

### Revenue Split
```
Example: $9.99 ticket sale
- Artist receives: $7.99 (80%)
- Platform fee: $1.00 (10%)
- Payment processing: $1.00 (10% Stripe fee)
```

### Timeline
- Week 1: Ticket model, purchase flow
- Week 2: QR generation + validation
- Week 3: Replay access logic
- Week 4: Stream gating + HLS integration
- Week 5: Reporting + payout reconciliation

---

## 📅 GLOBAL ROLLOUT SCHEDULE

### Phase 3A: Forensics Foundation (Week 1-2)
✅ Forensic audit service (IN PROGRESS)
- [ ] Forensics routes
- [ ] Integrate into all critical paths
- [ ] Daily snapshot cron
- [ ] Storage backend selection

### Phase 3B: Mobile App (Week 3-8)
- [ ] React Native project setup
- [ ] Auth flow
- [ ] Feed, watch, upload screens
- [ ] Socket.io real-time chat
- [ ] Build for iOS/Android
- [ ] TestFlight/internal testing
- [ ] App Store/Play Store submission

### Phase 3C: Label Distribution (Week 6-11)
- [ ] ISRC/UPC generation
- [ ] DDEX XML builder
- [ ] SFTP integrations
- [ ] Royalty report parser
- [ ] Distribution dashboard

### Phase 3D: Web3 Ledger (Week 9-13, optional)
- [ ] Smart contract development
- [ ] Polygon deployment
- [ ] Sync logic
- [ ] Blockchain UI

### Phase 3E: Ticketing System (Week 12-16)
- [ ] Ticket model + purchase
- [ ] QR code generation
- [ ] Stream gating
- [ ] Replay window logic

---

## 🎯 SUCCESS METRICS

By end of Phase 3:

✅ **Legal Compliance**
- 100% of transactions have forensic audit trail
- Chain integrity verified daily
- Merkle snapshots stored in immutable storage
- Exports are court-admissible

✅ **Mobile User Base**
- iOS app in App Store
- Android app in Play Store
- 50+ testers using daily
- Feature parity with web

✅ **Artist Revenue**
- Music distributed to 8+ DSPs
- Royalty reports auto-generated
- Direct DSP payouts automated
- Artists earning from day 1

✅ **Trust & Transparency**
- Blockchain ledger mirrors DB transactions
- Artists can verify royalties cryptographically
- No hidden fees or deductions
- Full data ownership

✅ **Monetization**
- Livestream ticketing active
- $100+ in tickets sold weekly
- Replay access generating repeat revenue
- Fraud rate < 0.1%

---

## 💰 COST BREAKDOWN (SELF-HOSTED)

| System | Cost | Notes |
|--------|------|-------|
| Forensic Storage | $100-500/mo | ZFS snapshots or MinIO |
| Mobile Hosting | $0 | Expo free tier + your server |
| SFTP Aggregator | $0 | Provided by DSPs |
| Blockchain (optional) | $20-200/mo | Polygon RPC node |
| Ticketing (no new infra) | $0 | Uses existing stream infra |
| **TOTAL** | **$120-700/mo** | vs $5000+/mo for AWS |

---

## ✅ VERIFICATION CHECKLIST

Before Phase 3 deployment:

- [ ] All forensic events logged correctly
- [ ] Chain integrity passes daily verification
- [ ] Mobile app tested on iOS/Android
- [ ] DDEX XML validates against schema
- [ ] Smart contract audited (if using blockchain)
- [ ] Ticket QR codes work at stream entry
- [ ] No big-tech dependencies (AWS, Firebase, Google)
- [ ] Global System Directive compliance verified
- [ ] Performance benchmarks passed
- [ ] Security review completed

---

**Status**: READY TO BUILD
**Estimated Completion**: 16 weeks
**Self-hosted Cost**: $1,920-11,200 per year
**Dependencies**: ZERO on Google, AWS, Firebase, Azure
