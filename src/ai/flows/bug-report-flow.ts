'use server';
/**
 * @fileOverview A flow for sending a bug report summary via SMS.
 *
 * - sendBugReportSms - A function that takes bug report details and sends an SMS.
 * - BugReportSmsInput - The Zod schema and type for the bug report input.
 * - BugReportSmsOutput - The Zod schema and type for the function's output.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Schema for the input of the bug report
const BugReportSmsInputSchema = z.object({
  userName: z.string().optional().default('N/A'),
  description: z.string(),
  severity: z.string().optional().default('N/A'),
});
export type BugReportSmsInput = z.infer<typeof BugReportSmsInputSchema>;

// Schema for the output of the sendBugReportSms function
const BugReportSmsOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type BugReportSmsOutput = z.infer<typeof BugReportSmsOutputSchema>;

/**
 * Takes a bug report object, sends it via a simulated SMS, and returns a success status.
 * @param input The bug report details.
 * @returns A promise that resolves to a success or failure message.
 */
export async function sendBugReport(input: BugReportSmsInput): Promise<BugReportSmsOutput> {
  const result = await bugSmsReporter(input);
  
  if (result.sent) {
    return { success: true, message: "Bug report SMS has been sent successfully." };
  }
  return { success: false, message: result.message || "The model did not send the SMS. You may need to try again." };
}

// This is a mock tool. In a real application, this would use an SMS service
// like Twilio to actually send an SMS.
const sendSmsTool = ai.defineTool(
  {
    name: 'sendSmsTool',
    description: 'Sends an SMS to a specified phone number with a message body.',
    inputSchema: z.object({
      to: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format.'),
      body: z.string(),
    }),
    outputSchema: z.object({
      success: z.boolean(),
    }),
  },
  async (input) => {
    console.log('//////////////////////////////////////////////////');
    console.log('BUG REPORT SMS (SIMULATED)');
    console.log(`To: ${input.to}`);
    console.log(`Body: \n${input.body}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log('//////////////////////////////////////////////////');
    // In a real scenario, you would have your SMS sending logic here.
    return { success: true };
  }
);

const bugSmsReporter = ai.defineFlow(
  {
    name: 'bugSmsReporter',
    inputSchema: BugReportSmsInputSchema,
    outputSchema: z.object({
      sent: z.boolean(),
      message: z.string().optional(),
    }),
  },
  async (report) => {
    // Constructing a concise SMS body
    const smsBody = `
New Bug Report:
User: ${report.userName}
Severity: ${report.severity}
Description: ${report.description.substring(0, 80)}${report.description.length > 80 ? '...' : ''}
Time: ${new Date().toLocaleTimeString()}
`.trim();

    const llmResponse = await ai.generate({
      prompt: `A user has submitted a bug report. Your only task is to send this report as an SMS to '+918800795476' using the provided sendSmsTool.

SMS Body:
"""
${smsBody}
"""
`,
      tools: [sendSmsTool],
    });
    
    // Check if the tool was called. This is the most reliable way to check for success.
    if (llmResponse.toolRequests.length > 0) {
        return { sent: true };
    }

    // If the tool was not called, then it's a failure.
    return { sent: false, message: "The model decided not to send the SMS. " + llmResponse.text };
  }
);
