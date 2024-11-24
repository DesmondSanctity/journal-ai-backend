import { Context, Next } from 'hono';
import { verify } from 'hono/jwt';
import { AppError } from './error.middleware';

export async function authMiddleware(c: Context, next: Next) {
 const authHeader = c.req.header('Authorization');

 if (!authHeader || !authHeader.startsWith('Bearer ')) {
  c.status(401);
  return c.json({
   status: 'error',
   message: 'Unauthorized',
   code: 'AUTH_REQUIRED',
  });
 }

 const token = authHeader.split(' ')[1];

 try {
  const payload = await verify(token, c.env.JWT_SECRET);
  c.set('user', payload);
  await next();
 } catch (error) {
  c.status(401);
  return c.json({
   status: 'error',
   message: 'Invalid token',
   code: 'INVALID_TOKEN',
  });
 }
}
