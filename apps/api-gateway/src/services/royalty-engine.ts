/**
 * Royalty Calculation Engine
 * 
 * Automated job that calculates and distributes royalties to artists.
 * Runs daily/weekly with zero human intervention.
 * Protects artists through transparent, auditable calculations.
 */

import { prisma } from '@mhc/database';
import { RoyaltyAlgorithms } from '@mhc/database/src/royalty-algorithms';
import { RoyaltyTracker } from './royalty-tracker';
import { ArtistTier, RoyaltyStatus, PaymentStatus } from '@prisma/client';

// ============================================================================
// MAIN CALCULATION JOB
// ============================================================================

export interface CalculationPeriod {
  start: Date;
  end: Date;
}

/**
 * Main calculation job - runs daily at midnight
 * Calculates royalties for previous day
 */
export async function calculateDailyRoyalties(date?: Date): Promise<{
  success: boolean;
  artistsProcessed: number;
  totalRoyalties: number;
  errors: string[];
}> {
  const targetDate = date || new Date();
  targetDate.setDate(targetDate.getDate() - 1); // Previous day
  
  const period: CalculationPeriod = {
    start: new Date(targetDate.setHours(0, 0, 0, 0)),
    end: new Date(targetDate.setHours(23, 59, 59, 999)),
  };

  console.log(`[Royalty Engine] Calculating royalties for ${period.start.toISOString().split('T')[0]}`);

  const errors: string[] = [];
  let artistsProcessed = 0;
  let totalRoyalties = 0;

  try {
    // Step 1: Get all artists with streams in this period
    const streamEvents = await prisma.streamEvent.findMany({
      where: {
        timestamp: {
          gte: period.start,
          lte: period.end,
        },
        qualified: true,
        processedAt: null, // Not yet processed
      },
      select: {
        artistId: true,
        userId: true,
        userTier: true,
      },
    });

    // Group by artist
    const artistStreams = new Map<string, number>();
    for (const event of streamEvents) {
      const current = artistStreams.get(event.artistId) || 0;
      artistStreams.set(event.artistId, current + 1);
    }

    // Step 2: Get total platform streams
    const totalPlatformStreams = streamEvents.length;

    // Step 3: Calculate revenue pool
    // Get subscription revenue for the period
    const subscriptionRevenue = await calculatePeriodRevenue(period);
    const revenuePool = RoyaltyAlgorithms.calculateRevenuePool(subscriptionRevenue);

    console.log(`[Royalty Engine] Revenue Pool: $${revenuePool / 100}, Platform Streams: ${totalPlatformStreams}`);

    // Step 4: Calculate royalties for each artist
    for (const [artistId, streamCount] of artistStreams.entries()) {
      try {
        await calculateArtistRoyalty({
          artistId,
          streamCount,
          totalPlatformStreams,
          revenuePool,
          period,
        });
        artistsProcessed++;
      } catch (error: any) {
        errors.push(`Artist ${artistId}: ${error.message}`);
        console.error(`[Royalty Engine] Error processing artist ${artistId}:`, error);
      }
    }

    // Step 5: Mark all processed stream events
    await prisma.streamEvent.updateMany({
      where: {
        timestamp: {
          gte: period.start,
          lte: period.end,
        },
        qualified: true,
        processedAt: null,
      },
      data: {
        processedAt: new Date(),
      },
    });

    // Step 6: Get total royalties calculated
    const royalties = await prisma.royalty.findMany({
      where: {
        periodStart: period.start,
        periodEnd: period.end,
      },
      select: {
        adjustedAmount: true,
      },
    });
    totalRoyalties = royalties.reduce((sum, r) => sum + r.adjustedAmount, 0);

    console.log(`[Royalty Engine] Complete! Artists: ${artistsProcessed}, Total: $${totalRoyalties / 100}`);

    return {
      success: true,
      artistsProcessed,
      totalRoyalties,
      errors,
    };
  } catch (error: any) {
    console.error('[Royalty Engine] Fatal error:', error);
    return {
      success: false,
      artistsProcessed,
      totalRoyalties,
      errors: [error.message],
    };
  }
}

// ============================================================================
// ARTIST ROYALTY CALCULATION
// ============================================================================

interface ArtistRoyaltyInput {
  artistId: string;
  streamCount: number;
  totalPlatformStreams: number;
  revenuePool: number;
  period: CalculationPeriod;
}

async function calculateArtistRoyalty(input: ArtistRoyaltyInput): Promise<void> {
  const { artistId, streamCount, totalPlatformStreams, revenuePool, period } = input;

  // Get artist details
  const artist = await prisma.artist.findUnique({
    where: { id: artistId },
    select: {
      tier: true,
      iswc: true,
      isrc: true,
    },
  });

  if (!artist) {
    throw new Error(`Artist ${artistId} not found`);
  }

  // Count fraud streams
  const fraudStreams = await prisma.streamEvent.count({
    where: {
      artistId,
      timestamp: {
        gte: period.start,
        lte: period.end,
      },
      fraudScore: { gt: 0.7 },
    },
  });

  // Calculate royalty using pro-rata model
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
      periodStart: period.start,
      periodEnd: period.end,
      streamCount,
      totalStreams: totalPlatformStreams,
      revenuePool,
      type: 'STREAM',
      baseAmount: calculation.baseAmount,
      tierMultiplier: calculation.tierMultiplier,
      finalAmount: calculation.finalAmount,
      adjustedAmount: calculation.adjustedAmount,
      fraudStreams,
      status: 'CALCULATED',
      calculatedAt: new Date(),
      iswc: artist.iswc,
      isrc: artist.isrc,
      metadata: {
        perStreamRate: calculation.perStreamRate,
        fraudRatio: fraudStreams / streamCount,
      },
    },
  });

  // Update artist's total earnings
  await prisma.artist.update({
    where: { id: artistId },
    data: {
      totalEarnings: { increment: calculation.adjustedAmount },
    },
  });

  console.log(
    `[Royalty Engine] ${artistId}: ${streamCount} streams → $${calculation.adjustedAmount / 100}`
  );
}

// ============================================================================
// AUTOMATED PAYOUTS
// ============================================================================

/**
 * Process pending payouts - runs twice monthly (1st and 15th)
 * Automatically pays artists who have reached minimum threshold
 */
export async function processAutomatedPayouts(): Promise<{
  success: boolean;
  payoutCount: number;
  totalPaid: number;
  errors: string[];
}> {
  console.log('[Royalty Engine] Processing automated payouts...');

  const errors: string[] = [];
  let payoutCount = 0;
  let totalPaid = 0;

  try {
    // Get all artists eligible for payout
    const artists = await prisma.artist.findMany({
      where: {
        totalEarnings: {
          gte: RoyaltyAlgorithms.CONFIG.MIN_PAYOUT_THRESHOLD,
        },
      },
      include: {
        royalties: {
          where: {
            status: 'CALCULATED',
          },
        },
      },
    });

    for (const artist of artists) {
      try {
        // Check if artist has payment details
        if (!artist.paypalEmail && !artist.bankAccount) {
          errors.push(`Artist ${artist.id} (${artist.name}) has no payment method`);
          continue;
        }

        // Calculate payout amount
        const pendingRoyalties = artist.royalties;
        const amount = pendingRoyalties.reduce((sum, r) => sum + r.adjustedAmount, 0);

        // Create payout record with join table items
        const payout = await prisma.royaltyPayout.create({
          data: {
            artistId: artist.id,
            amount,
            currency: 'USD',
            status: 'PENDING',
            paymentMethod: artist.paypalEmail ? 'paypal' : 'bank_transfer',
            paymentEmail: artist.paypalEmail,
            scheduledFor: new Date(),
            payoutItems: {
              create: pendingRoyalties.map(r => ({
                royaltyId: r.id,
              })),
            },
          },
        });

        // Execute payout (integrate with PayPal API, Stripe, etc.)
        const payoutSuccess = await executePayment(payout.id, artist);

        if (payoutSuccess) {
          // Update payout status
          await prisma.royaltyPayout.update({
            where: { id: payout.id },
            data: {
              status: 'COMPLETED',
              processedAt: new Date(),
            },
          });

          // Update royalty statuses
          await prisma.royalty.updateMany({
            where: {
              id: { in: pendingRoyalties.map(r => r.id) },
            },
            data: {
              status: 'PAID',
            },
          });

          // Update artist stats
          await prisma.artist.update({
            where: { id: artist.id },
            data: {
              totalEarnings: { decrement: amount },
              lifetimeRoyalties: { increment: amount / 100 },
            },
          });

          payoutCount++;
          totalPaid += amount;

          console.log(
            `[Royalty Engine] Paid ${artist.name}: $${amount / 100} via ${artist.paypalEmail || 'bank'}`
          );
        } else {
          errors.push(`Payment failed for artist ${artist.id}`);
        }
      } catch (error: any) {
        errors.push(`Artist ${artist.id}: ${error.message}`);
        console.error(`[Royalty Engine] Error processing payout for ${artist.id}:`, error);
      }
    }

    console.log(`[Royalty Engine] Payouts complete! Count: ${payoutCount}, Total: $${totalPaid / 100}`);

    return {
      success: true,
      payoutCount,
      totalPaid,
      errors,
    };
  } catch (error: any) {
    console.error('[Royalty Engine] Fatal payout error:', error);
    return {
      success: false,
      payoutCount,
      totalPaid,
      errors: [error.message],
    };
  }
}

// ============================================================================
// PAYMENT EXECUTION
// ============================================================================

/**
 * Execute actual payment to artist
 * Integrate with PayPal, Stripe, or other payment providers
 */
async function executePayment(payoutId: string, artist: any): Promise<boolean> {
  try {
    // TODO: Integrate with actual payment provider
    // For now, this is a placeholder that always succeeds
    
    // Example PayPal integration:
    // const paypal = new PayPalAPI(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_SECRET);
    // const result = await paypal.sendPayout({
    //   recipient: artist.paypalEmail,
    //   amount: payout.amount / 100,
    //   currency: 'USD',
    //   note: `MHC Streaming Royalty Payment - ${new Date().toISOString().split('T')[0]}`,
    // });
    
    // For testing/demo: auto-approve
    console.log(`[Payment] Sending $${artist.totalEarnings / 100} to ${artist.paypalEmail || 'bank'}`);
    
    return true;
  } catch (error) {
    console.error('[Payment] Error executing payment:', error);
    return false;
  }
}

// ============================================================================
// REVENUE CALCULATION
// ============================================================================

/**
 * Calculate platform revenue for a period
 * Based on subscription payments received
 */
async function calculatePeriodRevenue(period: CalculationPeriod): Promise<number> {
  const payments = await prisma.payment.findMany({
    where: {
      createdAt: {
        gte: period.start,
        lte: period.end,
      },
      status: 'COMPLETED',
    },
    select: {
      amount: true,
    },
  });

  return payments.reduce((sum, p) => sum + p.amount, 0);
}

// ============================================================================
// SCHEDULED JOBS
// ============================================================================

/**
 * Setup cron jobs for automated execution
 * Call this on server startup
 */
export function setupRoyaltyJobs(): void {
  // Daily royalty calculation at 1 AM
  const dailyJob = setInterval(
    async () => {
      const now = new Date();
      if (now.getHours() === 1 && now.getMinutes() === 0) {
        await calculateDailyRoyalties();
      }
    },
    60000 // Check every minute
  );

  // Bi-monthly payouts (1st and 15th at 9 AM)
  const payoutJob = setInterval(
    async () => {
      const now = new Date();
      const day = now.getDate();
      if ((day === 1 || day === 15) && now.getHours() === 9 && now.getMinutes() === 0) {
        await processAutomatedPayouts();
      }
    },
    60000
  );

  console.log('[Royalty Engine] Scheduled jobs initialized');
  console.log('  - Daily calculations: 1:00 AM');
  console.log('  - Automated payouts: 1st and 15th at 9:00 AM');
}

// ============================================================================
// EXPORTS
// ============================================================================

export const RoyaltyEngine = {
  calculateDailyRoyalties,
  processAutomatedPayouts,
  setupRoyaltyJobs,
};

export default RoyaltyEngine;
