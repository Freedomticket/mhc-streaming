import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { prisma } from '@mhc/database';
import { successResponse, errorResponse, ERROR_CODES, HTTP_STATUS } from '@mhc/common';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3006;

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
  res.json({ 
    status: 'ok', 
    service: 'analytics-service',
    timestamp: new Date().toISOString() 
  });
});

// Track event (generic analytics)
app.post('/api/analytics/event', async (req, res) => {
  try {
    const { userId, eventType, metadata } = req.body;
    
    if (!userId || !eventType) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({ code: ERROR_CODES.INVALID_INPUT, message: 'userId and eventType are required' })
      );
    }
    
    // Store event (simplified - in production would use time-series DB)
    console.log(`Analytics Event: ${eventType} for user ${userId}`, metadata);
    
    res.json(successResponse({ tracked: true, eventType }));
  } catch (error) {
    console.error('Track event error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: 'Failed to track event' })
    );
  }
});

// Get user analytics
app.get('/api/analytics/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;
    
    // Get user's stream count
    const streamCount = await prisma.stream.count({
      where: { userId },
    });
    
    // Get total views (sum of view counts from all streams)
    const streams = await prisma.stream.findMany({
      where: { userId },
      select: { viewCount: true },
    });
    
    const totalViews = streams.reduce((sum: number, stream: { viewCount: number }) => sum + (stream.viewCount || 0), 0);
    
    // Get video count
    const videoCount = await prisma.video.count({
      where: { userId },
    });
    
    // Get follower count
    const followerCount = await prisma.follow.count({
      where: { followingId: userId },
    });
    
    res.json(successResponse({
      userId,
      metrics: {
        streamCount,
        totalViews,
        videoCount,
        followerCount,
      },
      period: {
        startDate: startDate || 'all-time',
        endDate: endDate || 'now',
      },
    }));
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: 'Failed to fetch user analytics' })
    );
  }
});

// Get video analytics
app.get('/api/analytics/video/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    });
    
    if (!video) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse({ code: ERROR_CODES.NOT_FOUND, message: 'Video not found' })
      );
    }
    
    res.json(successResponse({
      videoId,
      title: video.title,
      metrics: {
        viewCount: video.viewCount || 0,
        likeCount: video.likeCount || 0,
        streamCount: video.streamCount || 0,
        createdAt: video.createdAt,
      },
    }));
  } catch (error) {
    console.error('Get track analytics error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: 'Failed to fetch track analytics' })
    );
  }
});

// Increment video view count
app.post('/api/analytics/video/:videoId/view', async (req, res) => {
  try {
    const { videoId } = req.params;
    
    const video = await prisma.video.update({
      where: { id: videoId },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });
    
    res.json(successResponse({ videoId, viewCount: video.viewCount }));
  } catch (error) {
    console.error('Increment play count error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: 'Failed to increment play count' })
    );
  }
});

// Get platform-wide stats
app.get('/api/analytics/platform', async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalVideos = await prisma.video.count();
    const totalStreams = await prisma.stream.count();
    const activeStreams = await prisma.stream.count({
      where: { status: 'LIVE' },
    });
    
    res.json(successResponse({
      platform: {
        totalUsers,
        totalVideos,
        totalStreams,
        activeStreams,
      },
      timestamp: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Get platform stats error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: 'Failed to fetch platform stats' })
    );
  }
});

// Get trending videos
app.get('/api/analytics/trending/videos', async (req, res) => {
  try {
    const { limit = '10' } = req.query;
    
    const videos = await prisma.video.findMany({
      where: { status: 'READY' },
      orderBy: [
        { viewCount: 'desc' },
        { createdAt: 'desc' },
      ],
      take: parseInt(limit as string),
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    });
    
    res.json(successResponse(videos));
  } catch (error) {
    console.error('Get trending videos error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: 'Failed to fetch trending videos' })
    );
  }
});

app.listen(PORT, () => {
  console.log(`📊 Analytics service running on port ${PORT}`);
});
