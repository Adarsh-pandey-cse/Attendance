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

  // =================================================================================
  // IMPORTANT: Replace the placeholder IDs below with the actual 'entry.xxxx' 
  // IDs from your Google Form.
  //
  // HOW TO FIND THE IDs:
  // 1. Open your Google Form in your browser.
  // 2. Right-click on the "Username" input field and select "Inspect" or "Inspect Element".
  // 3. In the developer tools, find the <input> element. Look for its 'name' attribute.
  //    It will look like 'entry.123456789'. Copy this entire value.
  // 4. Repeat the process for the "Bug Description" field.
  // =================================================================================
  const fieldMapping = {
    userName: 'entry.REPLACE_WITH_YOUR_USERNAME_FIELD_ID',       // E.g., 'entry.123456789'
    description: 'entry.REPLACE_WITH_YOUR_DESCRIPTION_FIELD_ID', // E.g., 'entry.987654321'
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
