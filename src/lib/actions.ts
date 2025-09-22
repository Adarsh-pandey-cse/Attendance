
'use server';

/**
 * @fileOverview Server-side actions for the application.
 */

import { db } from '@/lib/firebase';
import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
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

// --- Bug Report Actions ---

const BugReportSchema = z.object({
  report: z.string().min(10, { message: 'Please provide a more detailed report (min. 10 characters).' }).max(2000, { message: 'Report is too long (max. 2000 characters).'}),
});

/**
 * Submits a bug report to Firestore.
 * @param formData - The form data containing the report.
 * @returns An object indicating success or failure.
 */
export async function submitBugReport(
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  try {
    const validatedData = BugReportSchema.parse({
        report: formData.get('report'),
    });

    const bugReportsColRef = collection(db, 'bugReports');
    await addDoc(bugReportsColRef, {
      report: validatedData.report,
      createdAt: serverTimestamp(),
      status: 'new', // 'new', 'in-progress', 'resolved'
    });
    
    // Revalidate the path to ensure the admin panel shows the new report.
    revalidatePath('/admin/bug-reports');

    return { success: true, message: 'Thank you! Your bug report has been submitted.' };
  } catch (error) {
    console.error('Error submitting bug report:', error);
     if (error instanceof z.ZodError) {
      return { success: false, message: error.errors[0]?.message || 'Invalid data provided.' };
    }
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.',
    };
  }
}

