
'use server';

/**
 * @fileOverview Server-side actions for the application.
 */

import { db, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { z } from 'zod';
import { DeveloperInfo } from '@/types';

// --- Bug Report Actions ---

/**
 * Saves a bug report with optional attachments.
 * - Uploads files to Firebase Storage.
 * - Saves bug report details (including file URLs) to Firestore.
 * @param formData - The FormData object from the bug report form.
 * @returns An object indicating success or failure with a message.
 */
export async function saveBugReport(
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  try {
    const description = formData.get('description') as string;
    const userName = formData.get('userName') as string;
    const deviceInfo = formData.get('deviceInfo') as string;
    const files = formData.getAll('attachments') as File[];

    if (!description || description.trim() === '') {
      return { success: false, message: 'Bug description cannot be empty.' };
    }

    const attachmentUrls = [];

    // Loop through and upload each file individually
    for (const file of files) {
      if (file.size > 0) {
        try {
          const storageRef = ref(storage, `bug-attachments/${Date.now()}-${file.name}`);
          const buffer = await file.arrayBuffer(); // Convert file to buffer
          const snapshot = await uploadBytes(storageRef, buffer);
          const downloadURL = await getDownloadURL(snapshot.ref);
          attachmentUrls.push({ name: file.name, url: downloadURL });
        } catch (uploadError) {
          console.error('Error uploading a file:', uploadError);
          // Stop and return an error if any file fails to upload
          return { success: false, message: `Failed to upload file: ${file.name}.` };
        }
      }
    }
    
    // Save the bug report to Firestore
    const bugReportsColRef = collection(db, 'bug-reports');
    await addDoc(bugReportsColRef, {
      userName,
      description,
      deviceInfo,
      attachments: attachmentUrls,
      timestamp: serverTimestamp(),
      status: 'new',
    });

    return { success: true, message: 'Bug report submitted successfully!' };

  } catch (error) {
    console.error('Error saving bug report:', error);
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
