import { Context } from 'hono';
import { JournalService } from '../services/journal.service';
import { successResponse } from '../utils/response.util';
import { JournalEntryInput } from '../models/types/journal.types';

export class JournalController {
 constructor(private journalService: JournalService) {}

 async createEntry(c: Context) {
  const input = c.get('validated') as JournalEntryInput;
  const userId = c.get('userId'); // From auth middleware
  const result = await this.journalService.createEntry(userId, input);
  return c.json(successResponse(result));
 }

 async getEntries(c: Context) {
  const userId = c.get('userId');
  const entries = await this.journalService.getEntries(userId);
  return c.json(successResponse(entries));
 }
}
