import { Env } from '../config/env';

export class StorageService {
 constructor(private readonly r2: R2Bucket) {}

 async saveAudio(userId: string, audioData: ArrayBuffer, sessionId: string) {
  const timestamp = new Date().toISOString();
  const key = `audio/${userId}/${sessionId}/${timestamp}.wav`;

  await this.r2.put(key, audioData, {
   customMetadata: {
    userId,
    sessionId,
    timestamp,
   },
  });

  return { key, timestamp };
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
   { headers: { 'Content-Type': 'audio/wav' } }
  );
 }
}
