import { Request, Response, NextFunction } from 'express';
import { errorResponse, HTTP_STATUS } from '@mhc/common';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', err);

  const status = err.status || err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = err.message || 'Internal server error';

  res.status(status).json(
    errorResponse({
      code: err.code || 'INTERNAL_ERROR',
      message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    })
  );
}
