import { Router, Request, Response } from 'express';
import { prisma } from '@mhc/database';
import { HTTP_STATUS, successResponse, errorResponse, ERROR_CODES } from '@mhc/common';

const router = Router();

/**
 * GET /api/admin/videos
 * Returns paginated list of videos with filters
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { 
      page = '1', 
      limit = '50', 
      status,
      search,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};
    
    if (status && ['UPLOADING', 'PROCESSING', 'READY', 'FAILED'].includes(status as string)) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    // Get videos and total count
    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortBy as string]: order },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          viewCount: true,
          likeCount: true,
          streamCount: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              username: true,
              email: true
            }
          }
        }
      }),
      prisma.video.count({ where })
    ]);

    return res.status(HTTP_STATUS.OK).json(
      successResponse({ 
        data: {
          videos,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum)
          }
        }
      })
    );
  } catch (error: any) {
    console.error('Fetch videos error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ 
        code: ERROR_CODES.INTERNAL_ERROR, 
        message: 'Failed to fetch videos' 
      })
    );
  }
});

/**
 * POST /api/admin/videos/:id/moderate
 * Take moderation action on a video (takedown, flag, etc.)
 */
router.post('/:id/moderate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body;

    // Validate action
    if (!action || !['takedown', 'flag', 'approve'].includes(action)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({ 
          code: ERROR_CODES.VALIDATION_ERROR, 
          message: 'Invalid action. Must be: takedown, flag, or approve' 
        })
      );
    }

    // Check if video exists
    const video = await prisma.video.findUnique({ where: { id } });

    if (!video) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse({ code: ERROR_CODES.NOT_FOUND, message: 'Video not found' })
      );
    }

    // Handle takedown - change status to FAILED
    if (action === 'takedown') {
      await prisma.video.update({
        where: { id },
        data: { status: 'FAILED' }
      });
    }

    console.log(`Admin ${req.user?.userId} ${action} video ${id}. Reason: ${reason}`);

    return res.status(HTTP_STATUS.OK).json(
      successResponse({ 
        data: { 
          message: `Video ${action} successful`,
          videoId: id,
          action 
        } 
      })
    );
  } catch (error: any) {
    console.error('Moderate video error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ 
        code: ERROR_CODES.INTERNAL_ERROR, 
        message: 'Failed to moderate video' 
      })
    );
  }
});

export default router;
