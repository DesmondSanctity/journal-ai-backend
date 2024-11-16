import { Context, Next } from 'hono';
import { Monitor } from '../utils/monitor.util';

export const performanceMiddleware =
 (monitor: Monitor) => async (c: Context, next: Next) => {
  const route = `${c.req.method}:${c.req.path}`;
  const startTime = Date.now();

  monitor.trackRequest(route);

  await next();

  monitor.trackDuration(route, startTime);
 };
