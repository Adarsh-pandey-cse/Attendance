
'use server';

/**
 * @fileOverview Server-side actions for the application.
 */

import { db } from '@/lib/firebase';
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { z } from 'zod';
import { DeveloperInfo } from '@/types';
import { revalidatePath } from 'next/cache';

/**
 * Saves a bug report submitted from the client.
 * This is a Server Action called from a client-side handler.
 * @param description - The bug description string.
 * @returns An object indicating success or failure.
 */
export async function submitBugReport(
  description: string
): Promise<{ success: boolean; message: string }> {
  // Basic server-side validation
  if (!description || description.trim().length === 0) {
    return { success: false, message: 'Bug description cannot be empty.' };
  }

  try {
    await addDoc(collection(db, 'bug-reports'), {
      description: description.trim(),
      userName: 'Anonymous',
      timestamp: serverTimestamp(),
      status: 'new',
    });
    revalidatePath('/admin'); // Force the admin page to refetch data
    return { success: true, message: 'Bug report submitted successfully!' };
  } catch (error) {
    console.error('Firestore Error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred on the server.',
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
