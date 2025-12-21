/**
 * MHC Streaming Royalty Calculation Algorithms
 * 
 * Implements fair, automated royalty distribution protecting artist interests.
 * All calculations are transparent, auditable, and fraud-resistant.
 */

// Types will be available after Prisma generation
export type ArtistTier = 'EMERGING' | 'RISING' | 'ESTABLISHED' | 'FEATURED';
export type SubscriptionTier = 'FREE' | 'INFERNO' | 'PURGATORIO' | 'PARADISO';

// ============================================================================
// CONFIGURATION
// ============================================================================

export const ROYALTY_CONFIG = {
  // Minimum watch time to count as qualified stream (seconds)
  QUALIFIED_STREAM_THRESHOLD: 30,
  
  // Minimum payout threshold (cents) - artists paid when they reach this
  MIN_PAYOUT_THRESHOLD: 5000, // $50
  
  // Artist tier multipliers (protects and rewards artists)
  TIER_MULTIPLIERS: {
    EMERGING: 1.0,      // New artists
    RISING: 1.2,        // Growing artists (+20%)
    ESTABLISHED: 1.5,   // Popular artists (+50%)
    FEATURED: 2.0,      // Featured artists like ISM (+100%)
  },
  
  // Subscription tier revenue weights
  TIER_WEIGHTS: {
    FREE: 0.1,          // Free users generate minimal revenue
    INFERNO: 1.0,       // Base tier
    PURGATORIO: 1.5,    // Mid tier (+50% weight)
    PARADISO: 2.5,      // Premium tier (+150% weight)
  },
  
  // Fraud detection thresholds
  FRAUD_THRESHOLDS: {
    MAX_STREAMS_PER_USER_PER_HOUR: 100,
    MAX_STREAMS_SAME_IP_PER_HOUR: 500,
    MIN_DURATION_RATIO: 0.5, // If avg duration/video length < 0.5, suspicious
    MAX_FRAUD_SCORE: 0.7,    // Streams with score > 0.7 are rejected
  },
  
  // Revenue pools (example - adjust based on actual platform revenue)
  BASE_REVENUE_PER_STREAM: 0.004, // $0.004 per qualified stream (industry standard)
} as const;

// ============================================================================
// TYPES
// ============================================================================

export interface StreamEventData {
  artistId: string;
  userId?: string;
  duration: number;
  videoDuration?: number;
  userTier: SubscriptionTier;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface FraudAnalysisResult {
  fraudScore: number; // 0-1, higher = more suspicious
  flags: string[];
  isQualified: boolean;
}

export interface RoyaltyCalculationInput {
  artistId: string;
  artistTier: ArtistTier;
  streamCount: number;
  totalPlatformStreams: number;
  revenuePool: number; // In cents
  fraudStreams: number;
}

export interface RoyaltyCalculationResult {
  baseAmount: number;      // Before multipliers
  tierMultiplier: number;
  finalAmount: number;     // After multipliers
  adjustedAmount: number;  // After fraud deduction
  perStreamRate: number;   // For transparency
}

// ============================================================================
// FRAUD DETECTION
// ============================================================================

/**
 * Analyzes stream event for fraud indicators
 * Protects artists from fraudulent inflation/deflation of streams
 */
export function analyzeFraud(
  event: StreamEventData,
  recentStreamsFromUser: number,
  recentStreamsFromIP: number
): FraudAnalysisResult {
  const flags: string[] = [];
  let fraudScore = 0;

  // Check: Too many streams from single user
  if (recentStreamsFromUser > ROYALTY_CONFIG.FRAUD_THRESHOLDS.MAX_STREAMS_PER_USER_PER_HOUR) {
    flags.push('excessive_user_streams');
    fraudScore += 0.4;
  }

  // Check: Too many streams from single IP
  if (recentStreamsFromIP > ROYALTY_CONFIG.FRAUD_THRESHOLDS.MAX_STREAMS_SAME_IP_PER_HOUR) {
    flags.push('excessive_ip_streams');
    fraudScore += 0.3;
  }

  // Check: Watch duration vs video length
  if (event.videoDuration) {
    const durationRatio = event.duration / event.videoDuration;
    if (durationRatio < ROYALTY_CONFIG.FRAUD_THRESHOLDS.MIN_DURATION_RATIO) {
      flags.push('low_watch_ratio');
      fraudScore += 0.2;
    }
  }

  // Check: Bot-like user agent patterns
  const userAgent = event.userAgent?.toLowerCase() || '';
  if (userAgent.includes('bot') || userAgent.includes('crawler') || userAgent.includes('spider')) {
    flags.push('bot_user_agent');
    fraudScore += 0.5;
  }

  // Check: Suspiciously short duration
  if (event.duration < 5) {
    flags.push('too_short');
    fraudScore += 0.3;
  }

  // Determine if stream qualifies for royalties
  const isQualified = 
    event.duration >= ROYALTY_CONFIG.QUALIFIED_STREAM_THRESHOLD &&
    fraudScore <= ROYALTY_CONFIG.FRAUD_THRESHOLDS.MAX_FRAUD_SCORE;

  return {
    fraudScore: Math.min(fraudScore, 1.0),
    flags,
    isQualified,
  };
}

// ============================================================================
// ROYALTY CALCULATION ALGORITHMS
// ============================================================================

/**
 * PRO-RATA DISTRIBUTION
 * Standard industry model: (Artist Streams / Total Streams) × Revenue Pool
 * Fair, transparent, protects artists proportionally
 */
export function calculateProRataRoyalty(input: RoyaltyCalculationInput): RoyaltyCalculationResult {
  const {
    streamCount,
    totalPlatformStreams,
    revenuePool,
    artistTier,
    fraudStreams,
  } = input;

  // Prevent division by zero
  if (totalPlatformStreams === 0) {
    return {
      baseAmount: 0,
      tierMultiplier: 0,
      finalAmount: 0,
      adjustedAmount: 0,
      perStreamRate: 0,
    };
  }

  // Calculate base share
  const artistShare = streamCount / totalPlatformStreams;
  const baseAmount = Math.floor(artistShare * revenuePool);

  // Apply artist tier multiplier (rewards quality/loyalty)
  const tierMultiplier = ROYALTY_CONFIG.TIER_MULTIPLIERS[artistTier];
  const finalAmount = Math.floor(baseAmount * tierMultiplier);

  // Deduct fraud penalty (protects platform integrity)
  const fraudRatio = fraudStreams / streamCount;
  const fraudPenalty = Math.floor(finalAmount * fraudRatio);
  const adjustedAmount = finalAmount - fraudPenalty;

  // Calculate per-stream rate for transparency
  const perStreamRate = streamCount > 0 ? adjustedAmount / streamCount : 0;

  return {
    baseAmount,
    tierMultiplier,
    finalAmount,
    adjustedAmount,
    perStreamRate,
  };
}

/**
 * USER-CENTRIC PAYMENT SYSTEM (UCPS)
 * Alternative model: Each user's subscription is split among artists they listened to
 * More fair to niche artists, protects against stream farming
 */
export function calculateUserCentricRoyalty(
  userStreams: Array<{
    artistId: string;
    streamCount: number;
    userTier: SubscriptionTier;
  }>,
  artistId: string
): number {
  let totalRevenue = 0;

  // Group by user, calculate their contribution
  const userContributions = new Map<string, { tier: SubscriptionTier; streams: number }>();

  for (const stream of userStreams) {
    if (!userContributions.has(stream.artistId)) {
      userContributions.set(stream.artistId, {
        tier: stream.userTier,
        streams: 0,
      });
    }
    const contrib = userContributions.get(stream.artistId)!;
    contrib.streams += stream.streamCount;
  }

  // Calculate artist's share from each user
  for (const [uid, data] of userContributions.entries()) {
    const artistStreams = userStreams.find(s => s.artistId === artistId)?.streamCount || 0;
    const userTotalStreams = Array.from(userContributions.values()).reduce(
      (sum, c) => sum + c.streams,
      0
    );

    if (userTotalStreams === 0) continue;

    // User's subscription value
    const tierWeight = ROYALTY_CONFIG.TIER_WEIGHTS[data.tier];
    const userRevenue = ROYALTY_CONFIG.BASE_REVENUE_PER_STREAM * 100 * tierWeight; // In cents

    // Artist's share of this user's revenue
    const artistShare = artistStreams / userTotalStreams;
    totalRevenue += userRevenue * artistShare;
  }

  return Math.floor(totalRevenue);
}

/**
 * HYBRID MODEL (RECOMMENDED)
 * Combines pro-rata and user-centric for optimal fairness
 * Protects both popular and niche artists
 */
export function calculateHybridRoyalty(
  proRataInput: RoyaltyCalculationInput,
  userCentricAmount: number,
  proRataWeight: number = 0.6 // 60% pro-rata, 40% user-centric
): RoyaltyCalculationResult {
  const proRataResult = calculateProRataRoyalty(proRataInput);
  
  // Blend the two models
  const hybridAmount = Math.floor(
    proRataResult.adjustedAmount * proRataWeight +
    userCentricAmount * (1 - proRataWeight)
  );

  return {
    ...proRataResult,
    adjustedAmount: hybridAmount,
    perStreamRate: proRataInput.streamCount > 0 ? hybridAmount / proRataInput.streamCount : 0,
  };
}

// ============================================================================
// PAYOUT ELIGIBILITY
// ============================================================================

/**
 * Determines if artist is eligible for payout
 * Protects artists by batching small amounts until threshold
 */
export function isEligibleForPayout(
  accumulatedEarnings: number,
  minThreshold: number = ROYALTY_CONFIG.MIN_PAYOUT_THRESHOLD
): boolean {
  return accumulatedEarnings >= minThreshold;
}

/**
 * Calculate next payout date
 * Automated scheduling protects artists from payment delays
 */
export function getNextPayoutDate(lastPayoutDate?: Date): Date {
  const now = new Date();
  const nextPayout = lastPayoutDate || now;
  
  // Payouts run on 1st and 15th of each month
  if (nextPayout.getDate() < 15) {
    nextPayout.setDate(15);
  } else {
    nextPayout.setMonth(nextPayout.getMonth() + 1);
    nextPayout.setDate(1);
  }
  
  return nextPayout;
}

// ============================================================================
// REVENUE POOL CALCULATION
// ============================================================================

/**
 * Calculates total revenue pool for distribution
 * Based on platform subscription revenue minus operating costs
 */
export function calculateRevenuePool(
  subscriptionRevenue: number, // Total subscription revenue (cents)
  artistRevenueShare: number = 0.7 // 70% goes to artists (industry standard)
): number {
  return Math.floor(subscriptionRevenue * artistRevenueShare);
}

// ============================================================================
// EXPORTS
// ============================================================================

export const RoyaltyAlgorithms = {
  analyzeFraud,
  calculateProRataRoyalty,
  calculateUserCentricRoyalty,
  calculateHybridRoyalty,
  isEligibleForPayout,
  getNextPayoutDate,
  calculateRevenuePool,
  CONFIG: ROYALTY_CONFIG,
};

export default RoyaltyAlgorithms;
