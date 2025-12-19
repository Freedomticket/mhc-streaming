/**
 * Video Routes - TikTok/YouTube Backend (Production)
 *
 * Endpoints:
 * POST   /api/v1/videos/upload          - Upload video (short/long)
 * GET    /api/v1/videos/feed            - TikTok-style infinite feed
 * GET    /api/v1/videos/:id             - Get video details
 * POST   /api/v1/videos/:id/view        - Increment view count
 * POST   /api/v1/videos/:id/like        - Like/unlike video
 * POST   /api/v1/videos/:id/delete      - Delete video
 * GET    /api/v1/videos/artist/:id      - Get artist's channel
 * GET    /api/v1/videos/search          - Search videos
 * GET    /api/v1/videos/trending        - Get trending videos
 * GET    /stream/:filename              - Stream video with HTTP 206
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import { videoService } from '../services/video.service';
import { requireAuth } from '../middleware/auth.middleware';
import { requireProArtist } from '../middleware/subscription.middleware';
import { requireRateLimit } from '../middleware/rateLimit.middleware';
import { logForensicEvent } from '../services/forensics.service';

const router = Router();

// Configure multer for video uploads
const upload = multer({
  dest: process.env.UPLOAD_DIR || './uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024 * 1024, // 10 GB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files allowed'));
    }
  },
});

/**
 * POST /api/v1/videos/upload
 * Upload video (short or long-form)
 * Requires: Pro/Premium subscription
 */
router.post(
  '/upload',
  requireAuth,
  requireProArtist(),
  requireRateLimit,
  upload.single('video'),
  async (req: Request, res: Response) => {
    try {
      const { title, description, type, duration, danteRealm, patronOnly, collaborators } = req.body;

      // Validate required fields
      if (!title || !type || !duration) {
        return res.status(400).json({ error: 'Missing required fields: title, type, duration' });
      }

      if (!['short', 'long'].includes(type)) {
        return res.status(400).json({ error: 'Type must be "short" or "long"' });
      }

      const video = await videoService.uploadVideo(req.userId, req.file, {
        title,
        description,
        type,
        duration: parseInt(duration),
        danteRealm,
        patronOnly: patronOnly === 'true',
        collaborators: collaborators ? JSON.parse(collaborators) : [],
      });

      res.status(201).json({
        success: true,
        video,
        message: 'Video uploaded successfully',
      });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
);

/**
 * GET /api/v1/videos/feed?limit=20&cursor=...
 * TikTok-style infinite feed (algorithm-ranked)
 * Public endpoint, no auth required
 */
router.get('/feed', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const cursor = req.query.cursor as string;

    const result = await videoService.getVideoFeed(req.userId || null, limit, cursor);

    res.json({
      success: true,
      data: result.videos,
      pagination: {
        nextCursor: result.nextCursor,
        hasMore: result.hasMore,
      },
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * GET /api/v1/videos/:id
 * Get video details with creator info
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const video = await videoService.getVideoById(req.params.id);
    res.json({ success: true, video });
  } catch (error) {
    res.status(404).json({ error: (error as Error).message });
  }
});

/**
 * POST /api/v1/videos/:id/view
 * Increment view counter (non-blocking)
 * Tracks engagement + royalty credit
 */
router.post('/:id/view', async (req: Request, res: Response) => {
  try {
    // Non-blocking increment
    videoService.incrementView(req.params.id, req.userId);

    res.json({ success: true, message: 'View recorded' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * POST /api/v1/videos/:id/like
 * Like or unlike video (toggle)
 * Requires: Authentication
 */
router.post('/:id/like', requireAuth, async (req: Request, res: Response) => {
  try {
    await videoService.likeVideo(req.params.id, req.userId);
    res.json({ success: true, message: 'Like toggled' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

/**
 * POST /api/v1/videos/:id/delete
 * Soft delete video (preserves evidence for forensics)
 * Requires: Video ownership
 */
router.post('/:id/delete', requireAuth, async (req: Request, res: Response) => {
  try {
    await videoService.deleteVideo(req.params.id, req.userId);

    res.json({
      success: true,
      message: 'Video deleted successfully',
    });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

/**
 * GET /api/v1/videos/artist/:artistId
 * Get YouTube-style artist channel (all videos)
 */
router.get('/artist/:artistId', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const videos = await videoService.getArtistChannel(req.params.artistId, limit);

    res.json({
      success: true,
      videos,
      count: videos.length,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * GET /api/v1/videos/search?q=query&limit=20
 * Search videos by title/description
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;

    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const videos = await videoService.searchVideos(query, limit);

    res.json({
      success: true,
      query,
      results: videos,
      count: videos.length,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * GET /api/v1/videos/trending?limit=50
 * Get trending videos (last 7 days)
 * Ranked by views + likes
 */
router.get('/trending', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const videos = await videoService.getTrendingVideos(limit);

    res.json({
      success: true,
      videos,
      count: videos.length,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;

/**
 * STREAMING ROUTES (Separate file: stream.routes.ts)
 * GET /stream/:filename - HTTP 206 range streaming
 */
