import { Env } from './env';
import { AuthService } from '../services/auth.service';
import { JournalService } from '../services/journal.service';
import { AuthController } from '../controllers/auth.controller';
import { JournalController } from '../controllers/journal.controller';
import { TranscriptionController } from '../controllers/transcription.controller';
import { DatabaseService } from '../services/db.service';
import { AssemblyAIService } from '../services/assemblyai.service';
import { StorageService } from '../services/storage.service';

export const createControllers = (env: Env) => {
 // Services
 const authService = new AuthService(env);
 const journalService = new JournalService(env);
 const assemblyAI = new AssemblyAIService(env);
 const dbService = new DatabaseService(env.JOURNAL_KV);
 const storageService = new StorageService(env.JOURNAL_AUDIO, env);

 // Controllers
 return {
  authController: new AuthController(authService),
  journalController: new JournalController(journalService),
  transcriptionController: new TranscriptionController(assemblyAI, storageService, dbService),
 };
};
