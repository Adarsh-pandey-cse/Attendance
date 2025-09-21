'use server';

/**
 * @fileOverview Server-side actions for the application.
 */

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { z } from 'zod';
import { DeveloperInfo } from '@/types';

// --- Bug Report Actions ---

const BugReportInputSchema = z.object({
  userName: z.string().optional(),
  description: z.string().min(1, { message: 'Bug description cannot be empty.' }),
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
    const validatedInput = BugReportInputSchema.parse(input);

    const bugReportsColRef = collection(db, 'bug-reports');
    await addDoc(bugReportsColRef, {
      ...validatedInput,
      timestamp: serverTimestamp(),
      status: 'new',
    });
    return { success: true, message: 'Bug report submitted successfully!' };
  } catch (error) {
    console.error('Error saving bug report to Firestore:', error);
    if (error instanceof z.ZodError) {
      return { success: false, message: error.errors[0]?.message || 'Invalid data provided.' };
    }
    return {
      success: false,
      message: 'An unexpected error occurred while saving the report.',
    };
  }
}

// --- Developer Info Actions ---

const DeveloperInfoSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  bio: z.string().optional(),
  profilePicture: z.string().nullable().optional(),
});


/**
 * Saves developer information to Firestore.
 * @param devInfo - The developer info object.
 * @returns An object indicating success or failure.
 */
export async function saveDeveloperInfo(
  devInfo: Partial<DeveloperInfo>
): Promise<{ success: boolean; message: string }> {
  try {
    const validatedDevInfo = DeveloperInfoSchema.parse(devInfo);
    const devInfoDocRef = doc(db, 'settings', 'developerInfo');
    await setDoc(devInfoDocRef, validatedDevInfo, { merge: true });
    return { success: true, message: 'Developer information updated successfully!' };
  } catch (error) {
    console.error('Error saving developer info to Firestore:', error);
     if (error instanceof z.ZodError) {
      return { success: false, message: error.errors[0]?.message || 'Invalid data provided.' };
    }
    return {
      success: false,
      message: 'An unexpected error occurred while saving developer info.',
    };
  }
}
