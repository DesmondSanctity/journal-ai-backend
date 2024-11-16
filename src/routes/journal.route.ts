import { Hono } from 'hono';
import { JournalController } from '../controllers/journal.controller';
import { validateRequest } from '../utils/validation.util';
import { journalEntrySchema } from '../models/types/journal.types';
import { authMiddleware } from '../middleware/auth.middleware';
import { rateLimiter } from '../middleware/rate-limit.middleware';

export const createJournalRouter = (controller: JournalController) => {
 const router = new Hono();

 // Rate limit: 100 requests per 15 minutes
 router.use('*', rateLimiter(100, 15 * 60 * 1000));
 router.use('*', authMiddleware);

 router.get('/', (c) => controller.getEntries(c));
 router.post('/', validateRequest(journalEntrySchema), (c) =>
  controller.createEntry(c)
 );

 return router;
};
