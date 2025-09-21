'use server';

/**
 * @fileOverview Server-side actions for the application.
 */

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { z } from 'zod';

const BugReportInputSchema = z.object({
  userName: z.string().optional(),
  description: z.string(),
});
export type BugReportInput = z.infer<typeof BugReportInputSchema>;

/**
 * Saves a bug report to the 'bug-reports' collection in Firestore.
 * @param input - The bug report data.
 * @returns An object indicating success or failure.
 */
export async function saveBugReport(
  input: BugReportInput
): Promise<{ success: boolean; message: string }> {
  try {
    // Validate input at runtime
    const validatedInput = BugReportInputSchema.parse(input);

    const bugReportsColRef = collection(db, 'bug-reports');
    await addDoc(bugReportsColRef, {
      ...validatedInput,
      timestamp: serverTimestamp(),
      status: 'new', // default status
    });
    return { success: true, message: 'Bug report saved successfully.' };
  } catch (error) {
    console.error('Error saving bug report to Firestore:', error);
    if (error instanceof z.ZodError) {
      return { success: false, message: 'Invalid data provided.' };
    }
    // Return a generic error message to the client
    return {
      success: false,
      message: 'An unexpected error occurred while saving the report.',
    };
  }
}
