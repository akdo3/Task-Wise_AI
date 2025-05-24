
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Task, Subtask, AiTaskFormInput } from '@/types';
import { Header } from '@/components/layout/Header';
import { TaskList } from '@/components/TaskList';
import { TaskForm, type TaskFormData } from '@/components/TaskForm';
import { TaskFilterControls, type FilterState } from '@/components/TaskFilterControls';
import { AISuggestionsDialog } from '@/components/AISuggestionsDialog';
import { TaskStatsDashboard } from '@/components/TaskStatsDashboard';
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
    dataAiHint: 'groceries food',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
    completed: false,
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
    dataAiHint: 'business proposal',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
    updatedAt: new Date().toISOString(),
    completed: false,
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
    dataAiHint: 'medical health', 
    completed: true,
    completedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
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
  const [rawAiOutputForDialog, setRawAiOutputForDialog] = useState<AiTaskAssistantOutput | null>(null);
  const [stagedAiSuggestionsForSave, setStagedAiSuggestionsForSave] = useState<Partial<AiTaskAssistantOutput> | null>(null);
  const [imageQueryForForm, setImageQueryForForm] = useState<string | null>(null);
  const [stagedEmojiForForm, setStagedEmojiForForm] = useState<string | null>(null);


  useEffect(() => {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
      try {
        const parsedTasks = JSON.parse(storedTasks);
        if (Array.isArray(parsedTasks) && parsedTasks.every(t => typeof t.id === 'string')) {
          setTasks(parsedTasks.map(t => ({ ...t, completed: t.completed || false })));
        } else {
          setTasks(sampleTasks.map(t => ({ ...t, completed: t.completed || false })));
        }
      } catch (e) {
        console.error("Failed to parse tasks from localStorage", e);
        setTasks(sampleTasks.map(t => ({ ...t, completed: t.completed || false })));
      }
    } else {
      setTasks(sampleTasks.map(t => ({ ...t, completed: t.completed || false })));
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
    
    setFilteredTasks(tempTasks.sort((a,b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }));
  }, [tasks, filters]);


  const handleOpenTaskForm = (task: Task | null = null) => {
    setEditingTask(task);
    setIsTaskFormOpen(true);
    if (task) {
        const titleParts = task.title.split(" ");
        const firstPart = titleParts[0];
        if (/\p{Emoji}/u.test(firstPart) && firstPart.length <= 2) { 
            setStagedEmojiForForm(firstPart);
        }
    }
  };

  const handleCloseTaskForm = () => {
    setIsTaskFormOpen(false);
    setEditingTask(null);
    setRawAiOutputForDialog(null);
    setStagedAiSuggestionsForSave(null);
    setImageQueryForForm(null);
    setStagedEmojiForForm(null);
  };

  const handleTaskSubmit = (data: TaskFormData) => {
    const now = new Date().toISOString();
    const taskDataFromForm = { 
      ...data,
      description: data.description || "",
      dueDate: data.dueDate ? format(data.dueDate, 'yyyy-MM-dd') : undefined,
      reminderDate: data.reminderDate ? format(data.reminderDate, 'yyyy-MM-dd') : undefined,
      tags: data.tags || [],
      subtasks: data.subtasks || [],
      imageUrl: data.imageUrl || undefined,
    };
    
    let finalTaskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed' | 'completedAt'| 'dataAiHint'> & Partial<Pick<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed' | 'completedAt' | 'dataAiHint'>> = { ...taskDataFromForm };
        
    if (stagedAiSuggestionsForSave) {
        if (stagedAiSuggestionsForSave.improvedDescription) {
            finalTaskData.description = stagedAiSuggestionsForSave.improvedDescription;
        }
        if (stagedAiSuggestionsForSave.generatedSubtasks && stagedAiSuggestionsForSave.generatedSubtasks.length > 0) {
            const newAiSubtasks: Subtask[] = stagedAiSuggestionsForSave.generatedSubtasks.map(stText => ({
                id: crypto.randomUUID(),
                text: stText,
                completed: false,
            }));
            finalTaskData.subtasks = [...(finalTaskData.subtasks || []), ...newAiSubtasks];
        }
        if (stagedAiSuggestionsForSave.suggestedEmoji && finalTaskData.title) {
            const titleWithoutExistingEmoji = finalTaskData.title.replace(/^\p{Emoji_Presentation}\s*/u, '').trimStart();
            finalTaskData.title = `${stagedAiSuggestionsForSave.suggestedEmoji} ${titleWithoutExistingEmoji}`;
        }
        if (stagedAiSuggestionsForSave.suggestedTagline && finalTaskData.description !== undefined) {
            if (!finalTaskData.description.includes(stagedAiSuggestionsForSave.suggestedTagline)) {
                finalTaskData.description = `${finalTaskData.description}\n\n"${stagedAiSuggestionsForSave.suggestedTagline}"`;
            }
        }
    }


    if (editingTask) {
      const updatedTask: Task = {
        ...editingTask,
        ...finalTaskData,
        updatedAt: now,
        // Retain original dataAiHint if imageUrl hasn't changed or is still a placeholder
        dataAiHint: (finalTaskData.imageUrl && finalTaskData.imageUrl !== editingTask.imageUrl && !finalTaskData.imageUrl.startsWith('https://placehold.co')) ? undefined : editingTask.dataAiHint,
      };
      
      setTasks(
        tasks.map((t) => (t.id === editingTask.id ? updatedTask : t))
      );
      toast({ title: "Task Updated", description: `"${finalTaskData.title}" has been updated.` });
    } else { 
      const baseNewTask = {
        ...finalTaskData,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
        completed: false,
      };

      let taskSpecificDataAiHint: string | undefined = undefined;

      if (!baseNewTask.imageUrl && stagedAiSuggestionsForSave?.suggestedImageQuery) {
        taskSpecificDataAiHint = stagedAiSuggestionsForSave.suggestedImageQuery.trim().split(' ').slice(0, 2).join(' ');
      }
      
      const newTask: Task = {
        ...baseNewTask,
        description: baseNewTask.description || "", // Ensure description is not undefined
        dataAiHint: taskSpecificDataAiHint,
      };

      setTasks([newTask, ...tasks]);
      toast({ title: "Task Created", description: `"${newTask.title}" has been added.` });
    }
    handleCloseTaskForm();
  };

  const handleDeleteTask = (taskId: string) => {
    let taskTitleForToast: string | undefined;
    setTasks(tasks.filter((t) => {
      if (t.id === taskId) {
        taskTitleForToast = t.title;
        return false;
      }
      return true;
    }));
    if (taskTitleForToast) {
      toast({ title: "Task Deleted", description: `"${taskTitleForToast}" has been deleted.`, variant: "destructive" });
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

 const handleToggleTaskComplete = (taskId: string) => {
    let taskTitleForToast = "";
    let newCompletionStatus: boolean | undefined = undefined;

    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === taskId) {
          newCompletionStatus = !task.completed;
          taskTitleForToast = task.title;
          return {
            ...task,
            completed: newCompletionStatus,
            completedAt: newCompletionStatus ? new Date().toISOString() : undefined,
            updatedAt: new Date().toISOString(),
          };
        }
        return task;
      })
    );

    if (taskTitleForToast && newCompletionStatus !== undefined) {
      toast({
        title: `Task ${newCompletionStatus ? 'Completed' : 'Marked Incomplete'}`,
        description: `"${taskTitleForToast}" has been updated.`,
      });
    }
  };
  
 const handleGetAiSuggestions = async (aiInput: AiTaskFormInput) => {
    const result = await getAiTaskAssistance({
        ...aiInput,
        dueDate: aiInput.dueDate || "",
        reminder: aiInput.reminder || "",
        imageUrl: aiInput.imageUrl || undefined,
    });
    if (result && !('error' in result)) {
        setRawAiOutputForDialog(result);
        openAiSuggestionsDialog(result);
    } else if (result && 'error' in result) {
        toast({
            variant: "destructive",
            title: "AI Assistance Error",
            description: result.error,
        });
    }
    return result;
  };
  
  const openAiSuggestionsDialog = (suggestions: AiTaskAssistantOutput) => {
    setIsAiSuggestionsOpen(true);
  };
  
  const handleApplyAiSuggestions = (appliedSuggestions: Partial<AiTaskAssistantOutput>) => {
    setStagedAiSuggestionsForSave(prevStaged => {
        const updatedStaged = { ...prevStaged, ...appliedSuggestions };
        return updatedStaged;
    });

    if (appliedSuggestions.suggestedImageQuery) {
      setImageQueryForForm(appliedSuggestions.suggestedImageQuery);
    }
    if (appliedSuggestions.suggestedEmoji) {
      setStagedEmojiForForm(appliedSuggestions.suggestedEmoji);
    }

     toast({
      title: "AI Suggestion Queued",
      description: "The suggestion has been noted. Save the task to apply it, or use staged elements like the image query for generation.",
    });
     setIsAiSuggestionsOpen(false);
  };

  const handleClearStagedEmoji = () => {
    setStagedEmojiForForm(null);
    setStagedAiSuggestionsForSave(prev => {
        if (!prev) return null;
        const { suggestedEmoji, ...rest } = prev;
        return Object.keys(rest).length > 0 ? rest : null;
    });
  };

  const handleUpdateTaskImage = (taskId: string, newImageUrl: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, imageUrl: newImageUrl, updatedAt: new Date().toISOString(), dataAiHint: undefined } // Clear dataAiHint as image is now specific
          : task
      )
    );
    toast({
      title: "Task Image Updated",
      description: "AI has generated a new image for your task.",
    });
  };


  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex flex-col min-h-screen bg-background">
        <Header onAddTask={() => handleOpenTaskForm()} />
        <main className="flex-grow container mx-auto px-4 py-12">
          <TaskStatsDashboard tasks={tasks} />
          <TaskFilterControls onFilterChange={setFilters} initialFilters={initialFilters} />
          <TaskList
            tasks={filteredTasks}
            onEditTask={handleOpenTaskForm}
            onDeleteTask={handleDeleteTask}
            onToggleSubtask={handleToggleSubtask}
            onToggleTaskComplete={handleToggleTaskComplete}
            onUpdateTaskImage={handleUpdateTaskImage}
          />
        </main>
        <footer className="text-center py-6 text-xs text-muted-foreground border-t">
          &copy; {new Date().getFullYear()} TaskWise AI. Crafted with focus.
        </footer>
      </div>

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
                    activeImageQuery={imageQueryForForm}
                    onClearActiveImageQuery={() => setImageQueryForForm(null)}
                    stagedEmoji={stagedEmojiForForm}
                    onClearStagedEmoji={handleClearStagedEmoji}
                />
            </div>
        </DialogContent>
      </Dialog>

      {rawAiOutputForDialog && (
        <AISuggestionsDialog
            isOpen={isAiSuggestionsOpen}
            onClose={() => setIsAiSuggestionsOpen(false)}
            suggestions={rawAiOutputForDialog}
            onApplySuggestions={handleApplyAiSuggestions}
        />
      )}
    </TooltipProvider>
  );
}
