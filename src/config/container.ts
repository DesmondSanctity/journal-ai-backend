import { Env } from './env';
import { AuthService } from '../services/auth.service';
import { JournalService } from '../services/journal.service';
import { TranscriptionService } from '../services/transcription.service';
import { AuthController } from '../controllers/auth.controller';
import { JournalController } from '../controllers/journal.controller';
import { TranscriptionController } from '../controllers/transcription.controller';
import { StorageService } from '../services/storage.service';
import { DatabaseService } from '../services/db.service';

export const createControllers = (env: Env) => {
 // Services
 const authService = new AuthService(env);
 const journalService = new JournalService(env);
 const storageService = new StorageService(env.JOURNAL_AUDIO);
 const dbService = new DatabaseService(env.JOURNAL_KV);
 const transcriptionService = new TranscriptionService(
  env,
  env.TRANSCRIPTION_SOCKET
 );

 // Controllers
 return {
  authController: new AuthController(authService),
  journalController: new JournalController(journalService),
  transcriptionController: new TranscriptionController(
   transcriptionService,
   storageService,
   dbService
  )
 };
};
