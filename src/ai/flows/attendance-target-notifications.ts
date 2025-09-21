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
  prompt: `You are an assistant that generates motivational notifications for students in Hindi.

  Your task is to generate a supportive and encouraging message in HINDI for a student whose attendance is low. The tone should be positive and motivating, not scolding.

  Here is the student's data:
  Subject Name: {{{subjectName}}}
  Attendance Percentage: {{{attendancePercentage}}}
  Attendance Target: {{{attendanceTarget}}}
  Classes Needed to reach target: {{{classesNeeded}}}

  The notification MUST be short, sensible, and written in grammatically correct Hindi.
  Example: "थोड़ी और मेहनत, और आप लक्ष्य तक पहुँच जाएँगे।"
  
  Do not use any English words. The entire response must be in Hindi script.

  Generate the notification now.`,
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
