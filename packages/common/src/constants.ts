import { RealmTier, TierFeatures } from './types';

// Realm theme colors
export const REALM_COLORS = {
  INFERNO: '#000000', // infernoDark
  PURGATORIO: '#C7C7C7', // purgatorioGray
  PARADISO: '#FFFFFF', // paradisoWhite
} as const;

// Subscription tier configurations
export const TIER_CONFIG: Record<RealmTier, TierFeatures> = {
  [RealmTier.FREE]: {
    tier: RealmTier.FREE,
    price: 0,
    features: [
      'Basic streaming',
      '480p quality',
      'Limited storage',
      'Community features',
    ],
    limits: {
      uploadSize: 100 * 1024 * 1024, // 100MB
      streamDuration: 3600, // 1 hour
      storageLimit: 1024 * 1024 * 1024, // 1GB
    },
  },
  [RealmTier.INFERNO]: {
    tier: RealmTier.INFERNO,
    price: 999, // $9.99
    features: [
      'HD streaming (1080p)',
      'Extended storage',
      'No ads',
      'Priority support',
      'Custom emotes',
    ],
    limits: {
      uploadSize: 500 * 1024 * 1024, // 500MB
      streamDuration: 14400, // 4 hours
      storageLimit: 10 * 1024 * 1024 * 1024, // 10GB
    },
  },
  [RealmTier.PURGATORIO]: {
    tier: RealmTier.PURGATORIO,
    price: 1999, // $19.99
    features: [
      '4K streaming',
      'Unlimited storage',
      'No ads',
      'Priority support',
      'Custom emotes',
      'Exclusive content',
      'Early access',
    ],
    limits: {
      uploadSize: 2 * 1024 * 1024 * 1024, // 2GB
      streamDuration: 28800, // 8 hours
      storageLimit: 50 * 1024 * 1024 * 1024, // 50GB
    },
  },
  [RealmTier.PARADISO]: {
    tier: RealmTier.PARADISO,
    price: 4999, // $49.99
    features: [
      '4K streaming',
      'Unlimited storage',
      'No ads',
      '24/7 priority support',
      'Custom emotes',
      'Exclusive content',
      'Early access',
      'Creator revenue share',
      'Verified badge',
    ],
    limits: {
      uploadSize: 10 * 1024 * 1024 * 1024, // 10GB
      streamDuration: -1, // Unlimited
      storageLimit: -1, // Unlimited
    },
  },
};

// API error codes
export const ERROR_CODES = {
  // Auth errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  
  // User errors
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  
  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // Payment errors
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  SUBSCRIPTION_EXPIRED: 'SUBSCRIPTION_EXPIRED',
  
  // Media errors
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  TRANSCODE_FAILED: 'TRANSCODE_FAILED',
  STREAM_OFFLINE: 'STREAM_OFFLINE',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // Server errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// JWT configuration
export const JWT_CONFIG = {
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
} as const;

// Media configuration
export const MEDIA_CONFIG = {
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/quicktime'],
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  THUMBNAIL_WIDTH: 1280,
  THUMBNAIL_HEIGHT: 720,
} as const;
