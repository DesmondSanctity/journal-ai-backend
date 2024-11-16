import { Hono } from 'hono';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../utils/validation.util';
import { loginSchema, registerSchema } from '../models/types/auth.types';

export const createAuthRouter = (controller: AuthController) => {
 const router = new Hono();

 router.post('/login', validateRequest(loginSchema), (c) =>
  controller.login(c)
 );
 router.post('/register', validateRequest(registerSchema), (c) =>
  controller.register(c)
 );

 return router;
};
