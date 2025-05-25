
"use client";

import type { FC } from 'react';
import Image from 'next/image';
import type { Task, Priority } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface KanbanCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

const priorityBadgeClassConfig: Record<Priority, { baseBg: string; text: string; border: string }> = {
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
  },
};

export const KanbanCard: FC<KanbanCardProps> = ({ task, onEdit }) => {
  const badgeConfig = priorityBadgeClassConfig[task.priority];
  const displayImageUrl = task.imageUrl || 'https://placehold.co/300x200.png';
  const displayImageHint = task.dataAiHint || (task.imageUrl ? 'task visual context' : 'placeholder image');

  return (
    <Card 
      className={cn(
        "mb-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer rounded-[var(--radius)] border",
        task.completed && "opacity-60 dark:opacity-50 bg-muted/30 dark:bg-muted/20 grayscale"
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
          <Badge
            variant="outline"
            className={cn(
              "capitalize text-xs px-1.5 py-0.5 font-medium shrink-0",
              badgeConfig.baseBg,
              badgeConfig.text,
              badgeConfig.border,
              task.completed && "border-transparent !bg-muted text-muted-foreground opacity-70"
            )}
          >
            {task.priority}
          </Badge>
        </div>
      </CardHeader>
      {task.tags.length > 0 && !task.completed && (
        <CardContent className="p-3 pt-0">
          <div className="flex flex-wrap gap-1">
            {task.tags.slice(0, 2).map((tag) => ( // Show max 2 tags for brevity
              <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0.5 rounded-full bg-muted/70 hover:bg-muted/50 text-muted-foreground font-normal">
                {tag}
              </Badge>
            ))}
            {task.tags.length > 2 && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5 rounded-full bg-muted/70 text-muted-foreground font-normal">
                +{task.tags.length - 2} more
              </Badge>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};
