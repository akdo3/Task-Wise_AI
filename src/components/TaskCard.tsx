
"use client";

import type { FC } from 'react';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import type { Task, Priority } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CalendarDays, Edit3, Trash2, UserCheck, CheckCircle, Circle, Wand2, Loader2, Star, Sparkles, Bell } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { generateImageForTask } from '@/lib/actions';
import { useToast } from "@/hooks/use-toast";


interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onToggleComplete: (taskId: string) => void;
  onUpdateTaskImage: (taskId: string, newImageUrl: string) => void;
  isFocusTask?: boolean; // New prop
}

const priorityBadgeClassConfig: Record<Priority, { baseBg: string; text: string; border: string; animatedClass?: string }> = {
  low: {
    baseBg: 'bg-[hsl(var(--priority-low-bg-hsl))]',
    text: 'text-[hsl(var(--priority-low-fg-hsl))]',
    border: 'border-[hsl(var(--priority-low-border-hsl))]',
  },
  medium: {
    baseBg: 'bg-[hsl(var(--priority-medium-bg-hsl))]',
    text: 'text-[hsl(var(--priority-medium-fg-hsl))]',
    border: 'border-[hsl(var(--priority-medium-border-hsl))]',
  },
  high: {
    baseBg: 'bg-[hsl(var(--priority-high-bg-hsl))]',
    text: 'text-[hsl(var(--priority-high-fg-hsl))]',
    border: 'border-[hsl(var(--priority-high-border-hsl))]',
    animatedClass: 'animate-pulse-subtle-bg'
  },
};

const priorityCardBgClasses: Record<Priority, string> = {
  low: 'bg-[hsl(var(--priority-low-card-bg-subtle))] dark:bg-[hsl(var(--priority-low-card-bg-subtle-dark))]',
  medium: 'bg-[hsl(var(--priority-medium-card-bg-subtle))] dark:bg-[hsl(var(--priority-medium-card-bg-subtle-dark))]',
  high: 'bg-[hsl(var(--priority-high-card-bg-subtle))] dark:bg-[hsl(var(--priority-high-card-bg-subtle-dark))]',
};


export const TaskCard: FC<TaskCardProps> = ({ task, onEdit, onDelete, onToggleSubtask, onToggleComplete, onUpdateTaskImage, isFocusTask }) => {
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [isGeneratingHintImage, setIsGeneratingHintImage] = useState(false);
  const { toast } = useToast();

  const completedSubtasks = task.subtasks.filter(st => st.completed).length;
  const totalSubtasks = task.subtasks.length;
  const subtaskProgressPercentage = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  const badgeConfig = priorityBadgeClassConfig[task.priority];
  const cardBgClass = priorityCardBgClasses[task.priority];

  const displayImageUrl = task.imageUrl || 'https://placehold.co/600x400.png';
  const displayImageHint = task.dataAiHint || (task.imageUrl ? 'task visual context' : 'placeholder image');

  const prevCompletedSubtasksCountRef = useRef(completedSubtasks);

  useEffect(() => {
    const allSubtasksNowComplete = totalSubtasks > 0 && completedSubtasks === totalSubtasks;
    const allSubtasksPreviouslyComplete = totalSubtasks > 0 && prevCompletedSubtasksCountRef.current === totalSubtasks;

    if (allSubtasksNowComplete && !allSubtasksPreviouslyComplete && !task.completed) {
      setIsCelebrating(true);
      setTimeout(() => setIsCelebrating(false), 800); 
    }
    prevCompletedSubtasksCountRef.current = completedSubtasks;
  }, [completedSubtasks, totalSubtasks, task.completed]);


  const handleToggleCompleteAndCelebrate = () => {
    if (!task.completed && !(totalSubtasks > 0 && completedSubtasks === totalSubtasks)) {
      setIsCelebrating(true);
      setTimeout(() => setIsCelebrating(false), 800);
    } else if (task.completed) { 
       setIsCelebrating(false);
    }
    onToggleComplete(task.id);
  };

  const handleGenerateImageFromHint = async () => {
    if (!task.dataAiHint || isGeneratingHintImage) return;

    setIsGeneratingHintImage(true);
    try {
      const result = await generateImageForTask({
        taskTitle: task.title,
        imageQuery: task.dataAiHint,
      });

      if (result && !('error' in result) && result.imageDataUri) {
        onUpdateTaskImage(task.id, result.imageDataUri);
      } else {
        const errorMessage = (result && 'error' in result) ? result.error : "Failed to generate image from hint.";
        toast({
          variant: "destructive",
          title: "Image Generation Error",
          description: errorMessage,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Image Generation Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
      });
    } finally {
      setIsGeneratingHintImage(false);
    }
  };


  return (
    <Card className={cn(
      "animate-fade-in-up shadow-md hover:shadow-xl hover:scale-[1.03] transition-all duration-300 ease-out flex flex-col h-full text-card-foreground rounded-[var(--radius)] border hover:border-[hsl(var(--primary))]",
      cardBgClass,
      task.completed && "opacity-60 dark:opacity-50 bg-muted/30 dark:bg-muted/20 hover:opacity-100 grayscale",
      task.priority === 'high' && !task.completed && "high-priority-glow-effect",
      isFocusTask && !task.completed && "ring-2 ring-accent ring-offset-2 ring-offset-background dark:ring-offset-card shadow-2xl"
      )}>
      <div className={cn("relative w-full h-48 rounded-t-[var(--radius)] overflow-hidden", task.completed && "grayscale")}>
          <Image
            src={displayImageUrl}
            alt={`Image for ${task.title}`}
            layout="fill"
            objectFit="cover"
            data-ai-hint={displayImageHint}
            key={displayImageUrl} 
          />
          {!task.imageUrl && task.dataAiHint && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-background/70 hover:bg-accent hover:text-accent-foreground text-foreground rounded-full shadow-md h-8 w-8"
                  onClick={handleGenerateImageFromHint}
                  disabled={isGeneratingHintImage}
                >
                  {isGeneratingHintImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                  <span className="sr-only">Generate Image from AI Hint</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Generate Image from AI Hint: "{task.dataAiHint}"</TooltipContent>
            </Tooltip>
          )}
      </div>
      <CardHeader className="pb-3 pt-4">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className={cn("text-lg font-semibold leading-tight", task.completed && "line-through text-muted-foreground")}>{task.title}</CardTitle>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <Badge
              variant="outline"
              className={cn(
                "capitalize text-xs px-2 py-0.5 font-medium",
                badgeConfig.baseBg,
                badgeConfig.text,
                badgeConfig.border,
                task.priority === 'high' && !task.completed && badgeConfig.animatedClass,
                task.completed && "border-transparent !bg-muted text-muted-foreground opacity-70"
              )}
            >
              {task.priority}
            </Badge>
            {task.taskVibe && !task.completed && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5 font-normal mt-0.5 self-end bg-transparent border-primary/30 text-primary/80 items-center">
                <Sparkles className="h-3 w-3 mr-1 text-accent/70 animate-sparkle-effect" />
                 {task.taskVibe}
              </Badge>
            )}
            {isFocusTask && !task.completed && (
              <Badge variant="outline" className="border-accent text-accent bg-accent/10 text-xs px-1.5 py-0.5 font-medium animate-fade-in-up mt-0.5">
                <Star className="h-3 w-3 mr-1 fill-accent animate-star-pulse" /> Focus
              </Badge>
            )}
          </div>
        </div>
        {task.description && (
          <CardDescription className={cn("text-sm text-muted-foreground line-clamp-3 pt-1 whitespace-pre-wrap", task.completed && "line-through opacity-70")}>{task.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-grow space-y-2.5 text-sm">
        {task.completed && task.completedAt && (
          <div className="flex items-center text-accent dark:text-accent/90 font-medium">
            <CheckCircle className="h-4 w-4 mr-2" />
            Completed: {format(parseISO(task.completedAt), 'MMM d, yyyy')}
          </div>
        )}
        {task.dueDate && (
          <div className={cn("flex items-center text-muted-foreground", task.completed && "line-through opacity-70")}>
            <CalendarDays className="h-3.5 w-3.5 mr-2" />
            Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
          </div>
        )}
        {task.reminderDate && (
          <div className={cn("flex items-center text-muted-foreground", task.completed && "line-through opacity-70")}>
            <Bell className="h-3.5 w-3.5 mr-2 text-accent/80" />
            Reminder: {format(new Date(task.reminderDate), 'MMM d, yyyy')}
          </div>
        )}
        {task.delegatedTo && (
          <div className={cn("flex items-center text-muted-foreground", task.completed && "line-through opacity-70")}>
            <UserCheck className="h-3.5 w-3.5 mr-2" />
            Delegated to: {task.delegatedTo}
          </div>
        )}
        {task.tags.length > 0 && (
          <div className={cn("flex flex-wrap gap-1.5 pt-1", task.completed && "opacity-70")}>
            {task.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground">{tag}</Badge>
            ))}
          </div>
        )}
        {task.subtasks.length > 0 && (
           <div className={cn("pt-2", task.completed && "opacity-70")}>
             <h4 className="text-xs font-medium text-muted-foreground">SUBTASKS ({completedSubtasks}/{totalSubtasks})</h4>
             <Progress value={subtaskProgressPercentage} className="h-1.5 w-full mt-1 mb-1.5" aria-label={`${subtaskProgressPercentage.toFixed(0)}% of subtasks complete`} />
             <ul className="space-y-1 max-h-28 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent pr-1">
               {task.subtasks.map(subtask => (
                 <li key={subtask.id} className="flex items-center text-sm cursor-pointer hover:bg-muted/50 p-1.5 rounded-md" onClick={() => !task.completed && onToggleSubtask(task.id, subtask.id)}>
                   {subtask.completed ? <CheckCircle className="h-4 w-4 mr-2 text-accent flex-shrink-0" /> : <Circle className="h-4 w-4 mr-2 text-muted-foreground/50 flex-shrink-0" />}
                   <span className={cn("truncate", subtask.completed ? 'line-through text-muted-foreground' : 'text-foreground', task.completed && subtask.completed && 'text-muted-foreground', task.completed && !subtask.completed && 'text-foreground/70')}>{subtask.text}</span>
                 </li>
               ))}
             </ul>
           </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-1 border-t pt-3 mt-auto">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleCompleteAndCelebrate}
              className={cn(
                "relative text-muted-foreground",
                task.completed ? "hover:text-accent" : "hover:text-primary"
              )}
            >
              {task.completed ? <Circle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
              <span className="sr-only">{task.completed ? 'Mark as Incomplete' : 'Mark as Complete'}</span>
              {isCelebrating && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-visible">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className="confetti-particle"
                      style={{
                        background: `hsl(${Math.random() * 360}, 100%, 70%)`,
                        transform: `translate(${Math.random() * 50 - 25}px, ${Math.random() * 50 - 25}px) rotate(${Math.random() * 360}deg) scale(0)`,
                        animationDelay: `${Math.random() * 0.05}s`,
                        width: `${Math.random() * 5 + 3}px`,
                        height: `${Math.random() * 5 + 3}px`,
                      }}
                    />
                  ))}
                </div>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{task.completed ? 'Mark as Incomplete' : 'Mark as Complete'}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => onEdit(task)} className="text-muted-foreground hover:text-primary" disabled={task.completed}>
              <Edit3 className="h-4 w-4" />
              <span className="sr-only">Edit Task</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Edit Task {task.completed && "(Mark incomplete to edit)"}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => onDelete(task.id)} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete Task</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete Task</TooltipContent>
        </Tooltip>
      </CardFooter>
    </Card>
  );
};

