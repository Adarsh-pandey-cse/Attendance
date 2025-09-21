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

const previousQuotes: string[] = [];

export async function getDailyQuote(): Promise<DailyQuoteOutput> {
  return getDailyQuoteFlow();
}

const prompt = ai.definePrompt({
  name: 'dailyQuotePrompt',
  output: {schema: DailyQuoteOutputSchema},
  prompt: `You are an expert at providing short, powerful, motivational quotes.
  
  Please provide one short, powerful, motivational quote.
  The quote should be unique and not one of the following:
  {{#if previousQuotes}}
  {{#each previousQuotes}}
  - "{{this}}"
  {{/each}}
  {{/if}}

  Quote:`,
});

const getDailyQuoteFlow = ai.defineFlow(
  {
    name: 'getDailyQuoteFlow',
    outputSchema: DailyQuoteOutputSchema,
  },
  async () => {
    let attempts = 0;
    while (attempts < 5) {
      const {output} = await prompt({ previousQuotes });
      const newQuote = output!.quote;

      if (!previousQuotes.includes(newQuote)) {
        previousQuotes.push(newQuote);
        // Keep the list of previous quotes to a reasonable size
        if (previousQuotes.length > 50) {
          previousQuotes.shift();
        }
        return { quote: newQuote };
      }
      attempts++;
    }
    // Fallback if we can't get a unique quote after 5 tries
    return { quote: "Believe you can and you're halfway there." };
  }
);
