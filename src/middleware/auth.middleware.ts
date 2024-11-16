import { Context, Next } from 'hono';
import { verify } from 'hono/jwt';
import { AppError } from './error.middleware';

export async function authMiddleware(c: Context, next: Next) {
 const authHeader = c.req.header('Authorization');

 if (!authHeader || !authHeader.startsWith('Bearer ')) {
  throw new AppError(401, 'Unauthorized', 'AUTH_REQUIRED');
 }

 const token = authHeader.split(' ')[1];

 try {
  const payload = await verify(token, c.env.JWT_SECRET);
  c.set('user', payload);
  await next();
 } catch (error) {
  throw new AppError(401, 'Invalid token', 'INVALID_TOKEN');
 }
}
