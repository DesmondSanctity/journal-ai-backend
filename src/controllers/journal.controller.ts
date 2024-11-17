import { Context } from 'hono';
import { JournalService } from '../services/journal.service';
import { successResponse } from '../utils/response.util';
import { JournalEntryInput } from '../models/types/journal.types';
import { AppError } from '../middleware/error.middleware';

export class JournalController {
 constructor(private journalService: JournalService) {}

 async createEntry(c: Context) {
  const input = c.get('validated') as JournalEntryInput;
  const userId = c.get('user').userId;

  if (!userId) {
   throw new AppError(401, 'User not authenticated', 'AUTH_REQUIRED');
  }

  if (!input.content) {
   throw new AppError(400, 'Journal content is required', 'INVALID_INPUT');
  }

  try {
   const result = await this.journalService.createEntry(userId, input);
   return c.json(successResponse(result));
  } catch (error) {
   throw new AppError(
    500,
    'Failed to create journal entry',
    'ENTRY_CREATE_FAILED'
   );
  }
 }

 async getEntries(c: Context) {
  const userId = c.get('user').userId;
  if (!userId) {
   throw new AppError(401, 'User not authenticated', 'AUTH_REQUIRED');
  }

  try {
   const entries = await this.journalService.getEntries(userId);
   return c.json(successResponse(entries));
  } catch (error) {
   throw new AppError(
    500,
    'Failed to fetch journal entries',
    'ENTRIES_FETCH_FAILED'
   );
  }
 }
}
