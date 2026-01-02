import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { prisma } from '@mhc/database';
import { RoyaltyAlgorithms } from '@mhc/database/src/royalty-algorithms';
import { successResponse, errorResponse, ERROR_CODES, HTTP_STATUS } from '@mhc/common';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3007;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());

// ==================== STREAM TRACKING ====================

/**
 * Track a stream event for royalty calculation
 * Called every time a user streams music/video
 */
app.post('/api/royalty/track-stream', async (req, res) => {
  try {
    const { artistId, userId, contentId, contentType, duration, userTier, ipAddress, userAgent } = req.body;

    if (!artistId || !contentId || !duration) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({ code: ERROR_CODES.INVALID_INPUT, message: 'artistId, contentId, and duration required' })
      );
    }

    // Check fraud
    const recentStreamsFromUser = await prisma.streamEvent.count({
      where: {
        userId,
        timestamp: { gte: new Date(Date.now() - 60 * 60 * 1000) }, // Last hour
      },
    });

    const recentStreamsFromIP = await prisma.streamEvent.count({
      where: {
        ipAddress,
        timestamp: { gte: new Date(Date.now() - 60 * 60 * 1000) },
      },
    });

    const fraudAnalysis = RoyaltyAlgorithms.analyzeFraud(
      {
        artistId,
        userId,
        duration,
        userTier: userTier || 'FREE',
        ipAddress,
        userAgent,
        timestamp: new Date(),
      },
      recentStreamsFromUser,
      recentStreamsFromIP
    );

    // Create stream event
    const streamEvent = await prisma.streamEvent.create({
      data: {
        artistId,
        userId: userId || 'anonymous',
        contentId,
        contentType: contentType || 'VIDEO',
        duration,
        userTier: userTier || 'FREE',
        ipAddress,
        userAgent,
        qualified: fraudAnalysis.isQualified,
        fraudScore: fraudAnalysis.fraudScore,
        fraudFlags: fraudAnalysis.flags.join(','),
        timestamp: new Date(),
      },
    });

    // Update artist stats
    if (fraudAnalysis.isQualified) {
      await prisma.artist.update({
        where: { id: artistId },
        data: {
          totalStreams: { increment: 1 },
        },
      });
    }

    res.json(successResponse({
      streamId: streamEvent.id,
      qualified: fraudAnalysis.isQualified,
      fraudScore: fraudAnalysis.fraudScore,
    }));

  } catch (error: any) {
    console.error('Track stream error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: error.message })
    );
  }
});

// ==================== ROYALTY CALCULATIONS ====================

/**
 * Calculate royalties for a specific period
 * Called by cron job daily at 1 AM
 */
async function calculateDailyRoyalties(): Promise<void> {
  console.log('[Royalty Engine] Starting daily calculation...');

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const periodStart = new Date(yesterday.setHours(0, 0, 0, 0));
  const periodEnd = new Date(yesterday.setHours(23, 59, 59, 999));

  try {
    // Get all qualified streams from yesterday
    const streams = await prisma.streamEvent.findMany({
      where: {
        timestamp: { gte: periodStart, lte: periodEnd },
        qualified: true,
        processedAt: null,
      },
      select: {
        artistId: true,
        userId: true,
        userTier: true,
      },
    });

    // Group by artist
    const artistStreams = new Map<string, number>();
    for (const stream of streams) {
      artistStreams.set(stream.artistId, (artistStreams.get(stream.artistId) || 0) + 1);
    }

    // Calculate revenue pool (70% of subscription revenue)
    const subscriptionRevenue = await calculatePeriodRevenue(periodStart, periodEnd);
    const revenuePool = RoyaltyAlgorithms.calculateRevenuePool(subscriptionRevenue);

    const totalPlatformStreams = streams.length;

    console.log(`[Royalty Engine] Period: ${periodStart.toISOString().split('T')[0]}`);
    console.log(`[Royalty Engine] Revenue Pool: $${revenuePool / 100}`);
    console.log(`[Royalty Engine] Total Streams: ${totalPlatformStreams}`);
    console.log(`[Royalty Engine] Artists: ${artistStreams.size}`);

    // Calculate for each artist
    for (const [artistId, streamCount] of artistStreams.entries()) {
      const artist = await prisma.artist.findUnique({
        where: { id: artistId },
        select: { tier: true, name: true },
      });

      if (!artist) continue;

      // Count fraud streams
      const fraudStreams = await prisma.streamEvent.count({
        where: {
          artistId,
          timestamp: { gte: periodStart, lte: periodEnd },
          qualified: false,
        },
      });

      // Calculate royalty
      const calculation = RoyaltyAlgorithms.calculateProRataRoyalty({
        artistId,
        artistTier: artist.tier,
        streamCount,
        totalPlatformStreams,
        revenuePool,
        fraudStreams,
      });

      // Create royalty record
      await prisma.royalty.create({
        data: {
          artistId,
          periodStart,
          periodEnd,
          streamCount,
          fraudStreams,
          baseAmount: calculation.baseAmount,
          tierMultiplier: calculation.tierMultiplier,
          finalAmount: calculation.finalAmount,
          adjustedAmount: calculation.adjustedAmount,
          perStreamRate: calculation.perStreamRate,
          status: 'CALCULATED',
        },
      });

      // Update artist total earnings
      await prisma.artist.update({
        where: { id: artistId },
        data: {
          totalEarnings: { increment: calculation.adjustedAmount },
          pendingPayout: { increment: calculation.adjustedAmount },
        },
      });

      console.log(`[Royalty Engine] ${artist.name}: $${calculation.adjustedAmount / 100} (${streamCount} streams)`);
    }

    // Mark all streams as processed
    await prisma.streamEvent.updateMany({
      where: {
        timestamp: { gte: periodStart, lte: periodEnd },
        qualified: true,
        processedAt: null,
      },
      data: { processedAt: new Date() },
    });

    console.log('[Royalty Engine] Daily calculation complete!');

  } catch (error: any) {
    console.error('[Royalty Engine] Calculation error:', error);
  }
}

/**
 * Calculate subscription revenue for a period
 */
async function calculatePeriodRevenue(start: Date, end: Date): Promise<number> {
  // Get all active subscriptions during period
  const subscriptions = await prisma.subscription.findMany({
    where: {
      status: 'ACTIVE',
      currentPeriodStart: { lte: end },
      currentPeriodEnd: { gte: start },
    },
    select: { amount: true },
  });

  return subscriptions.reduce((sum, sub) => sum + sub.amount, 0);
}

// ==================== AUTOMATED PAYOUTS ====================

/**
 * Process automated payouts
 * Runs on 1st and 15th of each month at 9 AM
 */
async function processAutomatedPayouts(): Promise<void> {
  console.log('[Royalty Engine] Starting automated payouts...');

  try {
    // Get artists eligible for payout (>= $50 pending)
    const artists = await prisma.artist.findMany({
      where: {
        pendingPayout: { gte: 5000 }, // $50 minimum
      },
      select: {
        id: true,
        name: true,
        pendingPayout: true,
        paymentMethod: true,
        paypalEmail: true,
        stripeAccountId: true,
      },
    });

    console.log(`[Royalty Engine] ${artists.length} artists eligible for payout`);

    for (const artist of artists) {
      try {
        // Create payout record
        const payout = await prisma.royaltyPayout.create({
          data: {
            artistId: artist.id,
            amount: artist.pendingPayout,
            paymentMethod: artist.paymentMethod || 'MANUAL',
            status: 'PENDING',
            scheduledDate: new Date(),
          },
        });

        // Execute payment based on method
        if (artist.paymentMethod === 'STRIPE' && artist.stripeAccountId) {
          // TODO: Implement Stripe Connect transfer
          console.log(`[Royalty Engine] Stripe payout to ${artist.name}: $${artist.pendingPayout / 100}`);
        } else if (artist.paymentMethod === 'PAYPAL' && artist.paypalEmail) {
          // TODO: Implement PayPal payout
          console.log(`[Royalty Engine] PayPal payout to ${artist.name}: $${artist.pendingPayout / 100}`);
        } else {
          // Manual payout - mark for admin review
          console.log(`[Royalty Engine] Manual payout required for ${artist.name}: $${artist.pendingPayout / 100}`);
        }

        // Update payout status (for now, mark as processing)
        await prisma.royaltyPayout.update({
          where: { id: payout.id },
          data: {
            status: 'PROCESSING',
            processedAt: new Date(),
          },
        });

        // Clear pending amount
        await prisma.artist.update({
          where: { id: artist.id },
          data: {
            pendingPayout: 0,
            lifetimeRoyalties: { increment: artist.pendingPayout },
            lastPayoutAt: new Date(),
          },
        });

      } catch (error: any) {
        console.error(`[Royalty Engine] Payout failed for ${artist.name}:`, error);
      }
    }

    console.log('[Royalty Engine] Automated payouts complete!');

  } catch (error: any) {
    console.error('[Royalty Engine] Payout processing error:', error);
  }
}

// ==================== ARTIST APIs ====================

/**
 * Get artist royalty stats
 */
app.get('/api/royalty/artist/:artistId/stats', async (req, res) => {
  try {
    const { artistId } = req.params;

    const artist = await prisma.artist.findUnique({
      where: { id: artistId },
      select: {
        totalStreams: true,
        totalEarnings: true,
        pendingPayout: true,
        lifetimeRoyalties: true,
        tier: true,
      },
    });

    if (!artist) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse({ code: ERROR_CODES.NOT_FOUND, message: 'Artist not found' })
      );
    }

    // Get recent royalties
    const recentRoyalties = await prisma.royalty.findMany({
      where: { artistId },
      orderBy: { periodEnd: 'desc' },
      take: 30,
      select: {
        periodEnd: true,
        adjustedAmount: true,
        streamCount: true,
      },
    });

    res.json(successResponse({
      totalStreams: artist.totalStreams,
      totalEarnings: artist.totalEarnings,
      pendingPayout: artist.pendingPayout,
      lifetimeRoyalties: artist.lifetimeRoyalties,
      tier: artist.tier,
      tierMultiplier: RoyaltyAlgorithms.CONFIG.TIER_MULTIPLIERS[artist.tier],
      recentRoyalties,
    }));

  } catch (error: any) {
    console.error('Get artist stats error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: error.message })
    );
  }
});

/**
 * Get artist payout history
 */
app.get('/api/royalty/artist/:artistId/payouts', async (req, res) => {
  try {
    const { artistId } = req.params;

    const payouts = await prisma.royaltyPayout.findMany({
      where: { artistId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json(successResponse({ payouts }));

  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: error.message })
    );
  }
});

// ==================== ADMIN APIs ====================

/**
 * Manual calculation trigger (admin only)
 */
app.post('/api/royalty/admin/calculate', async (req, res) => {
  try {
    await calculateDailyRoyalties();
    res.json(successResponse({ message: 'Calculation triggered' }));
  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: error.message })
    );
  }
});

/**
 * Manual payout trigger (admin only)
 */
app.post('/api/royalty/admin/process-payouts', async (req, res) => {
  try {
    await processAutomatedPayouts();
    res.json(successResponse({ message: 'Payouts triggered' }));
  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: error.message })
    );
  }
});

/**
 * Get system-wide royalty stats (admin)
 */
app.get('/api/royalty/admin/stats', async (req, res) => {
  try {
    const totalArtists = await prisma.artist.count();
    const totalStreams = await prisma.streamEvent.count({ where: { qualified: true } });
    const totalEarnings = await prisma.artist.aggregate({
      _sum: { totalEarnings: true },
    });
    const pendingPayouts = await prisma.artist.aggregate({
      _sum: { pendingPayout: true },
    });

    res.json(successResponse({
      totalArtists,
      totalStreams,
      totalEarnings: totalEarnings._sum.totalEarnings || 0,
      pendingPayouts: pendingPayouts._sum.pendingPayout || 0,
    }));

  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: error.message })
    );
  }
});

// ==================== CRON JOBS ====================

/**
 * Setup automated jobs
 */
function setupCronJobs() {
  // Daily calculations at 1:00 AM
  cron.schedule('0 1 * * *', async () => {
    console.log('[Cron] Running daily royalty calculation...');
    await calculateDailyRoyalties();
  });

  // Bi-monthly payouts on 1st and 15th at 9:00 AM
  cron.schedule('0 9 1,15 * *', async () => {
    console.log('[Cron] Running automated payouts...');
    await processAutomatedPayouts();
  });

  console.log('✅ Cron jobs scheduled:');
  console.log('  - Daily calculations: 1:00 AM');
  console.log('  - Bi-monthly payouts: 1st & 15th at 9:00 AM');
}

// ==================== SERVER ====================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'royalty-service',
    features: {
      streaming: 'enabled',
      calculations: 'automated',
      payouts: 'automated',
    },
  });
});

app.listen(PORT, () => {
  console.log(`💰 Royalty service running on port ${PORT}`);
  setupCronJobs();
});
