import { Request, Response, NextFunction } from 'express';
import { errorResponse, ERROR_CODES, HTTP_STATUS } from '@mhc/common';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('Error:', err);
  
  res.status(err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
    errorResponse({
      code: err.code || ERROR_CODES.INTERNAL_ERROR,
      message: err.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    })
  );
}
