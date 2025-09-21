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
  prompt: `You are a helpful assistant that generates notifications for students regarding their attendance.

  Generate a notification message based on the student's current attendance percentage, the target attendance percentage, and the number of classes needed to reach the target.

  Subject Name: {{{subjectName}}}
  Attendance Percentage: {{{attendancePercentage}}}
  Attendance Target: {{{attendanceTarget}}}
  Classes Needed: {{{classesNeeded}}}

  Consider these cases when creating a notification:
  - If the attendance percentage is below the target, encourage the student to attend the required number of classes.
  - If the attendance percentage is near the target (e.g., within 5%), gently remind the student to maintain their attendance.
  - If the attendance percentage is above the target, congratulate the student and encourage them to keep up the good work.
  - If the number of classes needed to reach the target is zero, then congratulate the student for being at the target already.

  Notification:`,
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
