
'use server';
/**
 * @fileOverview A Genkit flow to generate an image for a task.
 *
 * - generateTaskImage - A function that handles task image generation.
 * - GenerateTaskImageInput - The input type for the generateTaskImage function.
 * - GenerateTaskImageOutput - The return type for the generateTaskImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTaskImageInputSchema = z.object({
  taskTitle: z.string().describe('The title of the task.'),
  taskDescription: z.string().optional().describe('The optional description of the task for more context.'),
});
export type GenerateTaskImageInput = z.infer<typeof GenerateTaskImageInputSchema>;

const GenerateTaskImageOutputSchema = z.object({
  imageDataUri: z.string().describe("The generated image as a data URI (e.g., 'data:image/png;base64,...')."),
});
export type GenerateTaskImageOutput = z.infer<typeof GenerateTaskImageOutputSchema>;

export async function generateTaskImage(input: GenerateTaskImageInput): Promise<GenerateTaskImageOutput> {
  return generateTaskImageFlow(input);
}

const generateTaskImageFlow = ai.defineFlow(
  {
    name: 'generateTaskImageFlow',
    inputSchema: GenerateTaskImageInputSchema,
    outputSchema: GenerateTaskImageOutputSchema,
  },
  async (input) => {
    const prompt = `Generate a visually appealing and relevant image for a task titled: "${input.taskTitle}".
    ${input.taskDescription ? `The task is further described as: "${input.taskDescription}".` : ''}
    The image should be suitable for a task card. Avoid including any text in the image. Focus on a clean, modern aesthetic.`;

    try {
      const {media} = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp', // IMPORTANT: Use this specific model for image generation
        prompt: prompt,
        config: {
          responseModalities: ['IMAGE', 'TEXT'], // Must include TEXT even if only IMAGE is primarily used
        },
      });

      if (media && media.url) {
        return {imageDataUri: media.url};
      } else {
        throw new Error('Image generation did not return a media URL.');
      }
    } catch (error) {
      console.error('Error during image generation flow:', error);
      // Consider how to propagate this error. For now, rethrowing.
      // Or, return a specific error structure in GenerateTaskImageOutputSchema if preferred.
      throw new Error(error instanceof Error ? error.message : 'Failed to generate image');
    }
  }
);
