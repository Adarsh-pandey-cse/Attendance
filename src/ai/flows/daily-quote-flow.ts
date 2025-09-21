
'use server';
/**
 * @fileOverview A flow for getting a daily motivational quote.
 *
 * - getDailyQuote - A function that returns a unique daily quote.
 * - DailyQuoteOutput - The return type for the getDailyQuote function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DailyQuoteInputSchema = z.object({
  isRadhaRaniTheme: z.boolean().describe('Whether the Radha Rani theme is active.'),
});

export type DailyQuoteInput = z.infer<typeof DailyQuoteInputSchema>;

const DailyQuoteOutputSchema = z.object({
  quote: z.string().describe('The motivational quote.'),
});
export type DailyQuoteOutput = z.infer<typeof DailyQuoteOutputSchema>;

export async function getDailyQuote(input: DailyQuoteInput): Promise<DailyQuoteOutput> {
  const {output} = await getDailyQuoteFlow(input);
  return output!;
}

const prompt = ai.definePrompt({
  name: 'dailyQuotePrompt',
  input: {schema: DailyQuoteInputSchema},
  output: {schema: DailyQuoteOutputSchema},
  prompt: `You are an expert at providing short, powerful, motivational quotes.

  {{#if isRadhaRaniTheme}}
  Please provide a short, powerful, motivational quote about Radha Krishna. The quote MUST be in Hindi script.
  {{else}}
  Please provide a unique, short, powerful, motivational quote by Premanand ji Maharaj. The quote MUST be in Hindi script.
  {{/if}}

  Quote:`,
});

const getDailyQuoteFlow = ai.defineFlow(
  {
    name: 'getDailyQuoteFlow',
    inputSchema: DailyQuoteInputSchema,
    outputSchema: DailyQuoteOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
