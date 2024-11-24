import { Context } from 'hono';
import { AppError } from '../middleware/error.middleware';
import {
 AssemblyAIService,
 TimedSegment,
} from '../services/assemblyai.service';
import { DatabaseService } from '../services/db.service';
import { errorResponse, successResponse } from '../utils/response.util';

interface TranscriptionResult {
 title: string;
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
  const { audioUrl, publicId } = await c.req.json();

  if (!audioUrl) {
   return c.json(errorResponse(400, 'No audio provided', 'NO_AUDIO_PROVIDED'));
  }

  try {
   // Get transcription and summary
   const transcriptionResult = (await this.assemblyAI.transcribeAudio(
    audioUrl
   )) as TranscriptionResult;

   // Create journal entry
   const journalEntry = await this.db.createJournalEntry(userId, {
    title: transcriptionResult.title,
    content: transcriptionResult.content,
    tags: transcriptionResult.tags,
    excerpt: transcriptionResult.excerpt,
    summary: transcriptionResult.summary,
    segments: transcriptionResult.segments,
    sentiments: transcriptionResult.sentiments,
    audioUrl: audioUrl,
    publicId: publicId,
    duration: transcriptionResult.duration,
    createdAt: transcriptionResult.createdAt,
   });

   return c.json(successResponse(journalEntry));
  } catch (error) {
   return c.json(
    errorResponse(
     503,
     'Failed to run transcription',
     'TRANSCRIPTION_START_FAILED'
    )
   );
  }
 }
}
