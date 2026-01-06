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

    // Get payouts from RoyaltyPayout table
    const [payouts, total] = await Promise.all([
      prisma.royaltyPayout.findMany({
        where: {
          status: status as any
          // Note: Artist is not linked to User in schema; omit userId filter
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          amount: true,
          currency: true,
          status: true,
          paymentMethod: true,
          paymentEmail: true,
          transactionId: true,
          scheduledFor: true,
          processedAt: true,
          metadata: true,
          createdAt: true,
          artist: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      }),
      prisma.royaltyPayout.count({ where: { status: status as any } })
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
    const payout = await prisma.royaltyPayout.findUnique({ where: { id } });

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

    // Update payout status to COMPLETED
    const updatedPayout = await prisma.royaltyPayout.update({
      where: { id },
      data: { 
        status: 'COMPLETED',
        processedAt: new Date(),
        metadata: {
          ...(payout?.metadata as any || {}),
          approvedBy: req.user?.userId,
          approvedAt: new Date().toISOString(),
          adminNotes: notes
        }
      }
    });

    console.log(`Admin ${req.user?.userId} approved payout ${id}`);

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

    const payout = await prisma.royaltyPayout.findUnique({ where: { id } });

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
    const updatedPayout = await prisma.royaltyPayout.update({
      where: { id },
      data: { 
        status: 'FAILED',
        processedAt: new Date(),
        metadata: {
          ...(payout?.metadata as any || {}),
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
