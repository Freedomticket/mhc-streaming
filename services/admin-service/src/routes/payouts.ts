import { Router, Request, Response } from 'express';
import { prisma } from '@mhc/database';
import { HTTP_STATUS, successResponse, errorResponse, ERROR_CODES } from '@mhc/common';

const router = Router();

/**
 * GET /api/admin/payouts
 * Returns pending payout requests
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { 
      page = '1', 
      limit = '50', 
      status = 'PENDING',
      userId
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = { type: 'PAYOUT' };
    
    if (status) {
      where.status = status;
    }

    if (userId) {
      where.userId = userId;
    }

    // Get payouts
    const [payouts, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          userId: true,
          amount: true,
          currency: true,
          status: true,
          metadata: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              role: true
            }
          }
        }
      }),
      prisma.payment.count({ where })
    ]);

    return res.status(HTTP_STATUS.OK).json(
      successResponse({ 
        data: {
          payouts,
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
    console.error('Fetch payouts error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ 
        code: ERROR_CODES.INTERNAL_ERROR, 
        message: 'Failed to fetch payouts' 
      })
    );
  }
});

/**
 * POST /api/admin/payouts/:id/approve
 * Approve a payout request
 */
router.post('/:id/approve', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    // Check if payout exists
    const payout = await prisma.payment.findUnique({ 
      where: { id },
      include: { user: true }
    });

    if (!payout) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse({ code: ERROR_CODES.NOT_FOUND, message: 'Payout not found' })
      );
    }

    if (payout.type !== 'PAYOUT') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({ 
          code: ERROR_CODES.VALIDATION_ERROR, 
          message: 'Payment is not a payout request' 
        })
      );
    }

    if (payout.status !== 'PENDING') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({ 
          code: ERROR_CODES.VALIDATION_ERROR, 
          message: 'Payout is not in pending status' 
        })
      );
    }

    // Update payout status to COMPLETED
    const updatedPayout = await prisma.payment.update({
      where: { id },
      data: { 
        status: 'COMPLETED',
        metadata: {
          ...(payout.metadata as any || {}),
          approvedBy: req.user?.userId,
          approvedAt: new Date().toISOString(),
          adminNotes: notes
        }
      }
    });

    console.log(`Admin ${req.user?.userId} approved payout ${id} for user ${payout.userId}`);

    return res.status(HTTP_STATUS.OK).json(
      successResponse({ 
        data: { 
          message: 'Payout approved successfully',
          payout: updatedPayout
        } 
      })
    );
  } catch (error: any) {
    console.error('Approve payout error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ 
        code: ERROR_CODES.INTERNAL_ERROR, 
        message: 'Failed to approve payout' 
      })
    );
  }
});

/**
 * POST /api/admin/payouts/:id/reject
 * Reject a payout request
 */
router.post('/:id/reject', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({ 
          code: ERROR_CODES.VALIDATION_ERROR, 
          message: 'Rejection reason is required' 
        })
      );
    }

    const payout = await prisma.payment.findUnique({ where: { id } });

    if (!payout) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse({ code: ERROR_CODES.NOT_FOUND, message: 'Payout not found' })
      );
    }

    if (payout.status !== 'PENDING') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({ 
          code: ERROR_CODES.VALIDATION_ERROR, 
          message: 'Payout is not in pending status' 
        })
      );
    }

    // Update payout status to FAILED (rejected)
    const updatedPayout = await prisma.payment.update({
      where: { id },
      data: { 
        status: 'FAILED',
        metadata: {
          ...(payout.metadata as any || {}),
          rejectedBy: req.user?.userId,
          rejectedAt: new Date().toISOString(),
          rejectionReason: reason
        }
      }
    });

    console.log(`Admin ${req.user?.userId} rejected payout ${id}. Reason: ${reason}`);

    return res.status(HTTP_STATUS.OK).json(
      successResponse({ 
        data: { 
          message: 'Payout rejected',
          payout: updatedPayout
        } 
      })
    );
  } catch (error: any) {
    console.error('Reject payout error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ 
        code: ERROR_CODES.INTERNAL_ERROR, 
        message: 'Failed to reject payout' 
      })
    );
  }
});

export default router;
