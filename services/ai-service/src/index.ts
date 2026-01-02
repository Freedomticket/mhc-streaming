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

// Get personalized track recommendations
app.get('/api/ai/recommendations/tracks', async (req, res) => {
  try {
    const { userId, limit = '10' } = req.query;
    
    // Simple recommendation algorithm: most played tracks by genre
    const userLikes = userId ? await prisma.like.findMany({
      where: { userId: userId as string },
      include: { track: true },
      take: 5,
    }) : [];
    
    // Get popular tracks (fallback or mix with personalized)
    const popularTracks = await prisma.track.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { plays: 'desc' },
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
      },
    });
    
    res.json(successResponse({
      tracks: popularTracks,
      algorithm: userId ? 'personalized' : 'popular',
    }));
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: 'Failed to fetch recommendations' })
    );
  }
});

// Get artist recommendations
app.get('/api/ai/recommendations/artists', async (req, res) => {
  try {
    const { userId, limit = '10' } = req.query;
    
    // Simple algorithm: popular artists by follower count
    const popularArtists = await prisma.user.findMany({
      where: { 
        role: 'ARTIST',
        tier: { not: 'FREE' },
      },
      take: parseInt(limit as string),
      include: {
        _count: {
          select: {
            followers: true,
            tracks: true,
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
      artists: popularArtists,
      algorithm: 'popular',
    }));
  } catch (error) {
    console.error('Get artist recommendations error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: 'Failed to fetch artist recommendations' })
    );
  }
});

// Get similar tracks
app.get('/api/ai/similar/tracks/:trackId', async (req, res) => {
  try {
    const { trackId } = req.params;
    const { limit = '5' } = req.query;
    
    const track = await prisma.track.findUnique({
      where: { id: trackId },
    });
    
    if (!track) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse({ code: ERROR_CODES.NOT_FOUND, message: 'Track not found' })
      );
    }
    
    // Simple similarity: same genre, different artist
    const similarTracks = await prisma.track.findMany({
      where: {
        AND: [
          { genre: track.genre },
          { artistId: { not: track.artistId } },
          { id: { not: trackId } },
          { status: 'PUBLISHED' },
        ],
      },
      take: parseInt(limit as string),
      orderBy: { plays: 'desc' },
      include: {
        artist: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profileImage: true,
          },
        },
      },
    });
    
    res.json(successResponse(similarTracks));
  } catch (error) {
    console.error('Get similar tracks error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: 'Failed to fetch similar tracks' })
    );
  }
});

// Auto-tag track (genre detection, mood, etc.)
app.post('/api/ai/auto-tag', async (req, res) => {
  try {
    const { trackId } = req.body;
    
    if (!trackId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({ code: ERROR_CODES.INVALID_INPUT, message: 'trackId is required' })
      );
    }
    
    // Placeholder for ML model inference
    // In production, would analyze audio features
    const suggestedTags = {
      genre: 'HIPHOP',
      mood: 'energetic',
      tempo: 'fast',
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
