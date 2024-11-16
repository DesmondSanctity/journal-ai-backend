import { Env } from '../config/env';

export interface TranscriptionSession {
 sessionId: string;
 userId: string;
 audioKeys: string[];
 completedAt: string;
 createdAt: string;
}

export class DatabaseService {
 constructor(private readonly kv: KVNamespace) {}

 async createUser(userData: any) {
  const key = `user:${userData.id}`;
  await this.kv.put(key, JSON.stringify(userData));
  return userData;
 }

 async getUser(id: string) {
  const key = `user:${id}`;
  const user = await this.kv.get(key);
  return user ? JSON.parse(user) : null;
 }

 async createJournalEntry(userId: string, entry: any) {
  const entryId = crypto.randomUUID();
  const key = `journal:${userId}:${entryId}`;
  const data = {
   id: entryId,
   userId,
   ...entry,
   createdAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
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
  sessionId: string
 ): Promise<TranscriptionSession | null> {
  const sessions = await this.kv.list({ prefix: `transcription:${sessionId}` });
  const session = await this.kv.get(sessions.keys[0].name);
  return session ? JSON.parse(session) : null;
 }
}
