import { Context } from 'hono';
import { DatabaseService } from '../services/db.service';

interface AnalyticsResponse {
 totalTime: number;
 totalEntries: number;
 averageDuration: number;
 topTags: Array<{ tag: string; count: number }>;
 topTopics: Array<{ topic: string; count: number }>;
 wordFrequency: Array<{ word: string; count: number }>;
 sentimentData: Array<{ sentiment: string; count: number }>;
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
 duration: number;
 audioUrl: string;
 createdAt: string;
}


export class AnalyticsController {
 constructor(private db: DatabaseService) {}

 async getJournalAnalytics(c: Context) {
  const userId = c.req.param('userId');
  const entries = await this.db.getUserJournalEntries(userId);

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

  return c.json({
   success: true,
   data: analytics,
  });
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
  const sentiments = ['Positive', 'Neutral', 'Negative'];
  const sentimentCount = new Map<string, number>();

  entries.forEach((entry) => {
   const sentiment = this.analyzeSentiment(entry.content);
   sentimentCount.set(sentiment, (sentimentCount.get(sentiment) || 0) + 1);
  });

  return sentiments.map((sentiment) => ({
   sentiment,
   count: sentimentCount.get(sentiment) || 0,
  }));
 }

 private analyzeSentiment(text: string): string {
  // Basic sentiment analysis - can be enhanced with NLP libraries
  const positiveWords = ['happy', 'good', 'great', 'excellent', 'amazing'];
  const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'horrible'];

  const words = text.toLowerCase().split(/\s+/);
  const positiveCount = words.filter((word) =>
   positiveWords.includes(word)
  ).length;
  const negativeCount = words.filter((word) =>
   negativeWords.includes(word)
  ).length;

  if (positiveCount > negativeCount) return 'Positive';
  if (negativeCount > positiveCount) return 'Negative';
  return 'Neutral';
 }
}
