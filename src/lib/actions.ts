"use server";

import { aiTaskAssistant, type AiTaskAssistantInput, type AiTaskAssistantOutput } from "@/ai/flows/ai-task-assistant";

export async function getAiTaskAssistance(input: AiTaskAssistantInput): Promise<AiTaskAssistantOutput | { error: string }> {
  try {
    // Ensure date fields are strings and not empty, or handle them appropriately if they can be undefined
    // The AI flow expects strings for dueDate and reminder. If they are optional, ensure they are passed correctly.
    const validatedInput: AiTaskAssistantInput = {
      ...input,
      dueDate: input.dueDate || "", // Provide default empty string if undefined, or handle as per AI flow requirements
      reminder: input.reminder || "", // Same for reminder
      // Image is optional, so it's fine if it's undefined
    };
    const result = await aiTaskAssistant(validatedInput);
    return result;
  } catch (error) {
    console.error("Error calling AI task assistant:", error);
    return { error: error instanceof Error ? error.message : "An unknown error occurred" };
  }
}
