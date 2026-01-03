import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { prisma } from '@mhc/database';
import { successResponse, errorResponse, ERROR_CODES, HTTP_STATUS } from '@mhc/common';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3009;

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
    service: 'ai-service',
    timestamp: new Date().toISOString() 
  });
});

// Get personalized video recommendations
app.get('/api/ai/recommendations/videos', async (req, res) => {
  try {
    const { userId, limit = '10' } = req.query;
    
    // Get popular videos (simplified - no Like model exists)
    const popularVideos = await prisma.video.findMany({
      where: { status: 'READY' },
      orderBy: { viewCount: 'desc' },
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
    
    res.json(successResponse({
      videos: popularVideos,
      algorithm: 'popular',
    }));
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: 'Failed to fetch recommendations' })
    );
  }
});

// Get creator recommendations
app.get('/api/ai/recommendations/creators', async (req, res) => {
  try {
    const { userId, limit = '10' } = req.query;
    
    // Simple algorithm: popular creators by follower count
    const popularCreators = await prisma.user.findMany({
      where: { 
        role: 'CREATOR',
      },
      take: parseInt(limit as string),
      include: {
        _count: {
          select: {
            followers: true,
            videos: true,
          },
        },
      },
      orderBy: {
        followers: {
          _count: 'desc',
        },
      },
    });
    
    res.json(successResponse({
      creators: popularCreators,
      algorithm: 'popular',
    }));
  } catch (error) {
    console.error('Get artist recommendations error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: 'Failed to fetch artist recommendations' })
    );
  }
});

// Get similar videos
app.get('/api/ai/similar/videos/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const { limit = '5' } = req.query;
    
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    });
    
    if (!video) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse({ code: ERROR_CODES.NOT_FOUND, message: 'Video not found' })
      );
    }
    
    // Simple similarity: same artist or related content
    const similarVideos = await prisma.video.findMany({
      where: {
        AND: [
          { userId: { not: video.userId } },
          { id: { not: videoId } },
          { status: 'READY' },
        ],
      },
      take: parseInt(limit as string),
      orderBy: { viewCount: 'desc' },
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
    
    res.json(successResponse(similarVideos));
  } catch (error) {
    console.error('Get similar tracks error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: 'Failed to fetch similar tracks' })
    );
  }
});

// Auto-tag video (category detection, mood, etc.)
app.post('/api/ai/auto-tag', async (req, res) => {
  try {
    const { videoId } = req.body;
    
    if (!videoId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({ code: ERROR_CODES.INVALID_INPUT, message: 'videoId is required' })
      );
    }
    
    // Placeholder for ML model inference
    // In production, would analyze video/audio features
    const suggestedTags = {
      category: 'music',
      mood: 'energetic',
      style: 'modern',
      confidence: 0.85,
    };
    
    res.json(successResponse(suggestedTags));
  } catch (error) {
    console.error('Auto-tag error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: 'Failed to auto-tag track' })
    );
  }
});

app.listen(PORT, () => {
  console.log(`🤖 AI service running on port ${PORT}`);
});
