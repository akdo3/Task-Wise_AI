// This is an AI task assistant that provides suggestions on how to approach a task and generates content to improve task details.
'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiTaskAssistantInputSchema = z.object({
  subtasks: z.array(z.string()).describe('A list of subtasks for the task.'),
  priority: z.string().describe('The priority of the task (e.g., high, medium, low).'),
  description: z.string().describe('A detailed description of the task.'),
  dueDate: z.string().describe('The due date of the task.'),
  reminder: z.string().describe('A reminder for the task.'),
  tags: z.array(z.string()).describe('A list of tags associated with the task.'),
  image: z
    .string()
    .optional()
    .describe(
      "A image of the task as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

export type AiTaskAssistantInput = z.infer<typeof AiTaskAssistantInputSchema>;

const AiTaskAssistantOutputSchema = z.object({
  approachSuggestions: z.array(z.string()).describe('Suggestions on how to approach the task.'),
  improvedDescription: z.string().describe('An improved description of the task.'),
  generatedSubtasks: z.array(z.string()).describe('A list of generated subtasks for the task.'),
});

export type AiTaskAssistantOutput = z.infer<typeof AiTaskAssistantOutputSchema>;

export async function aiTaskAssistant(input: AiTaskAssistantInput): Promise<AiTaskAssistantOutput> {
  return aiTaskAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiTaskAssistantPrompt',
  input: {schema: AiTaskAssistantInputSchema},
  output: {schema: AiTaskAssistantOutputSchema},
  prompt: `You are an AI assistant designed to help users plan and execute their tasks efficiently.

  Based on the task details provided, suggest how to approach the task and generate content to improve task details.

  Task Details:
  Subtasks: {{#each subtasks}}{{{this}}}, {{/each}}
  Priority: {{{priority}}}
  Description: {{{description}}}
  Due Date: {{{dueDate}}}
  Reminder: {{{reminder}}}
  Tags: {{#each tags}}{{{this}}}, {{/each}}
  {{#if image}}Image: {{media url=image}}{{/if}}

  Provide suggestions on how to approach the task. Generate content to improve task details, such as a new description and additional subtasks.
  Format your output as a JSON object matching the schema.
  `,
});

const aiTaskAssistantFlow = ai.defineFlow(
  {
    name: 'aiTaskAssistantFlow',
    inputSchema: AiTaskAssistantInputSchema,
    outputSchema: AiTaskAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
