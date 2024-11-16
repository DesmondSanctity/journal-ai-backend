import { Env } from '../config/env';
import { DatabaseService } from './db.service';
import { JournalEntryInput } from '../models/types/journal.types';

export class JournalService {
 private db: DatabaseService;

 constructor(private readonly env: Env) {
  this.db = new DatabaseService(env.JOURNAL_KV);
 }

 async createEntry(userId: string, entry: JournalEntryInput) {
  const journalEntry = await this.db.createJournalEntry(userId, {
   ...entry,
   status: 'active',
   updatedAt: new Date().toISOString(),
  });

  return journalEntry;
 }

 async getEntries(userId: string) {
  const entries = await this.db.getUserEntries(userId);
  return entries.sort(
   (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
 }
}
