import { Env } from '../config/env';
import { AssemblyAI, RealtimeTranscriber } from 'assemblyai';
import { StorageService } from './storage.service';

export interface TranscriptionChunk {
 timestamp: number;
 audioKeys?: { key: string; timestamp: number }[];
 transcript: string;
 isFinal: boolean;
 startTimestamp: number;
 endTimestamp: number;
}

export class AssemblyAIService {
 private readonly client: AssemblyAI;
 private readonly storage: StorageService;
 constructor(env: Env) {
  this.client = new AssemblyAI({
   apiKey: env.ASSEMBLY_AI_KEY,
  });
  this.storage = new StorageService(env.JOURNAL_AUDIO, env);
 }

 async transcribeAudio(audioUrl: string) {
  // Start transcription
  const transcript = await this.client.transcripts.transcribe({
   audio_url: audioUrl,
   speaker_labels: true,
  });

  if (!transcript.text) {
   throw new Error('Transcription failed');
  }

  // Generate summary using Lemur
  const summary = await this.generateSummary(transcript.text);

  return {
   content: transcript.text,
   summary,
   createdAt: new Date().toISOString(),
  };
 }

 async generateSummary(transcript: string): Promise<string> {
  const result = await this.client.lemur.summary({
   context: 'This is a personal journal entry.',
   final_model: 'anthropic/claude-3-5-sonnet',
   max_output_size: 300,
   temperature: 0,
   answer_format: 'TLDR',
   input_text: transcript,
  });

  return result.response;
 }
}
