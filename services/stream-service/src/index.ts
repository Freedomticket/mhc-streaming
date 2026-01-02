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
  res.json({ 
    status: 'ok', 
    service: 'stream-service',
    timestamp: new Date().toISOString() 
  });
});

// Get all active streams
app.get('/api/streams', async (req, res) => {
  try {
    const streams = await prisma.stream.findMany({
      where: { isLive: true },
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
      orderBy: { viewerCount: 'desc' },
    });
    
    res.json(successResponse(streams));
  } catch (error) {
    console.error('Get streams error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: 'Failed to fetch streams' })
    );
  }
});

// Get stream by ID
app.get('/api/streams/:streamId', async (req, res) => {
  try {
    const { streamId } = req.params;
    
    const stream = await prisma.stream.findUnique({
      where: { id: streamId },
      include: {
        artist: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profileImage: true,
            tier: true,
          },
        },
      },
    });
    
    if (!stream) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse({ code: ERROR_CODES.NOT_FOUND, message: 'Stream not found' })
      );
    }
    
    res.json(successResponse(stream));
  } catch (error) {
    console.error('Get stream error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: 'Failed to fetch stream' })
    );
  }
});

// Start a stream
app.post('/api/streams/start', async (req, res) => {
  try {
    const { artistId, title, category, thumbnailUrl } = req.body;
    
    if (!artistId || !title) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({ code: ERROR_CODES.INVALID_INPUT, message: 'artistId and title are required' })
      );
    }
    
    // Check if artist already has an active stream
    const existingStream = await prisma.stream.findFirst({
      where: { 
        artistId,
        isLive: true,
      },
    });
    
    if (existingStream) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({ code: ERROR_CODES.INVALID_INPUT, message: 'You already have an active stream' })
      );
    }
    
    const stream = await prisma.stream.create({
      data: {
        artistId,
        title,
        category: category || 'MUSIC',
        thumbnailUrl: thumbnailUrl || null,
        isLive: true,
        viewerCount: 0,
        startedAt: new Date(),
      },
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
    
    res.json(successResponse(stream));
  } catch (error) {
    console.error('Start stream error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: 'Failed to start stream' })
    );
  }
});

// End a stream
app.post('/api/streams/:streamId/end', async (req, res) => {
  try {
    const { streamId } = req.params;
    
    const stream = await prisma.stream.findUnique({
      where: { id: streamId },
    });
    
    if (!stream) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse({ code: ERROR_CODES.NOT_FOUND, message: 'Stream not found' })
      );
    }
    
    const updatedStream = await prisma.stream.update({
      where: { id: streamId },
      data: {
        isLive: false,
        endedAt: new Date(),
      },
    });
    
    res.json(successResponse(updatedStream));
  } catch (error) {
    console.error('End stream error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: 'Failed to end stream' })
    );
  }
});

// Update viewer count
app.patch('/api/streams/:streamId/viewers', async (req, res) => {
  try {
    const { streamId } = req.params;
    const { viewerCount } = req.body;
    
    if (typeof viewerCount !== 'number') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({ code: ERROR_CODES.INVALID_INPUT, message: 'viewerCount must be a number' })
      );
    }
    
    const stream = await prisma.stream.update({
      where: { id: streamId },
      data: { viewerCount },
    });
    
    res.json(successResponse(stream));
  } catch (error) {
    console.error('Update viewer count error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: 'Failed to update viewer count' })
    );
  }
});

// Get stream history for artist
app.get('/api/streams/artist/:artistId/history', async (req, res) => {
  try {
    const { artistId } = req.params;
    const { limit = '10' } = req.query;
    
    const streams = await prisma.stream.findMany({
      where: { 
        artistId,
        isLive: false,
      },
      orderBy: { startedAt: 'desc' },
      take: parseInt(limit as string),
    });
    
    res.json(successResponse(streams));
  } catch (error) {
    console.error('Get stream history error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: 'Failed to fetch stream history' })
    );
  }
});

app.listen(PORT, () => {
  console.log(`📺 Stream service running on port ${PORT}`);
});
