import { z } from 'zod';

export const journalEntrySchema = z.object({
 title: z.string().min(1),
 content: z.string().min(1),
 tags: z.array(z.string()).optional(),
});

export type JournalEntryInput = z.infer<typeof journalEntrySchema>;
