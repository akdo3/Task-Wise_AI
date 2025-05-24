
// This is an AI task assistant that provides suggestions on how to approach a task and generates content to improve task details.
'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Public input schema for the flow
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

// Internal input schema for the prompt (uses pre-joined strings and hasImage flag)
const AiTaskAssistantPromptInputSchema = z.object({
  subtasksString: z.string().describe('A comma-separated string of subtasks for the task. Empty if no subtasks.'),
  priority: z.string().describe('The priority of the task (e.g., high, medium, low).'),
  description: z.string().describe('A detailed description of the task. This could be the title if no explicit description is provided.'),
  dueDate: z.string().describe('The due date of the task.'),
  reminder: z.string().describe('A reminder for the task.'),
  tagsString: z.string().describe('A comma-separated string of tags associated with the task. Empty if no tags.'),
  hasImage: z.boolean().describe("A flag indicating if an image is associated with the task."),
});

const AiTaskAssistantOutputSchema = z.object({
  approachSuggestions: z.array(z.string()).describe('Suggestions on how to approach the task. These should be actionable and concise.'),
  improvedDescription: z.string().describe('An improved, more detailed, and clear description of the task. If the original description was good, refine it subtly or confirm its quality.'),
  generatedSubtasks: z.array(z.string()).describe('A list of generated subtasks for the task. These should be distinct from provided subtasks and help break down the main task further. If no further subtasks are logical, provide an empty array.'),
  suggestedEmoji: z.string().optional().describe("A single, relevant emoji character that could be prepended to the task title. For example: '🎉' or '🛒'. If no suitable emoji, this can be omitted."),
  suggestedTagline: z.string().optional().describe("A short, creative, and motivational tagline or motto for the task (max 10 words). For example: 'Let's get this done!' or 'Conquer the challenge!'. If no suitable tagline, this can be omitted."),
  suggestedImageQuery: z.string().max(40).optional().describe("A concise and descriptive prompt (max 7 words) suitable for an image generation model to create a relevant image for this task. E.g., 'professional team collaborating on project' or 'serene mountain landscape at dawn'. This is only generated if no image is associated with the task (hasImage is false)."),
  suggestedTaskVibe: z.string().max(25).optional().describe("A short, one or two-word vibe or mood for the task based on its content (max 25 chars), e.g., 'Focused Work', 'Creative Burst', 'Quick Win', 'Urgent Call', 'Relaxed Read'. Omit if no clear vibe emerges."),
});

export type AiTaskAssistantOutput = z.infer<typeof AiTaskAssistantOutputSchema>;

export async function aiTaskAssistant(input: AiTaskAssistantInput): Promise<AiTaskAssistantOutput> {
  return aiTaskAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiTaskAssistantPrompt',
  input: {schema: AiTaskAssistantPromptInputSchema}, // Uses internal schema
  output: {schema: AiTaskAssistantOutputSchema},
  prompt: `You are an AI assistant designed to help users plan and execute their tasks efficiently with a focus on clarity, conciseness, and a bit of creative flair.

  Based on the task details provided, suggest actionable ways to approach the task, generate an improved task description, suggest additional relevant subtasks, a relevant emoji for the title, a short creative tagline, (if no image is associated with the task) a concise image generation query, and a short task vibe.

  Task Details:
  Description: {{{description}}}
  Priority: {{{priority}}}
  Due Date: {{#if dueDate}}{{{dueDate}}}{{else}}Not set{{/if}}
  Reminder: {{#if reminder}}{{{reminder}}}{{else}}Not set{{/if}}
  Current Subtasks: {{#if subtasksString}}{{{subtasksString}}}{{else}}None provided{{/if}}
  Tags: {{#if tagsString}}{{{tagsString}}}{{else}}None provided{{/if}}
  Image Associated: {{#if hasImage}}Yes{{else}}No image provided by user.{{/if}}

  Your Goal:
  1.  **Improved Description**: Refine the provided description. Make it clearer, more actionable, and comprehensive if needed. If it's already good, you can state that or make minor enhancements.
  2.  **Approach Suggestions**: Provide 2-3 concise, actionable suggestions on how to best tackle this task.
  3.  **Generated Subtasks**: Suggest 2-4 new, relevant subtasks that would help complete the main task. Do not repeat existing subtasks. If no further subtasks are logical, provide an empty array.
  4.  **Suggested Emoji**: Suggest a single, relevant emoji (just the character, e.g., '🎉') suitable for prepending to the task title. If unsure, omit this field.
  5.  **Suggested Tagline**: Suggest a short (max 10 words), creative, and motivational tagline for the task. If unsure, omit this field.
  6.  **Suggested Image Query**: {{#if hasImage}}You can omit this field as an image is already associated with the task.{{else}}Suggest a concise and descriptive prompt (max 7 words, e.g., 'professional team meeting' or 'serene forest path') that would be suitable for an image generation model to create a relevant visual for this task. If unsure, omit this field.{{/if}}
  7.  **Suggested Task Vibe**: Analyze the task's content and suggest a short (1-3 words, max 25 characters) 'vibe' or 'mood' for it. Examples: 'Focused Work', 'Creative Burst', 'Quick Win', 'Urgent Call', 'Relaxed Read'. If no strong vibe is apparent, omit this field.

  Format your output STRICTLY as a JSON object matching the defined output schema.
  Ensure generated subtasks are distinct and add value.
  Keep all text concise and professional.
  `,
});

const aiTaskAssistantFlow = ai.defineFlow(
  {
    name: 'aiTaskAssistantFlow',
    inputSchema: AiTaskAssistantInputSchema, // Flow uses public schema
    outputSchema: AiTaskAssistantOutputSchema,
  },
  async (input) => { // input here has .subtasks and .tags as arrays
    const subtasksString = input.subtasks.join(', ');
    const tagsString = input.tags.join(', ');
    const hasImage = !!input.imageUrl && input.imageUrl.trim() !== '';

    // Prepare payload for the prompt, matching AiTaskAssistantPromptInputSchema
    const promptPayload = {
      description: input.description,
      priority: input.priority,
      dueDate: input.dueDate,
      reminder: input.reminder,
      subtasksString: subtasksString,
      tagsString: tagsString,
      hasImage: hasImage,
    };
    
    const {output} = await prompt(promptPayload);
    return output!;
  }
);

