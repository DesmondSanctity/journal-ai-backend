import { AuthController } from '../controllers/auth.controller';
import { JournalController } from '../controllers/journal.controller';
import { TranscriptionController } from '../controllers/transcription.controller';

export interface Controllers {
 authController: AuthController;
 journalController: JournalController;
 transcriptionController: TranscriptionController;
}
