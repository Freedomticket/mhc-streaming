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
      where: { status: 'LIVE' },
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
      orderBy: { viewCount: 'desc' },
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
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            role: true,
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
    const { userId, title, description, thumbnail } = req.body;
    
    if (!userId || !title) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({ code: ERROR_CODES.INVALID_INPUT, message: 'userId and title are required' })
      );
    }
    
    // Check if user already has an active stream
    const existingStream = await prisma.stream.findFirst({
      where: { 
        userId,
        status: 'LIVE',
      },
    });
    
    if (existingStream) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({ code: ERROR_CODES.INVALID_INPUT, message: 'You already have an active stream' })
      );
    }
    
    // Generate a unique stream key
    const streamKey = `stream_${userId}_${Date.now()}`;
    
    const stream = await prisma.stream.create({
      data: {
        userId,
        title,
        description: description || null,
        thumbnail: thumbnail || null,
        streamKey,
        status: 'LIVE',
        startedAt: new Date(),
      },
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
        status: 'ENDED',
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
    const { viewCount } = req.body;
    
    if (typeof viewCount !== 'number') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({ code: ERROR_CODES.INVALID_INPUT, message: 'viewCount must be a number' })
      );
    }
    
    const stream = await prisma.stream.update({
      where: { id: streamId },
      data: { viewCount },
    });
    
    res.json(successResponse(stream));
  } catch (error) {
    console.error('Update viewer count error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: 'Failed to update viewer count' })
    );
  }
});

// Get stream history for user
app.get('/api/streams/user/:userId/history', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = '10' } = req.query;
    
    const streams = await prisma.stream.findMany({
      where: { 
        userId,
        status: { in: ['ENDED', 'ARCHIVED'] },
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
