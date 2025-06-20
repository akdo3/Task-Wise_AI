'use server';
/**
 * @fileOverview A Genkit flow to suggest a random task title, description, priority, relevant tags, and initial subtasks.
 *
 * - suggestRandomTask - A function that handles random task suggestion.
 * - SuggestRandomTaskOutput - The return type for the suggestRandomTask function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { Priority } from '@/types';

const SuggestRandomTaskOutputSchema = z.object({
  suggestedTitle: z.string().describe("A single, concise, and actionable random task title. Examples: 'Organize your bookshelf', 'Learn a new recipe', 'Go for a 15-minute walk', 'Sketch a flower'."),
  suggestedDescription: z.string().max(150).optional().describe("A brief, 1-2 sentence description for the suggested task. Example: 'Take a short break and enjoy some fresh air to clear your mind.'"),
  suggestedPriority: z.enum(['low', 'medium', 'high'] as [Priority, ...Priority[]]).optional().describe("A suitable priority (low, medium, or high) for the suggested task."),
  suggestedTags: z.array(z.string()).max(2).optional().describe("One or two relevant, common tags for the suggested task. E.g., ['creative', 'home'], ['health', 'exercise'], ['learning']. Keep tags to single words if possible."),
  suggestedSubtasks: z.array(z.string()).max(2).optional().describe("One or two concise, actionable subtasks to help get started with the suggested main task. If no subtasks make sense, provide an empty array. Example: ['Research destinations', 'Set a budget']"),
});
export type SuggestRandomTaskOutput = z.infer<typeof SuggestRandomTaskOutputSchema>;

export async function suggestRandomTask(): Promise<SuggestRandomTaskOutput> {
  return suggestRandomTaskFlow();
}

const prompt = ai.definePrompt({
  name: 'suggestRandomTaskPrompt',
  output: {schema: SuggestRandomTaskOutputSchema},
  prompt: `You are a creative assistant. Suggest a single, concise, and actionable random task.
The task can be productive, creative, a simple chore, or for well-being.
Also, suggest:
1.  A very brief (1-2 sentences, max 150 characters) description for the task.
2.  A suitable priority (low, medium, or high) for the task.
3.  One or two relevant, common, single-word tags for this task.
4.  One or two concise, actionable subtasks to help get started with the suggested main task. If no subtasks make sense, provide an empty array.

Provide the task title, description, priority, its associated tags, and suggested subtasks. Make the title interesting and not too generic.

Examples of good suggestions (including subtasks):
Title: Plan a weekend getaway, Description: Research and outline a potential weekend trip, including destination ideas and budget considerations., Priority: medium, Tags: ["travel", "planning"], Subtasks: ["Research destinations", "Set a budget"]
Title: Write a thank-you note, Description: Express gratitude to someone who has helped you recently with a handwritten note., Priority: low, Tags: ["personal", "communication"], Subtasks: ["Draft the note content", "Mail the note"]
Title: Try a new type of tea or coffee, Description: Brew and taste a new variety of tea or coffee you haven't tried before., Priority: low, Tags: ["food", "discovery"], Subtasks: ["Buy a new tea/coffee variety", "Prepare and taste it"]
Title: Declutter your digital desktop, Description: Organize files and remove unnecessary shortcuts from your computer desktop to improve focus., Priority: medium, Tags: ["organization", "digital"], Subtasks: ["Delete unused files", "Organize shortcuts into folders"]
Title: Learn 5 new words in a different language, Description: Use a language app or website to learn and practice five new vocabulary words., Priority: low, Tags: ["learning", "language"], Subtasks: ["Choose a language app", "Practice the new words"]

Return ONLY the suggested title, description, priority, tags, and subtasks in the specified JSON output format.`,
});

const suggestRandomTaskFlow = ai.defineFlow(
  {
    name: 'suggestRandomTaskFlow',
    outputSchema: SuggestRandomTaskOutputSchema,
  },
  async () => {
    const {output} = await prompt({});
    return output!;
  }
);

