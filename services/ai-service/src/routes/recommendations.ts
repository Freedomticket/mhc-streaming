import { Router, Request, Response } from 'express';
import { successResponse, errorResponse, HTTP_STATUS } from '@mhc/common';
import { getRecommendationEngine } from '../services/recommendationEngine';

const router = Router();

/**
 * POST /api/ai/recommendations/track - Track user behavior
 */
router.post('/track', async (req: Request, res: Response) => {
  try {
    const { userId, contentId, contentType, action, watchTime, totalDuration } = req.body;

    const engine = getRecommendationEngine();
    await engine.trackBehavior({
      userId,
      contentId,
      contentType,
      action,
      watchTime,
      totalDuration,
      timestamp: new Date(),
    });

    res.json(successResponse({ message: 'Behavior tracked' }));
  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({
        code: 'TRACK_ERROR',
        message: error.message,
      })
    );
  }
});

/**
 * GET /api/ai/recommendations - Get personalized recommendations
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { userId, limit = 20, exclude } = req.query;
    
    const excludeIds = exclude ? (exclude as string).split(',') : [];
    const engine = getRecommendationEngine();
    
    const recommendations = await engine.getRecommendations(
      userId as string | null,
      Number(limit),
      excludeIds
    );

    res.json(successResponse(recommendations));
  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({
        code: 'RECOMMENDATION_ERROR',
        message: error.message,
      })
    );
  }
});

export default router;
