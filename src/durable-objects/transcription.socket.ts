import { RealtimeTranscript } from 'assemblyai';
import { DatabaseService } from '../services/db.service';
import { AssemblyAIService } from '../services/assemblyai.service';

interface TranscriptionChunk {
 timestamp: number;
 audioKeys: { key: string; timestamp: number }[];
 transcript: string;
 isFinal: boolean;
}

interface TranscriptionSession {
 transcriber: any;
 chunks: TranscriptionChunk[];
 audioKeys: { key: string; timestamp: number }[];
 startTime: number;
}

export class TranscriptionSocketService {
 private sessions = new Map<string, TranscriptionSession>();

 constructor(
  private assemblyAI: AssemblyAIService,
  private db: DatabaseService
 ) {}

 async startTranscription(userId: string) {
  const transcriber = await this.assemblyAI.createRealtimeConnection();
  const sessionId = crypto.randomUUID();
  const startTime = Date.now();

  transcriber.on('open', ({ sessionId: assemblyId }) => {
   console.log(`Session opened with ID: ${assemblyId}`);
  });

  transcriber.on('error', (error: Error) => {
   console.error('Transcription error:', error);
  });

  transcriber.on('close', (code: number, reason: string) => {
   console.log('Session closed:', code, reason);
   this.sessions.delete(sessionId);
  });

  transcriber.on('transcript', async (transcript: RealtimeTranscript) => {
   if (!transcript.text) return;

   const session = this.sessions.get(sessionId);
   if (!session) return;

   const chunk = {
    timestamp: Date.now() - startTime,
    audioKeys: session.audioKeys,
    transcript: transcript.text,
    isFinal: transcript.message_type === 'FinalTranscript',
   };

   session.chunks.push(chunk);

   if (transcript.message_type === 'FinalTranscript') {
    const summary = await this.assemblyAI.generateSummary(transcript.text);

    await this.db.createJournalEntry(userId, {
     content: transcript.text,
     summary,
     chunks: session.chunks,
     audioKeys: session.audioKeys.map((ak) => ak.key).join(','),
     createdAt: new Date().toISOString(),
    });
   }
  });

  await transcriber.connect();

  this.sessions.set(sessionId, {
   transcriber,
   chunks: [],
   audioKeys: [],
   startTime,
  });

  return { sessionId, stream: transcriber.stream() };
 }
}
