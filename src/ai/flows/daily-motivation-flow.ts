
'use server';
/**
 * @fileOverview A Genkit flow to suggest a daily motivational tip or quote.
 *
 * - getDailyMotivationalTipFlow - A function that handles the suggestion.
 * - DailyMotivationalTipOutput - The return type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DailyMotivationalTipOutputSchema = z.object({
  tipOrQuote: z.string().describe("A single, concise motivational tip or inspiring quote (max 30 words). Examples: 'The secret of getting ahead is getting started.' or 'Break big tasks into smaller, manageable steps.'"),
});
export type DailyMotivationalTipOutput = z.infer<typeof DailyMotivationalTipOutputSchema>;

export async function getDailyMotivationalTipFlow(): Promise<DailyMotivationalTipOutput> { // Renamed exported function
  return dailyMotivationalTipInternalFlow(); // Calls the internal flow
}

const prompt = ai.definePrompt({
  name: 'dailyMotivationalTipPrompt',
  output: {schema: DailyMotivationalTipOutputSchema},
  prompt: `You are a source of daily wisdom. Provide a single, concise motivational tip or an inspiring quote.
It should be relevant to productivity, task management, personal growth, or achieving goals.
Keep it short, ideally under 25 words, and definitely under 30 words.
Focus on being encouraging and actionable.

Examples:
- "Focus on progress, not perfection."
- "One small positive thought in the morning can change your whole day."
- "The best way to predict the future is to create it."
- "Tackle your most important task first thing in the morning."

Return ONLY the tip or quote in the specified JSON output format.`,
});

const dailyMotivationalTipInternalFlow = ai.defineFlow( // Renamed internal flow
  {
    name: 'dailyMotivationalTipInternalFlow', // Renamed internal flow name
    outputSchema: DailyMotivationalTipOutputSchema,
  },
  async () => {
    const {output} = await prompt({});
    return output!;
  }
);
