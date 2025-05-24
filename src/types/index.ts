
export type Priority = "low" | "medium" | "high";
export type CurrentView = "grid" | "compactList"; // Added for view switching

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string; 
  subtasks: Subtask[];
  imageUrl?: string; 
  dataAiHint?: string; 
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
  taskVibe?: string; 
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
