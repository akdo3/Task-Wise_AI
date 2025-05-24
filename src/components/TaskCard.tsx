"use client";

import type { FC } from 'react';
import type { Task, Priority } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Edit3, Trash2, UserCheck, Repeat, CheckCircle, Circle } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
}

const priorityColors: Record<Priority, string> = {
  low: 'bg-green-500/20 text-green-700 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
  high: 'bg-red-500/20 text-red-700 border-red-500/30',
};

export const TaskCard: FC<TaskCardProps> = ({ task, onEdit, onDelete, onToggleSubtask }) => {
  const completedSubtasks = task.subtasks.filter(st => st.completed).length;
  const totalSubtasks = task.subtasks.length;

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <CardHeader>
        {task.imageUrl && (
          <div className="relative w-full h-40 rounded-t-lg overflow-hidden mb-4">
            <Image src={task.imageUrl} alt={task.title} layout="fill" objectFit="cover" data-ai-hint="task illustration"/>
          </div>
        )}
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-semibold">{task.title}</CardTitle>
          <Badge className={`capitalize ${priorityColors[task.priority]}`}>{task.priority}</Badge>
        </div>
        <CardDescription className="text-muted-foreground line-clamp-2">{task.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        {task.dueDate && (
          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4 mr-2" />
            Due: {format(new Date(task.dueDate), 'PPP')}
          </div>
        )}
        {task.reminderDate && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Repeat className="h-4 w-4 mr-2" />
            Reminder: {format(new Date(task.reminderDate), 'PPP')}
          </div>
        )}
        {task.delegatedTo && (
          <div className="flex items-center text-sm text-muted-foreground">
            <UserCheck className="h-4 w-4 mr-2" />
            Delegated to: {task.delegatedTo}
          </div>
        )}
        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {task.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
          </div>
        )}
        {task.subtasks.length > 0 && (
           <div className="mt-3">
             <h4 className="text-sm font-medium mb-1">Subtasks ({completedSubtasks}/{totalSubtasks})</h4>
             <ul className="space-y-1 max-h-24 overflow-y-auto">
               {task.subtasks.map(subtask => (
                 <li key={subtask.id} className="flex items-center text-sm cursor-pointer hover:bg-muted p-1 rounded" onClick={() => onToggleSubtask(task.id, subtask.id)}>
                   {subtask.completed ? <CheckCircle className="h-4 w-4 mr-2 text-green-500" /> : <Circle className="h-4 w-4 mr-2 text-gray-400" />}
                   <span className={subtask.completed ? 'line-through text-muted-foreground' : ''}>{subtask.text}</span>
                 </li>
               ))}
             </ul>
           </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2 border-t pt-4">
        <Button variant="outline" size="sm" onClick={() => onEdit(task)}>
          <Edit3 className="h-4 w-4 mr-1" /> Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(task.id)}>
          <Trash2 className="h-4 w-4 mr-1" /> Delete
        </Button>
      </CardFooter>
    </Card>
  );
};
