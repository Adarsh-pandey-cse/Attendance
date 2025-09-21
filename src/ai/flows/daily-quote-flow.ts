
'use server';
/**
 * @fileOverview A flow for getting a daily motivational quote.
 *
 * - getDailyQuote - A function that returns a unique daily quote.
 * - DailyQuoteOutput - The return type for the getDailyQuote function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input schema is now empty as we don't need theme information.
const DailyQuoteInputSchema = z.object({});

export type DailyQuoteInput = z.infer<typeof DailyQuoteInputSchema>;

const DailyQuoteOutputSchema = z.object({
  quote: z.string().describe('The motivational quote.'),
});
export type DailyQuoteOutput = z.infer<typeof DailyQuoteOutputSchema>;

export async function getDailyQuote(): Promise<DailyQuoteOutput> {
  const {output} = await getDailyQuoteFlow({});
  return output!;
}

const prompt = ai.definePrompt({
  name: 'dailyQuotePrompt',
  input: {schema: DailyQuoteInputSchema},
  output: {schema: DailyQuoteOutputSchema},
  prompt: `You are an expert at providing short, powerful, motivational quotes.

  Please provide a unique, short, powerful, and grammatically correct motivational quote by Premanand ji Maharaj.
  
  The quote MUST be in Hindi script. Ensure the Hindi is accurate and well-formed.

  Quote:`,
});

const getDailyQuoteFlow = ai.defineFlow(
  {
    name: 'getDailyQuoteFlow',
    inputSchema: DailyQuoteInputSchema,
    outputSchema: DailyQuoteOutputSchema,
  },
  async () => {
    const {output} = await prompt({});
    return output!;
  }
);
