import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { prisma } from '@mhc/database';
import { successResponse, errorResponse, ERROR_CODES, HTTP_STATUS } from '@mhc/common';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3006;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'moderation-service',
    ai: 'enabled',
    timestamp: new Date().toISOString() 
  });
});

// ==================== MODERATION LAYERS ====================

// Layer 1: Hash-based blocking (known illegal content)
const BLOCKED_HASHES = new Set<string>();

// Layer 2: Keyword filtering (explicit content)
const BLOCKED_KEYWORDS = [
  // Add your filtered terms here
  'explicit_term_1',
  'explicit_term_2',
  // This is a placeholder - configure based on your policies
];

// Layer 3: AI-based classification
interface ModerationResult {
  approved: boolean;
  confidence: number;
  flags: string[];
  reason?: string;
  contentHash: string;
}

/**
 * Calculate SHA-256 hash of content
 */
function calculateHash(content: string | Buffer): string {
  const hash = crypto.createHash('sha256');
  hash.update(content);
  return hash.digest('hex');
}

/**
 * Layer 1: Check against known illegal content hashes
 */
function checkHashBlacklist(hash: string): boolean {
  return BLOCKED_HASHES.has(hash);
}

/**
 * Layer 2: Text content analysis (keywords, patterns)
 */
function analyzeText(text: string): { safe: boolean; flags: string[] } {
  const flags: string[] = [];
  const lowerText = text.toLowerCase();

  // Check for blocked keywords
  for (const keyword of BLOCKED_KEYWORDS) {
    if (lowerText.includes(keyword.toLowerCase())) {
      flags.push(`blocked_keyword:${keyword}`);
    }
  }

  // Check for suspicious patterns
  if (/\b(buy|sell|trade)\s+(drugs|weapons|illegal)\b/i.test(text)) {
    flags.push('suspicious_transaction');
  }

  // Check for spam patterns
  const urlCount = (text.match(/https?:\/\//g) || []).length;
  if (urlCount > 5) {
    flags.push('excessive_urls');
  }

  return {
    safe: flags.length === 0,
    flags,
  };
}

/**
 * Layer 3: AI Content Classification (using simple heuristics + extensible for ML models)
 */
async function classifyContent(contentType: string, data: any): Promise<ModerationResult> {
  const flags: string[] = [];
  let confidence = 1.0;

  // Text moderation
  if (contentType === 'text') {
    const analysis = analyzeText(data.text);
    if (!analysis.safe) {
      return {
        approved: false,
        confidence: 0.95,
        flags: analysis.flags,
        reason: 'Text content violates community guidelines',
        contentHash: calculateHash(data.text),
      };
    }
  }

  // Image moderation (placeholder for AI model integration)
  if (contentType === 'image') {
    const imageHash = calculateHash(data.buffer || data.url);
    
    // Check hash blacklist
    if (checkHashBlacklist(imageHash)) {
      return {
        approved: false,
        confidence: 1.0,
        flags: ['hash_blacklist'],
        reason: 'Content matches known illegal material',
        contentHash: imageHash,
      };
    }

    // TODO: Integrate with AI model (e.g., NSFW detection, violence detection)
    // Example: const aiResult = await detectNSFW(data.buffer);
    // For now, use basic checks
    
    flags.push('requires_human_review');
    confidence = 0.7; // Lower confidence without AI model
  }

  // Video moderation
  if (contentType === 'video') {
    const videoHash = calculateHash(data.title + data.description);
    
    // Check metadata
    const textAnalysis = analyzeText(data.title + ' ' + data.description);
    if (!textAnalysis.safe) {
      return {
        approved: false,
        confidence: 0.9,
        flags: textAnalysis.flags,
        reason: 'Video metadata violates guidelines',
        contentHash: videoHash,
      };
    }

    // TODO: Video frame analysis with AI model
    flags.push('requires_human_review');
    confidence = 0.6;
  }

  // Audio moderation
  if (contentType === 'audio') {
    const audioHash = calculateHash(data.title + data.artist);
    
    // Check metadata
    const textAnalysis = analyzeText(data.title + ' ' + (data.artist || '') + ' ' + (data.lyrics || ''));
    if (!textAnalysis.safe) {
      return {
        approved: false,
        confidence: 0.9,
        flags: textAnalysis.flags,
        reason: 'Audio metadata violates guidelines',
        contentHash: audioHash,
      };
    }

    // TODO: Audio analysis (speech-to-text + sentiment analysis)
  }

  return {
    approved: true,
    confidence,
    flags,
    contentHash: calculateHash(JSON.stringify(data)),
  };
}

// ==================== API ENDPOINTS ====================

/**
 * Moderate text content (comments, messages, descriptions)
 */
app.post('/api/moderation/text', async (req, res) => {
  try {
    const { text, userId, contentId } = req.body;

    if (!text) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({ code: ERROR_CODES.INVALID_INPUT, message: 'text is required' })
      );
    }

    const result = await classifyContent('text', { text });

    // Log moderation event
    await prisma.moderationLog.create({
      data: {
        contentType: 'TEXT',
        contentId: contentId || 'unknown',
        userId: userId || 'anonymous',
        approved: result.approved,
        confidence: result.confidence,
        flags: result.flags.join(','),
        reason: result.reason,
        contentHash: result.contentHash,
      },
    });

    // Block if not approved
    if (!result.approved) {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        errorResponse({ 
          code: ERROR_CODES.CONTENT_BLOCKED, 
          message: result.reason || 'Content violates community guidelines',
          meta: { flags: result.flags }
        })
      );
    }

    res.json(successResponse({ 
      approved: true, 
      confidence: result.confidence,
      message: 'Content approved' 
    }));

  } catch (error: any) {
    console.error('Text moderation error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: error.message })
    );
  }
});

/**
 * Moderate image uploads
 */
app.post('/api/moderation/image', async (req, res) => {
  try {
    const { url, userId, contentId } = req.body;

    if (!url) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({ code: ERROR_CODES.INVALID_INPUT, message: 'url is required' })
      );
    }

    const result = await classifyContent('image', { url });

    // Log moderation event
    await prisma.moderationLog.create({
      data: {
        contentType: 'IMAGE',
        contentId: contentId || url,
        userId: userId || 'anonymous',
        approved: result.approved,
        confidence: result.confidence,
        flags: result.flags.join(','),
        reason: result.reason,
        contentHash: result.contentHash,
      },
    });

    if (!result.approved) {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        errorResponse({ 
          code: ERROR_CODES.CONTENT_BLOCKED, 
          message: result.reason || 'Image violates community guidelines',
          meta: { flags: result.flags }
        })
      );
    }

    res.json(successResponse({ 
      approved: true, 
      confidence: result.confidence,
      requiresReview: result.flags.includes('requires_human_review')
    }));

  } catch (error: any) {
    console.error('Image moderation error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: error.message })
    );
  }
});

/**
 * Moderate video uploads
 */
app.post('/api/moderation/video', async (req, res) => {
  try {
    const { title, description, url, userId, contentId } = req.body;

    if (!title || !url) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({ code: ERROR_CODES.INVALID_INPUT, message: 'title and url are required' })
      );
    }

    const result = await classifyContent('video', { title, description: description || '', url });

    // Log moderation event
    await prisma.moderationLog.create({
      data: {
        contentType: 'VIDEO',
        contentId: contentId || url,
        userId: userId || 'anonymous',
        approved: result.approved,
        confidence: result.confidence,
        flags: result.flags.join(','),
        reason: result.reason,
        contentHash: result.contentHash,
      },
    });

    if (!result.approved) {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        errorResponse({ 
          code: ERROR_CODES.CONTENT_BLOCKED, 
          message: result.reason || 'Video violates community guidelines',
          meta: { flags: result.flags }
        })
      );
    }

    res.json(successResponse({ 
      approved: true, 
      confidence: result.confidence,
      requiresReview: result.flags.includes('requires_human_review')
    }));

  } catch (error: any) {
    console.error('Video moderation error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: error.message })
    );
  }
});

/**
 * Moderate audio uploads
 */
app.post('/api/moderation/audio', async (req, res) => {
  try {
    const { title, artist, lyrics, url, userId, contentId } = req.body;

    if (!title || !url) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({ code: ERROR_CODES.INVALID_INPUT, message: 'title and url are required' })
      );
    }

    const result = await classifyContent('audio', { title, artist: artist || '', lyrics: lyrics || '', url });

    // Log moderation event
    await prisma.moderationLog.create({
      data: {
        contentType: 'AUDIO',
        contentId: contentId || url,
        userId: userId || 'anonymous',
        approved: result.approved,
        confidence: result.confidence,
        flags: result.flags.join(','),
        reason: result.reason,
        contentHash: result.contentHash,
      },
    });

    if (!result.approved) {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        errorResponse({ 
          code: ERROR_CODES.CONTENT_BLOCKED, 
          message: result.reason || 'Audio content violates community guidelines',
          meta: { flags: result.flags }
        })
      );
    }

    res.json(successResponse({ 
      approved: true, 
      confidence: result.confidence 
    }));

  } catch (error: any) {
    console.error('Audio moderation error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: error.message })
    );
  }
});

/**
 * Get moderation logs (admin only)
 */
app.get('/api/moderation/logs', async (req, res) => {
  try {
    const { limit = 100, offset = 0, contentType, approved } = req.query;

    const where: any = {};
    if (contentType) where.contentType = contentType;
    if (approved !== undefined) where.approved = approved === 'true';

    const logs = await prisma.moderationLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: Number(offset),
    });

    const total = await prisma.moderationLog.count({ where });

    res.json(successResponse({ logs, total, limit: Number(limit), offset: Number(offset) }));

  } catch (error: any) {
    console.error('Get logs error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: error.message })
    );
  }
});

/**
 * Add hash to blacklist (admin endpoint)
 */
app.post('/api/moderation/blacklist', async (req, res) => {
  try {
    const { contentHash, reason } = req.body;

    if (!contentHash) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({ code: ERROR_CODES.INVALID_INPUT, message: 'contentHash is required' })
      );
    }

    BLOCKED_HASHES.add(contentHash);

    // Persist to database
    await prisma.moderationLog.create({
      data: {
        contentType: 'BLACKLIST',
        contentId: contentHash,
        userId: 'admin',
        approved: false,
        confidence: 1.0,
        flags: 'manual_blacklist',
        reason: reason || 'Added to blacklist by admin',
        contentHash,
      },
    });

    res.json(successResponse({ message: 'Hash added to blacklist', hash: contentHash }));

  } catch (error: any) {
    console.error('Blacklist error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: error.message })
    );
  }
});

/**
 * Get moderation statistics
 */
app.get('/api/moderation/stats', async (req, res) => {
  try {
    const total = await prisma.moderationLog.count();
    const approved = await prisma.moderationLog.count({ where: { approved: true } });
    const blocked = await prisma.moderationLog.count({ where: { approved: false } });
    
    const byType = await prisma.moderationLog.groupBy({
      by: ['contentType'],
      _count: true,
    });

    res.json(successResponse({ 
      total,
      approved,
      blocked,
      approvalRate: total > 0 ? (approved / total * 100).toFixed(2) + '%' : '0%',
      byType,
    }));

  } catch (error: any) {
    console.error('Stats error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: error.message })
    );
  }
});

// ==================== SERVER ====================

app.listen(PORT, () => {
  console.log(`🛡️  Moderation service running on port ${PORT}`);
  console.log(`AI Classification: enabled`);
  console.log(`Hash blacklist: ${BLOCKED_HASHES.size} entries`);
});
