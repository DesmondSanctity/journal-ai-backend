import { Context } from 'hono';
import { DatabaseService } from '../services/db.service';
import { errorResponse, successResponse } from '../utils/response.util';

interface EnhancedAnalyticsResponse {
 metrics: {
  totalTime: string;
  totalEntries: number;
  avgDuration: string;
  topTags: string[];
 };
 activityData: Array<{ day: string; entries: number }>;
 sentimentData: Array<{
  month: string;
  positive: number;
  neutral: number;
  negative: number;
 }>;
 topicsData: Array<{ topic: string; count: number }>;
 wordFrequency: Array<{ word: string; frequency: number }>;
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
  const userId = c.get('user').userId;
  const entries = await this.db.getUserJournalEntries(userId);

  const analytics: EnhancedAnalyticsResponse = {
   metrics: {
    totalTime: this.formatDuration(
     entries.reduce((acc, entry) => acc + entry.duration, 0)
    ),
    totalEntries: entries.length,
    avgDuration: this.formatDuration(
     entries.reduce((acc, entry) => acc + entry.duration, 0) / entries.length
    ),
    topTags: this.getTopTags(entries)
     .slice(0, 3)
     .map((tag) => tag.tag),
   },
   activityData: this.getActivityData(entries),
   sentimentData: this.getSentimentTrends(entries),
   topicsData: this.getTopTopics(entries),
   wordFrequency: this.getWordFrequency(entries).map((item) => ({
    word: item.word,
    frequency: item.count,
   })),
  };

  return c.json(successResponse(analytics));
 }

 private formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return minutes >= 60 ? `${hours} hours` : `${mins} mins`;
 }

 private getActivityData(
  entries: JournalEntry[]
 ): Array<{ day: string; entries: number }> {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const entriesByDay = new Map(days.map((day) => [day, 0]));

  entries.forEach((entry) => {
   const day = days[new Date(entry.createdAt).getDay()];
   entriesByDay.set(day, (entriesByDay.get(day) || 0) + 1);
  });

  return days.map((day) => ({
   day,
   entries: entriesByDay.get(day) || 0,
  }));
 }

 private getSentimentTrends(entries: JournalEntry[]): Array<{
  month: string;
  positive: number;
  neutral: number;
  negative: number;
 }> {
  const months = [
   'Jan',
   'Feb',
   'Mar',
   'Apr',
   'May',
   'Jun',
   'Jul',
   'Aug',
   'Sep',
   'Oct',
   'Nov',
   'Dec',
  ];
  const sentimentsByMonth = new Map();

  entries.forEach((entry) => {
   const month = months[new Date(entry.createdAt).getMonth()];
   const monthData = sentimentsByMonth.get(month) || {
    positive: 0,
    neutral: 0,
    negative: 0,
   };

   entry.sentiments.forEach((segment) => {
    monthData[segment.sentiment.toLowerCase()] += 1;
   });

   sentimentsByMonth.set(month, monthData);
  });

  return Array.from(sentimentsByMonth.entries()).map(([month, data]) => ({
   month,
   ...data,
  }));
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
   const topics = entry.title.split('.').map((s) => s.trim());
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

 // private getSentimentAnalysis(
 //  entries: JournalEntry[]
 // ): Array<{ sentiment: string; count: number }> {
 //  const sentimentCounts = entries.reduce((acc, entry) => {
 //   entry.sentiments.forEach((segment) => {
 //    const sentiment = segment.sentiment;
 //    acc[sentiment] = (acc[sentiment] || 0) + 1;
 //   });
 //   return acc;
 //  }, {} as Record<string, number>);

 //  return Object.entries(sentimentCounts)
 //   .map(([sentiment, count]) => ({
 //    sentiment,
 //    count,
 //   }))
 //   .sort((a, b) => b.count - a.count);
 // }
}
