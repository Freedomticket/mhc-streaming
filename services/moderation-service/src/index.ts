import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { prisma } from '@mhc/database';
import { successResponse, errorResponse, ERROR_CODES, HTTP_STATUS } from '@mhc/common';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3007;

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
    service: 'moderation-service',
    timestamp: new Date().toISOString() 
  });
});

// Report content
app.post('/api/moderation/report', async (req, res) => {
  try {
    const { reporterId, contentType, contentId, reason, description } = req.body;
    
    if (!reporterId || !contentType || !contentId || !reason) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({ code: ERROR_CODES.INVALID_INPUT, message: 'Missing required fields' })
      );
    }
    
    // Create report (simplified - in production would have Report model)
    console.log(`Content Report: ${contentType}/${contentId} by ${reporterId} - ${reason}`);
    
    res.json(successResponse({ 
      reported: true, 
      reportId: `report_${Date.now()}`,
      message: 'Report submitted successfully' 
    }));
  } catch (error) {
    console.error('Report content error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: 'Failed to submit report' })
    );
  }
});

// Get reports for moderation queue
app.get('/api/moderation/reports', async (req, res) => {
  try {
    const { status = 'PENDING', limit = '20' } = req.query;
    
    // In production, would query Report model
    res.json(successResponse({
      reports: [],
      total: 0,
      status,
    }));
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: 'Failed to fetch reports' })
    );
  }
});

// Take moderation action
app.post('/api/moderation/action', async (req, res) => {
  try {
    const { moderatorId, contentType, contentId, action, reason } = req.body;
    
    if (!moderatorId || !contentType || !contentId || !action) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({ code: ERROR_CODES.INVALID_INPUT, message: 'Missing required fields' })
      );
    }
    
    // Perform moderation action
    if (action === 'REMOVE' && contentType === 'VIDEO') {
      await prisma.video.update({
        where: { id: contentId },
        data: { status: 'REMOVED' },
      });
    }
    
    console.log(`Moderation Action: ${action} on ${contentType}/${contentId} by ${moderatorId}`);
    
    res.json(successResponse({ 
      action,
      contentType,
      contentId,
      message: 'Moderation action completed' 
    }));
  } catch (error) {
    console.error('Moderation action error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: 'Failed to perform moderation action' })
    );
  }
});

// Check content for violations (basic filter)
app.post('/api/moderation/check', async (req, res) => {
  try {
    const { contentType, content } = req.body;
    
    if (!contentType || !content) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({ code: ERROR_CODES.INVALID_INPUT, message: 'contentType and content are required' })
      );
    }
    
    // Basic profanity/spam check (simplified)
    const flaggedWords = ['spam', 'scam', 'hack'];
    const violations = flaggedWords.filter(word => 
      content.toLowerCase().includes(word)
    );
    
    res.json(successResponse({
      safe: violations.length === 0,
      violations,
      confidence: violations.length === 0 ? 0.99 : 0.75,
    }));
  } catch (error) {
    console.error('Content check error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: 'Failed to check content' })
    );
  }
});

app.listen(PORT, () => {
  console.log(`🛡️ Moderation service running on port ${PORT}`);
});
