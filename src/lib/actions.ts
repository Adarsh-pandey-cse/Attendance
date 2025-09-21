
'use server';

/**
 * @fileOverview Server-side actions for the application.
 */

import { db, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { z } from 'zod';
import { DeveloperInfo, BugReportAttachment } from '@/types';

// --- Bug Report Actions ---

const BugReportSchema = z.object({
  description: z.string().min(1, 'Description is required.'),
  userName: z.string(),
  deviceInfo: z.string().optional(),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
  })).optional(),
});

/**
 * Saves a bug report to Firestore.
 * This function is called by the client after files have been uploaded to Firebase Storage.
 * @param reportData - An object containing the bug report details and file attachment URLs.
 * @returns An object indicating success or failure with a message.
 */
export async function saveBugReport(
  reportData: z.infer<typeof BugReportSchema>
): Promise<{ success: boolean; message: string }> {
  try {
    const validatedData = BugReportSchema.parse(reportData);

    await addDoc(collection(db, 'bug-reports'), {
      ...validatedData,
      timestamp: serverTimestamp(),
      status: 'new',
    });

    return { success: true, message: 'Bug report submitted successfully!' };

  } catch (error) {
    console.error('Error in saveBugReport server action:', error);
    if (error instanceof z.ZodError) {
      return { success: false, message: `Invalid data: ${error.errors.map(e => e.message).join(', ')}` };
    }
    return {
      success: false,
      message: 'An unexpected server error occurred while saving the report.',
    };
  }
}


// --- Developer Info Actions ---

const DeveloperInfoSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  bio: z.string().optional(),
  profilePicture: z.string().url().nullable().optional(),
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
