import { sign } from 'hono/jwt';
import { Env } from '../config/env';
import {
 LoginInput,
 LoginResponse,
 RegisterInput,
 RegisterResponse,
} from '../models/types/auth.types';
import { AppError } from '../middleware/error.middleware';
import { DatabaseService } from './db.service';

export class AuthService {
 private db: DatabaseService;

 constructor(private readonly env: Env) {
  this.db = new DatabaseService(env.JOURNAL_KV);
 }

 async login(input: LoginInput): Promise<LoginResponse> {
  const user = await this.db.getUser(input.email);
  if (!user) {
   throw new AppError(401, 'Invalid credentials', 'AUTH_FAILED');
  }

  const isPasswordValid = await this.verifyPassword(
   input.password,
   user.password
  );
  if (!isPasswordValid) {
   throw new AppError(401, 'Invalid credentials', 'AUTH_FAILED');
  }

  const token = await sign(
   { userId: user.id, email: user.email, role: user.role },
   this.env.JWT_SECRET
  );

  return {
   token,
   user: {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
   },
  };
 }

 async register(input: RegisterInput): Promise<RegisterResponse> {
  const existingUser = await this.db.getUser(input.email);
  if (existingUser) {
   throw new AppError(409, 'Email already registered', 'EMAIL_EXISTS');
  }

  const hashedPassword = await this.hashPassword(input.password);

  const userData = {
   id: crypto.randomUUID(),
   email: input.email,
   name: input.name,
   password: hashedPassword,
   role: 'user',
   createdAt: new Date().toISOString(),
  };

  await this.db.createUser(userData);

  return {
   user: {
    email: userData.email,
    name: userData.name,
   },
  };
 }

 private async hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)));
 }

 private async verifyPassword(input: string, stored: string): Promise<boolean> {
  const hashedInput = await this.hashPassword(input);
  return hashedInput === stored;
 }
}
