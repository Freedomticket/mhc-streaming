import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { prisma } from '@mhc/database';
import { successResponse, errorResponse, HTTP_STATUS } from '@mhc/common';
import streamRoutes from './routes/streams';
import { errorHandler } from './middleware/errorHandler';
import { initStreamManager } from './services/streamManager';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
}

const app = express();
const PORT = process.env.PORT || 3003;
const RTMP_PORT = process.env.RTMP_PORT || 1935;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
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
    rtmp_port: RTMP_PORT,
    timestamp: new Date().toISOString() 
  });
});

// Routes
app.use('/api/streams', streamRoutes);

// Error handler
app.use(errorHandler);

// Initialize stream manager (RTMP server)
const streamManager = initStreamManager(Number(RTMP_PORT));

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing stream manager...');
  await streamManager.close();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing stream manager...');
  await streamManager.close();
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`📡 Stream service running on port ${PORT}`);
  console.log(`🎥 RTMP server listening on port ${RTMP_PORT}`);
});
