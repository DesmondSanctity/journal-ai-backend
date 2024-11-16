import { Hono } from 'hono';
import { Monitor } from '../utils/monitor.util';

export const createMonitorRouter = (monitor: Monitor) => {
 const router = new Hono();

 router.get('/metrics', (c) => {
  return c.json({
   success: true,
   data: monitor.getMetrics(),
  });
 });

 return router;
};
