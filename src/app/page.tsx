
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Task, Subtask, AiTaskFormInput, CurrentView, Priority } from '@/types';
import { Header } from '@/components/layout/Header';
import { TaskList } from '@/components/TaskList';
import { TaskForm, type TaskFormData } from '@/components/TaskForm';
import { AISuggestionsDialog, type AISuggestionsDialogCommonProps } from '@/components/AISuggestionsDialog';
import { FilterDialog, type DialogFilterState } from '@/components/FilterDialog';
import { DailyMotivation } from '@/components/DailyMotivation';
import { SettingsDialog } from '@/components/SettingsDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { getAiTaskAssistance, getDailyMotivationalTip, reviewTaskImage as reviewTaskImageAction, generateImageForTask as generateImageAction, suggestRandomTask as suggestRandomTaskAction } from "@/lib/actions";
import type { AiTaskAssistantOutput } from "@/ai/flows/ai-task-assistant";
import type { ReviewTaskImageOutput, ReviewTaskImageInput } from "@/ai/flows/review-task-image-flow";
import { format, parseISO } from 'date-fns';
import { TaskStatsDashboard } from '@/components/TaskStatsDashboard';

export interface FilterState {
  priority: Priority | 'all';
  dueDate: string;
  tags: string;
  searchTerm: string;
}

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
    taskVibe: "Weekly Essential",
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
    taskVibe: "Strategic Focus",
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
    // imageUrl: 'https://placehold.co/600x400.png', // Removed to test placeholder with hint
    dataAiHint: 'medical health', 
    taskVibe: "Health Check",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
  const [rawAiOutputForDialog, setRawAiOutputForDialog] = useState<AISuggestionsDialogCommonProps['suggestions']>(null);
  const [stagedAiSuggestionsForSave, setStagedAiSuggestionsForSave] = useState<Partial<AiTaskAssistantOutput & { imageReviewFeedback?: string } > | null>(null);
  const [imageQueryForForm, setImageQueryForForm] = useState<string | null>(null);
  const [stagedEmojiForForm, setStagedEmojiForForm] = useState<string | null>(null);
  const [taskOfTheDayId, setTaskOfTheDayId] = useState<string | null>(null);
  const [dailyMotivation, setDailyMotivation] = useState<{ quote: string; date: string } | null>(null);
  const [isLoadingMotivation, setIsLoadingMotivation] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false);
  const [currentView, setCurrentView] = useState<CurrentView>('grid');
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);


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

    const today = new Date().toDateString();
    const storedMotivationString = localStorage.getItem('dailyMotivation');
    if (storedMotivationString) {
      try {
        const storedMotivation: { quote: string; date: string } = JSON.parse(storedMotivationString);
        if (storedMotivation.date === today) {
          setDailyMotivation(storedMotivation);
        } else {
          fetchNewMotivation(today);
        }
      } catch (e) {
        console.error("Error parsing motivation from localStorage", e);
        fetchNewMotivation(today);
      }
    } else {
      fetchNewMotivation(today);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const fetchNewMotivation = async (currentDate: string) => {
    setIsLoadingMotivation(true);
    const result = await getDailyMotivationalTip();
    if (result && !('error' in result) && result.tipOrQuote) {
      const newMotivation = { quote: result.tipOrQuote, date: currentDate };
      setDailyMotivation(newMotivation);
      localStorage.setItem('dailyMotivation', JSON.stringify(newMotivation));
    } else {
      const errorMsg = (result && 'error' in result ? result.error : "Unknown error");
      console.error("Failed to fetch daily motivation:", errorMsg);
       toast({
        variant: "destructive",
        title: "Motivation Fetch Error",
        description: `Could not fetch daily wisdom: ${errorMsg}. Using a default.`,
      });
      setDailyMotivation({ quote: "The journey of a thousand miles begins with a single step.", date: currentDate });
    }
    setIsLoadingMotivation(false);
  };

 useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    applyFilters();
    
    let currentFocusTaskId: string | null = taskOfTheDayId; 
    const incompleteTasks = tasks.filter((t) => !t.completed);

    if(currentFocusTaskId){
        const focusTaskStillExistsAndValid = incompleteTasks.find(t => t.id === currentFocusTaskId);
        if(!focusTaskStillExistsAndValid){ 
            currentFocusTaskId = null; 
            localStorage.removeItem('taskOfTheDay');
        }
    }
    
    if (!currentFocusTaskId && incompleteTasks.length === 0 && taskOfTheDayId){
      currentFocusTaskId = null;
      localStorage.removeItem('taskOfTheDay');
    }


    if (!currentFocusTaskId) { 
        const today = new Date().toDateString();
        const storedTaskOfTheDayString = localStorage.getItem('taskOfTheDay');

        if (storedTaskOfTheDayString) {
            try {
                const storedTaskOfTheDay: { id: string; date: string } = JSON.parse(storedTaskOfTheDayString);
                const taskStillExistsAndValid = incompleteTasks.find(t => t.id === storedTaskOfTheDay.id);
                if (storedTaskOfTheDay.date === today && taskStillExistsAndValid) {
                    currentFocusTaskId = storedTaskOfTheDay.id;
                } else {
                    localStorage.removeItem('taskOfTheDay'); 
                }
            } catch (e) {
                console.error("Error parsing task of the day from localStorage", e);
                localStorage.removeItem('taskOfTheDay');
            }
        }
        
        if (!currentFocusTaskId && incompleteTasks.length > 0) {
            let candidates = incompleteTasks.filter(t => t.priority === 'high');
            if (candidates.length === 0) candidates = incompleteTasks.filter(t => t.priority === 'medium');
            if (candidates.length === 0) candidates = incompleteTasks; 
            
            if (candidates.length > 0) {
                const randomIndex = Math.floor(Math.random() * candidates.length);
                currentFocusTaskId = candidates[randomIndex].id;
                localStorage.setItem('taskOfTheDay', JSON.stringify({ id: currentFocusTaskId, date: today }));
            }
        }
    }
    
    if (incompleteTasks.length === 0 && currentFocusTaskId) { 
        currentFocusTaskId = null;
        localStorage.removeItem('taskOfTheDay');
    }

    setTaskOfTheDayId(currentFocusTaskId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks]); 


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
      if (taskOfTheDayId) {
        if (a.id === taskOfTheDayId) return -1;
        if (b.id === taskOfTheDayId) return 1;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }));
  }, [tasks, filters, taskOfTheDayId]);

  const handleSearchTermChange = (searchTerm: string) => {
    setFilters(prevFilters => ({ ...prevFilters, searchTerm }));
  };

  const handleApplyDialogFilters = (dialogFilters: DialogFilterState) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      priority: dialogFilters.priority,
      dueDate: dialogFilters.dueDate,
      tags: dialogFilters.tags,
    }));
    setIsFilterDialogOpen(false); 
  };
  
  const handleResetAllFilters = () => {
    setFilters(initialFilters);
    setIsFilterDialogOpen(false); 
  };


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
    
    let finalTaskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed' | 'completedAt'| 'dataAiHint'> & Partial<Pick<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed' | 'completedAt' | 'dataAiHint' | 'taskVibe'>> = { ...taskDataFromForm };
        
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
        if (stagedAiSuggestionsForSave.suggestedTaskVibe) {
            finalTaskData.taskVibe = stagedAiSuggestionsForSave.suggestedTaskVibe;
        }
        if (stagedAiSuggestionsForSave.suggestedReminderDate && !finalTaskData.reminderDate) {
             try {
                finalTaskData.reminderDate = format(parseISO(stagedAiSuggestionsForSave.suggestedReminderDate), 'yyyy-MM-dd');
            } catch (e) {
                console.warn("AI suggested an invalid reminder date format:", stagedAiSuggestionsForSave.suggestedReminderDate);
            }
        }
    }


    if (editingTask) {
      let updatedDataAiHint: string | undefined = editingTask.dataAiHint;

      if (finalTaskData.imageUrl && finalTaskData.imageUrl !== editingTask.imageUrl && !finalTaskData.imageUrl.startsWith('https://placehold.co') && !finalTaskData.imageUrl.startsWith('data:')) {
        updatedDataAiHint = undefined; 
      } 
      else if (!finalTaskData.imageUrl && stagedAiSuggestionsForSave?.suggestedImageQuery) {
        updatedDataAiHint = stagedAiSuggestionsForSave.suggestedImageQuery.trim().split(' ').slice(0, 2).join(' ');
      }
      
      const updatedTask: Task = {
        ...editingTask,
        ...finalTaskData,
        updatedAt: now,
        dataAiHint: updatedDataAiHint,
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
        description: baseNewTask.description || "",
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

    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map(task => {
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
      });
      return updatedTasks;
    });

    if (taskTitleForToast && newCompletionStatus !== undefined) {
      toast({
        title: `Task ${newCompletionStatus ? 'Completed' : 'Marked Incomplete'}`,
        description: `"${taskTitleForToast}" has been updated.`,
      });
    }
  };
  
 const handleGetAiTaskSuggestions = async (aiInput: AiTaskFormInput) => {
    const result = await getAiTaskAssistance({
        ...aiInput,
        dueDate: aiInput.dueDate || "", 
        reminder: aiInput.reminder || "",
        imageUrl: aiInput.imageUrl || undefined,
    });
    if (result && !('error' in result)) {
        setRawAiOutputForDialog(result);
        setIsAiSuggestionsOpen(true);
    } else if (result && 'error' in result) {
        toast({
            variant: "destructive",
            title: "AI Assistance Error",
            description: result.error,
        });
    }
    return result;
  };

  const handleReviewImage = async (imageUrl: string, title: string, description?: string) => {
    const reviewInput: ReviewTaskImageInput = {
      imageUrl,
      taskTitle: title,
      taskDescription: description,
    };
    const result = await reviewTaskImageAction(reviewInput);

    if (result && !('error' in result)) {
      const dialogPayload: AISuggestionsDialogCommonProps['suggestions'] = {
        approachSuggestions: [], 
        improvedDescription: '', 
        generatedSubtasks: [],  
        imageReviewFeedback: result.feedback,
        suggestedImageQuery: result.suggestedImageQuery,
      };
      setRawAiOutputForDialog(dialogPayload);
      setIsAiSuggestionsOpen(true);
    } else if (result && 'error' in result) {
      toast({
        variant: "destructive",
        title: "AI Image Review Error",
        description: result.error,
      });
    }
  };
  
  const handleApplyAiSuggestions = (appliedSuggestions: Partial<AiTaskAssistantOutput & { imageReviewFeedback?: string }>) => {
    setStagedAiSuggestionsForSave(prevStaged => {
        const updatedStaged = { ...prevStaged, ...appliedSuggestions };
        if (appliedSuggestions.hasOwnProperty('generatedSubtasks') && Array.isArray(appliedSuggestions.generatedSubtasks) && appliedSuggestions.generatedSubtasks.length === 0) {
            updatedStaged.generatedSubtasks = [];
        }
        return updatedStaged;
    });

    if (appliedSuggestions.suggestedImageQuery) {
      setImageQueryForForm(appliedSuggestions.suggestedImageQuery);
    }
    if (appliedSuggestions.suggestedEmoji) {
      setStagedEmojiForForm(appliedSuggestions.suggestedEmoji);
    }

    let stagedItemDescription = "AI suggestion(s) have been noted";
    const keysStaged = Object.keys(appliedSuggestions);
    const relevantKeys = keysStaged.filter(key => key !== 'imageReviewFeedback' && appliedSuggestions[key as keyof typeof appliedSuggestions] !== undefined);


    if (relevantKeys.length === 1) {
        const key = relevantKeys[0];
        if (key === 'improvedDescription') stagedItemDescription = "Description staged";
        else if (key === 'generatedSubtasks') stagedItemDescription = "Selected subtasks staged";
        else if (key === 'suggestedEmoji') stagedItemDescription = "Emoji staged";
        else if (key === 'suggestedTagline') stagedItemDescription = "Tagline staged";
        else if (key === 'suggestedImageQuery') stagedItemDescription = "Image query staged";
        else if (key === 'suggestedTaskVibe') stagedItemDescription = "Task vibe staged";
        else if (key === 'suggestedReminderDate') stagedItemDescription = "Reminder date staged";
         toast({ title: "AI Suggestion Staged", description: stagedItemDescription });
    } else if (relevantKeys.length > 1) {
        stagedItemDescription = "Multiple AI suggestions staged";
         toast({ title: "AI Suggestions Staged", description: stagedItemDescription });
    }
    
    if ( (appliedSuggestions.hasOwnProperty('generatedSubtasks') && Array.isArray(appliedSuggestions.generatedSubtasks) && appliedSuggestions.generatedSubtasks.length === 0) ) {
      toast({ title: "AI Suggestion Staged", description: "Generated subtasks selection cleared." });
    }
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
          ? { ...task, imageUrl: newImageUrl, updatedAt: new Date().toISOString(), dataAiHint: undefined } 
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
      <div className="flex flex-col min-h-screen bg-background scrollbar-thin">
        <Header 
            onAddTask={() => handleOpenTaskForm()} 
            onOpenSettings={() => setIsSettingsDialogOpen(true)}
            onOpenStats={() => setIsStatsDialogOpen(true)}
            currentView={currentView}
            onSetView={setCurrentView}
            searchTerm={filters.searchTerm} 
            onSearchTermChange={handleSearchTermChange} 
            onOpenFilterDialog={() => setIsFilterDialogOpen(true)} 
        />
        <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
          <DailyMotivation motivation={dailyMotivation} isLoading={isLoadingMotivation} />
          <TaskList
            tasks={filteredTasks}
            onEditTask={handleOpenTaskForm}
            onDeleteTask={handleDeleteTask}
            onToggleSubtask={handleToggleSubtask}
            onToggleTaskComplete={handleToggleTaskComplete}
            onUpdateTaskImage={handleUpdateTaskImage}
            taskOfTheDayId={taskOfTheDayId}
            currentView={currentView}
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
                    onGetAiSuggestions={handleGetAiTaskSuggestions}
                    onReviewImage={handleReviewImage}
                    activeImageQuery={imageQueryForForm}
                    onClearActiveImageQuery={() => setImageQueryForForm(null)}
                    stagedEmoji={stagedEmojiForForm}
                    onClearStagedEmoji={handleClearStagedEmoji}
                    generateImageAction={generateImageAction}
                    suggestRandomTaskAction={suggestRandomTaskAction}
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

      <SettingsDialog 
        isOpen={isSettingsDialogOpen}
        onClose={() => setIsSettingsDialogOpen(false)}
      />

      <Dialog open={isStatsDialogOpen} onOpenChange={setIsStatsDialogOpen}>
        <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[80vh] flex flex-col rounded-[var(--radius)]">
            <DialogHeader>
                <DialogTitle className="text-xl">Task Statistics</DialogTitle>
                <DialogDescription>
                    An overview of your current tasks.
                </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto flex-grow py-4 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                <TaskStatsDashboard tasks={tasks} />
            </div>
             <DialogFooter className="pt-4">
                <Button onClick={() => setIsStatsDialogOpen(false)} variant="outline">Close</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      <FilterDialog
        isOpen={isFilterDialogOpen}
        onOpenChange={setIsFilterDialogOpen}
        currentDialogFilters={{
          priority: filters.priority,
          dueDate: filters.dueDate,
          tags: filters.tags,
        }}
        onApplyFilters={handleApplyDialogFilters}
        onResetAllFilters={handleResetAllFilters}
        initialDialogFilters={{ 
            priority: initialFilters.priority,
            dueDate: initialFilters.dueDate,
            tags: initialFilters.tags,
        }}
      />

    </TooltipProvider>
  );
}
