'use server';
/**
 * @fileOverview A flow for sending a bug report.
 *
 * - sendBugReport - A function that takes a bug description and sends it.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const BugReportInputSchema = z.string().describe('The description of the bug.');
export type BugReportInput = z.infer<typeof BugReportInputSchema>;

const BugReportOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type BugReportOutput = z.infer<typeof BugReportOutputSchema>;

export async function sendBugReport(input: BugReportInput): Promise<BugReportOutput> {
  return sendBugReportFlow(input);
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


const bugReportPrompt = ai.definePrompt({
  name: 'bugReportPrompt',
  tools: [sendEmailTool],
  prompt: `A user has submitted a bug report. You must use the sendEmailTool to send this report to 'pandeyji5544@gmail.com'.

  The subject of the email should be "Bug Report from AttendX App".

  The body of the email should be the user's report, which is provided below:
  
  {{{prompt}}}
  `,
});


const sendBugReportFlow = ai.defineFlow(
  {
    name: 'sendBugReportFlow',
    inputSchema: BugReportInputSchema,
    outputSchema: BugReportOutputSchema,
  },
  async (bugDescription) => {
    // We just call the prompt and let the LLM call the tool.
    // The prompt already knows the recipient and the subject line.
    await bugReportPrompt({ prompt: bugDescription });

    return { success: true, message: 'Bug report sent successfully.' };
  }
);
