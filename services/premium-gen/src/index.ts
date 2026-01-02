import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { prisma } from '@mhc/database';
import { successResponse, errorResponse, ERROR_CODES, HTTP_STATUS } from '@mhc/common';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3011;

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
    service: 'premium-gen-service',
    timestamp: new Date().toISOString() 
  });
});

// Generate album artwork using AI
app.post('/api/premium/generate/artwork', async (req, res) => {
  try {
    const { artistId, prompt, style, dimensions } = req.body;
    
    if (!artistId || !prompt) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({ code: ERROR_CODES.INVALID_INPUT, message: 'artistId and prompt are required' })
      );
    }
    
    // Mock AI generation (in production, integrate with DALL-E, Midjourney, etc.)
    const artwork = {
      id: `artwork_${Date.now()}`,
      artistId,
      prompt,
      style: style || 'realistic',
      dimensions: dimensions || '1024x1024',
      url: `https://placeholder.com/artwork_${Date.now()}.png`,
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
    };
    
    console.log('Generated artwork:', artwork);
    
    res.json(successResponse(artwork));
  } catch (error) {
    console.error('Generate artwork error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: 'Failed to generate artwork' })
    );
  }
});

// Generate promotional content
app.post('/api/premium/generate/promo', async (req, res) => {
  try {
    const { artistId, trackId, type } = req.body;
    
    if (!artistId || !trackId || !type) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({ code: ERROR_CODES.INVALID_INPUT, message: 'artistId, trackId, and type are required' })
      );
    }
    
    const track = await prisma.track.findUnique({
      where: { id: trackId },
      include: { artist: true },
    });
    
    if (!track) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse({ code: ERROR_CODES.NOT_FOUND, message: 'Track not found' })
      );
    }
    
    // Generate promo content based on type
    let content = '';
    switch (type) {
      case 'social_post':
        content = `🎵 New track alert! "${track.title}" by ${track.artist.displayName} is now live! Check it out on MHC Streaming 🔥`;
        break;
      case 'email':
        content = `Hey fans! ${track.artist.displayName} just dropped a new track: "${track.title}". Stream it now!`;
        break;
      case 'press_release':
        content = `${track.artist.displayName} releases new single "${track.title}" - Available now on MHC Streaming platform.`;
        break;
      default:
        content = `Check out "${track.title}" by ${track.artist.displayName}!`;
    }
    
    res.json(successResponse({
      trackId,
      type,
      content,
      generatedAt: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Generate promo error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: 'Failed to generate promo content' })
    );
  }
});

// Generate track description using AI
app.post('/api/premium/generate/description', async (req, res) => {
  try {
    const { trackId, keywords } = req.body;
    
    if (!trackId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({ code: ERROR_CODES.INVALID_INPUT, message: 'trackId is required' })
      );
    }
    
    const track = await prisma.track.findUnique({
      where: { id: trackId },
      include: { artist: true },
    });
    
    if (!track) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse({ code: ERROR_CODES.NOT_FOUND, message: 'Track not found' })
      );
    }
    
    // Mock AI-generated description
    const description = `"${track.title}" is a ${track.genre.toLowerCase()} track by ${track.artist.displayName} that showcases their unique sound and artistic vision. ${keywords ? `Featuring elements of ${keywords.join(', ')}.` : ''}`;
    
    res.json(successResponse({
      trackId,
      description,
      generatedAt: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Generate description error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: 'Failed to generate description' })
    );
  }
});

// Get generation history for artist
app.get('/api/premium/history/:artistId', async (req, res) => {
  try {
    const { artistId } = req.params;
    const { limit = '20' } = req.query;
    
    // In production, query Generation model
    res.json(successResponse({
      artistId,
      generations: [],
      limit: parseInt(limit as string),
    }));
  } catch (error) {
    console.error('Get generation history error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: 'Failed to fetch generation history' })
    );
  }
});

app.listen(PORT, () => {
  console.log(`✨ Premium-Gen service running on port ${PORT}`);
});
