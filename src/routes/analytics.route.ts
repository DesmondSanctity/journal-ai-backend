import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.middleware';
import { rateLimiter } from '../middleware/rate-limit.middleware';
import { AnalyticsController } from '../controllers/analytics.controller';

export const createAnalyticsRouter = (controller: AnalyticsController) => {
 const router = new Hono();

 // Rate limit: 100 requests per 15 minutes
 router.use('*', rateLimiter(100, 15 * 60 * 1000));
 router.use('*', authMiddleware);

 router.get('/', (c) => controller.getJournalAnalytics(c));

 return router;
};
