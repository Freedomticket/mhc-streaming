import { Router, Request, Response } from 'express';
import { prisma } from '@mhc/database';
import { HTTP_STATUS, successResponse, errorResponse, ERROR_CODES } from '@mhc/common';

const router = Router();

/**
 * GET /api/admin/revenue
 * Returns revenue analytics and summary
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    // Build date filter
    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    // Get aggregated revenue data
    const [totalRevenue, transactionCount, avgTransaction] = await Promise.all([
      prisma.payment.aggregate({
        where,
        _sum: { amount: true }
      }),
      prisma.payment.count({ where }),
      prisma.payment.aggregate({
        where,
        _avg: { amount: true }
      })
    ]);

    // Revenue by payment type
    const revenueByType = await prisma.payment.groupBy({
      by: ['type'],
      where,
      _sum: { amount: true },
      _count: true
    });

    // Revenue by status
    const revenueByStatus = await prisma.payment.groupBy({
      by: ['status'],
      where,
      _sum: { amount: true },
      _count: true
    });

    const data = {
      summary: {
        totalRevenue: totalRevenue._sum.amount || 0,
        transactionCount,
        averageTransaction: avgTransaction._avg.amount || 0
      },
      byType: revenueByType.map(r => ({
        type: r.type,
        revenue: r._sum.amount || 0,
        count: r._count
      })),
      byStatus: revenueByStatus.map(r => ({
        status: r.status,
        revenue: r._sum.amount || 0,
        count: r._count
      }))
    };

    return res.status(HTTP_STATUS.OK).json(successResponse({ data }));
  } catch (error: any) {
    console.error('Fetch revenue error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ 
        code: ERROR_CODES.INTERNAL_ERROR, 
        message: 'Failed to fetch revenue data' 
      })
    );
  }
});

/**
 * GET /api/admin/revenue/breakdown
 * Returns detailed revenue breakdown by creator
 */
router.get('/breakdown', async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '50', sortBy = 'revenue', order = 'desc' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Get creators with revenue
    const creatorsRevenue = await prisma.payment.groupBy({
      by: ['userId'],
      _sum: { amount: true },
      _count: true,
      orderBy: {
        _sum: {
          amount: order as 'asc' | 'desc'
        }
      },
      skip,
      take: limitNum
    });

    // Get user details
    const userIds = creatorsRevenue.map(r => r.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        username: true,
        email: true,
        role: true
      }
    });

    const userMap = new Map(users.map(u => [u.id, u]));

    const breakdown = creatorsRevenue.map(r => ({
      user: userMap.get(r.userId),
      revenue: r._sum.amount || 0,
      transactionCount: r._count
    }));

    const total = await prisma.payment.groupBy({
      by: ['userId']
    }).then(res => res.length);

    return res.status(HTTP_STATUS.OK).json(
      successResponse({ 
        data: {
          breakdown,
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
    console.error('Fetch revenue breakdown error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ 
        code: ERROR_CODES.INTERNAL_ERROR, 
        message: 'Failed to fetch revenue breakdown' 
      })
    );
  }
});

export default router;
