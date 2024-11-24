import { Env } from '../config/env';

export interface LogMetadata {
 status?: string;
 code?: number;
 path?: string;
 method?: string;
 message?: string;
}

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

 error(message: string, meta: LogMetadata) {
  console.error(
   this.formatMessage('error', message, {
    ...meta,
   })
  );
 }

 info(message: string, meta?: any) {
  console.log(this.formatMessage('info', message, meta));
 }
}
