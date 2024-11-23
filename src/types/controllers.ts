import { AnalyticsController } from '../controllers/analytics.controller';
import { AuthController } from '../controllers/auth.controller';
import { JournalController } from '../controllers/journal.controller';
import { TranscriptionController } from '../controllers/transcription.controller';

export interface Controllers {
 authController: AuthController;
 journalController: JournalController;
 analyticsController: AnalyticsController;
 transcriptionController: TranscriptionController;
}
