import { Context } from 'hono';
import { AuthService } from '../services/auth.service';
import { successResponse } from '../utils/response.util';
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
   throw new AppError(401, 'Invalid credentials', 'AUTH_FAILED');
  }
 }

 async register(c: Context) {
  const input = c.get('validated') as RegisterInput;
  if (!input.email || !input.password || !input.name) {
   throw new AppError(400, 'Missing required fields', 'INVALID_INPUT');
  }

  try {
   const result = await this.authService.register(input);
   return c.json(successResponse(result));
  } catch (error) {
   if (error instanceof AppError && error.code === 'EMAIL_EXISTS') {
    throw error;
   }
   throw new AppError(500, 'Registration failed', 'REGISTRATION_FAILED');
  }
 }
}
