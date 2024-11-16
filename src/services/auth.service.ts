import { sign } from 'hono/jwt';
import { Env } from '../config/env';
import {
 LoginInput,
 LoginResponse,
 RegisterInput,
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

  const token = await sign(
   { id: user.id, email: user.email, role: user.role },
   this.env.JWT_SECRET
  );

  return {
   token,
   user: {
    id: user.id,
    email: user.email,
   },
  };
 }

 async register(input: RegisterInput): Promise<LoginResponse> {
  const userData = {
   id: crypto.randomUUID(),
   email: input.email,
   role: 'user',
  };

  await this.db.createUser(userData);
  const token = await sign(userData, this.env.JWT_SECRET);

  return {
   token,
   user: {
    id: userData.id,
    email: userData.email,
   },
  };
 }
}
