import { Env } from '../config/env';

export class StorageService {
 constructor(private readonly r2: R2Bucket, private readonly env: Env) {}

 async saveAudio(userId: string, audioData: ArrayBuffer, sessionId: string) {
  const timestamp = new Date().toISOString();
  const key = `audio/${userId}/${timestamp}.webm`;

  await this.r2.put(key, audioData, {
   httpMetadata: {
    contentType: 'audio/webm',
   },
   customMetadata: {
    userId,
    sessionId,
    timestamp,
   },
  });

  const url = `https://${this.env.R2_BUCKET_URL}/${key}`;

  console.log('Audio URL:', url);

  return { key, timestamp, url };
 }

 async getAudio(key: string) {
  return this.r2.get(key);
 }

 async getSessionAudio(audioKeys: string[]) {
  const chunks = await Promise.all(audioKeys.map((key) => this.r2.get(key)));

  const audioBlobs = await Promise.all(
   chunks.map(async (chunk) => chunk?.arrayBuffer() || null)
  );

  return new Response(
   new Blob(audioBlobs.filter((blob): blob is ArrayBuffer => blob !== null)),
   { headers: { 'Content-Type': 'audio/webm' } }
  );
 }
}
