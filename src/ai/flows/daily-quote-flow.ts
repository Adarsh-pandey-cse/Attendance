
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
  previousQuotes: z.array(z.string()).optional(),
});

const DailyQuoteOutputSchema = z.object({
  quote: z.string().describe('The motivational quote.'),
});
export type DailyQuoteOutput = z.infer<typeof DailyQuoteOutputSchema>;

const previousQuotes: string[] = [];

export async function getDailyQuote(theme?: string): Promise<DailyQuoteOutput> {
  return getDailyQuoteFlow({ isRadhaRaniTheme: theme === 'radha-rani' });
}

const prompt = ai.definePrompt({
  name: 'dailyQuotePrompt',
  input: {schema: DailyQuoteInputSchema},
  output: {schema: DailyQuoteOutputSchema},
  prompt: `You are an expert at providing short, powerful, motivational quotes.
  {{#if isRadhaRaniTheme}}
  Please provide one short, powerful, motivational quote related to Radha Krishna, spiritual love, or devotion. The tone should be uplifting and serene.
  {{else}}
  Please provide one short, powerful, motivational quote by Premanand ji Maharaj in Hindi. The quote MUST be in Hindi script.
  {{/if}}
  
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
    inputSchema: z.object({ isRadhaRaniTheme: z.boolean().optional() }),
    outputSchema: DailyQuoteOutputSchema,
  },
  async ({ isRadhaRaniTheme }) => {
    let attempts = 0;
    while (attempts < 5) {
      const {output} = await prompt({ previousQuotes, isRadhaRaniTheme });
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
    if (isRadhaRaniTheme) {
      return { quote: "Let your soul be filled with the divine melody of 'Radhe Krishna'."}
    }
    return { quote: "राधा नाम का आश्रय करने से, मनुष्य का जीवन सफल हो जाता है।" };
  }
);
