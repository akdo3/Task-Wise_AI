
"use client";

import type { FC } from 'react';
import type { Task, KanbanColumnType } from '@/types';
import { KanbanCard } from './KanbanCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  column: KanbanColumnType;
  onEditTask: (task: Task) => void;
}

export const KanbanColumn: FC<KanbanColumnProps> = ({ column, onEditTask }) => {
  return (
    <div className="flex flex-col w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 shrink-0 p-2">
      <div className="bg-muted/50 p-3 rounded-lg h-full flex flex-col shadow">
        <h3 className="text-md font-semibold mb-3 px-1 text-foreground capitalize flex items-center justify-between">
          {column.title}
          <span className="text-xs font-normal text-muted-foreground bg-background px-2 py-0.5 rounded-full">
            {column.tasks.length}
          </span>
        </h3>
        <ScrollArea className="flex-grow pr-1 -mr-1 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          <div className="space-y-0.5 min-h-[50px]">
            {column.tasks.length === 0 && (
              <p className="text-xs text-muted-foreground p-2 text-center">No tasks here.</p>
            )}
            {column.tasks.map((task) => (
              <KanbanCard key={task.id} task={task} onEdit={onEditTask} />
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
