import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { prisma } from '@mhc/database';
import { successResponse, errorResponse, ERROR_CODES, HTTP_STATUS } from '@mhc/common';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'analytics-service', timestamp: new Date().toISOString() });
});

// Track video/stream view
app.post('/api/analytics/track/view', async (req, res) => {
  try {
    const { userId, videoId, streamId, duration, completed } = req.body;
    
    const view = await prisma.view.create({
      data: {
        userId: userId || null,
        videoId: videoId || null,
        streamId: streamId || null,
        duration: duration || 0,
        completed: completed || false,
      },
    });
    
    // Update view count
    if (videoId) {
      await prisma.video.update({
        where: { id: videoId },
        data: { viewCount: { increment: 1 } },
      });
    } else if (streamId) {
      await prisma.stream.update({
        where: { id: streamId },
        data: { viewCount: { increment: 1 } },
      });
    }
    
    res.json(successResponse(view));
  } catch (error) {
    console.error('Track view error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: 'Failed to track view' })
    );
  }
});

// Track generic analytics event
app.post('/api/analytics/track', async (req, res) => {
  try {
    const { metric, value, metadata } = req.body;
    
    if (!metric || value === undefined) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({ code: ERROR_CODES.INVALID_INPUT, message: 'metric and value are required' })
      );
    }
    
    const analytic = await prisma.analytics.create({
      data: {
        metric,
        value: Number(value),
        metadata: metadata || null,
      },
    });
    
    res.json(successResponse(analytic));
  } catch (error) {
    console.error('Track analytics error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: 'Failed to track analytics' })
    );
  }
});

// Get video views
app.get('/api/analytics/views/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const { startDate, endDate } = req.query;
    
    const where: any = { videoId };
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }
    
    const [views, totalViews, avgDuration] = await Promise.all([
      prisma.view.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      prisma.view.count({ where }),
      prisma.view.aggregate({
        where,
        _avg: { duration: true },
      }),
    ]);
    
    res.json(successResponse({
      views,
      totalViews,
      avgDuration: avgDuration._avg.duration || 0,
    }));
  } catch (error) {
    console.error('Get views error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: 'Failed to fetch views' })
    );
  }
});

// Get overall platform stats
app.get('/api/analytics/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalVideos,
      totalStreams,
      totalViews,
      activeSubscriptions,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.video.count({ where: { status: 'READY' } }),
      prisma.stream.count(),
      prisma.view.count(),
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    ]);
    
    // Get subscription tier breakdown
    const subscriptionBreakdown = await prisma.subscription.groupBy({
      by: ['tier'],
      where: { status: 'ACTIVE' },
      _count: true,
    });
    
    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentViews = await prisma.view.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    });
    
    res.json(successResponse({
      totalUsers,
      totalVideos,
      totalStreams,
      totalViews,
      activeSubscriptions,
      subscriptionBreakdown,
      recentViews,
    }));
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: 'Failed to fetch stats' })
    );
  }
});

// Get user analytics
app.get('/api/analytics/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const [
      totalViews,
      totalVideos,
      totalStreams,
      followers,
      following,
    ] = await Promise.all([
      prisma.view.count({ where: { userId } }),
      prisma.video.count({ where: { userId } }),
      prisma.stream.count({ where: { userId } }),
      prisma.follow.count({ where: { followingId: userId } }),
      prisma.follow.count({ where: { followerId: userId } }),
    ]);
    
    res.json(successResponse({
      totalViews,
      totalVideos,
      totalStreams,
      followers,
      following,
    }));
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: 'Failed to fetch user analytics' })
    );
  }
});

app.listen(PORT, () => {
  console.log(`📊 Analytics service running on port ${PORT}`);
});
