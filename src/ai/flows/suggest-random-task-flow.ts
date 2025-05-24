
'use server';
/**
 * @fileOverview A Genkit flow to suggest a random task title and relevant tags.
 *
 * - suggestRandomTaskTitleFlow - A function that handles random task title and tag suggestion.
 * - SuggestRandomTaskOutput - The return type for the suggestRandomTaskTitleFlow function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// No specific input schema needed for a random suggestion, but define for consistency if expanded later.
// const SuggestRandomTaskInputSchema = z.object({});
// export type SuggestRandomTaskInput = z.infer<typeof SuggestRandomTaskInputSchema>;

const SuggestRandomTaskOutputSchema = z.object({
  suggestedTitle: z.string().describe("A single, concise, and actionable random task title. Examples: 'Organize your bookshelf', 'Learn a new recipe', 'Go for a 15-minute walk', 'Sketch a flower'."),
  suggestedTags: z.array(z.string()).max(2).optional().describe("One or two relevant, common tags for the suggested task. E.g., ['creative', 'home'], ['health', 'exercise'], ['learning']. Keep tags to single words if possible."),
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
Also, suggest one or two relevant, common, single-word tags for this task.

Provide just the task title and its associated tags. Make the title interesting and not too generic.

Examples of good suggestions:
Title: Plan a weekend getaway, Tags: ["travel", "planning"]
Title: Write a thank-you note to someone, Tags: ["personal", "writing"]
Title: Try a new type of tea or coffee, Tags: ["food", "discovery"]
Title: Declutter your digital desktop, Tags: ["organization", "digital"]
Title: Learn 5 new words in a different language, Tags: ["learning", "language"]

Return ONLY the suggested title and tags in the specified JSON output format.`,
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
