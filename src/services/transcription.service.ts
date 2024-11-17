import { Env } from '../config/env';

export class TranscriptionService {
 constructor(
  private readonly env: Env,
  private readonly transcriptionSocket: DurableObjectNamespace
 ) {}

 async createWebSocketConnection() {
  const id = this.transcriptionSocket.newUniqueId();
  const socket = this.transcriptionSocket.get(id);
  const userId = '13acb4a5-52f8-45d5-9947-b2d358201d99';

  const response = await socket.fetch(
   new Request(`https://worker/connect?userId=${userId}`, {
    method: 'GET',
    headers: {
     Upgrade: 'websocket',
     Connection: 'Upgrade',
    },
   })
  );

  console.log('Response from WebSocket:', response);

  return {
   socketUrl: `wss://${id}.workers.dev/connect?userId=${userId}`,
   sessionId: id.toString(),
  };
 }
}
