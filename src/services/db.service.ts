import { Env } from '../config/env';

export interface TranscriptionSession {
 sessionId: string;
 userId: string;
 audioKeys: string[];
 completedAt: string;
 createdAt: string;
}

interface TranscriptionData extends TranscriptionSession {
 transcript?: string;
 summary?: string;
}

interface User {
 id: string;
 email: string;
 name: string;
 password: string;
 role: 'user' | 'admin';
 createdAt: string;
}

export class DatabaseService {
 constructor(private readonly kv: KVNamespace) {}

 async createUser(userData: any) {
  const key = `user:${userData.email}`;
  await this.kv.put(key, JSON.stringify(userData));
  return userData;
 }

 async getUser(email: string) {
  const key = `user:${email}`;
  const user = await this.kv.get(key);
  return user ? (JSON.parse(user) as User) : null;
 }

 async updateUser(email: string, updates: Partial<User>) {
  const user = await this.getUser(email);
  if (!user) return null;

  const updatedUser = { ...user, ...updates };
  const key = `user:${email}`;
  await this.kv.put(key, JSON.stringify(updatedUser));
  return updatedUser;
 }

 async createJournalEntry(userId: string, entry: any) {
  const entryId = crypto.randomUUID();
  const key = `journal:${userId}:${entryId}`;
  const data = {
   id: entryId,
   user: userId,
   ...entry,
  };
  await this.kv.put(key, JSON.stringify(data));
  return data;
 }

 async getUserEntries(userId: string) {
  const entries = await this.kv.list({ prefix: `journal:${userId}:` });
  const promises = entries.keys.map(({ name }) => this.kv.get(name));
  const results = await Promise.all(promises);
  return results
   .map((entry) => (entry ? JSON.parse(entry) : null))
   .filter(Boolean);
 }

 async createTranscriptionSession(session: TranscriptionSession) {
  const key = `transcription:${session.userId}:${session.sessionId}`;
  await this.kv.put(
   key,
   JSON.stringify({
    ...session,
   })
  );
  return session;
 }

 async getUserTranscriptions(userId: string) {
  const sessions = await this.kv.list({ prefix: `transcription:${userId}:` });
  const promises = sessions.keys.map(({ name }) => this.kv.get(name));
  const results = await Promise.all(promises);
  return results
   .map((session) => (session ? JSON.parse(session) : null))
   .filter(Boolean);
 }

 async getTranscriptionSession(
  sessionId: string,
  userId: string
 ): Promise<TranscriptionSession | null> {
  const sessions = await this.kv.list({
   prefix: `transcription:${userId}:${sessionId}`,
  });
  const session = await this.kv.get(sessions.keys[0].name);
  return session ? JSON.parse(session) : null;
 }
}
