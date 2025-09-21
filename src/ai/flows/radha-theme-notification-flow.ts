
'use server';

/**
 * @fileOverview Flow for generating Radha-theme attendance target notifications.
 *
 * - `radhaThemeAttendanceNotification`:  A function that generates notifications in the style of Premanand ji Maharaj.
 * - `RadhaThemeNotificationInput`: The input type for the radhaThemeAttendanceNotification function.
 * - `RadhaThemeNotificationOutput`: The return type for the radhaThemeAttendanceNotification function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RadhaThemeNotificationInputSchema = z.object({
  subjectName: z.string().describe('The name of the subject.'),
  attendancePercentage: z.number().describe('The current attendance percentage.'),
});
export type RadhaThemeNotificationInput = z.infer<
  typeof RadhaThemeNotificationInputSchema
>;

const RadhaThemeNotificationOutputSchema = z.object({
  notificationMessage: z.string().describe('The notification message to display in Hindi.'),
});
export type RadhaThemeNotificationOutput = z.infer<
  typeof RadhaThemeNotificationOutputSchema
>;

export async function radhaThemeAttendanceNotification(
  input: RadhaThemeNotificationInput
): Promise<RadhaThemeNotificationOutput> {
  return radhaThemeNotificationFlow(input);
}

const radhaThemeNotificationPrompt = ai.definePrompt({
  name: 'radhaThemeNotificationPrompt',
  input: {schema: RadhaThemeNotificationInputSchema},
  output: {schema: RadhaThemeNotificationOutputSchema},
  prompt: `You are a devotee and expert on the teachings of Premanand ji Maharaj. Your purpose is to provide his most profound, moving, and transformative quotes to encourage a student with low attendance.

  The student's attendance for the subject "{{subjectName}}" is only {{attendancePercentage}}%.

  Your task is to generate a supportive and encouraging message in HINDI, in the style of Premanand ji Maharaj. The tone should be gentle, loving, and motivational, focusing on duty (kartavya) and devotion.

  The quote MUST be in Hindi script. Ensure the Hindi is accurate and well-formed.
  The quote MUST be short, ideally one or two lines.

  Focus on themes like:
  - Performing one's duty with dedication.
  - The importance of not neglecting responsibilities.
  - Finding strength and focus through devotion.

  Example: "अपने कर्तव्य का पालन करो, श्रीजी सब संभाल लेंगे।"
  Another example: "सांसारिक कार्यों को भी सेवा समझकर करो, मन लगेगा।"

  Generate a loving and motivational notification now.`,
});

const radhaThemeNotificationFlow = ai.defineFlow(
  {
    name: 'radhaThemeNotificationFlow',
    inputSchema: RadhaThemeNotificationInputSchema,
    outputSchema: RadhaThemeNotificationOutputSchema,
  },
  async input => {
    const {output} = await radhaThemeNotificationPrompt(input);
    return output!;
  }
);
