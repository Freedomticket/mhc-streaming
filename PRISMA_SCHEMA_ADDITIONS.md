# Prisma Schema Additions for Royalty System

Add these models to your `packages/database/prisma/schema.prisma` file:

```prisma
// ==================== ARTISTS ====================

model Artist {
  id                String   @id @default(cuid())
  name              String
  slug              String   @unique
  email             String   @unique
  
  // Industry identifiers
  iswc              String?  // International Standard Musical Work Code
  isrc              String?  // International Standard Recording Code
  ipi               String?  // Interested Party Information
  ipn               String?  // International Performer Number
  isni              String?  // International Standard Name Identifier
  
  // Tier system
  tier              ArtistTier @default(EMERGING)
  isFeatured        Boolean  @default(false)
  featuredAt        DateTime?
  
  // Payment details
  paymentMethod     String?  // STRIPE, PAYPAL, BANK, CRYPTO, MANUAL
  paypalEmail       String?
  stripeAccountId   String?
  bankAccount       String?
  walletAddress     String?  // For crypto payments
  
  // Royalty settings
  minPayout         Int      @default(5000) // $50 minimum
  
  // Stats (updated automatically)
  totalStreams      Int      @default(0)
  totalEarnings     Int      @default(0) // In cents
  pendingPayout     Int      @default(0) // In cents
  lifetimeRoyalties Int      @default(0) // In cents
  lastPayoutAt      DateTime?
  
  // Relations
  streamEvents      StreamEvent[]
  royalties         Royalty[]
  payouts           RoyaltyPayout[]
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

enum ArtistTier {
  EMERGING      // 1.0x multiplier
  RISING        // 1.2x multiplier
  ESTABLISHED   // 1.5x multiplier
  FEATURED      // 2.0x multiplier
}

// ==================== STREAM TRACKING ====================

model StreamEvent {
  id                String   @id @default(cuid())
  artistId          String
  artist            Artist   @relation(fields: [artistId], references: [id])
  
  userId            String
  contentId         String   // Video or song ID
  contentType       String   // VIDEO, AUDIO
  
  // Stream details
  duration          Int      // Seconds watched/listened
  userTier          SubscriptionTier @default(FREE)
  
  // Fraud detection
  ipAddress         String?
  userAgent         String?
  qualified         Boolean  @default(false) // True if passed fraud checks
  fraudScore        Float    @default(0)
  fraudFlags        String?  // Comma-separated flags
  
  // Processing
  processedAt       DateTime?
  timestamp         DateTime @default(now())
  
  @@index([artistId])
  @@index([userId])
  @@index([timestamp])
  @@index([qualified])
}

// ==================== ROYALTY CALCULATIONS ====================

model Royalty {
  id                String   @id @default(cuid())
  artistId          String
  artist            Artist   @relation(fields: [artistId], references: [id])
  
  // Period
  periodStart       DateTime
  periodEnd         DateTime
  
  // Calculation details
  streamCount       Int
  fraudStreams      Int      @default(0)
  
  // Amounts (all in cents)
  baseAmount        Int      // Before multipliers
  tierMultiplier    Float    // 1.0 - 2.0
  finalAmount       Int      // After multipliers
  adjustedAmount    Int      // After fraud deduction
  perStreamRate     Float    // For transparency
  
  // Status
  status            RoyaltyStatus @default(CALCULATED)
  
  createdAt         DateTime @default(now())
  
  @@index([artistId])
  @@index([periodEnd])
}

enum RoyaltyStatus {
  CALCULATED
  APPROVED
  PAID
  DISPUTED
}

// ==================== PAYOUTS ====================

model RoyaltyPayout {
  id                String   @id @default(cuid())
  artistId          String
  artist            Artist   @relation(fields: [artistId], references: [id])
  
  amount            Int      // In cents
  paymentMethod     String   // STRIPE, PAYPAL, BANK, CRYPTO, MANUAL
  
  // Payment details
  transactionId     String?  // From payment processor
  status            PaymentStatus @default(PENDING)
  failureReason     String?
  
  // Scheduling
  scheduledDate     DateTime
  processedAt       DateTime?
  completedAt       DateTime?
  
  createdAt         DateTime @default(now())
  
  @@index([artistId])
  @@index([status])
}

enum PaymentStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  CANCELLED
}

// ==================== MODERATION LOGS ====================

model ModerationLog {
  id                String   @id @default(cuid())
  contentType       String   // TEXT, IMAGE, VIDEO, AUDIO, BLACKLIST
  contentId         String
  userId            String
  
  // Decision
  approved          Boolean
  confidence        Float
  flags             String?  // Comma-separated
  reason            String?
  
  // Evidence
  contentHash       String
  
  createdAt         DateTime @default(now())
  
  @@index([userId])
  @@index([approved])
  @@index([createdAt])
}
```

## Run Migration

After adding to schema:

```bash
cd packages/database
npx prisma migrate dev --name add_royalty_system
npx prisma generate
```

## Seed ISM Artist

```typescript
// packages/database/seed.ts
await prisma.artist.create({
  data: {
    name: 'ISM',
    slug: 'ism',
    email: 'ism@mhcstreaming.com',
    tier: 'FEATURED',
    isFeatured: true,
    featuredAt: new Date(),
    iswc: 'T-123.456.789-0',
    isrc: 'USISM2500001',
    ipi: '00123456789',
    ipn: 'ISM-001',
    isni: '0000 0000 0000 0001',
    paymentMethod: 'PAYPAL',
    paypalEmail: 'ism@mhcstreaming.com',
    minPayout: 5000,
  },
});
```
