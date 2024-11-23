import { Hono } from 'hono';
import { Env } from '../config/env';
import { createMonitorRouter } from './monitor.route';
import { createAuthRouter } from './auth.route';
import { createJournalRouter } from './journal.route';
import { createTranscriptionRouter } from './transcription.route';
import { createAnalyticsRouter } from './analytics.route';
import { Controllers } from '../types/controllers';
import { Logger } from '../utils/logger.util';
import { Monitor } from '../utils/monitor.util';

interface Variables {
 controllers: Controllers;
 logger: Logger;
 monitor: Monitor;
}
export const createApiRouter = () => {
 const router = new Hono<{
  Bindings: Env;
  Variables: Variables;
 }>();

 router.use('/monitor/*', async (c) => {
  const newUrl = new URL(c.req.url);
  newUrl.pathname = newUrl.pathname.replace('/api/monitor', '');
  const newRequest = new Request(newUrl, c.req.raw);
  const monitorRouter = createMonitorRouter(c.get('monitor'));
  return monitorRouter.fetch(newRequest, c.env);
 });

 router.use('/auth/*', async (c) => {
  const newUrl = new URL(c.req.url);
  newUrl.pathname = newUrl.pathname.replace('/api/auth', '');
  const newRequest = new Request(newUrl, c.req.raw);
  const authRouter = createAuthRouter(c.get('controllers').authController);
  return authRouter.fetch(newRequest, c.env);
 });

 router.use('/journal/*', async (c) => {
  const newUrl = new URL(c.req.url);
  newUrl.pathname = newUrl.pathname.replace('/api/journal', '');
  const newRequest = new Request(newUrl, c.req.raw);
  const journalRouter = createJournalRouter(
   c.get('controllers').journalController
  );
  return journalRouter.fetch(newRequest, c.env);
 });

 router.use('/transcription/*', async (c) => {
  const newUrl = new URL(c.req.url);
  newUrl.pathname = newUrl.pathname.replace('/api/transcription', '');
  const newRequest = new Request(newUrl, c.req.raw);
  const transcriptionRouter = createTranscriptionRouter(
   c.get('controllers').transcriptionController
  );
  return transcriptionRouter.fetch(newRequest, c.env);
 });

 router.use('/analytics/*', async (c) => {
  const newUrl = new URL(c.req.url);
  newUrl.pathname = newUrl.pathname.replace('/api/analytics', '');
  const newRequest = new Request(newUrl, c.req.raw);
  const analyticsRouter = createAnalyticsRouter(
   c.get('controllers').analyticsController
  );
  return analyticsRouter.fetch(newRequest, c.env);
 });

 return router;
};
