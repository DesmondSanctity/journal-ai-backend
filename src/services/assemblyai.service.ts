import { Env } from '../config/env';

export class AssemblyAIService {
 private readonly API_KEY: string;
 private readonly WS_URL = 'wss://api.assemblyai.com/v2/realtime/ws';

 constructor(env: Env) {
  this.API_KEY = env.ASSEMBLY_AI_KEY;
 }

 async createRealtimeConnection(): Promise<WebSocket> {
  const socket = new WebSocket(
   `${this.WS_URL}?sample_rate=16000&token=${this.API_KEY}`
  );
  return socket;
 }
}
