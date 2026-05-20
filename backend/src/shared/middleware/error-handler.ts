import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors';
import { config } from '../../core/config';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        message: err.message,
        code: err.code,
      },
    });
    return;
  }

  console.error('[ERROR] Unhandled:', err);
  res.status(500).json({
    error: {
      message: config.isDev ? err.message : 'Internal server error',
      code: 'INTERNAL_ERROR',
    },
  });
}
