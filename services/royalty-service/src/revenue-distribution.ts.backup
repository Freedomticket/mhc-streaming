import { prisma } from '@mhc/database';
import { startOfMonth, endOfMonth } from 'date-fns';

/**
 * SUSTAINABLE TREASURY SYSTEM
 * 
 * Revenue Split from Production House Licenses:
 * - 30% Platform Operations (servers, bandwidth, infrastructure)
 * - 10% ISM Priority Fund (designated elite artists)
 * - 5% Governance Treasury (DAO voting & community decisions)
 * - 5% AI Development (continuous AI improvements)
 * - 50% General Artist Pool (all active artists by weight)
 */

// ============ CORE FUNCTIONS ============

/**
 * Calculate revenue split when a license is purchased
 */
export function calculateRevenueSplit(amount: number) {
  return {
    total: amount,
    platformOps: Math.floor(amount * 0.30),     // 30%
    ismFund: Math.floor(amount * 0.10),         // 10%
    governanceFund: Math.floor(amount * 0.05),  // 5%
    aiFund: Math.floor(amount * 0.05),          // 5%
    artistPool: Math.floor(amount * 0.50),      // 50%
  };
}

/**
 * Record license revenue when production house subscribes
 */
export async function recordLicenseRevenue(data: {
  subscriptionId: string;
  userId?: string;
  tier: 'Basic' | 'Pro';
  amount: number; // in cents: 9900 or 49900
  periodStart: Date;
  periodEnd: Date;
}) {
  const split = calculateRevenueSplit(data.amount);
  
  const revenue = await prisma.licenseRevenue.create({
    data: {
      subscriptionId: data.subscriptionId,
      userId: data.userId,
      tier: data.tier,
      amount: data.amount,
      platformOps: split.platformOps,
      ismFund: split.ismFund,
      governanceFund: split.governanceFund,
      aiFund: split.aiFund,
      artistPool: split.artistPool,
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
      billingMonth: startOfMonth(data.periodStart),
      processed: false,
    },
  });
  
  console.log(`📊 Recorded ${data.tier} license revenue: $${data.amount / 100}`);
  console.log(`   Platform: $${split.platformOps / 100}`);
  console.log(`   ISM: $${split.ismFund / 100}`);
  console.log(`   Governance: $${split.governanceFund / 100}`);
  console.log(`   AI: $${split.aiFund / 100}`);
  console.log(`   Artists: $${split.artistPool / 100}`);
  
  return revenue;
}

/**
 * Main monthly revenue distribution (run on 1st of each month)
 */
export async function distributeMonthlyRevenue(month: Date = new Date()) {
  const periodStart = startOfMonth(month);
  const periodEnd = endOfMonth(month);
  
  console.log(`🚀 Starting revenue distribution for ${periodStart.toISOString().slice(0, 7)}`);
  
  // 1. Get all unprocessed license revenue for the month
  const licenses = await prisma.licenseRevenue.findMany({
    where: {
      billingMonth: periodStart,
      processed: false,
    },
  });
  
  if (licenses.length === 0) {
    console.log('ℹ️  No unprocessed revenue for this period');
    return;
  }
  
  // 2. Calculate totals
  const totals = licenses.reduce(
    (acc, license) => ({
      total: acc.total + license.amount,
      platformOps: acc.platformOps + license.platformOps,
      ismFund: acc.ismFund + license.ismFund,
      governanceFund: acc.governanceFund + license.governanceFund,
      aiFund: acc.aiFund + license.aiFund,
      artistPool: acc.artistPool + license.artistPool,
    }),
    { total: 0, platformOps: 0, ismFund: 0, governanceFund: 0, aiFund: 0, artistPool: 0 }
  );
  
  console.log(`💰 Total revenue: $${totals.total / 100} from ${licenses.length} subscriptions`);
  
  // 3. Update treasury balances
  await updateTreasury('OPERATIONS', totals.platformOps, periodStart);
  await updateTreasury('ISM_PRIORITY', totals.ismFund, periodStart);
  await updateTreasury('GOVERNANCE', totals.governanceFund, periodStart);
  await updateTreasury('AI_DEVELOPMENT', totals.aiFund, periodStart);
  
  // 4. Distribute ISM Priority Fund (10%)
  const ismArtists = await distributeIsmFund(totals.ismFund, periodStart, periodEnd);
  
  // 5. Distribute General Artist Pool (50%)
  const totalArtists = await distributeGeneralArtistPool(totals.artistPool, periodStart, periodEnd);
  
  // 6. Record distribution summary
  await prisma.revenueDistribution.create({
    data: {
      periodStart,
      periodEnd,
      month: periodStart,
      totalRevenue: totals.total,
      platformOps: totals.platformOps,
      ismFund: totals.ismFund,
      governanceFund: totals.governanceFund,
      aiFund: totals.aiFund,
      artistPool: totals.artistPool,
      totalArtists,
      ismArtists,
      avgArtistShare: totalArtists > 0 ? Math.floor(totals.artistPool / totalArtists) : 0,
      calculated: true,
      distributed: true,
      calculatedAt: new Date(),
      distributedAt: new Date(),
    },
  });
  
  // 7. Mark license revenue as processed
  await prisma.licenseRevenue.updateMany({
    where: {
      billingMonth: periodStart,
      processed: false,
    },
    data: {
      processed: true,
      processedAt: new Date(),
    },
  });
  
  console.log(`✅ Revenue distribution complete!`);
  console.log(`   ISM Artists: ${ismArtists}, Total Artists: ${totalArtists}`);
  
  return {
    totalRevenue: totals.total,
    artistsReceived: totalArtists,
    ismArtistsReceived: ismArtists,
  };
}

/**
 * Update treasury balance for a fund type
 */
async function updateTreasury(fundType: 'OPERATIONS' | 'ISM_PRIORITY' | 'GOVERNANCE' | 'AI_DEVELOPMENT', amount: number, month: Date) {
  const treasury = await prisma.platformTreasury.upsert({
    where: {
      fundType_month: {
        fundType,
        month: startOfMonth(month),
      },
    },
    create: {
      fundType,
      month: startOfMonth(month),
      balance: amount,
      totalReceived: amount,
      monthlyIncome: amount,
    },
    update: {
      balance: { increment: amount },
      totalReceived: { increment: amount },
      monthlyIncome: { increment: amount },
    },
  });
  
  console.log(`💵 Updated ${fundType} treasury: +$${amount / 100} (Balance: $${treasury.balance / 100})`);
  
  return treasury;
}

/**
 * Distribute ISM Priority Fund to designated artists
 */
async function distributeIsmFund(totalFund: number, periodStart: Date, periodEnd: Date): Promise<number> {
  const ismArtists = await prisma.ismPriorityArtist.findMany({
    where: { active: true },
    include: { artist: true },
  });
  
  if (ismArtists.length === 0) {
    console.log('⚠️  No ISM priority artists found');
    return 0;
  }
  
  // Calculate weight based on priority level
  const totalWeight = ismArtists.reduce((sum, ism) => sum + ism.priorityLevel, 0);
  
  for (const ism of ismArtists) {
    const share = Math.floor((ism.priorityLevel / totalWeight) * totalFund);
    
    await prisma.royalty.create({
      data: {
        artistId: ism.artistId,
        periodStart,
        periodEnd,
        type: 'ISM_PRIORITY',
        revenuePool: totalFund,
        finalAmount: share,
        status: 'CALCULATED',
        calculatedAt: new Date(),
      },
    });
    
    console.log(`   🎨 ISM Artist ${ism.artist.name}: $${share / 100} (Level ${ism.priorityLevel})`);
  }
  
  return ismArtists.length;
}

/**
 * Distribute general artist pool based on activity weight
 */
async function distributeGeneralArtistPool(totalPool: number, periodStart: Date, periodEnd: Date): Promise<number> {
  // Get all artists with activity in the period
  const artists = await prisma.artist.findMany({
    include: {
      _count: {
        select: {
          streamEvents: {
            where: {
              qualified: true,
              timestamp: {
                gte: periodStart,
                lte: periodEnd,
              },
            },
          },
        },
      },
      galleryItems: true,
    },
  });
  
  // Calculate weights for each artist
  const weights = artists
    .map((artist) => ({
      artistId: artist.id,
      name: artist.name,
      weight: calculateArtistWeight({
        streams: artist._count.streamEvents,
        catalogSize: artist.galleryItems.length,
        tier: artist.tier,
      }),
    }))
    .filter((w) => w.weight > 0); // Only artists with activity
  
  if (weights.length === 0) {
    console.log('⚠️  No active artists found for distribution');
    return 0;
  }
  
  const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
  
  // Distribute proportionally
  for (const { artistId, name, weight } of weights) {
    const share = Math.floor((weight / totalWeight) * totalPool);
    
    await prisma.royalty.create({
      data: {
        artistId,
        periodStart,
        periodEnd,
        type: 'LICENSE_REVENUE',
        revenuePool: totalPool,
        finalAmount: share,
        status: 'CALCULATED',
        calculatedAt: new Date(),
      },
    });
    
    console.log(`   🎵 Artist ${name}: $${share / 100} (Weight: ${weight.toFixed(2)})`);
  }
  
  return weights.length;
}

/**
 * Calculate artist weight for revenue distribution
 */
function calculateArtistWeight(metrics: {
  streams: number;
  catalogSize: number;
  tier: string;
}): number {
  // Weights: streams 70%, catalog 30%
  const streamScore = metrics.streams * 0.7;
  const catalogScore = metrics.catalogSize * 0.3;
  
  const baseScore = streamScore + catalogScore;
  
  // Tier multipliers
  const tierBonus = {
    EMERGING: 1.0,
    RISING: 1.1,
    ESTABLISHED: 1.25,
    LEGENDARY: 1.5,
  }[metrics.tier] || 1.0;
  
  return baseScore * tierBonus;
}

/**
 * Auto-promote artists to ISM Priority based on performance
 */
export async function autoPromoteToISM() {
  const eligibleArtists = await prisma.artist.findMany({
    where: {
      totalStreams: { gte: 10000 },  // At least 10k streams
      ismPriority: null,              // Not already ISM
    },
    include: {
      galleryItems: true,
    },
  });
  
  for (const artist of eligibleArtists) {
    if (artist.galleryItems.length >= 5) {  // At least 5 tracks
      const priorityLevel = calculatePriorityLevel(artist);
      
      await prisma.ismPriorityArtist.create({
        data: {
          artistId: artist.id,
          priorityLevel,
          minUploads: 5,
          minQuality: 0.8,
          minStreams: 10000,
          autoPromoted: true,
          active: true,
        },
      });
      
      console.log(`✨ Auto-promoted ${artist.name} to ISM Priority (Level ${priorityLevel})`);
    }
  }
}

/**
 * Calculate ISM priority level based on artist performance
 */
function calculatePriorityLevel(artist: any): number {
  const streams = artist.totalStreams;
  
  if (streams >= 100000) return 5;  // 100k+ streams
  if (streams >= 50000) return 4;   // 50k-100k
  if (streams >= 25000) return 3;   // 25k-50k
  if (streams >= 10000) return 2;   // 10k-25k
  return 1;                         // Default
}

/**
 * Pay platform infrastructure costs automatically
 */
export async function payInfrastructureCosts(month: Date = new Date()) {
  const opsBalance = await getTreasuryBalance('OPERATIONS', month);
  
  // Define monthly costs (in cents)
  const costs = {
    servers: 500_00,    // $500/month
    storage: 200_00,    // $200/month
    bandwidth: 300_00,  // $300/month
    ai: 100_00,         // $100/month AI API costs
  };
  
  const total = Object.values(costs).reduce((a, b) => a + b, 0);
  
  if (opsBalance >= total) {
    // Automatically pay from treasury
    for (const [category, amount] of Object.entries(costs)) {
      await recordTreasuryExpense('OPERATIONS', {
        category,
        description: `Monthly ${category} costs`,
        amount,
        status: 'approved',
      }, month);
    }
    
    console.log(`💸 Automatically paid $${total / 100} in infrastructure costs`);
    return true;
  } else {
    console.log(`⚠️  Insufficient funds in Operations treasury. Need $${total / 100}, have $${opsBalance / 100}`);
    return false;
  }
}

/**
 * Get treasury balance for a fund type
 */
async function getTreasuryBalance(fundType: 'OPERATIONS' | 'ISM_PRIORITY' | 'GOVERNANCE' | 'AI_DEVELOPMENT', month: Date): Promise<number> {
  const treasury = await prisma.platformTreasury.findUnique({
    where: {
      fundType_month: {
        fundType,
        month: startOfMonth(month),
      },
    },
  });
  
  return treasury?.balance || 0;
}

/**
 * Record a treasury expense
 */
async function recordTreasuryExpense(
  fundType: 'OPERATIONS' | 'ISM_PRIORITY' | 'GOVERNANCE' | 'AI_DEVELOPMENT',
  expense: {
    category: string;
    description: string;
    amount: number;
    status?: string;
  },
  month: Date
) {
  const treasury = await prisma.platformTreasury.findUnique({
    where: {
      fundType_month: {
        fundType,
        month: startOfMonth(month),
      },
    },
  });
  
  if (!treasury) {
    throw new Error(`Treasury not found for ${fundType}`);
  }
  
  const treasuryExpense = await prisma.treasuryExpense.create({
    data: {
      treasuryId: treasury.id,
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      status: expense.status || 'approved',
      approvedAt: new Date(),
      paidAt: new Date(),
    },
  });
  
  // Deduct from treasury balance
  await prisma.platformTreasury.update({
    where: { id: treasury.id },
    data: {
      balance: { decrement: expense.amount },
      totalSpent: { increment: expense.amount },
      monthlyExpense: { increment: expense.amount },
    },
  });
  
  return treasuryExpense;
}
