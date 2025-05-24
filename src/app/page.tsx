"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Task, Subtask, Priority, AiTaskFormInput } from '@/types';
import { Header } from '@/components/layout/Header';
import { TaskList } from '@/components/TaskList';
import { TaskForm, type TaskFormData } from '@/components/TaskForm';
import { TaskFilterControls, type FilterState } from '@/components/TaskFilterControls';
import { AISuggestionsDialog } from '@/components/AISuggestionsDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from "@/hooks/use-toast";
import { getAiTaskAssistance } from "@/lib/actions";
import type { AiTaskAssistantOutput } from "@/ai/flows/ai-task-assistant";
import { format } from 'date-fns';

const initialFilters: FilterState = {
  priority: 'all',
  dueDate: '',
  tags: '',
  searchTerm: '',
};

// Sample Data
const sampleTasks: Task[] = [
  {
    id: '1',
    title: 'Grocery Shopping',
    description: 'Buy groceries for the week. Focus on fresh vegetables and fruits.',
    subtasks: [
      { id: 's1-1', text: 'Buy apples', completed: true },
      { id: 's1-2', text: 'Buy milk', completed: false },
      { id: 's1-3', text: 'Buy bread', completed: false },
    ],
    priority: 'high',
    dueDate: '2024-08-15',
    reminderDate: '2024-08-14',
    tags: ['personal', 'home'],
    delegatedTo: 'Self',
    imageUrl: 'https://placehold.co/600x400/E3F2FD/333?text=Groceries',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Project Proposal',
    description: 'Draft and finalize the project proposal for Q4. Include market analysis and financial projections.',
    subtasks: [
      { id: 's2-1', text: 'Market research', completed: false },
      { id: 's2-2', text: 'Draft proposal', completed: false },
      { id: 's2-3', text: 'Review with team', completed: false },
    ],
    priority: 'medium',
    dueDate: '2024-08-25',
    tags: ['work', 'project'],
    delegatedTo: 'John Doe',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];


export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const { toast } = useToast();

  const [isAiSuggestionsOpen, setIsAiSuggestionsOpen] = useState(false);
  const [currentAiSuggestions, setCurrentAiSuggestions] = useState<AiTaskAssistantOutput | null>(null);
  const [taskFormForAi, setTaskFormForAi] = useState<TaskFormData | null>(null);


  useEffect(() => {
    // Load tasks from local storage or use sample tasks
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    } else {
      setTasks(sampleTasks);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    applyFilters();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, filters]);

  const applyFilters = useCallback(() => {
    let tempTasks = [...tasks];

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      tempTasks = tempTasks.filter(
        (task) =>
          task.title.toLowerCase().includes(term) ||
          task.description.toLowerCase().includes(term)
      );
    }

    if (filters.priority !== 'all') {
      tempTasks = tempTasks.filter((task) => task.priority === filters.priority);
    }

    if (filters.dueDate) {
      tempTasks = tempTasks.filter((task) => task.dueDate === filters.dueDate);
    }

    if (filters.tags) {
      const filterTags = filters.tags.toLowerCase().split(',').map(t => t.trim()).filter(t => t);
      if (filterTags.length > 0) {
        tempTasks = tempTasks.filter((task) =>
          filterTags.every(ft => task.tags.map(t => t.toLowerCase()).includes(ft))
        );
      }
    }
    setFilteredTasks(tempTasks.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, [tasks, filters]);


  const handleOpenTaskForm = (task: Task | null = null) => {
    setEditingTask(task);
    setIsTaskFormOpen(true);
  };

  const handleCloseTaskForm = () => {
    setIsTaskFormOpen(false);
    setEditingTask(null);
    setTaskFormForAi(null); // Clear AI context
  };

  const handleTaskSubmit = (data: TaskFormData) => {
    const now = new Date().toISOString();
    const taskData = {
      ...data,
      dueDate: data.dueDate ? format(data.dueDate, 'yyyy-MM-dd') : undefined,
      reminderDate: data.reminderDate ? format(data.reminderDate, 'yyyy-MM-dd') : undefined,
      tags: data.tags || [],
      subtasks: data.subtasks || [],
    };
    
    // Apply AI suggestions if available from context
    let finalTaskData = { ...taskData };
    if (taskFormForAi && currentAiSuggestions) { // Check if AI was triggered for this form
        if (currentAiSuggestions.improvedDescription) {
            finalTaskData.description = currentAiSuggestions.improvedDescription;
        }
        if (currentAiSuggestions.generatedSubtasks && currentAiSuggestions.generatedSubtasks.length > 0) {
            const newAiSubtasks: Subtask[] = currentAiSuggestions.generatedSubtasks.map(stText => ({
                id: crypto.randomUUID(),
                text: stText,
                completed: false,
            }));
            finalTaskData.subtasks = [...(finalTaskData.subtasks || []), ...newAiSubtasks];
        }
    }


    if (editingTask) {
      setTasks(
        tasks.map((t) =>
          t.id === editingTask.id ? { ...t, ...finalTaskData, updatedAt: now } : t
        )
      );
      toast({ title: "Task Updated", description: `"${finalTaskData.title}" has been updated.` });
    } else {
      setTasks([{ ...finalTaskData, id: crypto.randomUUID(), createdAt: now, updatedAt: now }, ...tasks]);
      toast({ title: "Task Created", description: `"${finalTaskData.title}" has been added.` });
    }
    handleCloseTaskForm();
    setCurrentAiSuggestions(null); // Reset AI suggestions after submit
  };

  const handleDeleteTask = (taskId: string) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    setTasks(tasks.filter((t) => t.id !== taskId));
    if (taskToDelete) {
      toast({ title: "Task Deleted", description: `"${taskToDelete.title}" has been deleted.`, variant: "destructive" });
    }
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
        ? {
            ...task,
            subtasks: task.subtasks.map(subtask => 
              subtask.id === subtaskId 
              ? { ...subtask, completed: !subtask.completed }
              : subtask
            )
          }
        : task
      )
    );
  };
  
  const handleGetAiSuggestions = async (aiInput: AiTaskFormInput) => {
    // Store current form state for potential application later
    // This is a bit simplified; react-hook-form's `getValues()` might be better here
    // For now, assume aiInput is sufficient context if suggestions are applied directly by TaskForm
    const result = await getAiTaskAssistance({
        ...aiInput,
        // Ensure dueDate and reminder are strings, even if empty
        dueDate: aiInput.dueDate || "", 
        reminder: aiInput.reminder || "",
    });
    return result;
  };
  
  const handleOpenAiSuggestionsDialog = (suggestions: AiTaskAssistantOutput) => {
    setCurrentAiSuggestions(suggestions);
    setIsAiSuggestionsOpen(true);
  };
  
  const handleApplyAiSuggestions = (appliedSuggestions: Partial<AiTaskAssistantOutput>) => {
    // This function is called from AISuggestionsDialog
    // It updates the currentAiSuggestions state which TaskForm can then use on submit
    // or TaskForm could have its own state updated directly.
    // For now, let's update currentAiSuggestions and TaskForm will read from it.
    // A more robust way would be for TaskForm to expose `setValue` from react-hook-form.
     if (!editingTask && !isTaskFormOpen) return; // Should not happen if form is basis

    // Update the `currentAiSuggestions` which will be used by `handleTaskSubmit`
    // This is an indirect way. A better way would be to update form fields directly.
    // For simplicity, we'll set currentAiSuggestions. The TaskForm will need to use these when submitting.
    // This is a simplified approach. Ideally, TaskForm would expose methods to update its fields.
    
    setCurrentAiSuggestions(prev => ({
        ...(prev || { approachSuggestions: [], improvedDescription: '', generatedSubtasks: [] }), // ensure prev is not null
        ...appliedSuggestions
    }));

    // Let user know suggestions are ready to be applied on save
     toast({
      title: "AI Suggestions Ready",
      description: "Review and save the task to apply AI enhancements.",
    });
  };


  return (
    <div className="min-h-screen flex flex-col">
      <Header onAddTask={() => handleOpenTaskForm()} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <TaskFilterControls onFilterChange={setFilters} initialFilters={initialFilters} />
        <TaskList tasks={filteredTasks} onEditTask={handleOpenTaskForm} onDeleteTask={handleDeleteTask} onToggleSubtask={handleToggleSubtask}/>
      </main>

      <Dialog open={isTaskFormOpen} onOpenChange={setIsTaskFormOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
              <DialogDescription>
                {editingTask ? 'Update the details of your task.' : 'Fill in the details for your new task.'}
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto flex-grow pr-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                <TaskForm
                    task={editingTask}
                    onSubmit={handleTaskSubmit}
                    onCancel={handleCloseTaskForm}
                    onGetAiSuggestions={handleGetAiSuggestions}
                    openAiSuggestionsDialog={handleOpenAiSuggestionsDialog}
                />
            </div>
        </DialogContent>
      </Dialog>

      {currentAiSuggestions && (
        <AISuggestionsDialog
            isOpen={isAiSuggestionsOpen}
            onClose={() => setIsAiSuggestionsOpen(false)}
            suggestions={currentAiSuggestions}
            onApplySuggestions={handleApplyAiSuggestions}
        />
      )}

      <footer className="text-center py-4 text-sm text-muted-foreground border-t">
        &copy; {new Date().getFullYear()} TaskWise AI. All rights reserved.
      </footer>
    </div>
  );
}
