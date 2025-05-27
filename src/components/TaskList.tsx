
"use client";

import type { FC } from 'react';
import type { Task, CurrentView, Priority, KanbanColumnType } from '@/types';
import { TaskCard } from './TaskCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { format, parseISO } from 'date-fns';
import { CalendarDays, Edit3, Trash2, CheckCircle, Circle, UserCheck, Sparkles, Bell, ListChecks } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { KanbanColumn } from './KanbanColumn';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

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

const CompactListItem: FC<{ task: Task; onEdit: () => void; onDelete: () => void; onToggleComplete: () => void; onToggleSubtask: (taskId: string, subtaskId: string) => void; isFocusTask?: boolean }> = ({ task, onEdit, onDelete, onToggleComplete, onToggleSubtask, isFocusTask }) => {
  const badgeConfig = priorityBadgeClassConfig[task.priority];
  const completedSubtasks = task.subtasks.filter(st => st.completed).length;
  const totalSubtasks = task.subtasks.length;
  const subtaskProgressPercentage = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  return (
    <div
      className={cn(
        "p-3 sm:p-4 border-b hover:bg-muted/30 transition-colors rounded-lg mb-2 shadow-sm",
        task.completed && "opacity-60 dark:opacity-50 bg-muted/20",
        isFocusTask && !task.completed && "ring-2 ring-accent ring-offset-2 ring-offset-background dark:ring-offset-card"
      )}
    >
      <div className="flex items-start gap-2 sm:gap-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleComplete}
              className={cn(
                "h-6 w-6 sm:h-7 sm:w-7 shrink-0 text-muted-foreground mt-0.5",
                task.completed ? "hover:text-accent" : "hover:text-primary"
              )}
            >
              {task.completed ? <CheckCircle className="h-4 sm:h-5 w-4 sm:w-5 text-accent" /> : <Circle className="h-4 sm:h-5 w-4 sm:w-5" />}
              <span className="sr-only">{task.completed ? 'Mark as Incomplete' : 'Mark as Complete'}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">{task.completed ? 'Mark as Incomplete' : 'Mark as Complete'}</TooltipContent>
        </Tooltip>

        <div className="flex-grow overflow-hidden">
          <div className="flex items-center justify-between">
            <p
              className={cn(
                "text-sm sm:text-base font-semibold cursor-pointer hover:underline",
                task.completed && "line-through text-muted-foreground"
              )}
              onClick={onEdit}
              title={task.title}
            >
              {task.title}
            </p>
            <Badge
              variant="outline"
              className={cn(
                "capitalize text-xs px-1.5 sm:px-2 py-0.5 font-medium shrink-0",
                badgeConfig.baseBg,
                badgeConfig.text,
                badgeConfig.border,
                task.priority === 'high' && !task.completed && badgeConfig.animatedClass,
                task.completed && "border-transparent !bg-muted text-muted-foreground opacity-70"
              )}
            >
              {task.priority}
            </Badge>
          </div>

          {task.description && (
            <p className={cn("text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2 whitespace-pre-wrap", task.completed && "line-through opacity-70")}>
              {task.description}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
            {task.dueDate && (
              <div className={cn("flex items-center", task.completed && "line-through opacity-70")}>
                <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
                Due: {format(parseISO(task.dueDate), 'MMM d, yyyy')}
              </div>
            )}
            {task.reminderDate && (
              <div className={cn("flex items-center", task.completed && "line-through opacity-70")}>
                <Bell className="h-3.5 w-3.5 mr-1.5 text-accent/80" />
                Reminder: {format(parseISO(task.reminderDate), 'MMM d, yyyy')}
              </div>
            )}
             {task.delegatedTo && (
              <div className={cn("flex items-center", task.completed && "line-through opacity-70")}>
                <UserCheck className="h-3.5 w-3.5 mr-1.5" />
                To: {task.delegatedTo}
              </div>
            )}
            {task.taskVibe && !task.completed && (
                 <div className={cn("flex items-center", task.completed && "opacity-70")}>
                    <Sparkles className="h-3.5 w-3.5 mr-1.5 text-accent/70 animate-sparkle-effect" />
                    Vibe: {task.taskVibe}
                </div>
            )}
          </div>


          {task.tags.length > 0 && (
            <div className={cn("flex flex-wrap gap-1 mt-2", task.completed && "opacity-70")}>
              {task.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground">{tag}</Badge>
              ))}
            </div>
          )}

          {task.subtasks.length > 0 && (
             <div className={cn("mt-2", task.completed && "opacity-70")}>
               <h4 className="text-[11px] sm:text-xs font-medium text-muted-foreground">SUBTASKS ({completedSubtasks}/{totalSubtasks})</h4>
               <Progress value={subtaskProgressPercentage} className="h-1 sm:h-1.5 w-full mt-1 mb-1.5" aria-label={`${subtaskProgressPercentage.toFixed(0)}% of subtasks complete`} />
               <ul className="space-y-0.5 max-h-20 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent pr-1">
                 {task.subtasks.map(subtask => (
                   <li key={subtask.id} className="flex items-center text-xs sm:text-sm cursor-pointer hover:bg-muted/50 p-0.5 sm:p-1 rounded" onClick={() => !task.completed && onToggleSubtask(task.id, subtask.id)}>
                     {subtask.completed ? <CheckCircle className="h-3 sm:h-3.5 w-3 sm:w-3.5 mr-1.5 sm:mr-2 text-accent flex-shrink-0" /> : <Circle className="h-3 sm:h-3.5 w-3 sm:w-3.5 mr-1.5 sm:mr-2 text-muted-foreground/50 flex-shrink-0" />}
                     <span className={cn("truncate", subtask.completed ? 'line-through text-muted-foreground' : 'text-foreground', task.completed && subtask.completed && 'text-muted-foreground', task.completed && !subtask.completed && 'text-foreground/70')}>{subtask.text}</span>
                   </li>
                 ))}
               </ul>
             </div>
          )}
           {task.completed && task.completedAt && (
            <div className="flex items-center text-xs text-accent dark:text-accent/90 font-medium mt-2">
                <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                Completed: {format(parseISO(task.completedAt), 'MMM d, yyyy')}
            </div>
            )}
        </div>

        <div className="flex flex-col gap-0.5 sm:gap-1 shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onEdit} className="h-6 w-6 sm:h-7 sm:w-7 text-muted-foreground hover:text-primary" disabled={task.completed}>
                <Edit3 className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                <span className="sr-only">Edit Task</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit Task {task.completed && "(Mark incomplete to edit)"}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onDelete} className="h-6 w-6 sm:h-7 sm:w-7 text-muted-foreground hover:text-destructive">
                <Trash2 className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                <span className="sr-only">Delete Task</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete Task</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

const KanbanBoardView: FC<TaskListProps> = ({ tasks, onEditTask, taskOfTheDayId }) => {
  const columns: KanbanColumnType[] = [
    { id: 'high', title: 'High Priority', tasks: [] },
    { id: 'medium', title: 'Medium Priority', tasks: [] },
    { id: 'low', title: 'Low Priority', tasks: [] },
    { id: 'completed', title: 'Completed', tasks: [] },
  ];

  tasks.forEach(task => {
    if (task.completed) {
      columns.find(col => col.id === 'completed')?.tasks.push(task);
    } else {
      columns.find(col => col.id === task.priority)?.tasks.push(task);
    }
  });

  columns.forEach(column => {
    if (column.id !== 'completed') { 
        column.tasks.sort((a, b) => {
        if (taskOfTheDayId) {
            if (a.id === taskOfTheDayId) return -1;
            if (b.id === taskOfTheDayId) return 1;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    } else {
         column.tasks.sort((a, b) => new Date(b.completedAt || b.updatedAt).getTime() - new Date(a.completedAt || a.updatedAt).getTime());
    }
  });


  return (
     <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-0 pb-4 -mx-2">
        {columns.map(column => (
          <KanbanColumn
            key={column.id}
            column={column}
            onEditTask={onEditTask}
          />
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};


export const TaskList: FC<TaskListProps> = (props) => {
  const { tasks, currentView, taskOfTheDayId, onToggleSubtask } = props;

  if (tasks.length === 0 && (currentView !== 'calendar' && currentView !== 'gantt')) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold text-muted-foreground">No tasks yet!</h2>
        <p className="text-muted-foreground">Click "Add Task" to get started.</p>
      </div>
    );
  }

  if (currentView === 'calendar' || currentView === 'gantt') {
    const Icon = currentView === 'calendar' ? CalendarDays : GanttChartSquare;
    return (
      <div className="text-center py-16 bg-card rounded-lg shadow-sm border border-dashed">
        <Icon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">
          {currentView === 'calendar' ? 'Calendar View' : 'Gantt Chart View'}
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          This view is under construction and will be available soon to help you visualize your tasks over time!
        </p>
      </div>
    );
  }


  if (currentView === 'compactList') {
    return (
      <div className="space-y-0">
        {tasks.map((task) => (
          <CompactListItem
            key={task.id}
            task={task}
            onEdit={() => props.onEditTask(task)}
            onDelete={() => props.onDeleteTask(task.id)}
            onToggleComplete={() => props.onToggleTaskComplete(task.id)}
            onToggleSubtask={onToggleSubtask}
            isFocusTask={task.id === taskOfTheDayId && !task.completed}
          />
        ))}
      </div>
    );
  }

  if (currentView === 'kanban') {
    return <KanbanBoardView {...props} />;
  }

  // Default to Grid View
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={props.onEditTask}
          onDelete={props.onDeleteTask}
          onToggleSubtask={props.onToggleSubtask}
          onToggleComplete={props.onToggleTaskComplete}
          onUpdateTaskImage={props.onUpdateTaskImage}
          isFocusTask={task.id === taskOfTheDayId}
        />
      ))}
    </div>
  );
};
