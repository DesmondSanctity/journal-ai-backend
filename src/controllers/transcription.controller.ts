import { Context } from 'hono';
import { successResponse } from '../utils/response.util';
import { AppError } from '../middleware/error.middleware';
import {
 AssemblyAIService,
 TranscriptionChunk,
} from '../services/assemblyai.service';
import { StorageService } from '../services/storage.service';
import { DatabaseService } from '../services/db.service';

interface TranscriptionResult {
 content: string;
 summary: string;
 createdAt: string;
}

export class TranscriptionController {
 constructor(
  private assemblyAI: AssemblyAIService,
  private storage: StorageService,
  private db: DatabaseService
 ) {}

 async handleAudioTranscription(c: Context) {
  const userId = c.req.param('userId');
  const sessionId = crypto.randomUUID();

  if (!c.req.raw.body) {
   return c.json(
    {
     success: false,
     error: 'No audio provided',
    },
    400
   );
  }

  try {
   const audio = await c.req.raw.arrayBuffer();

   // Store audio in R2
   const { key, timestamp, url } = await this.storage.saveAudio(
    userId,
    audio,
    sessionId
   );

   if (!url) {
    throw new AppError(500, 'Failed to save audio', 'AUDIO_SAVE_FAILED');
   }

   // Get transcription and summary
   const transcriptionResult = (await this.assemblyAI.transcribeAudio(
    url
   )) as TranscriptionResult;

   console.log('Transcription Result:', transcriptionResult);

   // Create journal entry
   const journalEntry = await this.db.createJournalEntry(userId, {
    content: transcriptionResult.content,
    summary: transcriptionResult.summary,
    audioKey: key,
    createdAt: timestamp,
   });

   return c.json({
    success: true,
    data: journalEntry,
   });
  } catch (error) {
   throw new AppError(
    503,
    'Failed to run transcription',
    'TRANSCRIPTION_START_FAILED'
   );
  }
 }
}
