export class Monitor {
 private metrics: Map<string, number> = new Map();

 trackDuration(route: string, startTime: number) {
  const duration = Date.now() - startTime;
  const key = `duration:${route}`;
  this.metrics.set(key, (this.metrics.get(key) || 0) + duration);
 }

 trackRequest(route: string) {
  const key = `requests:${route}`;
  this.metrics.set(key, (this.metrics.get(key) || 0) + 1);
 }

 getMetrics() {
  return Object.fromEntries(this.metrics);
 }
}
