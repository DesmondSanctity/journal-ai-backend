import { Env } from '../config/env';
import { AssemblyAIService } from '../services/assemblyai.service';
import { DatabaseService } from '../services/db.service';
import { StorageService } from '../services/storage.service';

export class TranscriptionSocket implements DurableObject {
 private sessions: Map<
  string,
  {
   client: WebSocket;
   assembly: WebSocket;
   audioKeys: string[];
   userId: string;
  }
 > = new Map();
 private storage: StorageService;
 private db: DatabaseService;
 private assemblyAI: AssemblyAIService;

 constructor(state: DurableObjectState, env: Env) {
  this.storage = new StorageService(env.JOURNAL_AUDIO);
  this.db = new DatabaseService(env.JOURNAL_KV);
  this.assemblyAI = new AssemblyAIService(env);
 }

 async fetch(request: Request) {
  const url = new URL(request.url);

  if (url.pathname === '/connect') {
   const userId = url.searchParams.get('userId');
   if (!userId) {
    return new Response('User ID required', { status: 400 });
   }

   const pair = new WebSocketPair();
   const [client, server] = Object.values(pair);

   const assemblySocket = await this.assemblyAI.createRealtimeConnection();
   const sessionId = crypto.randomUUID();

   server.accept();

   // Handle client messages (audio data)
   server.addEventListener('message', async (msg: MessageEvent) => {
    if (assemblySocket.readyState === WebSocket.OPEN) {
     if (msg.data instanceof ArrayBuffer) {
      // Save audio chunk and forward to AssemblyAI
      const audioKey = await this.handleAudioChunk(userId, sessionId, msg.data);

      // Add to session tracking
      const session = this.sessions.get(sessionId);
      if (session) {
       session.audioKeys.push(audioKey);
       this.sessions.set(sessionId, {
        ...session,
        audioKeys: session.audioKeys,
       });
      }

      // Forward to AssemblyAI
      assemblySocket.send(msg.data);
     }
    }
   });

   // Handle AssemblyAI responses
   assemblySocket.addEventListener('message', (msg) => {
    if (typeof msg.data === 'string') {
     const data = JSON.parse(msg.data);
     if (data.message_type === 'FinalTranscript') {
      server.send(
       JSON.stringify({
        type: 'transcription',
        text: data.text,
        timestamp: new Date().toISOString(),
       })
      );
     }
    }
   });

   // Cleanup on close
   server.addEventListener('close', async () => {
    const session = this.sessions.get(sessionId);
    if (session) {
     // Store session metadata with audio keys
     await this.db.createTranscriptionSession({
      sessionId,
      userId: session.userId,
      audioKeys: session.audioKeys,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
     });
    }

    assemblySocket.close();
    this.sessions.delete(sessionId);
   });

   this.sessions.set(sessionId, {
    client: server,
    assembly: assemblySocket,
    audioKeys: [],
    userId,
   });

   return new Response(null, {
    status: 101,
    webSocket: client,
   });
  }

  return new Response('Not found', { status: 404 });
 }

 private async handleAudioChunk(
  userId: string,
  sessionId: string,
  audioData: ArrayBuffer
 ) {
  const { key } = await this.storage.saveAudio(userId, audioData, sessionId);

  const session = this.sessions.get(sessionId);
  if (session) {
   session.audioKeys.push(key);
   this.sessions.set(sessionId, session);
  }

  return key;
 }
}
