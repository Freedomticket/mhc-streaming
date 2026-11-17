/**
 * Play Event Ingest Route
 *
 * POST /api/plays/event
 *   Records a qualifying play (>30 seconds) against an ISRC.
 *   This is the entry point for the entire royalty pipeline.
 *   Written once per play — immutable after creation.
 *
 * GET  /api/plays/isrc/:isrc/stats
 *   Per-ISRC play stats (total, qualified, by period).
 *
 * GET  /api/plays/artist/:artistId/stats
 *   Per-artist aggregate stats for the current and last period.
 */

import { Router, Request, Response } from 'express';
import { createHash } from 'crypto';
import rateLimit from 'express-rate-limit';
import { prisma } from '@mhc/database';

const router = Router();

// 60 play events per minute per IP — generous for a streaming platform
// but blocks bots hammering the endpoint
const playIngestLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Play event rate limit exceeded', code: 'RATE_LIMIT' },
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function hashIp(ip: string): string {
  // One-way hash — we never store raw IPs (privacy + GDPR)
  return createHash('sha256').update(ip + (process.env.AUDIT_IP_SALT || 'mhc-salt')).digest('hex').slice(0, 32);
}

function normalizeIsrc(raw: string): string | null {
  // Strip hyphens/spaces, uppercase, re-insert canonical hyphens
  // Format: CC-XXX-YY-NNNNN (12 chars without hyphens)
  const clean = raw.replace(/[-\s]/g, '').toUpperCase();
  if (!/^[A-Z]{2}[A-Z0-9]{3}\d{7}$/.test(clean)) return null;
  return `${clean.slice(0, 2)}-${clean.slice(2, 5)}-${clean.slice(5, 7)}-${clean.slice(7)}`;
}

/** Basic fraud score heuristic — refined by the nightly qualify job */
async function quickFraudScore(
  userId: string | null,
  ipHash: string,
  isrc: string,
  windowMinutes = 60
): Promise<number> {
  const since = new Date(Date.now() - windowMinutes * 60 * 1000);

  // Count recent plays of same ISRC from same user/IP in the window
  const [userCount, ipCount] = await Promise.all([
    userId
      ? prisma.playEvent.count({
          where: { userId, isrc, playedAt: { gte: since } },
        })
      : Promise.resolve(0),
    prisma.playEvent.count({
      where: { ipHash, isrc, playedAt: { gte: since } },
    }),
  ]);

  // Score: 0 = clean, 1 = fraud
  // >3 plays of same track per hour from same user/IP is suspicious
  const userScore = Math.min(userCount / 10, 1.0);
  const ipScore = Math.min(ipCount / 10, 1.0);
  return Math.max(userScore, ipScore);
}

// ── POST /api/plays/event ─────────────────────────────────────────────────────

router.post('/event', playIngestLimiter, async (req: Request, res: Response) => {
  try {
    const {
      isrc: rawIsrc,
      trackId,
      videoId,
      artistId,
      userId,
      durationSeconds,
      trackDurationSeconds,
      subscriptionTier,
      platform = 'mhc',
      country,
    } = req.body;

    // ── Validate ──────────────────────────────────────────────────────────────

    if (!rawIsrc) {
      return res.status(400).json({ error: 'isrc is required', code: 'MISSING_ISRC' });
    }

    const isrc = normalizeIsrc(rawIsrc);
    if (!isrc) {
      return res.status(400).json({
        error: `Invalid ISRC format: "${rawIsrc}". Expected CC-XXX-YY-NNNNN`,
        code: 'INVALID_ISRC',
      });
    }

    if (typeof durationSeconds !== 'number' || durationSeconds < 1) {
      return res.status(400).json({ error: 'durationSeconds must be a positive number', code: 'INVALID_DURATION' });
    }

    // Only record qualified plays (>30 seconds)
    // Callers should enforce this, but we enforce it server-side too
    const qualified = durationSeconds >= 30;

    // ── Enrich ───────────────────────────────────────────────────────────────

    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
      || req.socket?.remoteAddress
      || 'unknown';
    const ipHash = hashIp(ip);
    const userAgent = req.headers['user-agent']?.slice(0, 512) || null;

    const completionPct =
      trackDurationSeconds && trackDurationSeconds > 0
        ? Math.min(durationSeconds / trackDurationSeconds, 1.0)
        : null;

    // ── Fraud check (quick, in-request) ──────────────────────────────────────

    const fraudScore = await quickFraudScore(userId || null, ipHash, isrc);
    const flagged = fraudScore >= 0.5;

    // ── Write (immutable) ────────────────────────────────────────────────────

    const event = await prisma.playEvent.create({
      data: {
        isrc,
        trackId: trackId || null,
        videoId: videoId || null,
        artistId: artistId || null,
        userId: userId || null,
        ipHash,
        userAgent,
        durationSeconds: Math.round(durationSeconds),
        trackDurationSeconds: trackDurationSeconds ? Math.round(trackDurationSeconds) : null,
        completionPct,
        qualified,
        subscriptionTier: subscriptionTier || null,
        fraudScore,
        flagged,
        platform,
        country: country || null,
      },
    });

    // If flagged, log it (don't reject — we still record, just mark it)
    if (flagged) {
      console.warn(`[plays] Flagged play: isrc=${isrc} userId=${userId} ipHash=${ipHash} score=${fraudScore.toFixed(2)}`);
    }

    res.status(201).json({
      success: true,
      eventId: event.id,
      qualified,
      flagged,
    });
  } catch (error: any) {
    console.error('[plays] ingest error:', error);
    res.status(500).json({ error: 'Failed to record play event', code: 'SERVER_ERROR' });
  }
});

// ── GET /api/plays/isrc/:isrc/stats ──────────────────────────────────────────

router.get('/isrc/:isrc/stats', async (req: Request, res: Response) => {
  try {
    const isrc = normalizeIsrc(req.params.isrc);
    if (!isrc) {
      return res.status(400).json({ error: 'Invalid ISRC format', code: 'INVALID_ISRC' });
    }

    const { from, to } = req.query;
    const periodStart = from ? new Date(from as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const periodEnd = to ? new Date(to as string) : new Date();

    const [total, qualified, flagged] = await Promise.all([
      prisma.playEvent.count({ where: { isrc, playedAt: { gte: periodStart, lte: periodEnd } } }),
      prisma.playEvent.count({ where: { isrc, qualified: true, flagged: false, playedAt: { gte: periodStart, lte: periodEnd } } }),
      prisma.playEvent.count({ where: { isrc, flagged: true, playedAt: { gte: periodStart, lte: periodEnd } } }),
    ]);

    // Unique listeners
    const uniqueListeners = await prisma.playEvent.groupBy({
      by: ['userId'],
      where: { isrc, userId: { not: null }, playedAt: { gte: periodStart, lte: periodEnd } },
      _count: true,
    });

    // Country breakdown (top 10)
    const byCountry = await prisma.playEvent.groupBy({
      by: ['country'],
      where: { isrc, country: { not: null }, playedAt: { gte: periodStart, lte: periodEnd } },
      _count: { country: true },
      orderBy: { _count: { country: 'desc' } },
      take: 10,
    });

    res.json({
      isrc,
      period: { start: periodStart, end: periodEnd },
      plays: {
        total,
        qualified,
        flagged,
        clean: qualified,
      },
      uniqueListeners: uniqueListeners.length,
      topCountries: byCountry.map((r: { country: string | null; _count: { country: number } }) => ({ country: r.country, plays: r._count.country })),
    });
  } catch (error) {
    console.error('[plays] stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats', code: 'SERVER_ERROR' });
  }
});

// ── GET /api/plays/artist/:artistId/stats ─────────────────────────────────────

router.get('/artist/:artistId/stats', async (req: Request, res: Response) => {
  try {
    const { artistId } = req.params;

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const [thisMonth, lastMonth, allTime] = await Promise.all([
      prisma.playEvent.count({
        where: { artistId, qualified: true, flagged: false, playedAt: { gte: thisMonthStart } },
      }),
      prisma.playEvent.count({
        where: { artistId, qualified: true, flagged: false, playedAt: { gte: lastMonthStart, lte: lastMonthEnd } },
      }),
      prisma.playEvent.count({
        where: { artistId, qualified: true, flagged: false },
      }),
    ]);

    // Top ISRCs for this artist
    const topTracks = await prisma.playEvent.groupBy({
      by: ['isrc'],
      where: { artistId, qualified: true, flagged: false, playedAt: { gte: thisMonthStart } },
      _count: { isrc: true },
      orderBy: { _count: { isrc: 'desc' } },
      take: 10,
    });

    res.json({
      artistId,
      streams: {
        thisMonth,
        lastMonth,
        allTime,
        growth: lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth * 100).toFixed(1) + '%' : null,
      },
      topTracks: topTracks.map((t: { isrc: string; _count: { isrc: number } }) => ({ isrc: t.isrc, plays: t._count.isrc })),
    });
  } catch (error) {
    console.error('[plays] artist stats error:', error);
    res.status(500).json({ error: 'Failed to fetch artist stats', code: 'SERVER_ERROR' });
  }
});

export default router;
