import { Context } from 'hono';
import { JournalService } from '../services/journal.service';
import { errorResponse, successResponse } from '../utils/response.util';
import { JournalEntryInput } from '../models/types/journal.types';
import { AppError } from '../middleware/error.middleware';

export class JournalController {
 constructor(private journalService: JournalService) {}

 async getEntries(c: Context) {
  const userId = c.get('user').userId;
  if (!userId) {
   throw new AppError(401, 'User not authenticated', 'AUTH_REQUIRED');
  }

  try {
   const entries = await this.journalService.getEntries(userId);
   return c.json(successResponse(entries));
  } catch (error) {
   return c.json(
    errorResponse(
     500,
     'Failed to fetch journal entries',
     'ENTRIES_FETCH_FAILED'
    )
   );
  }
 }

 async deleteEntry(c: Context) {
  const userId = c.get('user').userId;
  const entryId = c.req.param('entryId');
  if (!userId) {
   return c.json(errorResponse(401, 'User not authenticated', 'AUTH_REQUIRED'));
  }

  if (!entryId) {
   return c.json(errorResponse(400, 'Entry ID is required', 'INVALID_INPUT'));
  }

  try {
   await this.journalService.deleteEntry(userId, entryId);
   return c.json(successResponse({ success: true }));
  } catch (error) {
   return c.json(
    errorResponse(500, 'Failed to delete journal entry', 'ENTRY_DELETE_FAILED')
   );
  }
 }
}
