
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Task, Subtask, AiTaskFormInput } from '@/types';
import { Header } from '@/components/layout/Header';
import { TaskList } from '@/components/TaskList';
import { TaskForm, type TaskFormData } from '@/components/TaskForm';
import { TaskFilterControls, type FilterState } from '@/components/TaskFilterControls';
import { AISuggestionsDialog } from '@/components/AISuggestionsDialog';
import { TaskStatsDashboard } from '@/components/TaskStatsDashboard'; // Added import
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { TooltipProvider } from "@/components/ui/tooltip";
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

const sampleTasks: Task[] = [
  {
    id: '1',
    title: '🛒 Grocery Shopping',
    description: 'Buy groceries for the week. Focus on fresh vegetables and fruits. Need to get items for the weekend party as well.\n\n"Fueling up for a fantastic week!"',
    subtasks: [
      { id: 's1-1', text: 'Buy apples and bananas', completed: true },
      { id: 's1-2', text: 'Buy milk (2 gallons)', completed: false },
      { id: 's1-3', text: 'Buy whole wheat bread', completed: false },
    ],
    priority: 'high',
    dueDate: '2024-08-15',
    reminderDate: '2024-08-14',
    tags: ['personal', 'home', 'urgent'],
    delegatedTo: 'Self',
    imageUrl: 'https://placehold.co/600x400.png',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
  },
  {
    id: '2',
    title: '🚀 Project Proposal Finalization',
    description: 'Draft and finalize the project proposal for Q4. Must include detailed market analysis, competitor research, and realistic financial projections. Circulate to stakeholders by EOD.\n\n"Launching the next big thing!"',
    subtasks: [
      { id: 's2-1', text: 'Market research & competitor analysis', completed: true },
      { id: 's2-2', text: 'Draft initial proposal sections', completed: true },
      { id: 's2-3', text: 'Incorporate financial projections', completed: false },
      { id: 's2-4', text: 'Final review with team lead', completed: false },
    ],
    priority: 'medium',
    dueDate: '2024-08-25',
    tags: ['work', 'project', 'strategic'],
    delegatedTo: 'John Doe',
    imageUrl: 'https://placehold.co/600x400.png',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Book Doctor Appointment',
    description: 'Schedule annual check-up with Dr. Smith. Prefer a weekday morning slot. Check insurance coverage beforehand.',
    subtasks: [
       { id: 's3-1', text: 'Call clinic for availability', completed: false },
       { id: 's3-2', text: 'Verify insurance details', completed: false },
    ],
    priority: 'low',
    dueDate: '2024-09-10',
    tags: ['health', 'personal'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    imageUrl: 'https://placehold.co/600x400.png',
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
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
      try {
        const parsedTasks = JSON.parse(storedTasks);
        if (Array.isArray(parsedTasks) && parsedTasks.every(t => typeof t.id === 'string')) {
          setTasks(parsedTasks);
        } else {
          setTasks(sampleTasks);
        }
      } catch (e) {
        console.error("Failed to parse tasks from localStorage", e);
        setTasks(sampleTasks);
      }
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
          (task.description && task.description.toLowerCase().includes(term))
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
    setTaskFormForAi(null); 
    setCurrentAiSuggestions(null); // Clear AI suggestions when form closes
  };

  const handleTaskSubmit = (data: TaskFormData) => {
    const now = new Date().toISOString();
    const taskData = {
      ...data,
      description: data.description || "", 
      dueDate: data.dueDate ? format(data.dueDate, 'yyyy-MM-dd') : undefined,
      reminderDate: data.reminderDate ? format(data.reminderDate, 'yyyy-MM-dd') : undefined,
      tags: data.tags || [],
      subtasks: data.subtasks || [],
      imageUrl: data.imageUrl || undefined, 
    };
    
    let finalTaskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> & Partial<Pick<Task, 'id' | 'createdAt' | 'updatedAt'>> = { ...taskData };
    
    // Apply AI suggestions if they exist and were applied by the user
    if (currentAiSuggestions) { 
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
        if (currentAiSuggestions.suggestedEmoji && finalTaskData.title) {
            // Avoid double-prepending emoji if title already starts with it
            if (!finalTaskData.title.startsWith(currentAiSuggestions.suggestedEmoji)) {
                 finalTaskData.title = `${currentAiSuggestions.suggestedEmoji} ${finalTaskData.title}`;
            }
        }
        if (currentAiSuggestions.suggestedTagline && finalTaskData.description !== undefined) {
            finalTaskData.description = `${finalTaskData.description}\n\n"${currentAiSuggestions.suggestedTagline}"`;
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
      setTasks([{ ...finalTaskData, id: crypto.randomUUID(), createdAt: now, updatedAt: now } as Task, ...tasks]);
      toast({ title: "Task Created", description: `"${finalTaskData.title}" has been added.` });
    }
    handleCloseTaskForm();
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
    const result = await getAiTaskAssistance({
        ...aiInput,
        dueDate: aiInput.dueDate || "", 
        reminder: aiInput.reminder || "",
        imageUrl: aiInput.imageUrl || undefined,
    });
    return result;
  };
  
  const handleOpenAiSuggestionsDialog = (suggestions: AiTaskAssistantOutput) => {
    setCurrentAiSuggestions(suggestions); // Store all suggestions initially
    setIsAiSuggestionsOpen(true);
  };
  
  // This function is called by AISuggestionsDialog when user clicks "Use this..." or "Apply All"
  const handleApplyAiSuggestions = (appliedSuggestions: Partial<AiTaskAssistantOutput>) => {
    // Merge the applied suggestions into the existing currentAiSuggestions
    // This way, if a user applies description, then later emoji, both are stored.
    setCurrentAiSuggestions(prev => {
        const newSuggestions = {
            ...(prev || { approachSuggestions: [], improvedDescription: '', generatedSubtasks: [] }), // Base for prev if null
            ...appliedSuggestions // Overwrite with what was just applied
        };
        // Ensure arrays are handled correctly (not critical for emoji/tagline but good practice)
        if (appliedSuggestions.generatedSubtasks && prev?.generatedSubtasks) {
            newSuggestions.generatedSubtasks = [...prev.generatedSubtasks, ...appliedSuggestions.generatedSubtasks];
        }
        return newSuggestions;
    });

     toast({
      title: "AI Suggestion Queued",
      description: "The suggestion has been noted. Save the task to apply it.",
    });
     // Keep the task form open, but close the AI suggestions dialog
     setIsAiSuggestionsOpen(false);
  };


  return (
    <TooltipProvider delayDuration={100}>
      <div className="min-h-screen flex flex-col">
        <Header onAddTask={() => handleOpenTaskForm()} />
        <main className="flex-grow container mx-auto px-4 py-12">
          <TaskStatsDashboard tasks={tasks} /> {/* Added Dashboard */}
          <TaskFilterControls onFilterChange={setFilters} initialFilters={initialFilters} />
          <TaskList tasks={filteredTasks} onEditTask={handleOpenTaskForm} onDeleteTask={handleDeleteTask} onToggleSubtask={handleToggleSubtask}/>
        </main>

        <Dialog open={isTaskFormOpen} onOpenChange={(isOpen) => { if(!isOpen) handleCloseTaskForm(); else setIsTaskFormOpen(true);}}>
          <DialogContent className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl max-h-[90vh] flex flex-col rounded-[var(--radius)]">
              <DialogHeader className="pb-4">
                <DialogTitle className="text-2xl">{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
                <DialogDescription>
                  {editingTask ? 'Update the details of your task.' : 'Fill in the details for your new task.'}
                </DialogDescription>
              </DialogHeader>
              <div className="overflow-y-auto flex-grow pr-3 mr-[-6px] scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
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
              suggestions={currentAiSuggestions} // Pass all initially fetched suggestions
              onApplySuggestions={handleApplyAiSuggestions} // This will now merge selected parts
          />
        )}

        <footer className="text-center py-6 text-xs text-muted-foreground border-t mt-8">
          &copy; {new Date().getFullYear()} TaskWise AI. Crafted with focus.
        </footer>
      </div>
    </TooltipProvider>
  );
}

