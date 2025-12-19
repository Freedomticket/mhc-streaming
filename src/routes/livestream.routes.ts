/**
 * Livestream Routes - Real-Time Streaming API (Production)
 *
 * Endpoints:
 * POST   /api/v1/livestreams/start         - Start livestream
 * POST   /api/v1/livestreams/:id/end       - End livestream
 * GET    /api/v1/livestreams/active        - List active streams
 * GET    /api/v1/livestreams/:id           - Get stream details
 * GET    /api/v1/livestreams/:id/chat      - Get chat history
 * POST   /api/v1/livestreams/:id/report    - Report livestream
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { logForensicEvent } from '../services/forensics.service';
import { creditRoyalty } from '../services/royalty.service';
import { requireAuth } from '../middleware/auth.middleware';
import { requireProArtist } from '../middleware/subscription.middleware';
import { requireRateLimit } from '../middleware/rateLimit.middleware';

const router = Router();

/**
 * POST /api/v1/livestreams/start
 * Start a new livestream
 * Requires: Pro/Premium subscription
 */
router.post(
  '/start',
  requireAuth,
  requireProArtist(),
  requireRateLimit,
  async (req: Request, res: Response) => {
    try {
      const { title, description, patronOnly, danteRealm } = req.body;

      // Validate required fields
      if (!title || title.length < 3) {
        return res.status(400).json({ error: 'Title must be at least 3 characters' });
      }

      // Check if user already has active stream
      const existing = await prisma.livestream.findFirst({
        where: {
          creatorId: req.userId,
          isActive: true,
        },
      });

      if (existing) {
        return res.status(400).json({ error: 'You already have an active stream' });
      }

      // Create livestream
      const stream = await prisma.livestream.create({
        data: {
          creatorId: req.userId,
          title,
          description: description || '',
          isActive: true,
          patronOnly: patronOnly || false,
          danteRealm: danteRealm || 'purgatorio',
          viewers: 0,
          startedAt: new Date(),
        },
        include: {
          creator: {
            select: {
              id: true,
              displayName: true,
              avatar: true,
              tier: true,
            },
          },
        },
      });

      // Log to forensics
      await logForensicEvent('LIVESTREAM_STARTED', 'livestream', stream.id, req.userId, {
        title,
        patronOnly,
      });

      res.status(201).json({
        success: true,
        stream,
        wsUrl: process.env.SOCKET_URL || 'ws://localhost:3001',
        message: 'Livestream started. Share the room ID with viewers.',
      });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
);

/**
 * POST /api/v1/livestreams/:id/end
 * End an active livestream
 * Requires: Stream ownership
 */
router.post(
  '/:id/end',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const stream = await prisma.livestream.findUnique({
        where: { id: req.params.id },
      });

      if (!stream) {
        return res.status(404).json({ error: 'Stream not found' });
      }

      if (stream.creatorId !== req.userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      if (!stream.isActive) {
        return res.status(400).json({ error: 'Stream already ended' });
      }

      // Calculate stream stats
      const duration = Date.now() - stream.startedAt.getTime();
      const durationMinutes = Math.round(duration / 60000);

      // Award completion bonus
      await creditRoyalty(
        req.userId,
        Math.round(durationMinutes * 10), // 10 cents per minute
        'livestream_completion',
        { streamId: req.params.id, durationMinutes }
      );

      // Update stream
      const updated = await prisma.livestream.update({
        where: { id: req.params.id },
        data: {
          isActive: false,
          endedAt: new Date(),
        },
        include: {
          creator: {
            select: {
              id: true,
              displayName: true,
              avatar: true,
            },
          },
        },
      });

      // Log to forensics
      await logForensicEvent('LIVESTREAM_ENDED', 'livestream', req.params.id, req.userId, {
        durationMinutes,
        viewers: stream.viewers,
      });

      res.json({
        success: true,
        stream: updated,
        stats: {
          durationMinutes,
          viewers: stream.viewers,
          earnedBonus: `$${(durationMinutes * 0.1).toFixed(2)}`,
        },
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

/**
 * GET /api/v1/livestreams/active
 * List all active livestreams
 * Public endpoint
 */
router.get('/active', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);

    const streams = await prisma.livestream.findMany({
      where: { isActive: true },
      include: {
        creator: {
          select: {
            id: true,
            displayName: true,
            avatar: true,
            tier: true,
          },
        },
      },
      orderBy: { viewers: 'desc' },
      take: limit,
    });

    res.json({
      success: true,
      streams,
      count: streams.length,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * GET /api/v1/livestreams/:id
 * Get livestream details
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const stream = await prisma.livestream.findUnique({
      where: { id: req.params.id },
      include: {
        creator: {
          select: {
            id: true,
            displayName: true,
            avatar: true,
            tier: true,
            bio: true,
          },
        },
      },
    });

    if (!stream) {
      return res.status(404).json({ error: 'Stream not found' });
    }

    // Check patron access
    if (stream.patronOnly && req.userId && req.userId !== stream.creatorId) {
      const patron = await prisma.patronSubscription.findUnique({
        where: {
          fanId_artistId: { fanId: req.userId, artistId: stream.creatorId },
        },
      });

      if (!patron || patron.status !== 'active') {
        return res.status(403).json({
          error: 'This stream is patron-only',
          requiresPatronage: true,
        });
      }
    }

    res.json({ success: true, stream });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * GET /api/v1/livestreams/:id/chat?limit=50
 * Get chat history for a livestream
 */
router.get('/:id/chat', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);

    const messages = await prisma.streamMessage.findMany({
      where: { streamId: req.params.id },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });

    res.json({
      success: true,
      messages,
      count: messages.length,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * POST /api/v1/livestreams/:id/report
 * Report inappropriate livestream
 * Requires: Authentication
 */
router.post(
  '/:id/report',
  requireAuth,
  requireRateLimit,
  async (req: Request, res: Response) => {
    try {
      const { reason, description } = req.body;

      if (!reason) {
        return res.status(400).json({ error: 'Reason is required' });
      }

      // Create report
      const report = await prisma.report.create({
        data: {
          videoId: req.params.id,
          reportedBy: req.userId,
          reason,
          description: description || '',
          type: 'livestream',
          status: 'pending',
        },
      });

      // Log to forensics
      await logForensicEvent('LIVESTREAM_REPORTED', 'report', report.id, req.userId, {
        streamId: req.params.id,
        reason,
      });

      res.status(201).json({
        success: true,
        report,
        message: 'Report submitted. Our team will review shortly.',
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

/**
 * GET /api/v1/livestreams/creator/:creatorId
 * Get all livestreams (active + archived) for a creator
 */
router.get('/creator/:creatorId', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const includeArchived = req.query.archived === 'true';

    const where: any = { creatorId: req.params.creatorId };
    if (!includeArchived) {
      where.isActive = true;
    }

    const streams = await prisma.livestream.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            displayName: true,
            avatar: true,
          },
        },
      },
      orderBy: { startedAt: 'desc' },
      take: limit,
    });

    res.json({
      success: true,
      streams,
      count: streams.length,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
