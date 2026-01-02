import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { prisma } from '@mhc/database';
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

// ==================== HEALTH CHECK ====================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'royalty-service',
    features: {
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

// ==================== SERVER ====================

app.listen(PORT, () => {
  console.log(`💰 Royalty service running on port ${PORT}`);
  console.log('⚠️  Running in simplified mode - advanced features disabled');
});
