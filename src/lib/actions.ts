
'use server';

/**
 * @fileOverview Server-side actions for the application.
 */

import { db } from '@/lib/firebase';
import { collection, addDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { z } from 'zod';
import { DeveloperInfo } from '@/types';
import { revalidatePath } from 'next/cache';

// --- Bug Report Actions ---

const BugReportSchema = z.object({
  description: z.string().min(1, 'Description cannot be empty.'),
  userName: z.string().optional(),
});

type BugReportState = {
  errors?: {
    description?: string[];
  };
  message?: string | null;
  success: boolean;
};

export async function submitBugReport(
  prevState: BugReportState,
  formData: FormData
): Promise<BugReportState> {
  const validatedFields = BugReportSchema.safeParse({
    description: formData.get('description'),
    userName: formData.get('userName'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed. Please check your input.',
      success: false,
    };
  }

  const { description, userName } = validatedFields.data;

  try {
    await addDoc(collection(db, 'bug-reports'), {
      description,
      userName: userName || 'Anonymous',
      timestamp: serverTimestamp(),
      status: 'new',
    });

    revalidatePath('/admin'); // Revalidate the admin page to show the new bug
    return { message: 'Bug report submitted successfully!', success: true, errors: {} };
  } catch (error) {
    console.error('Error submitting bug report:', error);
    return {
      message: 'Database error: Failed to submit bug report.',
      success: false,
      errors: {},
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
    revalidatePath('/developer-info');
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
