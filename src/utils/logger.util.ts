import { Env } from "../config/env";

export class Logger {
 constructor(private env: Env) {}

 private formatMessage(level: string, message: string, meta?: any) {
  return JSON.stringify({
   timestamp: new Date().toISOString(),
   level,
   message,
   environment: this.env.ENVIRONMENT,
   ...meta,
  });
 }

 error(message: string, error?: Error, meta?: any) {
  console.error(
   this.formatMessage('error', message, {
    error: {
     message: error?.message,
     stack: error?.stack,
    },
    ...meta,
   })
  );
 }

 info(message: string, meta?: any) {
  console.log(this.formatMessage('info', message, meta));
 }
}
