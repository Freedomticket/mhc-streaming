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
      where: { artistId: userId },
    });
    
    // Get total views (sum of viewer counts from all streams)
    const streams = await prisma.stream.findMany({
      where: { artistId: userId },
      select: { viewerCount: true },
    });
    
    const totalViews = streams.reduce((sum: number, stream) => sum + (stream.viewerCount || 0), 0);
    
    // Get track count
    const trackCount = await prisma.track.count({
      where: { artistId: userId },
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
        trackCount,
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

// Get track analytics
app.get('/api/analytics/track/:trackId', async (req, res) => {
  try {
    const { trackId } = req.params;
    
    const track = await prisma.track.findUnique({
      where: { id: trackId },
      include: {
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });
    
    if (!track) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse({ code: ERROR_CODES.NOT_FOUND, message: 'Track not found' })
      );
    }
    
    res.json(successResponse({
      trackId,
      title: track.title,
      metrics: {
        plays: track.plays || 0,
        likes: track._count.likes,
        createdAt: track.createdAt,
      },
    }));
  } catch (error) {
    console.error('Get track analytics error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: 'Failed to fetch track analytics' })
    );
  }
});

// Increment track play count
app.post('/api/analytics/track/:trackId/play', async (req, res) => {
  try {
    const { trackId } = req.params;
    
    const track = await prisma.track.update({
      where: { id: trackId },
      data: {
        plays: {
          increment: 1,
        },
      },
    });
    
    res.json(successResponse({ trackId, plays: track.plays }));
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
    const totalTracks = await prisma.track.count();
    const totalStreams = await prisma.stream.count();
    const activeStreams = await prisma.stream.count({
      where: { isLive: true },
    });
    
    res.json(successResponse({
      platform: {
        totalUsers,
        totalTracks,
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

// Get trending tracks
app.get('/api/analytics/trending/tracks', async (req, res) => {
  try {
    const { limit = '10' } = req.query;
    
    const tracks = await prisma.track.findMany({
      orderBy: [
        { plays: 'desc' },
        { createdAt: 'desc' },
      ],
      take: parseInt(limit as string),
      include: {
        artist: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profileImage: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });
    
    res.json(successResponse(tracks));
  } catch (error) {
    console.error('Get trending tracks error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: 'Failed to fetch trending tracks' })
    );
  }
});

app.listen(PORT, () => {
  console.log(`📊 Analytics service running on port ${PORT}`);
});
