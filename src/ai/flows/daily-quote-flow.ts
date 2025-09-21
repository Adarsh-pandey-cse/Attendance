
'use server';
/**
 * @fileOverview A flow for getting a daily motivational quote.
 *
 * - getDailyQuote - A function that returns a unique daily quote.
 * - DailyQuoteOutput - The return type for the getDailyQuote function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DailyQuoteOutputSchema = z.object({
  quote: z.string().describe('The motivational quote.'),
});
export type DailyQuoteOutput = z.infer<typeof DailyQuoteOutputSchema>;

export async function getDailyQuote(): Promise<DailyQuoteOutput> {
  const {output} = await getDailyQuoteFlow();
  return output!;
}

const prompt = ai.definePrompt({
  name: 'dailyQuotePrompt',
  output: {schema: DailyQuoteOutputSchema},
  prompt: `You are an expert at providing short, powerful, motivational quotes. You will provide a unique quote each time.
  Please provide one short, powerful, motivational quote by Premanand ji Maharaj in Hindi. The quote MUST be in Hindi script.

  Quote:`,
});

const getDailyQuoteFlow = ai.defineFlow(
  {
    name: 'getDailyQuoteFlow',
    outputSchema: DailyQuoteOutputSchema,
  },
  async () => {
    const {output} = await prompt();
    return output!;
  }
);
