
'use server';

/**
 * @fileOverview Server-side actions for the application.
 */

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { z } from 'zod';
import { DeveloperInfo } from '@/types';


/**
 * Saves a bug report to Firestore.
 * This is a simplified version that only takes the description to ensure reliability.
 * @param description - The bug description string.
 * @returns An object indicating success or failure with a message.
 */
export async function saveBugReport(
  description: string
): Promise<{ success: boolean; message: string }> {
  try {
    if (!description || description.trim() === '') {
      return { success: false, message: 'Description is required.' };
    }

    await addDoc(collection(db, 'bug-reports'), {
      description,
      userName: 'Anonymous', // Hardcoded for reliability
      deviceInfo: 'Not provided', // Hardcoded for reliability
      timestamp: serverTimestamp(),
      status: 'new',
      attachments: [], 
    });

    return { success: true, message: 'Bug report submitted successfully!' };

  } catch (error) {
    console.error('Error in saveBugReport server action:', error);
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
