import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { errorHandler } from './middleware/errorHandler';
import recommendationRoutes from './routes/recommendations';
import moderationRoutes from './routes/moderation';
import generationRoutes from './routes/generation';
import discoveryRoutes from './routes/discovery';
import analyticsRoutes from './routes/analytics';
import { initRecommendationEngine } from './services/recommendationEngine';
import { initModerationEngine } from './services/moderationEngine';

dotenv.config({ path: path.resolve(__dirname, '../.env') });
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
}

const app = express();
const PORT = process.env.PORT || 3008;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'ai-service',
    engines: {
      recommendations: 'active',
      moderation: 'active',
      generation: 'active',
      discovery: 'active'
    },
    timestamp: new Date().toISOString() 
  });
});

// Routes
app.use('/api/ai/recommendations', recommendationRoutes);
app.use('/api/ai/moderation', moderationRoutes);
app.use('/api/ai/generation', generationRoutes);
app.use('/api/ai/discovery', discoveryRoutes);
app.use('/api/ai/analytics', analyticsRoutes);

// Error handler
app.use(errorHandler);

// Initialize AI engines
async function initializeEngines() {
  console.log('🤖 Initializing AI engines...');
  await initRecommendationEngine();
  await initModerationEngine();
  console.log('✅ All AI engines initialized');
}

// Start server
app.listen(PORT, async () => {
  console.log(`🤖 AI service running on port ${PORT}`);
  await initializeEngines();
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});
