import { Context } from 'hono';
import { DatabaseService } from '../services/db.service';
import { errorResponse, successResponse } from '../utils/response.util';

interface AnalyticsResponse {
 totalTime: number;
 totalEntries: number;
 averageDuration: number;
 topTags: Array<{ tag: string; count: number }>;
 topTopics: Array<{ topic: string; count: number }>;
 wordFrequency: Array<{ word: string; count: number }>;
 sentimentData: Array<{ sentiment: string; count: number }>;
}

export interface SentimentSegment {
 sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
 text: string;
 start: number;
 end: number;
 confidence: number;
}

interface JournalEntry {
 id: string;
 title: string;
 content: string;
 tags: string[];
 summary: string;
 segments: Array<{
  timestamp: string;
  text: string;
 }>;
 sentiments: SentimentSegment[];
 duration: number;
 audioUrl: string;
 createdAt: string;
}

export class AnalyticsController {
 constructor(private db: DatabaseService) {}

 async getJournalAnalytics(c: Context) {
  const userId = c.req.param('userId');
  const entries = await this.db.getUserJournalEntries(userId);

  try {
   const analytics: AnalyticsResponse = {
    totalTime: entries.reduce((acc, entry) => acc + entry.duration, 0),
    totalEntries: entries.length,
    averageDuration:
     entries.reduce((acc, entry) => acc + entry.duration, 0) / entries.length,
    topTags: this.getTopTags(entries),
    topTopics: this.getTopTopics(entries),
    wordFrequency: this.getWordFrequency(entries),
    sentimentData: this.getSentimentAnalysis(entries),
   };

   return c.json(successResponse(analytics));
  } catch (error) {
   return c.json(
    errorResponse(
     500,
     'Failed to fetch journal analytics',
     'ANALYTICS_FETCH_FAILED'
    )
   );
  }
 }

 private getTopTags(
  entries: JournalEntry[]
 ): Array<{ tag: string; count: number }> {
  const tagCount = new Map<string, number>();
  entries.forEach((entry) => {
   entry.tags.forEach((tag) => {
    tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
   });
  });
  return Array.from(tagCount.entries())
   .map(([tag, count]) => ({ tag, count }))
   .sort((a, b) => b.count - a.count)
   .slice(0, 10);
 }

 private getTopTopics(
  entries: JournalEntry[]
 ): Array<{ topic: string; count: number }> {
  const topicCount = new Map<string, number>();
  entries.forEach((entry) => {
   const topics = entry.summary.split('.').map((s) => s.trim());
   topics.forEach((topic) => {
    if (topic) topicCount.set(topic, (topicCount.get(topic) || 0) + 1);
   });
  });
  return Array.from(topicCount.entries())
   .map(([topic, count]) => ({ topic, count }))
   .sort((a, b) => b.count - a.count)
   .slice(0, 5);
 }

 private getWordFrequency(
  entries: JournalEntry[]
 ): Array<{ word: string; count: number }> {
  const wordCount = new Map<string, number>();
  entries.forEach((entry) => {
   const words = entry.content
    .toLowerCase()
    .split(/\s+/)
    .filter((word: string) => word.length > 3); // Filter out small words
   words.forEach((word: string) => {
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
   });
  });
  return Array.from(wordCount.entries())
   .map(([word, count]) => ({ word, count }))
   .sort((a, b) => b.count - a.count)
   .slice(0, 20);
 }

 private getSentimentAnalysis(
  entries: JournalEntry[]
 ): Array<{ sentiment: string; count: number }> {
  const sentimentCounts = entries.reduce((acc, entry) => {
   entry.sentiments.forEach((segment) => {
    const sentiment = segment.sentiment;
    acc[sentiment] = (acc[sentiment] || 0) + 1;
   });
   return acc;
  }, {} as Record<string, number>);

  return Object.entries(sentimentCounts)
   .map(([sentiment, count]) => ({
    sentiment,
    count,
   }))
   .sort((a, b) => b.count - a.count);
 }
}
