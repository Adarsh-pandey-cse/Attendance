'use server';

import { z } from 'zod';

const GoogleFormInputSchema = z.object({
  userName: z.string().optional(),
  description: z.string(),
});

export type GoogleFormInput = z.infer<typeof GoogleFormInputSchema>;

export async function submitToGoogleForm(
  input: GoogleFormInput
): Promise<{ success: boolean; message: string }> {
  const formUrl =
    'https://docs.google.com/forms/d/e/1FAIpQLSf0uVM1M4fwvjpEpdvkVLwaUBPS_56hM4NWvnRkLMPPtX8PVA/formResponse';

  // IMPORTANT: Replace these placeholder IDs with the actual 'entry.xxxx' IDs from your Google Form's source code.
  // To find them:
  // 1. Open your Google Form in your browser.
  // 2. Right-click on a form field and select "Inspect".
  // 3. Find the <input> or <textarea> element and look for the 'name' attribute, which will be something like 'entry.123456789'.
  const fieldMapping = {
    userName: 'entry.YOUR_USERNAME_FIELD_ID',       // Replace with actual ID
    description: 'entry.YOUR_BUGDESCRIPTION_FIELD_ID', // Replace with actual ID
  };
  
  const formData = new URLSearchParams();
  formData.append(fieldMapping.userName, input.userName || 'Not provided');
  formData.append(fieldMapping.description, input.description);

  try {
    const response = await fetch(formUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
      mode: 'no-cors', // Important for sending to Google Forms to avoid CORS errors. The response will be opaque.
    });

    // With 'no-cors', we can't inspect the response status (it will be 0 or an opaque response).
    // We assume success if the request doesn't throw an error, which is the standard way to handle Google Form submissions.
    return { success: true, message: 'Bug report submitted successfully.' };

  } catch (error) {
    console.error('Error submitting to Google Form:', error);
    return {
      success: false,
      message: 'An unexpected error occurred while submitting the form.',
    };
  }
}
