import { Context, Next } from 'hono';
import { Logger } from '../utils/logger.util';
import { StatusCode } from 'hono/utils/http-status';
import { errorResponse } from '../utils/response.util';

export class AppError extends Error {
 constructor(
  public code: number,
  public message: string,
  public status: string
 ) {
  super(message);
  this.name = 'AppError';
 }
}

export const errorHandler =
 (logger: Logger) => async (c: Context, next: Next) => {
  try {
   return await next();
  } catch (error) {
   if (error instanceof AppError) {
    logger.error('Application error', {
     message: error.message,
     status: error.status,
     path: c.req.path,
    });

    c.status(error.code as StatusCode);
    return c.json(errorResponse(error.code, error.message, error.status));
   }

   logger.error('Unhandled error', {
    message: (error as Error).message,
    path: c.req.path,
    method: c.req.method,
   });

   c.status(500);
   return  c.json(errorResponse(500, 'An unexpected error occurred', 'INTERNAL_ERROR'));
  }
 };
