// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface ResponseMeta {
  timestamp: string;
  requestId?: string;
  page?: number;
  limit?: number;
  total?: number;
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Auth types
export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Stream types
export interface StreamConfig {
  rtmpUrl: string;
  streamKey: string;
  hlsUrl?: string;
}

// Media types
export interface MediaUploadResult {
  url: string;
  key: string;
  size: number;
  mimeType: string;
}

export interface VideoTranscodeJob {
  videoId: string;
  inputUrl: string;
  outputBucket: string;
  presets: string[];
}

// Subscription tiers with realm theming
export enum RealmTier {
  FREE = 'FREE',
  INFERNO = 'INFERNO',
  PURGATORIO = 'PURGATORIO',
  PARADISO = 'PARADISO',
}

export interface TierFeatures {
  tier: RealmTier;
  price: number;
  features: string[];
  limits: {
    uploadSize: number;
    streamDuration: number;
    storageLimit: number;
  };
}
