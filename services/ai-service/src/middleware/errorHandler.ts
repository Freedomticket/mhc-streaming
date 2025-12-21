import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('AI Service Error:', err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'AI service error';

  res.status(status).json({
    success: false,
    error: {
      code: err.code || 'AI_ERROR',
      message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    }
  });
}
