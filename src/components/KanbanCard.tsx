
"use client";

import type { FC } from 'react';
import Image from 'next/image';
import type { Task, Priority } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { CalendarDays, UserCheck, Sparkles, ListChecks } from 'lucide-react';

interface KanbanCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  isFocusTask?: boolean;
}

const priorityBadgeClassConfig: Record<Priority, { baseBg: string; text: string; border: string, animatedClass?: string }> = {
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

export const KanbanCard: FC<KanbanCardProps> = ({ task, onEdit, isFocusTask }) => {
  const badgeConfig = priorityBadgeClassConfig[task.priority];
  const displayImageUrl = task.imageUrl || 'https://placehold.co/300x200.png';
  const displayImageHint = task.dataAiHint || (task.imageUrl ? 'task visual context' : 'placeholder image');

  const completedSubtasks = task.subtasks.filter(st => st.completed).length;
  const totalSubtasks = task.subtasks.length;

  return (
    <Card
      className={cn(
        "mb-3 shadow-sm hover:shadow-lg transition-all duration-200 ease-out cursor-pointer rounded-[var(--radius)] border hover:border-[hsl(var(--primary))]",
        task.completed && "opacity-60 dark:opacity-50 bg-muted/30 dark:bg-muted/20 grayscale",
        isFocusTask && !task.completed && "ring-2 ring-accent ring-offset-2 ring-offset-background dark:ring-offset-card shadow-2xl"
      )}
      onClick={() => onEdit(task)}
    >
      {task.imageUrl && (
        <div className={cn("relative w-full h-32 rounded-t-[var(--radius)] overflow-hidden", task.completed && "grayscale")}>
          <Image
            src={displayImageUrl}
            alt={`Image for ${task.title}`}
            layout="fill"
            objectFit="cover"
            data-ai-hint={displayImageHint}
            key={displayImageUrl}
          />
        </div>
      )}
      <CardHeader className="p-3">
        <div className="flex justify-between items-start gap-1">
          <CardTitle className={cn("text-sm font-semibold leading-tight line-clamp-2", task.completed && "line-through text-muted-foreground")}>
            {task.title}
          </CardTitle>
          <div className="flex flex-col items-end gap-0.5 shrink-0">
            <Badge
              variant="outline"
              className={cn(
                "capitalize text-xs px-1.5 py-0.5 font-medium",
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
              <Badge variant="secondary" className="text-xs px-1 py-0 font-normal bg-transparent border-primary/30 text-primary/80 items-center self-end">
                <Sparkles className="h-2.5 w-2.5 mr-1 text-accent/70 animate-sparkle-effect" />
                 {task.taskVibe}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-1.5 text-xs">
        {task.description && !task.completed && (
          <CardDescription className="text-xs text-muted-foreground line-clamp-2 whitespace-pre-wrap">
            {task.description}
          </CardDescription>
        )}
        {task.dueDate && !task.completed && (
          <div className="flex items-center text-muted-foreground">
            <CalendarDays className="h-3 w-3 mr-1.5" />
            Due: {format(parseISO(task.dueDate), 'MMM d')}
          </div>
        )}
        {totalSubtasks > 0 && !task.completed && (
          <div className="flex items-center text-muted-foreground">
            <ListChecks className="h-3 w-3 mr-1.5" />
            Subtasks: {completedSubtasks}/{totalSubtasks}
          </div>
        )}
        {task.delegatedTo && !task.completed && (
            <div className="flex items-center text-muted-foreground">
                <UserCheck className="h-3 w-3 mr-1.5" />
                {task.delegatedTo}
            </div>
        )}
        {task.tags.length > 0 && !task.completed && (
          <div className="flex flex-wrap gap-1 pt-1">
            {task.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted/70 hover:bg-muted/50 text-muted-foreground font-normal">
                {tag}
              </Badge>
            ))}
            {task.tags.length > 2 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted/70 text-muted-foreground font-normal">
                +{task.tags.length - 2}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
