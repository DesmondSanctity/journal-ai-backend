import { Context } from 'hono';
import { TranscriptionSocketService } from '../durable-objects/transcription.socket';
import { successResponse } from '../utils/response.util';
import { AppError } from '../middleware/error.middleware';

export class TranscriptionController {
 constructor(private transcriptionSocket: TranscriptionSocketService) {}

 async startTranscription(c: Context) {
  const userId = c.get('userId');
  if (!userId) {
   throw new AppError(401, 'User not authenticated', 'AUTH_REQUIRED');
  }

  try {
   const { sessionId, stream } =
    await this.transcriptionSocket.startTranscription(userId);
   return c.json(
    successResponse({
     sessionId,
     stream,
    })
   );
  } catch (error) {
   throw new AppError(
    503,
    'Failed to start transcription',
    'TRANSCRIPTION_START_FAILED'
   );
  }
 }
}
