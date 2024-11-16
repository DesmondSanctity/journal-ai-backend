import { Context } from 'hono';
import { TranscriptionService } from '../services/transcription.service';
import { successResponse } from '../utils/response.util';
import { StorageService } from '../services/storage.service';
import { DatabaseService } from '../services/db.service';
import { AppError } from '../middleware/error.middleware';

export class TranscriptionController {
 constructor(
  private transcriptionService: TranscriptionService,
  private storageService: StorageService,
  private dbService: DatabaseService
 ) {}

 async startWebSocket(c: Context) {
  const connection =
   await this.transcriptionService.createWebSocketConnection();
  return c.json(successResponse(connection));
 }

 async getUserSessions(c: Context) {
  const userId = c.req.param('userId');
  const sessions = await this.dbService.getUserTranscriptions(userId);
  return c.json(successResponse(sessions));
 }

 async getSessionAudio(c: Context) {
  const sessionId = c.req.param('sessionId');
  const session = await this.dbService.getTranscriptionSession(sessionId);

  if (!session) {
   throw new AppError(404, 'Session not found');
  }

  const audioStream = await this.storageService.getSessionAudio(
   session.audioKeys
  );
  return audioStream;
 }
}
