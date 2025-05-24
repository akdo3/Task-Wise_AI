"use client";

import type { FC } from 'react';
import type { Task } from '@/types';
import { TaskCard } from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
}

export const TaskList: FC<TaskListProps> = ({ tasks, onEditTask, onDeleteTask, onToggleSubtask }) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold text-muted-foreground">No tasks yet!</h2>
        <p className="text-muted-foreground">Click "Add Task" to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tasks.map((task) => (
        <TaskCard 
          key={task.id} 
          task={task} 
          onEdit={onEditTask} 
          onDelete={onDeleteTask}
          onToggleSubtask={onToggleSubtask}
        />
      ))}
    </div>
  );
};
