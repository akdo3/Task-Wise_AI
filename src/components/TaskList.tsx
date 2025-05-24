
"use client";

import type { FC } from 'react';
import type { Task, CurrentView, Priority } from '@/types';
import { TaskCard } from './TaskCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { CalendarDays, Edit3, Trash2, CheckCircle, Circle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface TaskListProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onToggleTaskComplete: (taskId: string) => void;
  onUpdateTaskImage: (taskId: string, newImageUrl: string) => void;
  taskOfTheDayId: string | null;
  currentView: CurrentView;
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

const CompactListItem: FC<{ task: Task; onEdit: () => void; onDelete: () => void; onToggleComplete: () => void; isFocusTask?: boolean }> = ({ task, onEdit, onDelete, onToggleComplete, isFocusTask }) => {
  const badgeConfig = priorityBadgeClassConfig[task.priority];
  return (
    <div 
      className={cn(
        "flex items-center gap-3 p-3 border-b hover:bg-muted/50 transition-colors rounded-md",
        task.completed && "opacity-60 dark:opacity-50",
        isFocusTask && !task.completed && "ring-2 ring-accent ring-offset-1 ring-offset-background dark:ring-offset-card"
      )}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleComplete}
            className={cn(
              "h-7 w-7 shrink-0 text-muted-foreground",
              task.completed ? "hover:text-yellow-500 dark:hover:text-yellow-400" : "hover:text-green-500 dark:hover:text-green-400"
            )}
          >
            {task.completed ? <CheckCircle className="h-5 w-5 text-accent" /> : <Circle className="h-5 w-5" />}
            <span className="sr-only">{task.completed ? 'Mark as Incomplete' : 'Mark as Complete'}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">{task.completed ? 'Mark as Incomplete' : 'Mark as Complete'}</TooltipContent>
      </Tooltip>

      <div className="flex-grow overflow-hidden">
        <p 
          className={cn(
            "text-sm font-medium truncate cursor-pointer hover:underline", 
            task.completed && "line-through text-muted-foreground"
          )}
          onClick={onEdit}
          title={task.title}
        >
          {task.title}
        </p>
      </div>

      {task.dueDate && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("hidden sm:flex items-center text-xs text-muted-foreground shrink-0", task.completed && "line-through")}>
              <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
              {format(parseISO(task.dueDate), 'MMM d')}
            </div>
          </TooltipTrigger>
          <TooltipContent>Due: {format(parseISO(task.dueDate), 'MMM d, yyyy')}</TooltipContent>
        </Tooltip>
      )}

      <Badge
        variant="outline"
        className={cn(
          "capitalize text-xs px-2 py-0.5 font-medium shrink-0",
          badgeConfig.baseBg,
          badgeConfig.text,
          badgeConfig.border,
          task.priority === 'high' && !task.completed && badgeConfig.animatedClass,
          task.completed && "border-transparent !bg-muted text-muted-foreground opacity-70"
        )}
      >
        {task.priority}
      </Badge>

      <div className="flex gap-1 shrink-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onEdit} className="h-7 w-7 text-muted-foreground hover:text-primary" disabled={task.completed}>
              <Edit3 className="h-4 w-4" />
              <span className="sr-only">Edit Task</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Edit Task {task.completed && "(Mark incomplete to edit)"}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onDelete} className="h-7 w-7 text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete Task</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete Task</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};


export const TaskList: FC<TaskListProps> = ({ 
  tasks, 
  onEditTask, 
  onDeleteTask, 
  onToggleSubtask,
  onToggleTaskComplete,
  onUpdateTaskImage,
  taskOfTheDayId,
  currentView,
}) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold text-muted-foreground">No tasks yet!</h2>
        <p className="text-muted-foreground">Click "Add Task" to get started.</p>
      </div>
    );
  }

  if (currentView === 'compactList') {
    return (
      <div className="space-y-1">
        {tasks.map((task) => (
          <CompactListItem
            key={task.id}
            task={task}
            onEdit={() => onEditTask(task)}
            onDelete={() => onDeleteTask(task.id)}
            onToggleComplete={() => onToggleTaskComplete(task.id)}
            isFocusTask={task.id === taskOfTheDayId && !task.completed}
          />
        ))}
      </div>
    );
  }

  // Default to Grid View
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tasks.map((task) => (
        <TaskCard 
          key={task.id} 
          task={task} 
          onEdit={onEditTask} 
          onDelete={onDeleteTask}
          onToggleSubtask={onToggleSubtask}
          onToggleComplete={onToggleTaskComplete}
          onUpdateTaskImage={onUpdateTaskImage}
          isFocusTask={task.id === taskOfTheDayId}
        />
      ))}
    </div>
  );
};
