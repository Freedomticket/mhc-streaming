import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { prisma } from '@mhc/database';
import { successResponse, errorResponse, ERROR_CODES, HTTP_STATUS } from '@mhc/common';
import playsRouter from './routes/plays';
import reportsRouter from './routes/reports';
import { qualifyPlays } from './jobs/qualify-plays';
import { generateMonthlyReport } from './ddex/generate-ern';

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

// ==================== HEALTH CHECK ====================

// ==================== ROUTES ====================

app.use('/api/plays', playsRouter);
app.use('/api/reports', reportsRouter);

// ==================== HEALTH CHECK ====================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'royalty-service',
    features: {
      playIngest: 'enabled',
      ddexReporting: 'enabled',
      streaming: 'enabled',
      calculations: 'basic',
      payouts: 'manual',
    },
  });
});

// ==================== ARTIST STATS ====================

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
      lifetimeRoyalties: artist.lifetimeRoyalties,
      tier: artist.tier,
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
 * Get system-wide royalty stats (admin)
 */
app.get('/api/royalty/admin/stats', async (req, res) => {
  try {
    const totalArtists = await prisma.artist.count();
    const totalStreams = await prisma.streamEvent.count({ where: { qualified: true } });
    const totalEarnings = await prisma.artist.aggregate({
      _sum: { totalEarnings: true },
    });

    res.json(successResponse({
      totalArtists,
      totalStreams,
      totalEarnings: totalEarnings._sum.totalEarnings || 0,
    }));

  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: error.message })
    );
  }
});

// ==================== SCHEDULER ====================
// Lightweight in-process scheduler using setInterval.
// In production, replace with a proper cron job or Render cron service.

function scheduleJobs() {
  // Nightly qualify job: runs at 00:30 UTC every day
  // Check every 5 minutes if it's time to run
  const QUALIFY_HOUR_UTC = 0;
  const QUALIFY_MINUTE_UTC = 30;

  let lastQualifyRun: string | null = null;

  setInterval(async () => {
    const now = new Date();
    const todayKey = now.toISOString().slice(0, 10); // YYYY-MM-DD

    if (
      now.getUTCHours() === QUALIFY_HOUR_UTC &&
      now.getUTCMinutes() >= QUALIFY_MINUTE_UTC &&
      lastQualifyRun !== todayKey
    ) {
      lastQualifyRun = todayKey;
      console.log('[scheduler] Starting nightly qualify-plays job');
      try {
        const result = await qualifyPlays();
        console.log(`[scheduler] qualify-plays complete:`, result);
      } catch (err) {
        console.error('[scheduler] qualify-plays failed:', err);
      }
    }
  }, 5 * 60 * 1000); // check every 5 minutes

  // Monthly DDEX report: runs on the 2nd of each month at 02:00 UTC
  // (1st = last day of previous month's plays finish qualifying overnight)
  const REPORT_DAY_OF_MONTH = 2;
  const REPORT_HOUR_UTC = 2;

  let lastReportRun: string | null = null;

  setInterval(async () => {
    const now = new Date();
    const monthKey = now.toISOString().slice(0, 7); // YYYY-MM

    if (
      now.getUTCDate() === REPORT_DAY_OF_MONTH &&
      now.getUTCHours() === REPORT_HOUR_UTC &&
      lastReportRun !== monthKey
    ) {
      lastReportRun = monthKey;
      // Report for the PREVIOUS month
      const reportYear = now.getUTCMonth() === 0 ? now.getUTCFullYear() - 1 : now.getUTCFullYear();
      const reportMonth = now.getUTCMonth() === 0 ? 12 : now.getUTCMonth(); // 1-indexed
      console.log(`[scheduler] Generating DDEX report for ${reportYear}-${String(reportMonth).padStart(2, '0')}`);
      try {
        const result = await generateMonthlyReport(reportYear, reportMonth);
        console.log(`[scheduler] DDEX report generated: messageId=${result.messageId}`, result.stats);
      } catch (err) {
        console.error('[scheduler] DDEX report generation failed:', err);
      }
    }
  }, 5 * 60 * 1000); // check every 5 minutes

  console.log('[scheduler] Jobs registered: qualify-plays (nightly 00:30 UTC), ddex-report (monthly 2nd 02:00 UTC)');
}

// ==================== SERVER ====================

app.listen(PORT, () => {
  console.log(`💰 Royalty service running on port ${PORT}`);
  console.log('📡 Play ingest: POST /api/plays/event');
  console.log('📊 DDEX reports: GET /api/reports');
  scheduleJobs();
});
