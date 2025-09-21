'use server';
/**
 * @fileOverview A flow for sending a bug report summary via SMS.
 *
 * - sendBugReport - A function that takes bug report details and sends an SMS.
 * - BugReportSmsInput - The Zod schema and type for the bug report input.
 * - BugReportSmsOutput - The Zod schema and type for the function's output.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Schema for the input of the bug report
const BugReportSmsInputSchema = z.object({
  userName: z.string().optional().default('N/A'),
  description: z.string(), // This will now be the pre-formatted string
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
  try {
    const result = await bugSmsReporter(input);
    if (result.success) {
      return { success: true, message: "Bug report SMS has been sent successfully." };
    } else {
      return { success: false, message: "The tool failed to send the SMS." };
    }
  } catch (error) {
    console.error('Error in bugSmsReporter flow:', error);
    return { success: false, message: 'An unexpected error occurred while sending the bug report.' };
  }
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
      success: z.boolean(),
    }),
  },
  async (report) => {
    // This flow now directly calls the tool, removing the LLM from the decision process.
    // This is a much more reliable way to guarantee the tool is executed.
    const toolResult = await sendSmsTool.run({
      to: '+918800795476',
      body: report.description,
    });
    
    return { success: toolResult.success };
  }
);
