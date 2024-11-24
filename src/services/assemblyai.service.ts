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
  });

  if (!transcript.text) {
   throw new Error('Transcription failed');
  }

  // Generate title and excerpt
  const { title, excerpt } = await this.generateTitleAndExcerpt(
   transcript.text,
   transcript.id
  );
  // Generate summary using Lemur
  const summary = await this.generateSummary(transcript.text);
  // Get tags for entry
  const tags = await this.generateTags(transcript.text, transcript.id);

  if (!transcript.words) {
   return {
    title: title,
    content: transcript.text,
    tags,
    excerpt: excerpt,
    summary: summary,
    segments: [],
    sentiments: this.organizeSentimentSegments(
     transcript.sentiment_analysis_results || []
    ),
    duration: transcript.audio_duration,
    createdAt: new Date().toISOString(),
   };
  }

  if (!transcript.sentiment_analysis_results) {
   return {
    title: title,
    content: transcript.text,
    tags,
    excerpt: excerpt,
    summary: summary,
    segments: this.organizeByTimeSegments(transcript.words) || [],
    sentiments: [],
    duration: transcript.audio_duration,
    createdAt: new Date().toISOString(),
   };
  }

  const sentiments = this.organizeSentimentSegments(
   transcript.sentiment_analysis_results || []
  );
  const segments = this.organizeByTimeSegments(transcript.words);

  return {
   title: title,
   content: transcript.text,
   tags,
   excerpt: excerpt,
   summary,
   segments: segments,
   sentiments: sentiments,
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
   answer_format: 'bullet points',
   input_text: transcript,
  });

  return result.response;
 }

 async generateTags(
  transcript: string,
  transcriptId: string
 ): Promise<string[]> {
  const prompt = `Create a list of two tags for this journal entry: ${transcript}. Retrn the tags ONLY as a comma separated list. The tags should be related to the content of the journal entry and arranged in order of importance.`;
  const result = await this.client.lemur.task({
   transcript_ids: [transcriptId],
   prompt,
   final_model: 'anthropic/claude-3-5-sonnet',
  });

  // convert response to array of strings
  const tags = result.response.split(',');
  return tags;
 }

 async generateTitleAndExcerpt(
  transcript: string,
  transcriptId: string
 ): Promise<{ excerpt: string; title: string }> {
  const titlePrompt = `Create a three words title for this journal entry: ${transcript}. Be precise, not long, conscise, and accurate as possible. Return the title ONLY.`;
  const excerptPrompt = `Create an excerpt(one liner) for this journal entry: ${transcript}. Be precise, conscise, and accurate as possible. Return the excerpt ONLY.`;

  const title = await this.client.lemur.task({
   transcript_ids: [transcriptId],
   prompt: titlePrompt,
   final_model: 'anthropic/claude-3-5-sonnet',
  });

  const excerpt = await this.client.lemur.task({
   transcript_ids: [transcriptId],
   prompt: excerptPrompt,
   final_model: 'anthropic/claude-3-5-sonnet',
  });

  return { excerpt: excerpt.response, title: title.response };
 }
 private organizeByTimeSegments(words: any[]): TimedSegment[] {
  const segments: TimedSegment[] = [];
  const INTERVAL_MS = 10000; // 10 seconds

  let currentText = '';
  let segmentStart = words[0]?.start || 0;
  let currentTime = segmentStart;

  words.forEach((word, index) => {
   if (word.start >= currentTime + INTERVAL_MS || index === words.length - 1) {
    segments.push({
     timestamp: `${this.formatTimestamp(segmentStart)} - ${this.formatTimestamp(
      word.end
     )}`,
     text: currentText.trim(),
    });

    currentText = word.text;
    segmentStart = word.start;
    currentTime = word.start;
   } else {
    currentText += ' ' + word.text;
   }
  });

  return segments;
 }

 private organizeSentimentSegments(sentimentAnalysisResults: any[]) {
  const sentimentSegments = sentimentAnalysisResults.map((segment: any) => ({
   sentiment: segment.sentiment,
   text: segment.text,
   confidence: segment.confidence,
   timestamp: this.formatTimestamp(segment.start),
  }));

  return sentimentSegments;
 }

 private formatTimestamp(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes.toString().padStart(2, '0')}:${seconds
   .toString()
   .padStart(2, '0')}`;
 }
}
