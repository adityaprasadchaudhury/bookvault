import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || (err instanceof ZodError ? 400 : 500);

  // Only log unexpected server errors (500+) to console.error
  if (statusCode >= 500) {
    console.error('[Internal Server Error]:', err.stack || err);
  }

  if (err instanceof ZodError) {
    const issues = err.issues || (err as any).errors || [];
    const messages = issues.map((e: any) => `${e.path?.join('.')}: ${e.message}`);
    res.status(400).json({
      success: false,
      error: messages[0] || 'Validation error',
      details: messages,
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
    return;
  }

  // Handle Prisma errors
  if (err.code === 'P2002') {
    res.status(409).json({
      success: false,
      error: 'A record with this information already exists.',
    });
    return;
  }

  const message =
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'An unexpected internal server error occurred.'
      : err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: message,
  });
};
