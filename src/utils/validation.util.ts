import { z } from 'zod';
import { Context, Next } from 'hono';
import { AppError } from '../middleware/error.middleware';

export const validateRequest = (schema: z.ZodSchema) => {
 return async (c: Context, next: Next) => {
  const body = await c.req.json();
  const result = schema.safeParse(body);

  if (!result.success) {
   throw new AppError(400, 'Validation failed', 'VALIDATION_ERROR');
  }

  c.set('validated', result.data);
  await next();
 };
};
