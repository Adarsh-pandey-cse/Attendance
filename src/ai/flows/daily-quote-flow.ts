
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
    cache: {ttl: 86400}, // Cache for 24 hours to prevent rate limiting.
  },
  async () => {
    const {output} = await ai.generate({
      prompt: `You are a devotee and expert on the teachings of Premanand ji Maharaj. Your purpose is to provide his most profound, moving, and transformative quotes.

      Please provide a unique, powerful, and grammatically correct quote by Premanand ji Maharaj. The quote should be inspiring and thought-provoking.
      
      The quote MUST be in Hindi script. Ensure the Hindi is accurate and well-formed.
      
      IMPORTANT: The quote MUST be short, ideally one line, and at most two lines.

      Focus on themes like:
      - The glory and name of Radha Rani (राधा नाम की महिमा).
      - The path to spiritual liberation (मुक्ति का मार्ग).
      - The nature of true devotion (सच्ची भक्ति का स्वरूप).
      - Overcoming ego and worldly attachments (अहंकार और सांसारिक मोह पर विजय).

      Example: "बिना राधा नाम के, शांति और आनंद का कोई दूसरा उपाय नहीं है।"

      Provide another profound and beautiful quote now.
    
      Quote:`,
      output: {
        schema: DailyQuoteOutputSchema,
      },
    });
    return output!;
  }
);
