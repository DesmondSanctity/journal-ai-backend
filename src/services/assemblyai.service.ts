import { Env } from '../config/env';
import { AssemblyAI } from 'assemblyai';

export interface TimedSegment {
 timestamp: string;
 text: string;
}

export class AssemblyAIService {
 private readonly client: AssemblyAI;
 constructor(env: Env) {
  this.client = new AssemblyAI({
   apiKey: env.ASSEMBLY_AI_KEY,
  });
 }

 async transcribeAudio(audioUrl: string) {
  // Start transcription
  const transcript = await this.client.transcripts.transcribe({
   audio_url: audioUrl,
   sentiment_analysis: true,
   auto_chapters: true,
   summarization: true,
   summary_model: 'catchy',
   summary_type: 'headline',
  });

  console.log('Transcription:', transcript);

  if (!transcript.text) {
   throw new Error('Transcription failed');
  }

  // Generate summary using Lemur
  const summary = await this.generateSummary(transcript.text);

  console.log('Summary:', summary);

  // Get tags for entry
  const tags = await this.generateTags(transcript.text, transcript.id);

  if (!transcript.chapters) {
   return {
    content: transcript.text,
    tags,
    excerpt: transcript.summary,
    summary: summary,
    segments: [],
    duration: transcript.audio_duration,
    createdAt: new Date().toISOString(),
   };
  }
  // Get segments and speakers
  const segments = this.organizeByTimeSegments(transcript.chapters);

  console.log('Summary:', segments);

  return {
   content: transcript.text,
   tags,
   exceerpt: transcript.summary,
   summary,
   segments,
   duration: transcript.audio_duration,
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

 async generateTags(
  transcript: string,
  transcriptId: string
 ): Promise<string[]> {
  const prompt = `Generate a list of tags for this journal entry: ${transcript}`;
  const result = await this.client.lemur.task({
   transcript_ids: [transcriptId],
   prompt,
   final_model: 'anthropic/claude-3-5-sonnet',
  });

  // convert response to array of strings
  const tags = result.response.split(',');
  return tags;
 }

 private organizeByTimeSegments(chapters: any[]): TimedSegment[] {
  const segments: TimedSegment[] = [];
  for (const chapter of chapters) {
   segments.push({
    timestamp: this.formatTimestamp(chapter.start, chapter.end),
    text: chapter.headline,
   });
  }

  return segments;
 }

 private formatTimestamp(start: number, end: number): string {
  return `${start} - ${end}`;
 }
}
