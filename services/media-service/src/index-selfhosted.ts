import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import helmet from 'helmet';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { prisma } from '@mhc/database';
import { successResponse, errorResponse, ERROR_CODES, HTTP_STATUS, randomString, sanitizeFilename, authenticateToken, AuthRequest } from '@mhc/common';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Create upload directories
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');
const MEDIA_DIR = process.env.MEDIA_DIR || path.join(__dirname, '../../media');

[UPLOAD_DIR, MEDIA_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Use crypto for secure random filename
    const ext = path.extname(file.originalname);
    const hash = crypto.randomBytes(16).toString('hex');
    cb(null, `${hash}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only videos and images allowed.'));
    }
  },
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'media-service', timestamp: new Date().toISOString() });
});

// Upload video (PROTECTED - requires authentication)
app.post('/api/media/upload', authenticateToken, upload.single('video'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({ code: ERROR_CODES.INVALID_INPUT, message: 'No file uploaded' })
      );
    }

    const { title, description, isPremium, requiredTier } = req.body;

    const video = await prisma.video.create({
      data: {
        title,
        description,
        userId: req.user!.userId, // Use authenticated user's ID
        isPremium: isPremium === 'true',
        requiredTier: requiredTier || null,
        originalUrl: `/uploads/${req.file.filename}`,
        status: 'PROCESSING',
        fileSize: req.file.size,
      },
    });

    // Mark as ready (transcoding can be added later)
    await prisma.video.update({
      where: { id: video.id },
      data: {
        status: 'READY',
        processedUrl: `/uploads/${req.file.filename}`,
        publishedAt: new Date(),
      },
    });

    res.status(HTTP_STATUS.CREATED).json(successResponse(video));
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.UPLOAD_FAILED, message: 'Failed to upload video' })
    );
  }
});

// Get all videos
app.get('/api/media/videos', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where: { status: 'READY', publishedAt: { not: null } },
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
        orderBy: { publishedAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.video.count({ where: { status: 'READY', publishedAt: { not: null } } }),
    ]);

    res.json(successResponse({ videos, total, page: Number(page), limit: Number(limit) }));
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: 'Failed to fetch videos' })
    );
  }
});

// Get video by ID
app.get('/api/media/videos/:id', async (req, res) => {
  try {
    const video = await prisma.video.findUnique({
      where: { id: req.params.id },
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

    if (!video) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse({ code: ERROR_CODES.NOT_FOUND, message: 'Video not found' })
      );
    }

    res.json(successResponse(video));
  } catch (error) {
    console.error('Get video error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: 'Failed to fetch video' })
    );
  }
});

// Serve uploaded files
app.use('/uploads', express.static(UPLOAD_DIR));
app.use('/media', express.static(MEDIA_DIR));

app.listen(PORT, () => {
  console.log(`📹 Media service (self-hosted) running on port ${PORT}`);
  console.log(`Upload directory: ${UPLOAD_DIR}`);
  console.log(`Media directory: ${MEDIA_DIR}`);
});
