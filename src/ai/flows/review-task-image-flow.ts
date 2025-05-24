'use server';
/**
 * @fileOverview A Genkit flow to review a task's image and provide feedback.
 *
 * - reviewTaskImage - The main flow function (exported).
 * - ReviewTaskImageInput - Input type for the flow (exported).
 * - ReviewTaskImageOutput - Output type for the flow (exported).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReviewTaskImageInputSchema = z.object({
  taskTitle: z.string().describe('The title of the task.'),
  taskDescription: z.string().optional().describe('The optional description of the task for more context.'),
  imageUrl: z.string().url().describe("The URL of the image to review. Must be a publicly accessible URL or a data URI that includes a MIME type and Base64 encoding (e.g., 'data:image/png;base64,...')."),
});
export type ReviewTaskImageInput = z.infer<typeof ReviewTaskImageInputSchema>;

const ReviewTaskImageOutputSchema = z.object({
  feedback: z.string().describe("Constructive feedback on the image's relevance, suitability, and quality for the given task. Be specific and helpful."),
  suggestedImageQuery: z.string().max(40).optional().describe("If the image could be improved or is not suitable, an optional concise query (max 7 words) for an image generation model to create a better alternative. E.g., 'serene workspace at sunrise' or 'team collaborating on a project'. Omit if the current image is good."),
});
export type ReviewTaskImageOutput = z.infer<typeof ReviewTaskImageOutputSchema>;

export async function reviewTaskImage(input: ReviewTaskImageInput): Promise<ReviewTaskImageOutput> {
  return reviewTaskImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'reviewTaskImagePrompt',
  input: {schema: ReviewTaskImageInputSchema},
  output: {schema: ReviewTaskImageOutputSchema},
  prompt: `You are an AI design assistant. Your task is to review an image provided for a task and offer constructive feedback.

Task Details:
Title: {{{taskTitle}}}
{{#if taskDescription}}Description: {{{taskDescription}}}{{/if}}

Image to Review:
{{media url=imageUrl}}

Your Review Should Cover:
1.  **Relevance**: How well does the image relate to the task title and description?
2.  **Suitability**: Is the image appropriate for a task card? Is it clear, visually appealing, and not distracting?
3.  **Quality (Briefly)**: Any obvious quality issues (e.g., very blurry, pixelated, inappropriate content if discernible)?

Based on your review:
- Provide overall **feedback**. Be specific. For example, instead of "Good image", say "This image of a laptop on a desk effectively conveys a work-related task." Or, "While the cat is cute, it's not very relevant to 'Submit Tax Returns'."
- If the image is good, state that clearly in the feedback.
- If the image is not ideal or could be improved, provide a **suggestedImageQuery** (max 7 words) that could be used to generate a more suitable image. If the current image is perfectly fine, you can omit the suggestedImageQuery.

Format your output STRICTLY as a JSON object matching the defined output schema.
Example for a good image: {"feedback": "The provided image of a calendar and pen is highly relevant for a task about scheduling meetings.", "suggestedImageQuery": null}
Example for an image needing improvement: {"feedback": "The image of a generic landscape doesn't quite fit the task 'Finalize Q3 Budget'. A more suitable image might depict financial documents or a focused work environment.", "suggestedImageQuery": "financial planning documents"}
`,
});

const reviewTaskImageFlow = ai.defineFlow(
  {
    name: 'reviewTaskImageFlow',
    inputSchema: ReviewTaskImageInputSchema,
    outputSchema: ReviewTaskImageOutputSchema,
  },
  async (input) => {
    // Use a Gemini model capable of multimodal input
    const {output} = await ai.generate({
      model: 'googleai/gemini-pro-vision', // Or another suitable multimodal model
      prompt: await prompt.render(input), 
      output: { schema: ReviewTaskImageOutputSchema },
      // It's good practice to ensure the model is allowed to generate text.
      // If using gemini-2.0-flash-exp for this, it might need responseModalities.
      // For gemini-pro-vision, just text output configuration is usually fine for schema'd JSON.
    });
    return output!;
  }
);
