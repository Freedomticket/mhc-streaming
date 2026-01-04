import { Router, Request, Response } from 'express';
import { prisma } from '@mhc/database';
import { HTTP_STATUS, successResponse, errorResponse, ERROR_CODES } from '@mhc/common';

const router = Router();

/**
 * GET /api/admin/reports
 * Returns moderation reports queue
 * Note: Schema doesn't have Report model yet, this is a placeholder
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { 
      page = '1', 
      limit = '50', 
      status = 'PENDING',
      type
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    // TODO: When Report model is added to schema, implement actual query
    // For now, return empty list with structure
    const reports: any[] = [];
    const total = 0;

    return res.status(HTTP_STATUS.OK).json(
      successResponse({ 
        data: {
          reports,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: 0
          }
        }
      })
    );
  } catch (error: any) {
    console.error('Fetch reports error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ 
        code: ERROR_CODES.INTERNAL_ERROR, 
        message: 'Failed to fetch reports' 
      })
    );
  }
});

/**
 * POST /api/admin/reports/:id/resolve
 * Resolve a moderation report
 */
router.post('/:id/resolve', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body;

    // Validate action
    if (!action || !['dismiss', 'takedown', 'warn', 'ban'].includes(action)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({ 
          code: ERROR_CODES.VALIDATION_ERROR, 
          message: 'Invalid action. Must be: dismiss, takedown, warn, or ban' 
        })
      );
    }

    // TODO: When Report model exists, update report status
    console.log(`Admin ${req.user?.userId} resolved report ${id} with action: ${action}. Notes: ${notes}`);

    return res.status(HTTP_STATUS.OK).json(
      successResponse({ 
        data: { 
          message: 'Report resolved successfully',
          reportId: id,
          action 
        } 
      })
    );
  } catch (error: any) {
    console.error('Resolve report error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ 
        code: ERROR_CODES.INTERNAL_ERROR, 
        message: 'Failed to resolve report' 
      })
    );
  }
});

export default router;
