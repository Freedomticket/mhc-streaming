import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Service URLs
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const MEDIA_SERVICE_URL = process.env.MEDIA_SERVICE_URL || 'http://localhost:3002';
const STREAM_SERVICE_URL = process.env.STREAM_SERVICE_URL || 'http://localhost:3003';
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:3004';
const ANALYTICS_SERVICE_URL = process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3005';

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    services: {
      auth: AUTH_SERVICE_URL,
      media: MEDIA_SERVICE_URL,
      stream: STREAM_SERVICE_URL,
      payment: PAYMENT_SERVICE_URL,
      analytics: ANALYTICS_SERVICE_URL,
    },
  });
});

// Proxy routes
app.use(
  '/api/auth',
  createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    onError: (err, req, res) => {
      console.error('Auth service proxy error:', err);
      res.status(503).json({
        success: false,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Auth service is currently unavailable',
        },
      });
    },
  })
);

app.use(
  '/api/media',
  createProxyMiddleware({
    target: MEDIA_SERVICE_URL,
    changeOrigin: true,
    onError: (err, req, res) => {
      console.error('Media service proxy error:', err);
      res.status(503).json({
        success: false,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Media service is currently unavailable',
        },
      });
    },
  })
);

app.use(
  '/api/streams',
  createProxyMiddleware({
    target: STREAM_SERVICE_URL,
    changeOrigin: true,
    onError: (err, req, res) => {
      console.error('Stream service proxy error:', err);
      res.status(503).json({
        success: false,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Stream service is currently unavailable',
        },
      });
    },
  })
);

app.use(
  '/api/payments',
  createProxyMiddleware({
    target: PAYMENT_SERVICE_URL,
    changeOrigin: true,
    onError: (err, req, res) => {
      console.error('Payment service proxy error:', err);
      res.status(503).json({
        success: false,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Payment service is currently unavailable',
        },
      });
    },
  })
);

app.use(
  '/api/analytics',
  createProxyMiddleware({
    target: ANALYTICS_SERVICE_URL,
    changeOrigin: true,
    onError: (err, req, res) => {
      console.error('Analytics service proxy error:', err);
      res.status(503).json({
        success: false,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Analytics service is currently unavailable',
        },
      });
    },
  })
);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
    },
  });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚪 API Gateway running on port ${PORT}`);
  console.log(`Routing to services:`);
  console.log(`  - Auth: ${AUTH_SERVICE_URL}`);
  console.log(`  - Media: ${MEDIA_SERVICE_URL}`);
  console.log(`  - Stream: ${STREAM_SERVICE_URL}`);
  console.log(`  - Payment: ${PAYMENT_SERVICE_URL}`);
  console.log(`  - Analytics: ${ANALYTICS_SERVICE_URL}`);
});
