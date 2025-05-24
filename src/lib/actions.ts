
"use server";

import { aiTaskAssistant, type AiTaskAssistantInput, type AiTaskAssistantOutput } from "@/ai/flows/ai-task-assistant";
import { generateTaskImage, type GenerateTaskImageInput, type GenerateTaskImageOutput } from "@/ai/flows/generate-task-image-flow";
import { suggestRandomTaskTitle as suggestRandomTaskTitleFlow, type SuggestRandomTaskOutput } from "@/ai/flows/suggest-random-task-flow";
import { getDailyMotivationalTipFlow, type DailyMotivationalTipOutput } from "@/ai/flows/daily-motivation-flow";

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
    const result = await generateTaskImage(input);
    return result;
  } catch (error) {
    console.error("Error calling generate image for task flow:", error);
    return { error: error instanceof Error ? error.message : "An unknown error occurred during image generation" };
  }
}

export async function suggestRandomTaskTitle(): Promise<SuggestRandomTaskOutput | { error: string }> {
  try {
    const result = await suggestRandomTaskTitleFlow();
    return result;
  } catch (error) {
    console.error("Error calling suggest random task title flow:", error);
    return { error: error instanceof Error ? error.message : "An unknown error occurred during task title suggestion" };
  }
}

export async function getDailyMotivationalTip(): Promise<DailyMotivationalTipOutput | { error: string }> {
  try {
    const result = await getDailyMotivationalTipFlow();
    return result;
  } catch (error) {
    console.error("Error calling daily motivational tip flow:", error);
    return { error: error instanceof Error ? error.message : "An unknown error occurred when fetching daily motivation" };
  }
}
