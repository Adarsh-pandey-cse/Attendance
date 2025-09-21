
'use server';

/**
 * @fileOverview Server-side actions for the application.
 */

import { db } from '@/lib/firebase';
import { doc, setDoc, addDoc, collection, updateDoc } from 'firebase/firestore';
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
    revalidatePath('/admin');
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

// --- Bug Report Actions ---

const BugReportSchema = z.object({
  description: z.string().min(10, { message: "Description must be at least 10 characters long." }),
  userName: z.string(),
});

export async function submitBugReport(
  userName: string,
  description: string
): Promise<{ success: boolean; message: string; }> {
    try {
        const validatedFields = BugReportSchema.safeParse({ description, userName });

        if (!validatedFields.success) {
            return {
                success: false,
                message: validatedFields.error.flatten().fieldErrors.description?.[0] || 'Invalid data provided.',
            };
        }

        const bugReportsColRef = collection(db, 'bug-reports');
        await addDoc(bugReportsColRef, {
            description: validatedFields.data.description,
            userName: validatedFields.data.userName,
            timestamp: Date.now(),
            status: 'open',
        });
        
        revalidatePath('/admin');
        return { success: true, message: 'Thank you! Your bug report has been received.' };
    } catch (error) {
        console.error('Error submitting bug report:', error);
        // This is a generic error message to avoid exposing implementation details.
        return { success: false, message: 'An unexpected server error occurred. Please try again later.' };
    }
}

export async function updateBugStatus(bugId: string, status: 'open' | 'closed'): Promise<{ success: boolean; message: string }> {
    try {
        const bugDocRef = doc(db, 'bug-reports', bugId);
        await updateDoc(bugDocRef, { status });
        revalidatePath('/admin');
        return { success: true, message: `Bug marked as ${status}.` };
    } catch (error) {
        console.error('Error updating bug status:', error);
        return { success: false, message: 'Failed to update bug status.' };
    }
}