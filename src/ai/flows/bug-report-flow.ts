'use server';
/**
 * @fileOverview A flow for sending a bug report.
 *
 * - sendBugReport - A function that takes a bug description and sends it.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const BugReportInputSchema = z.string().describe('The description of the bug.');
export type BugReportInput = z.infer<typeof BugReportInputSchema>;

const BugReportOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type BugReportOutput = z.infer<typeof BugReportOutputSchema>;

export async function sendBugReport(input: BugReportInput): Promise<BugReportOutput> {
  const result = await bugReporter(input);
  if (result.sent) {
    return { success: true, message: "Bug report has been sent successfully." };
  }
  return { success: false, message: result.message || "The model did not send the bug report. You may need to try again." };
}

// This is a mock tool. In a real application, this would use an email service
// like Nodemailer or an API like SendGrid to actually send an email.
// For this environment, we simulate the action and log it.
const sendEmailTool = ai.defineTool(
  {
    name: 'sendEmailTool',
    description: 'Sends an email to a specified recipient with a subject and body.',
    inputSchema: z.object({
      to: z.string().email(),
      subject: z.string(),
      body: z.string(),
    }),
    outputSchema: z.object({
      success: z.boolean(),
    }),
  },
  async (input) => {
    console.log('//////////////////////////////////////////////////');
    console.log('BUG REPORT EMAIL (SIMULATED)');
    console.log(`To: ${input.to}`);
    console.log(`Subject: ${input.subject}`);
    console.log(`Body: \n${input.body}`);
    console.log('//////////////////////////////////////////////////');
    // In a real scenario, you would have your email sending logic here.
    // For now, we'll just simulate a successful send.
    return { success: true };
  }
);


const bugReporter = ai.defineFlow(
  {
    name: 'bugReporter',
    inputSchema: BugReportInputSchema,
    outputSchema: z.object({
      sent: z.boolean(),
      message: z.string().optional(),
    }),
  },
  async (bugReport) => {
    const llmResponse = await ai.generate({
      prompt: `A user has submitted the following bug report. Your task is to send this report to 'pandeyji5544@gmail.com' using the provided sendEmailTool.

The subject of the email must be "Bug Report from AttendX App".
The body of the email must be the user's report.

Bug Report:
"""
${bugReport}
"""
`,
      tools: [sendEmailTool],
      model: 'googleai/gemini-2.5-flash',
    });
    
    // Check if the tool was called and return a confirmation message.
    if (llmResponse.toolRequests.length > 0) {
      return { sent: true };
    }

    return { sent: false, message: llmResponse.text };
  }
);
