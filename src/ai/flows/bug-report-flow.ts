'use server';

/**
 * @fileOverview Flow for saving a bug report to Firestore.
 * - saveBugReport: Saves the bug report to the 'bug-reports' collection.
 * - BugReportInput: The input type for the saveBugReport function.
 */

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { z } from 'zod';

const BugReportInputSchema = z.object({
  userName: z.string().optional(),
  description: z.string(),
});
export type BugReportInput = z.infer<typeof BugReportInputSchema>;

export async function saveBugReport(
  input: BugReportInput
): Promise<{ success: boolean; message: string }> {
  try {
    // Validate input at runtime
    BugReportInputSchema.parse(input);

    const bugReportsColRef = collection(db, 'bug-reports');
    await addDoc(bugReportsColRef, {
      ...input,
      timestamp: serverTimestamp(),
      status: 'new', // default status
    });
    return { success: true, message: 'Bug report saved successfully.' };
  } catch (error) {
    console.error('Error saving bug report to Firestore:', error);
    if (error instanceof z.ZodError) {
      return { success: false, message: 'Invalid data provided.' };
    }
    return {
      success: false,
      message: 'An unexpected error occurred while saving the report.',
    };
  }
}
