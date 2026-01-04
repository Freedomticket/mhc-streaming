import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { HTTP_STATUS, ERROR_CODES, errorResponse } from '@mhc/common';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Middleware to verify JWT token and check for ADMIN role
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        errorResponse({ code: ERROR_CODES.UNAUTHORIZED, message: 'No token provided' })
      );
    }

    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error('JWT_SECRET not configured');
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: 'Server configuration error' })
      );
    }

    // Verify token
    const decoded = jwt.verify(token, secret) as JWTPayload;

    // Check for ADMIN role
    if (decoded.role !== 'ADMIN') {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        errorResponse({ 
          code: ERROR_CODES.FORBIDDEN, 
          message: 'Admin access required' 
        })
      );
    }

    // Attach user to request
    req.user = decoded;
    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        errorResponse({ code: ERROR_CODES.UNAUTHORIZED, message: 'Invalid token' })
      );
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        errorResponse({ code: ERROR_CODES.UNAUTHORIZED, message: 'Token expired' })
      );
    }

    console.error('Auth middleware error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: 'Authentication failed' })
    );
  }
};
