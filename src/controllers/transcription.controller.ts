import { Context } from 'hono';
import { AppError } from '../middleware/error.middleware';
import {
 AssemblyAIService,
 TimedSegment,
} from '../services/assemblyai.service';
import { DatabaseService } from '../services/db.service';

interface TranscriptionResult {
 content: string;
 tags: string[];
 excerpt: string;
 summary: string;
 segments: TimedSegment[];
 sentiments: {
  sentiment: string;
  text: string;
  confidence: number;
  timestamp: string;
 }[];
 duration: number;
 createdAt: string;
}

export class TranscriptionController {
 constructor(
  private assemblyAI: AssemblyAIService,
  private db: DatabaseService
 ) {}

 async handleAudioTranscription(c: Context) {
  const userId = c.req.param('userId');
  const { audioUrl } = await c.req.json();

  console.log('URL:', audioUrl);
  if (!audioUrl) {
   throw new AppError(400, 'No audio provided', 'NO_AUDIO_PROVIDED');
  }

  try {
   // Get transcription and summary
   const transcriptionResult = (await this.assemblyAI.transcribeAudio(
    audioUrl
   )) as TranscriptionResult;

   console.log('Transcription Result:', transcriptionResult);

   // Create journal entry
   const journalEntry = await this.db.createJournalEntry(userId, {
    content: transcriptionResult.content,
    tags: transcriptionResult.tags,
    excerpt: transcriptionResult.summary,
    summary: transcriptionResult.summary,
    segments: transcriptionResult.segments,
    sentiments: transcriptionResult.sentiments,
    audioUrl: audioUrl,
    duration: transcriptionResult.duration,
    createdAt: transcriptionResult.createdAt,
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
