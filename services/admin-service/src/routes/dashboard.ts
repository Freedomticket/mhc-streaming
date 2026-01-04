import { Router, Request, Response } from 'express';
import { prisma } from '@mhc/database';
import { HTTP_STATUS, successResponse, errorResponse, ERROR_CODES } from '@mhc/common';

const router = Router();

/**
 * GET /api/admin/dashboard
 * Returns aggregated statistics for admin dashboard
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // Aggregate user statistics
    const [totalUsers, totalCreators, totalAdmins] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'CREATOR' } }),
      prisma.user.count({ where: { role: 'ADMIN' } })
    ]);

    // Aggregate content statistics
    const [totalVideos, totalStreams, activeStreams] = await Promise.all([
      prisma.video.count(),
      prisma.stream.count(),
      prisma.stream.count({ where: { status: 'LIVE' } })
    ]);

    // Aggregate engagement statistics
    const [totalViews, totalLikes] = await Promise.all([
      prisma.video.aggregate({ _sum: { viewCount: true } }),
      prisma.video.aggregate({ _sum: { likeCount: true } })
    ]);

    // Revenue statistics (requires Payment model)
    const revenueStats = await prisma.payment.aggregate({
      _sum: { amount: true },
      _count: true
    });

    // Recent activity (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [recentUsers, recentVideos, recentPayments] = await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: oneDayAgo } } }),
      prisma.video.count({ where: { createdAt: { gte: oneDayAgo } } }),
      prisma.payment.count({ where: { createdAt: { gte: oneDayAgo } } })
    ]);

    const stats = {
      users: {
        total: totalUsers,
        creators: totalCreators,
        admins: totalAdmins,
        recent24h: recentUsers
      },
      content: {
        totalVideos,
        totalStreams,
        activeStreams,
        recent24h: recentVideos
      },
      engagement: {
        totalViews: totalViews._sum.viewCount || 0,
        totalLikes: totalLikes._sum.likeCount || 0
      },
      revenue: {
        totalRevenue: revenueStats._sum.amount || 0,
        totalTransactions: revenueStats._count,
        recent24h: recentPayments
      }
    };

    return res.status(HTTP_STATUS.OK).json(successResponse({ data: stats }));
  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ 
        code: ERROR_CODES.INTERNAL_ERROR, 
        message: 'Failed to fetch dashboard statistics' 
      })
    );
  }
});

export default router;
