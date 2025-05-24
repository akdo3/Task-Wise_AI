
// This is an AI task assistant that provides suggestions on how to approach a task and generates content to improve task details.
'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiTaskAssistantInputSchema = z.object({
  subtasks: z.array(z.string()).describe('A list of subtasks for the task.'),
  priority: z.string().describe('The priority of the task (e.g., high, medium, low).'),
  description: z.string().describe('A detailed description of the task. This could be the title if no explicit description is provided.'),
  dueDate: z.string().describe('The due date of the task.'),
  reminder: z.string().describe('A reminder for the task.'),
  tags: z.array(z.string()).describe('A list of tags associated with the task.'),
  imageUrl: z.string().optional().describe("An optional URL of an image related to the task."),
});

export type AiTaskAssistantInput = z.infer<typeof AiTaskAssistantInputSchema>;

const AiTaskAssistantOutputSchema = z.object({
  approachSuggestions: z.array(z.string()).describe('Suggestions on how to approach the task. These should be actionable and concise.'),
  improvedDescription: z.string().describe('An improved, more detailed, and clear description of the task. If the original description was good, refine it subtly or confirm its quality.'),
  generatedSubtasks: z.array(z.string()).describe('A list of generated subtasks for the task. These should be distinct from provided subtasks and help break down the main task further.'),
  suggestedEmoji: z.string().optional().describe("A single, relevant emoji character that could be prepended to the task title. For example: '🎉' or '🛒'. If no suitable emoji, this can be omitted."),
  suggestedTagline: z.string().optional().describe("A short, creative, and motivational tagline or motto for the task (max 10 words). For example: 'Let's get this done!' or 'Conquer the challenge!'. If no suitable tagline, this can be omitted."),
});

export type AiTaskAssistantOutput = z.infer<typeof AiTaskAssistantOutputSchema>;

export async function aiTaskAssistant(input: AiTaskAssistantInput): Promise<AiTaskAssistantOutput> {
  return aiTaskAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiTaskAssistantPrompt',
  input: {schema: AiTaskAssistantInputSchema},
  output: {schema: AiTaskAssistantOutputSchema},
  prompt: `You are an AI assistant designed to help users plan and execute their tasks efficiently with a focus on clarity, conciseness, and a bit of creative flair.

  Based on the task details provided, suggest actionable ways to approach the task, generate an improved task description, suggest additional relevant subtasks, a relevant emoji for the title, and a short creative tagline.

  Task Details:
  Description: {{{description}}}
  Priority: {{{priority}}}
  Due Date: {{#if dueDate}}{{{dueDate}}}{{else}}Not set{{/if}}
  Reminder: {{#if reminder}}{{{reminder}}}{{else}}Not set{{/if}}
  Current Subtasks: {{#if subtasks.length}}{{join subtasks ", "}}{{else}}None provided{{/if}}
  Tags: {{#if tags.length}}{{join tags ", "}}{{else}}None provided{{/if}}
  {{#if imageUrl}}Associated Image URL: {{{imageUrl}}}{{/if}}

  Your Goal:
  1.  **Improved Description**: Refine the provided description. Make it clearer, more actionable, and comprehensive if needed. If it's already good, you can state that or make minor enhancements.
  2.  **Approach Suggestions**: Provide 2-3 concise, actionable suggestions on how to best tackle this task.
  3.  **Generated Subtasks**: Suggest 2-4 new, relevant subtasks that would help complete the main task. Do not repeat existing subtasks. If no further subtasks are logical, provide an empty array.
  4.  **Suggested Emoji**: Suggest a single, relevant emoji (just the character, e.g., '🎉') suitable for prepending to the task title. If unsure, omit this field.
  5.  **Suggested Tagline**: Suggest a short (max 10 words), creative, and motivational tagline for the task. If unsure, omit this field.

  Format your output STRICTLY as a JSON object matching the defined output schema.
  Ensure generated subtasks are distinct and add value.
  Keep all text concise and professional.
  `,
});

const aiTaskAssistantFlow = ai.defineFlow(
  {
    name: 'aiTaskAssistantFlow',
    inputSchema: AiTaskAssistantInputSchema,
    outputSchema: AiTaskAssistantOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);

