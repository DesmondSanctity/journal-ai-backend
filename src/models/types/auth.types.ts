import { z } from 'zod';

export const loginSchema = z.object({
 email: z.string().email(),
 password: z.string().min(6),
});

export const registerSchema = z.object({
 email: z.string().email(),
 password: z.string().min(6),
 name: z.string().min(2),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export interface UserPayload {
 id: string;
 email: string;
 role: 'user' | 'admin';
}

export interface LoginResponse {
 token: string;
 user: {
  id: string;
  email: string;
 };
}