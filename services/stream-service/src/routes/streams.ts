import { Router, Request, Response } from 'express';
import { prisma } from '@mhc/database';
import { successResponse, errorResponse, HTTP_STATUS } from '@mhc/common';
import { getStreamManager } from '../services/streamManager';
import crypto from 'crypto';

const router = Router();

/**
 * GET /api/streams - Get all live streams
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, category, sortBy = 'viewerCount' } = req.query;

    const where: any = { isLive: true };
    if (category) {
      where.category = category;
    }

    const streams = await prisma.stream.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: sortBy === 'recent' ? { startedAt: 'desc' } : { viewerCount: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    const total = await prisma.stream.count({ where });

    res.json(
      successResponse(streams, {
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      })
    );
  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({
        code: 'FETCH_STREAMS_ERROR',
        message: error.message,
      })
    );
  }
});

/**
 * GET /api/streams/:id - Get stream by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const stream = await prisma.stream.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!stream) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse({
          code: 'STREAM_NOT_FOUND',
          message: 'Stream not found',
        })
      );
    }

    res.json(successResponse(stream));
  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({
        code: 'FETCH_STREAM_ERROR',
        message: error.message,
      })
    );
  }
});

/**
 * POST /api/streams - Create new stream
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { userId, title, description, category, tags } = req.body;

    // Validate required fields
    if (!userId || !title) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({
          code: 'VALIDATION_ERROR',
          message: 'userId and title are required',
        })
      );
    }

    // Generate unique stream key
    const streamKey = crypto.randomBytes(16).toString('hex');

    const stream = await prisma.stream.create({
      data: {
        userId,
        title,
        description,
        category,
        tags: tags || [],
        streamKey,
        isLive: false,
        viewerCount: 0,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
    });

    res.status(HTTP_STATUS.CREATED).json(successResponse(stream));
  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({
        code: 'CREATE_STREAM_ERROR',
        message: error.message,
      })
    );
  }
});

/**
 * PATCH /api/streams/:id - Update stream
 */
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, category, tags } = req.body;

    const stream = await prisma.stream.update({
      where: { id },
      data: {
        title,
        description,
        category,
        tags,
      },
    });

    res.json(successResponse(stream));
  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({
        code: 'UPDATE_STREAM_ERROR',
        message: error.message,
      })
    );
  }
});

/**
 * DELETE /api/streams/:id - Delete stream
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.stream.delete({
      where: { id },
    });

    res.json(successResponse({ message: 'Stream deleted successfully' }));
  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({
        code: 'DELETE_STREAM_ERROR',
        message: error.message,
      })
    );
  }
});

/**
 * POST /api/streams/:id/start - Start streaming (for testing)
 */
router.post('/:id/start', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const stream = await prisma.stream.findUnique({
      where: { id },
    });

    if (!stream) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse({
          code: 'STREAM_NOT_FOUND',
          message: 'Stream not found',
        })
      );
    }

    const streamManager = getStreamManager();
    const started = await streamManager.onStreamPublish(stream.streamKey);

    if (!started) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({
          code: 'STREAM_START_ERROR',
          message: 'Failed to start stream',
        })
      );
    }

    res.json(successResponse({ message: 'Stream started', streamKey: stream.streamKey }));
  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({
        code: 'STREAM_START_ERROR',
        message: error.message,
      })
    );
  }
});

/**
 * POST /api/streams/:id/stop - Stop streaming (for testing)
 */
router.post('/:id/stop', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const stream = await prisma.stream.findUnique({
      where: { id },
    });

    if (!stream) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse({
          code: 'STREAM_NOT_FOUND',
          message: 'Stream not found',
        })
      );
    }

    const streamManager = getStreamManager();
    await streamManager.onStreamUnpublish(stream.streamKey);

    res.json(successResponse({ message: 'Stream stopped' }));
  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({
        code: 'STREAM_STOP_ERROR',
        message: error.message,
      })
    );
  }
});

/**
 * GET /api/streams/active/sessions - Get active stream sessions
 */
router.get('/active/sessions', async (req: Request, res: Response) => {
  try {
    const streamManager = getStreamManager();
    const sessions = streamManager.getAllSessions();

    res.json(successResponse(sessions));
  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({
        code: 'FETCH_SESSIONS_ERROR',
        message: error.message,
      })
    );
  }
});

export default router;
