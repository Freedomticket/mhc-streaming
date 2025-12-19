import { z } from 'zod';

// User validation schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  password: z
    .string()
    .min(12, 'Password must be at least 12 characters')
    .max(128, 'Password must be at most 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  displayName: z.string().min(1).max(50).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
});

// Stream validation schemas
export const createStreamSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(1000).optional(),
  scheduledFor: z.string().datetime().optional(),
  isPremium: z.boolean().default(false),
  requiredTier: z.enum(['INFERNO', 'PURGATORIO', 'PARADISO']).optional(),
});

export const updateStreamSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional(),
  thumbnail: z.string().url().optional(),
  scheduledFor: z.string().datetime().optional(),
  isPremium: z.boolean().optional(),
  requiredTier: z.enum(['INFERNO', 'PURGATORIO', 'PARADISO']).optional(),
});

// Video validation schemas
export const createVideoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(1000).optional(),
  isPremium: z.boolean().default(false),
  requiredTier: z.enum(['INFERNO', 'PURGATORIO', 'PARADISO']).optional(),
});

export const updateVideoSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional(),
  thumbnail: z.string().url().optional(),
  isPremium: z.boolean().optional(),
  requiredTier: z.enum(['INFERNO', 'PURGATORIO', 'PARADISO']).optional(),
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ID parameter schema
export const idParamSchema = z.object({
  id: z.string().min(1, 'ID is required'),
});
