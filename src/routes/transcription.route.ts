import { Hono } from 'hono';
import { TranscriptionController } from '../controllers/transcription.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { rateLimiter } from '../middleware/rate-limit.middleware';

export const createTranscriptionRouter = (
 controller: TranscriptionController
) => {
 const router = new Hono();

 // Rate limit: 100 requests per 15 minutes
 router.use('*', rateLimiter(100, 15 * 60 * 1000));
 router.use('*', authMiddleware);

 router.get('/sessions/:userId', (c) => controller.getUserSessions(c));
 router.get('/sessions/:sessionId/audio', (c) => controller.getSessionAudio(c));
 router.get('/ws', (c) => controller.startWebSocket(c));

 return router;
};
