import { Env } from '../config/env';

export class TranscriptionService {
 constructor(
  private readonly env: Env,
  private readonly transcriptionSocket: DurableObjectNamespace
 ) {}

 async createWebSocketConnection() {
  const id = this.transcriptionSocket.newUniqueId();
  const socket = this.transcriptionSocket.get(id);

  const response = await socket.fetch(
   new Request('https://worker/connect', {
    method: 'GET',
   })
  );

  return {
   socketUrl: `wss://${id}.workers.dev/connect`,
   sessionId: id.toString(),
  };
 }
}

