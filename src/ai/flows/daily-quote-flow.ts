
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
  isRadhaRaniTheme: z.boolean().optional().describe('Whether the current theme is Radha Rani.'),
});

const DailyQuoteOutputSchema = z.object({
  quote: z.string().describe('The motivational quote.'),
});
export type DailyQuoteOutput = z.infer<typeof DailyQuoteOutputSchema>;

export async function getDailyQuote(theme?: string): Promise<DailyQuoteOutput> {
  return getDailyQuoteFlow({ isRadhaRaniTheme: theme === 'radha-rani' });
}

const prompt = ai.definePrompt({
  name: 'dailyQuotePrompt',
  input: {schema: DailyQuoteInputSchema},
  output: {schema: DailyQuoteOutputSchema},
  prompt: `You are an expert at providing short, powerful, motivational quotes. You will provide a unique quote each time.
  {{#if isRadhaRaniTheme}}
  Please provide one short, powerful, motivational quote related to Radha Krishna, spiritual love, or devotion. The tone should be uplifting and serene.
  {{else}}
  Please provide one short, powerful, motivational quote by Premanand ji Maharaj in Hindi. The quote MUST be in Hindi script.
  {{/if}}

  Quote:`,
});

const getDailyQuoteFlow = ai.defineFlow(
  {
    name: 'getDailyQuoteFlow',
    inputSchema: z.object({ isRadhaRaniTheme: z.boolean().optional() }),
    outputSchema: DailyQuoteOutputSchema,
  },
  async ({ isRadhaRaniTheme }) => {
    const {output} = await prompt({ isRadhaRaniTheme });
    return output!;
  }
);
