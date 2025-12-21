import { Router, Request, Response } from 'express';
import { successResponse, errorResponse, HTTP_STATUS } from '@mhc/common';
import { getModerationEngine } from '../services/moderationEngine';

const router = Router();

/**
 * POST /api/ai/moderation/analyze - Analyze content for moderation
 */
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { text, imageUrl, videoUrl, audioUrl, metadata } = req.body;

    const engine = getModerationEngine();
    const result = await engine.moderateContent({
      text,
      imageUrl,
      videoUrl,
      audioUrl,
      metadata,
    });

    res.json(successResponse(result));
  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({
        code: 'MODERATION_ERROR',
        message: error.message,
      })
    );
  }
});

/**
 * POST /api/ai/moderation/deepfake - Detect deepfakes
 */
router.post('/deepfake', async (req: Request, res: Response) => {
  try {
    const { mediaUrl, type } = req.body;

    if (!mediaUrl || !type) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({
          code: 'VALIDATION_ERROR',
          message: 'mediaUrl and type are required',
        })
      );
    }

    const engine = getModerationEngine();
    const result = await engine.detectDeepfake(mediaUrl, type);

    res.json(successResponse(result));
  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({
        code: 'DEEPFAKE_DETECTION_ERROR',
        message: error.message,
      })
    );
  }
});

/**
 * POST /api/ai/moderation/report - Report content
 */
router.post('/report', async (req: Request, res: Response) => {
  try {
    const { contentId, reporterId, reason } = req.body;

    if (!contentId || !reporterId || !reason) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({
          code: 'VALIDATION_ERROR',
          message: 'contentId, reporterId, and reason are required',
        })
      );
    }

    const engine = getModerationEngine();
    await engine.reportContent(contentId, reporterId, reason);

    res.json(successResponse({ message: 'Content reported' }));
  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({
        code: 'REPORT_ERROR',
        message: error.message,
      })
    );
  }
});

export default router;
