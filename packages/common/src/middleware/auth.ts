import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { errorResponse, ERROR_CODES, HTTP_STATUS } from '../index';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

/**
 * Middleware to authenticate JWT tokens
 * Verifies the token and attaches user info to request
 */
export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json(
      errorResponse({
        code: ERROR_CODES.UNAUTHORIZED,
        message: 'Access token required',
      })
    );
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET not configured');
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({
        code: ERROR_CODES.INTERNAL_ERROR,
        message: 'Authentication not configured',
      })
    );
  }

  try {
    const user = jwt.verify(token, secret) as any;
    req.user = {
      userId: user.userId,
      email: user.email,
      role: user.role,
    };
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        errorResponse({
          code: ERROR_CODES.TOKEN_EXPIRED,
          message: 'Token has expired',
        })
      );
    }
    
    return res.status(HTTP_STATUS.FORBIDDEN).json(
      errorResponse({
        code: ERROR_CODES.INVALID_TOKEN,
        message: 'Invalid or malformed token',
      })
    );
  }
}

/**
 * Middleware to require specific user roles
 * Must be used after authenticateToken
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        errorResponse({
          code: ERROR_CODES.UNAUTHORIZED,
          message: 'Authentication required',
        })
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        errorResponse({
          code: ERROR_CODES.FORBIDDEN,
          message: 'Insufficient permissions',
        })
      );
    }

    next();
  };
}

/**
 * Optional authentication - attaches user if token present, but doesn't require it
 */
export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(); // No token, continue without user
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return next(); // Not configured, continue without user
  }

  try {
    const user = jwt.verify(token, secret) as any;
    req.user = {
      userId: user.userId,
      email: user.email,
      role: user.role,
    };
  } catch (error) {
    // Invalid token, but we don't fail - just continue without user
  }

  next();
}
