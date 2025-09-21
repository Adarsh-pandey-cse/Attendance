
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

export const getDailyQuote = ai.defineFlow(
  {
    name: 'getDailyQuoteFlow',
    inputSchema: z.object({}),
    outputSchema: DailyQuoteOutputSchema,
    cache: {ttl: 0}, // Disable caching to get a new quote every time.
  },
  async () => {
    const {output} = await ai.generate({
      prompt: `You are an expert at providing short, powerful, motivational quotes.

      Please provide a unique, short, powerful, and grammatically correct motivational quote by Premanand ji Maharaj.
      
      The quote MUST be in Hindi script. Ensure the Hindi is accurate and well-formed.
    
      Quote:`,
      output: {
        schema: DailyQuoteOutputSchema,
      },
    });
    return output!;
  }
);
