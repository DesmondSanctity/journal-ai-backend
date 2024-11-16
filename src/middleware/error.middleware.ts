import { Context, Next } from 'hono';
import { Logger } from '../utils/logger.util';
import { StatusCode } from 'hono/utils/http-status';

export class AppError extends Error {
 constructor(
  public statusCode: number,
  public message: string,
  public code?: string
 ) {
  super(message);
  this.name = 'AppError';
 }
}

export const errorHandler =
 (logger: Logger) => async (c: Context, next: Next) => {
  try {
   await next();
  } catch (error) {
   if (error instanceof AppError) {
    logger.error('Application error', error, {
     code: error.code,
     path: c.req.path,
    });

    return c.json(
     {
      success: false,
      error: {
       code: error.code || 'ERROR',
       message: error.message,
      },
     },
     error.statusCode as StatusCode
    );
   }

   logger.error('Unhandled error', error as Error, {
    path: c.req.path,
    method: c.req.method,
   });

   return c.json(
    {
     success: false,
     error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
     },
    },
    500
   );
  }
 };
