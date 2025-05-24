
"use server";

import { aiTaskAssistant, type AiTaskAssistantInput, type AiTaskAssistantOutput } from "@/ai/flows/ai-task-assistant";

export async function getAiTaskAssistance(input: AiTaskAssistantInput): Promise<AiTaskAssistantOutput | { error: string }> {
  try {
    const validatedInput: AiTaskAssistantInput = {
      ...input,
      dueDate: input.dueDate || "", 
      reminder: input.reminder || "",
      imageUrl: input.imageUrl || undefined, // Pass imageUrl, or undefined if not present
    };
    const result = await aiTaskAssistant(validatedInput);
    return result;
  } catch (error) {
    console.error("Error calling AI task assistant:", error);
    return { error: error instanceof Error ? error.message : "An unknown error occurred" };
  }
}
