
'use server';
/**
 * @fileOverview A Genkit flow to suggest a random task title.
 *
 * - suggestRandomTaskTitleFlow - A function that handles random task title suggestion.
 * - SuggestRandomTaskOutput - The return type for the suggestRandomTaskTitleFlow function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// No specific input schema needed for a random suggestion, but define for consistency if expanded later.
// const SuggestRandomTaskInputSchema = z.object({});
// export type SuggestRandomTaskInput = z.infer<typeof SuggestRandomTaskInputSchema>;

const SuggestRandomTaskOutputSchema = z.object({
  suggestedTitle: z.string().describe("A single, concise, and actionable random task title. Examples: 'Organize your bookshelf', 'Learn a new recipe', 'Go for a 15-minute walk', 'Sketch a flower'."),
});
export type SuggestRandomTaskOutput = z.infer<typeof SuggestRandomTaskOutputSchema>;

export async function suggestRandomTaskTitle(): Promise<SuggestRandomTaskOutput> {
  return suggestRandomTaskTitleFlow();
}

const prompt = ai.definePrompt({
  name: 'suggestRandomTaskPrompt',
  // input: {schema: SuggestRandomTaskInputSchema}, // No input needed for this version
  output: {schema: SuggestRandomTaskOutputSchema},
  prompt: `You are a creative assistant. Suggest a single, concise, and actionable random task.
The task can be productive, creative, a simple chore, or for well-being.
Provide just the task title. Make it interesting and not too generic.

Examples of good suggestions:
- Plan a weekend getaway
- Write a thank-you note to someone
- Try a new type of tea or coffee
- Declutter your digital desktop
- Learn 5 new words in a different language

Return ONLY the suggested title in the specified JSON output format.`,
});

const suggestRandomTaskTitleFlow = ai.defineFlow(
  {
    name: 'suggestRandomTaskTitleFlow',
    // inputSchema: SuggestRandomTaskInputSchema, // No input needed for this version
    outputSchema: SuggestRandomTaskOutputSchema,
  },
  async () => { // No input parameter needed
    const {output} = await prompt({}); // Call prompt with empty object as there's no input schema
    return output!;
  }
);
