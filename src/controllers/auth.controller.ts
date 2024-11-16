import { Context } from 'hono';
import { AuthService } from '../services/auth.service';
import { successResponse } from '../utils/response.util';
import { LoginInput, RegisterInput } from '../models/types/auth.types';

export class AuthController {
 constructor(private authService: AuthService) {}

 async login(c: Context) {
  const input = c.get('validated') as LoginInput;
  const result = await this.authService.login(input);
  return c.json(successResponse(result));
 }

 async register(c: Context) {
  const input = c.get('validated') as RegisterInput;
  const result = await this.authService.register(input);
  return c.json(successResponse(result));
 }
}
