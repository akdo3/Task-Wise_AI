
"use client";

import type { FC } from 'react';
import type { Task, Priority } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'; // Using ShadCN chart components

interface TaskStatsDashboardProps {
  tasks: Task[];
}

interface ChartData {
  name: string;
  count: number;
  fill: string;
}

export const TaskStatsDashboard: FC<TaskStatsDashboardProps> = ({ tasks }) => {
  const totalTasks = tasks.length;

  const totalSubtasks = tasks.reduce((acc, task) => acc + task.subtasks.length, 0);
  const completedSubtasks = tasks.reduce(
    (acc, task) => acc + task.subtasks.filter(st => st.completed).length,
    0
  );
  const subtaskProgress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  const priorityCounts: Record<Priority, number> = {
    high: 0,
    medium: 0,
    low: 0,
  };
  tasks.forEach(task => {
    priorityCounts[task.priority]++;
  });

  const priorityChartData: ChartData[] = [
    { name: 'High', count: priorityCounts.high, fill: 'hsl(var(--priority-high-fg-hsl))' },
    { name: 'Medium', count: priorityCounts.medium, fill: 'hsl(var(--priority-medium-fg-hsl))' },
    { name: 'Low', count: priorityCounts.low, fill: 'hsl(var(--priority-low-fg-hsl))' },
  ];
  
  const chartConfig = {
    count: {
      label: "Tasks",
    },
    high: { label: "High", color: "hsl(var(--priority-high-fg-hsl))" },
    medium: { label: "Medium", color: "hsl(var(--priority-medium-fg-hsl))" },
    low: { label: "Low", color: "hsl(var(--priority-low-fg-hsl))" },
  } satisfies import('@/components/ui/chart').ChartConfig;


  if (totalTasks === 0) {
    return (
        <div className="mb-8 p-6 text-center bg-card rounded-[var(--radius)] shadow-md">
            <p className="text-muted-foreground">No tasks yet to show statistics. Add some tasks!</p>
        </div>
    );
  }

  return (
    <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Total Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-primary">{totalTasks}</p>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Subtask Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={subtaskProgress} className="h-3 mb-2" />
          <p className="text-sm text-muted-foreground">
            {completedSubtasks} of {totalSubtasks} subtasks completed ({subtaskProgress.toFixed(0)}%)
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-lg md:col-span-2 lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg">Tasks by Priority</CardTitle>
        </CardHeader>
        <CardContent className="h-[200px] p-2">
          <ChartContainer config={chartConfig} className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityChartData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border)/0.5)" />
                <XAxis 
                  dataKey="name" 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={8} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={8} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  allowDecimals={false} 
                />
                 <Tooltip
                  cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                   {priorityChartData.map((entry, index) => (
                    <div key={`cell-${index}`} style={{ backgroundColor: entry.fill }} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};
