'use server';

/**
 * @fileOverview Flow for generating attendance target notifications.
 *
 * - `attendanceTargetNotifications`:  A function that triggers notifications if attendance nears or falls below the target.
 * - `AttendanceTargetNotificationsInput`: The input type for the attendanceTargetNotifications function.
 * - `AttendanceTargetNotificationsOutput`: The return type for the attendanceTargetNotifications function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AttendanceTargetNotificationsInputSchema = z.object({
  subjectName: z.string().describe('The name of the subject.'),
  attendancePercentage: z.number().describe('The current attendance percentage.'),
  attendanceTarget: z.number().describe('The target attendance percentage.'),
  classesNeeded: z.number().describe('The number of classes needed to reach the target.'),
});
export type AttendanceTargetNotificationsInput = z.infer<
  typeof AttendanceTargetNotificationsInputSchema
>;

const AttendanceTargetNotificationsOutputSchema = z.object({
  notificationMessage: z.string().describe('The notification message to display.'),
});
export type AttendanceTargetNotificationsOutput = z.infer<
  typeof AttendanceTargetNotificationsOutputSchema
>;

export async function attendanceTargetNotifications(
  input: AttendanceTargetNotificationsInput
): Promise<AttendanceTargetNotificationsOutput> {
  return attendanceTargetNotificationsFlow(input);
}

const attendanceTargetNotificationsPrompt = ai.definePrompt({
  name: 'attendanceTargetNotificationsPrompt',
  input: {schema: AttendanceTargetNotificationsInputSchema},
  output: {schema: AttendanceTargetNotificationsOutputSchema},
  prompt: `You are a witty and funny assistant that generates motivational notifications for students.

  Your task is to generate a supportive, funny, and encouraging message for a student whose attendance is low. The tone should be light-hearted and amusing, not scolding. Use humor to motivate them.

  Here is the student's data:
  Subject Name: {{{subjectName}}}
  Attendance Percentage: {{{attendancePercentage}}}
  Attendance Target: {{{attendanceTarget}}}
  Classes Needed to reach target: {{{classesNeeded}}}

  The notification MUST be short, witty, and funny.
  Example: "Your attendance is playing hide and seek. Time to be the seeker!"
  Another Example: "Are you a Wi-Fi signal? Because your connection to class is weak."

  Generate a funny and motivational notification now.`,
});

const attendanceTargetNotificationsFlow = ai.defineFlow(
  {
    name: 'attendanceTargetNotificationsFlow',
    inputSchema: AttendanceTargetNotificationsInputSchema,
    outputSchema: AttendanceTargetNotificationsOutputSchema,
  },
  async input => {
    const {output} = await attendanceTargetNotificationsPrompt(input);
    return output!;
  }
);
