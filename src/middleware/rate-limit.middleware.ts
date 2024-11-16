import { Context, Next } from 'hono';
import { AppError } from './error.middleware';

export const rateLimiter = (requests: number, windowMs: number) => {
 return async (c: Context, next: Next) => {
  const ip = c.req.header('cf-connecting-ip') || 'unknown';
  const key = `ratelimit:${ip}`;

  const currentRequests = await c.env.JOURNAL_KV.get(key);
  const count = currentRequests ? parseInt(currentRequests) : 0;

  if (count >= requests) {
   throw new AppError(429, 'Too many requests', 'RATE_LIMIT_EXCEEDED');
  }

  await c.env.JOURNAL_KV.put(key, (count + 1).toString(), {
   expirationTtl: windowMs / 1000,
  });

  await next();
 };
};
