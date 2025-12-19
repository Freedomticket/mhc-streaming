import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { prisma } from '@mhc/database';
import { registerSchema, loginSchema, successResponse, errorResponse, ERROR_CODES, HTTP_STATUS } from '@mhc/common';
import { hashPassword, comparePassword } from '../utils/password';
import { generateTokens, verifyRefreshToken, verifyAccessToken } from '../utils/jwt';

const router = Router();

// Rate limiters for auth endpoints
const strictAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json(
      errorResponse({
        code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
        message: 'Too many attempts from this IP, please try again after 15 minutes',
      })
    );
  },
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // More lenient for general endpoints
  standardHeaders: true,
  legacyHeaders: false,
});

// Register new user
router.post('/register', strictAuthLimiter, async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { username: validatedData.username },
        ],
      },
    });
    
    if (existingUser) {
      return res.status(HTTP_STATUS.CONFLICT).json(
        errorResponse({
          code: ERROR_CODES.USER_ALREADY_EXISTS,
          message: 'User with this email or username already exists',
        })
      );
    }
    
    // Hash password
    const passwordHash = await hashPassword(validatedData.password);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        username: validatedData.username,
        displayName: validatedData.displayName || validatedData.username,
        passwordHash,
        subscription: {
          create: {
            tier: 'FREE',
            status: 'ACTIVE',
          },
        },
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    });
    
    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    
    res.status(HTTP_STATUS.CREATED).json(
      successResponse({
        user,
        ...tokens,
      })
    );
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Validation failed',
          details: error.errors,
        })
      );
    }
    
    console.error('Registration error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({
        code: ERROR_CODES.INTERNAL_ERROR,
        message: 'Failed to register user',
      })
    );
  }
});

// Login
router.post('/login', strictAuthLimiter, async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatar: true,
        role: true,
        passwordHash: true,
      },
    });
    
    if (!user || !user.passwordHash) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        errorResponse({
          code: ERROR_CODES.INVALID_CREDENTIALS,
          message: 'Invalid email or password',
        })
      );
    }
    
    // Verify password
    const isValidPassword = await comparePassword(validatedData.password, user.passwordHash);
    
    if (!isValidPassword) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        errorResponse({
          code: ERROR_CODES.INVALID_CREDENTIALS,
          message: 'Invalid email or password',
        })
      );
    }
    
    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
    
    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    
    // Remove passwordHash from response
    const { passwordHash, ...userWithoutPassword } = user;
    
    res.json(
      successResponse({
        user: userWithoutPassword,
        ...tokens,
      })
    );
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Validation failed',
          details: error.errors,
        })
      );
    }
    
    console.error('Login error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({
        code: ERROR_CODES.INTERNAL_ERROR,
        message: 'Failed to login',
      })
    );
  }
});

// Refresh token
router.post('/refresh', generalLimiter, async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({
          code: ERROR_CODES.INVALID_INPUT,
          message: 'Refresh token is required',
        })
      );
    }
    
    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);
    
    // Generate new tokens
    const tokens = generateTokens({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    });
    
    res.json(successResponse(tokens));
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(HTTP_STATUS.UNAUTHORIZED).json(
      errorResponse({
        code: ERROR_CODES.INVALID_TOKEN,
        message: 'Invalid or expired refresh token',
      })
    );
  }
});

// Get current user
router.get('/me', generalLimiter, async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        errorResponse({
          code: ERROR_CODES.UNAUTHORIZED,
          message: 'No token provided',
        })
      );
    }
    
    const token = authHeader.substring(7);
    const payload = verifyRefreshToken(token);
    
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatar: true,
        bio: true,
        role: true,
        createdAt: true,
        subscription: {
          select: {
            tier: true,
            status: true,
          },
        },
      },
    });
    
    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse({
          code: ERROR_CODES.USER_NOT_FOUND,
          message: 'User not found',
        })
      );
    }
    
    res.json(successResponse(user));
  } catch (error) {
    console.error('Get user error:', error);
    res.status(HTTP_STATUS.UNAUTHORIZED).json(
      errorResponse({
        code: ERROR_CODES.INVALID_TOKEN,
        message: 'Invalid or expired token',
      })
    );
  }
});

export default router;
