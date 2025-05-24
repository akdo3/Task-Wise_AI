
"use server";

import { aiTaskAssistant, type AiTaskAssistantInput, type AiTaskAssistantOutput } from "@/ai/flows/ai-task-assistant";
import { generateTaskImage, type GenerateTaskImageInput, type GenerateTaskImageOutput } from "@/ai/flows/generate-task-image-flow";

export async function getAiTaskAssistance(input: AiTaskAssistantInput): Promise<AiTaskAssistantOutput | { error: string }> {
  try {
    const validatedInput: AiTaskAssistantInput = {
      ...input,
      dueDate: input.dueDate || "", 
      reminder: input.reminder || "",
      imageUrl: input.imageUrl || undefined,
    };
    const result = await aiTaskAssistant(validatedInput);
    return result;
  } catch (error) {
    console.error("Error calling AI task assistant:", error);
    return { error: error instanceof Error ? error.message : "An unknown error occurred" };
  }
}

export async function generateImageForTask(input: GenerateTaskImageInput): Promise<GenerateTaskImageOutput | { error: string }> {
  try {
    // The input type GenerateTaskImageInput already includes an optional imageQuery
    const result = await generateTaskImage(input);
    return result;
  } catch (error) {
    console.error("Error calling generate image for task flow:", error);
    return { error: error instanceof Error ? error.message : "An unknown error occurred during image generation" };
  }
}
