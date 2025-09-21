
'use server';
/**
 * @fileOverview A flow for sending a detailed bug report via email.
 *
 * - sendBugReport - A function that takes a bug report object and sends it.
 * - BugReportInput - The Zod schema and type for the bug report input.
 * - BugReportOutput - The Zod schema and type for the function's output.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Schema for the input of the bug report
const BugReportInputSchema = z.object({
  userName: z.string().optional().default('Not provided'),
  description: z.string(),
  steps: z.string().optional().default('Not provided'),
  severity: z.string().optional().default('Not specified'),
  deviceInfo: z.string().optional().default('Not provided'),
});
export type BugReportInput = z.infer<typeof BugReportInputSchema>;

// Schema for the output of the sendBugReport function
const BugReportOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type BugReportOutput = z.infer<typeof BugReportOutputSchema>;

/**
 * Takes a bug report object, sends it via a simulated email, and returns a success status.
 * @param input The bug report details.
 * @returns A promise that resolves to a success or failure message.
 */
export async function sendBugReport(input: BugReportInput): Promise<BugReportOutput> {
  // Add a server-side timestamp
  const fullReport = {
    ...input,
    submittedAt: new Date().toUTCString(),
  };

  const result = await bugReporter(fullReport);
  
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
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log('//////////////////////////////////////////////////');
    // In a real scenario, you would have your email sending logic here.
    // For now, we'll just simulate a successful send.
    return { success: true };
  }
);


const bugReporter = ai.defineFlow(
  {
    name: 'bugReporter',
    inputSchema: BugReportInputSchema.extend({ submittedAt: z.string() }),
    outputSchema: z.object({
      sent: z.boolean(),
      message: z.string().optional(),
    }),
  },
  async (report) => {
    const emailBody = `
Bug Report Details:

User Name: ${report.userName}
Description: ${report.description}
Steps to Reproduce: ${report.steps}
Severity: ${report.severity}
Device Info: ${report.deviceInfo}
Submitted At: ${report.submittedAt}

Please review the bug report in the admin panel or follow up accordingly.
`;

    const llmResponse = await ai.generate({
      prompt: `A user has submitted a bug report. Your task is to send this report to 'pandeyji5544@gmail.com' using the provided sendEmailTool.

The subject of the email must be "New Bug Report Submitted".
The body of the email must be the formatted text provided below.

Email Body:
"""
${emailBody}
"""
`,
      tools: [sendEmailTool],
      model: 'googleai/gemini-pro',
    });
    
    // Check if the tool was called and return a confirmation message.
    // This is the most reliable way to check for success.
    if (llmResponse.toolRequests.length > 0) {
        return { sent: true };
    }

    // If the tool was not called, then it's a failure.
    return { sent: false, message: "The model decided not to send the email. " + llmResponse.text };
  }
);
