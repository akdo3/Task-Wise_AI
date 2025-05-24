
export type Priority = "low" | "medium" | "high";

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string; // Made non-optional for consistency, can be empty string
  subtasks: Subtask[];
  imageUrl?: string; // Optional
  dataAiHint?: string; // Optional hint for images
  priority: Priority;
  dueDate?: string; // YYYY-MM-DD
  reminderDate?: string; // YYYY-MM-DD
  tags: string[];
  delegatedTo?: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  aiApproachSuggestions?: string[];
  aiImprovedDescription?: string;
  aiGeneratedSubtasks?: string[];
  taskVibe?: string; // New: AI suggested vibe for the task
  completed: boolean;
  completedAt?: string;
}

// For mapping form data to AI input:
export interface AiTaskFormInput {
  description: string;
  subtasks: string[]; // array of subtask texts
  priority: Priority;
  dueDate: string; // Needs to be string for AI
  reminder: string; // Needs to be string for AI
  tags: string[];
  imageUrl?: string;
}

