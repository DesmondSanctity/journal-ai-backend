import { Env } from '../config/env';
import { AssemblyAI, RealtimeTranscriber } from 'assemblyai';

export class AssemblyAIService {
 private readonly API_KEY: string;
 private readonly client: AssemblyAI;

 constructor(env: Env) {
  this.API_KEY = env.ASSEMBLY_AI_KEY;
  this.client = new AssemblyAI({
   apiKey: env.ASSEMBLY_AI_KEY,
  });
 }

 async createRealtimeConnection(): Promise<RealtimeTranscriber> {
  const transcriber = this.client.realtime.transcriber({
   sampleRate: 16000,
  });

  return transcriber;
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
