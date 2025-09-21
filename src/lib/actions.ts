
'use server';

/**
 * @fileOverview Server-side actions for the application.
 */

import { db, storage } from '@/lib/firebase';
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { z } from 'zod';
import { DeveloperInfo } from '@/types';
import { redirect } from 'next/navigation';

/**
 * Saves a bug report submitted from a standard HTML form.
 * This is a Server Action and is designed to be called directly from a <form> element.
 * @param formData - The form data submitted by the user.
 */
export async function submitBugReport(formData: FormData): Promise<void> {
  const description = formData.get('description') as string;

  // Basic server-side validation
  if (!description || description.trim().length === 0) {
    console.error('Validation failed: Description is empty.');
    redirect('/report-bug?error=description_empty');
    return;
  }

  try {
    await addDoc(collection(db, 'bug-reports'), {
      description: description.trim(),
      userName: 'Anonymous', // Simplified for reliability
      timestamp: serverTimestamp(),
      status: 'new',
    });
  } catch (error) {
    console.error('Firestore Error:', error);
    redirect('/report-bug?error=submit_failed');
    return;
  }

  // Redirect to the home page with a success flag on success.
  redirect('/?bug_submitted=true');
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
