
'use server';

/**
 * @fileOverview Server-side actions for the application.
 */

import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { z } from 'zod';
import { DeveloperInfo } from '@/types';
import { revalidatePath } from 'next/cache';

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
    revalidatePath('/developer-info');
    revalidatePath('/admin/developer-info/edit');
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
