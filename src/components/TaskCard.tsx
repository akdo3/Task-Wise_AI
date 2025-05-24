
"use client";

import type { FC } from 'react';
import Image from 'next/image'; // Import next/image
import type { Task, Priority } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Edit3, Trash2, UserCheck, Repeat, CheckCircle, Circle, GripVertical } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
}

const priorityBadgeClassConfig: Record<Priority, { bg: string; text: string; border: string }> = {
  low: {
    bg: 'bg-transparent hover:bg-[hsl(var(--priority-low-bg-hsl)/0.5)]',
    text: 'text-[hsl(var(--priority-low-fg-hsl))]',
    border: 'border-[hsl(var(--priority-low-border-hsl))]',
  },
  medium: {
    bg: 'bg-transparent hover:bg-[hsl(var(--priority-medium-bg-hsl)/0.5)]',
    text: 'text-[hsl(var(--priority-medium-fg-hsl))]',
    border: 'border-[hsl(var(--priority-medium-border-hsl))]',
  },
  high: {
    bg: 'bg-transparent hover:bg-[hsl(var(--priority-high-bg-hsl)/0.5)]',
    text: 'text-[hsl(var(--priority-high-fg-hsl))]',
    border: 'border-[hsl(var(--priority-high-border-hsl))]',
  },
};

const priorityCardBgClasses: Record<Priority, string> = {
  low: 'bg-[hsl(var(--priority-low-card-bg-subtle))] dark:bg-[hsl(var(--priority-low-card-bg-subtle-dark))]',
  medium: 'bg-[hsl(var(--priority-medium-card-bg-subtle))] dark:bg-[hsl(var(--priority-medium-card-bg-subtle-dark))]',
  high: 'bg-[hsl(var(--priority-high-card-bg-subtle))] dark:bg-[hsl(var(--priority-high-card-bg-subtle-dark))]',
};


export const TaskCard: FC<TaskCardProps> = ({ task, onEdit, onDelete, onToggleSubtask }) => {
  const completedSubtasks = task.subtasks.filter(st => st.completed).length;
  const totalSubtasks = task.subtasks.length;
  const badgeClasses = priorityBadgeClassConfig[task.priority];
  const cardBgClass = priorityCardBgClasses[task.priority];

  return (
    <Card className={cn(
      "animate-fade-in-up shadow-md hover:shadow-xl hover:scale-[1.03] transition-all duration-300 ease-out flex flex-col h-full text-card-foreground rounded-[var(--radius)] border hover:border-[hsl(var(--primary))]",
      cardBgClass
      )}>
      {task.imageUrl && (
        <div className="relative w-full h-48 rounded-t-[var(--radius)] overflow-hidden">
          <Image
            src={task.imageUrl}
            alt={`Image for ${task.title}`}
            layout="fill"
            objectFit="cover"
            data-ai-hint="task visual context" 
          />
        </div>
      )}
      <CardHeader className={cn("pb-3", task.imageUrl ? "pt-4" : "pt-6")}>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold leading-tight">{task.title}</CardTitle>
          <Badge 
            variant="outline"
            className={cn(
              "capitalize text-xs px-2 py-0.5 font-medium",
              badgeClasses.bg,
              badgeClasses.text,
              badgeClasses.border
            )}
          >
            {task.priority}
          </Badge>
        </div>
        {task.description && (
          <CardDescription className="text-sm text-muted-foreground line-clamp-3 pt-1">{task.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-grow space-y-2.5 text-sm">
        {task.dueDate && (
          <div className="flex items-center text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5 mr-2" />
            Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
          </div>
        )}
        {task.reminderDate && (
          <div className="flex items-center text-muted-foreground">
            <Repeat className="h-3.5 w-3.5 mr-2" />
            Reminder: {format(new Date(task.reminderDate), 'MMM d, yyyy')}
          </div>
        )}
        {task.delegatedTo && (
          <div className="flex items-center text-muted-foreground">
            <UserCheck className="h-3.5 w-3.5 mr-2" />
            Delegated to: {task.delegatedTo}
          </div>
        )}
        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {task.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground">{tag}</Badge>
            ))}
          </div>
        )}
        {task.subtasks.length > 0 && (
           <div className="pt-2">
             <h4 className="text-xs font-medium text-muted-foreground mb-1.5">SUBTASKS ({completedSubtasks}/{totalSubtasks})</h4>
             <ul className="space-y-1 max-h-28 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent pr-1">
               {task.subtasks.map(subtask => (
                 <li key={subtask.id} className="flex items-center text-sm cursor-pointer hover:bg-muted/50 p-1.5 rounded-md" onClick={() => onToggleSubtask(task.id, subtask.id)}>
                   {subtask.completed ? <CheckCircle className="h-4 w-4 mr-2 text-accent flex-shrink-0" /> : <Circle className="h-4 w-4 mr-2 text-muted-foreground/50 flex-shrink-0" />}
                   <span className={cn("truncate", subtask.completed ? 'line-through text-muted-foreground' : 'text-foreground')}>{subtask.text}</span>
                 </li>
               ))}
             </ul>
           </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-1 border-t pt-3 mt-auto">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => onEdit(task)} className="text-muted-foreground hover:text-primary">
              <Edit3 className="h-4 w-4" />
              <span className="sr-only">Edit Task</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Edit Task</TooltipContent>
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
