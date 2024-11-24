import { Context } from 'hono';
import { AuthService } from '../services/auth.service';
import { errorResponse, successResponse } from '../utils/response.util';
import { LoginInput, RegisterInput } from '../models/types/auth.types';
import { AppError } from '../middleware/error.middleware';

export class AuthController {
 constructor(private authService: AuthService) {}

 async login(c: Context) {
  const input = c.get('validated') as LoginInput;
  if (!input.email || !input.password) {
   throw new AppError(400, 'Email and password are required', 'INVALID_INPUT');
  }

  try {
   const result = await this.authService.login(input);
   return c.json(successResponse(result));
  } catch (error) {
   c.status(401);
   return c.json(errorResponse(401, 'Invalid credentials', 'AUTH_FAILED'));
  }
 }

 async register(c: Context) {
  const input = c.get('validated') as RegisterInput;
  if (!input.email || !input.password || !input.name) {
   return c.json(errorResponse(400, 'Missing required fields', 'INVALID_INPUT'));
  }

  try {
   const result = await this.authService.register(input);
   return c.json(successResponse(result));
  } catch (error) {
   c.status(500);
   return c.json(errorResponse(500, 'Registration failed', 'REGISTRATION_FAILED'));
  }
 }
}
