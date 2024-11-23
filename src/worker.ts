import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger as honoLogger } from 'hono/logger';
import { errorHandler } from './middleware/error.middleware';
import { performanceMiddleware } from './middleware/performance.middleware';
import { createControllers } from './config/container';
import { createApiRouter } from './routes/api.route';
import { Env } from './config/env';
import { Controllers } from './types/controllers';
import { Logger } from './utils/logger.util';
import { Monitor } from './utils/monitor.util';

interface Variables {
 controllers: Controllers;
 logger: Logger;
 monitor: Monitor;
}

const app = new Hono<{
 Bindings: Env;
 Variables: Variables;
}>();

// Global middleware
app.use(
 '*',
 cors({
  origin: '*',
  allowHeaders: [
   'X-Custom-Header',
   'Upgrade-Insecure-Requests',
   'Content-Type',
   'Authorization',
  ],
  allowMethods: ['POST', 'GET', 'OPTIONS'],
  exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
  maxAge: 600,
  credentials: true,
 })
);

// Initialize core services
app.use('*', async (c, next) => {
 const logger = new Logger(c.env);
 const monitor = new Monitor();
 const controllers = createControllers(c.env);

 c.set('logger', logger);
 c.set('monitor', monitor);
 c.set('controllers', controllers);
 await next();
});

app.use('*', honoLogger());
app.use('*', (c, next) => errorHandler(c.get('logger'))(c, next));
app.use('*', (c, next) => performanceMiddleware(c.get('monitor'))(c, next));

// Mount all routes
app.route('/api', createApiRouter());

// Health check
app.get('/', (c) =>
 c.json({ status: 'ok', timestamp: new Date().toISOString() })
);

export default app;
