/**
 * Royalty Tracking Service
 * 
 * Tracks all stream events in real-time for royalty calculation.
 * Uses Redis for fast aggregation and fraud detection.
 */

import { prisma } from '@mhc/database';
import { Redis } from 'ioredis';
import { RoyaltyAlgorithms, StreamEventData, FraudAnalysisResult } from '@mhc/database/src/royalty-algorithms';
import { SubscriptionTier } from '@prisma/client';

// Initialize Redis client
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: 1, // Use separate DB for royalty tracking
});

// ============================================================================
// STREAM TRACKING
// ============================================================================

export interface TrackStreamParams {
  videoId?: string;
  streamId?: string;
  artistId: string;
  userId?: string;
  duration: number;
  videoDuration?: number;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Track a stream event with fraud detection
 * Called every time a user watches content
 */
export async function trackStream(params: TrackStreamParams): Promise<{
  success: boolean;
  qualified: boolean;
  fraudAnalysis: FraudAnalysisResult;
  streamEventId?: string;
}> {
  const {
    videoId,
    streamId,
    artistId,
    userId,
    duration,
    videoDuration,
    ipAddress,
    userAgent,
  } = params;

  try {
    // Get user's subscription tier
    let userTier: SubscriptionTier = 'FREE';
    if (userId) {
      const subscription = await prisma.subscription.findUnique({
        where: { userId },
        select: { tier: true },
      });
      userTier = subscription?.tier || 'FREE';
    }

    // Fraud detection: Check recent streams
    const hourAgo = Date.now() - 3600000; // 1 hour ago
    const recentStreamsFromUser = userId
      ? await redis.zcount(`streams:user:${userId}`, hourAgo, Date.now())
      : 0;
    const recentStreamsFromIP = ipAddress
      ? await redis.zcount(`streams:ip:${ipAddress}`, hourAgo, Date.now())
      : 0;

    // Analyze fraud
    const eventData: StreamEventData = {
      artistId,
      userId,
      duration,
      videoDuration,
      userTier,
      ipAddress,
      userAgent,
      timestamp: new Date(),
    };

    const fraudAnalysis = RoyaltyAlgorithms.analyzeFraud(
      eventData,
      recentStreamsFromUser,
      recentStreamsFromIP
    );

    // Create stream event in database
    const streamEvent = await prisma.streamEvent.create({
      data: {
        videoId,
        streamId,
        artistId,
        userId,
        duration,
        completed: videoDuration ? duration / videoDuration > 0.8 : false,
        qualified: fraudAnalysis.isQualified,
        userTier,
        ipAddress,
        userAgent,
        fraudScore: fraudAnalysis.fraudScore,
      },
    });

    // Update Redis counters for real-time tracking
    const now = Date.now();
    if (userId) {
      await redis.zadd(`streams:user:${userId}`, now, streamEvent.id);
      await redis.expire(`streams:user:${userId}`, 86400); // 24h TTL
    }
    if (ipAddress) {
      await redis.zadd(`streams:ip:${ipAddress}`, now, streamEvent.id);
      await redis.expire(`streams:ip:${ipAddress}`, 86400);
    }

    // Track in Redis for fast aggregation (if qualified)
    if (fraudAnalysis.isQualified) {
      const today = new Date().toISOString().split('T')[0];
      
      // Increment artist stream count
      await redis.hincrby(`royalty:daily:${today}`, artistId, 1);
      
      // Increment total platform streams
      await redis.incr(`royalty:daily:${today}:total`);
      
      // Update artist stats
      await prisma.artist.update({
        where: { id: artistId },
        data: {
          totalStreams: { increment: 1 },
        },
      });

      // Update video stream count
      if (videoId) {
        await prisma.video.update({
          where: { id: videoId },
          data: {
            streamCount: { increment: 1 },
          },
        });
      }
    }

    return {
      success: true,
      qualified: fraudAnalysis.isQualified,
      fraudAnalysis,
      streamEventId: streamEvent.id,
    };
  } catch (error) {
    console.error('Error tracking stream:', error);
    return {
      success: false,
      qualified: false,
      fraudAnalysis: {
        fraudScore: 1.0,
        flags: ['error'],
        isQualified: false,
      },
    };
  }
}

// ============================================================================
// AGGREGATION & REPORTING
// ============================================================================

/**
 * Get real-time stream stats for an artist
 */
export async function getArtistStreamStats(
  artistId: string,
  periodDays: number = 30
): Promise<{
  totalStreams: number;
  qualifiedStreams: number;
  fraudStreams: number;
  estimatedEarnings: number;
}> {
  const since = new Date();
  since.setDate(since.getDate() - periodDays);

  const events = await prisma.streamEvent.findMany({
    where: {
      artistId,
      timestamp: { gte: since },
    },
    select: {
      qualified: true,
      fraudScore: true,
    },
  });

  const totalStreams = events.length;
  const qualifiedStreams = events.filter(e => e.qualified).length;
  const fraudStreams = events.filter(e => e.fraudScore > 0.7).length;

  // Estimate earnings (rough calculation)
  const estimatedEarnings = Math.floor(
    qualifiedStreams * RoyaltyAlgorithms.CONFIG.BASE_REVENUE_PER_STREAM * 100
  );

  return {
    totalStreams,
    qualifiedStreams,
    fraudStreams,
    estimatedEarnings,
  };
}

/**
 * Get daily stream counts from Redis (fast)
 */
export async function getDailyStreamCounts(date: Date): Promise<Map<string, number>> {
  const dateStr = date.toISOString().split('T')[0];
  const counts = await redis.hgetall(`royalty:daily:${dateStr}`);
  
  const result = new Map<string, number>();
  for (const [artistId, count] of Object.entries(counts)) {
    result.set(artistId, parseInt(count));
  }
  
  return result;
}

/**
 * Get total platform streams for a day
 */
export async function getTotalStreamCount(date: Date): Promise<number> {
  const dateStr = date.toISOString().split('T')[0];
  const total = await redis.get(`royalty:daily:${dateStr}:total`);
  return total ? parseInt(total) : 0;
}

// ============================================================================
// CLEANUP & MAINTENANCE
// ============================================================================

/**
 * Clean up old Redis data
 * Should run daily via cron
 */
export async function cleanupOldData(daysToKeep: number = 90): Promise<void> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  // Clean up old stream events (keep in DB but remove from processing)
  await prisma.streamEvent.updateMany({
    where: {
      timestamp: { lt: cutoffDate },
      processedAt: null,
    },
    data: {
      processedAt: new Date(),
    },
  });
  
  console.log(`Cleaned up stream events older than ${daysToKeep} days`);
}

// ============================================================================
// EXPORTS
// ============================================================================

export const RoyaltyTracker = {
  trackStream,
  getArtistStreamStats,
  getDailyStreamCounts,
  getTotalStreamCount,
  cleanupOldData,
  redis, // Expose Redis client for advanced usage
};

export default RoyaltyTracker;
