
"use client";

import type { FC } from 'react';
import { useState, useMemo } from 'react';
import { DayPicker, type DateFormatter } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format, parseISO, isSameDay, startOfMonth } from 'date-fns';
import type { Task, Priority } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CalendarViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
}

const formatCaption: DateFormatter = (month, options) => {
  return format(month, 'MMMM yyyy', { locale: options?.locale });
};

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

export const CalendarView: FC<CalendarViewProps> = ({ tasks, onEditTask }) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const tasksWithDueDates = useMemo(() => tasks.filter(task => task.dueDate && !task.completed), [tasks]);

  const dueDatesModifier = useMemo(() => {
    return tasksWithDueDates.map(task => parseISO(task.dueDate!));
  }, [tasksWithDueDates]);

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
  };

  const tasksForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return tasksWithDueDates.filter(task => task.dueDate && isSameDay(parseISO(task.dueDate), selectedDate));
  }, [selectedDate, tasksWithDueDates]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up">
      <Card className="lg:col-span-2 shadow-lg rounded-[var(--radius)]">
        <CardContent className="p-1 sm:p-2">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleDayClick}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            modifiers={{ hasTasks: dueDatesModifier }}
            formatters={{ formatCaption }}
            className="w-full"
            classNames={{
              months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 justify-center",
              month: "space-y-4 w-full p-2",
              caption: "flex justify-center pt-2 pb-1 relative items-center",
              caption_label: "text-xl font-semibold text-primary",
              nav: "space-x-1 flex items-center",
              nav_button: cn(
                "h-8 w-8 bg-transparent p-0 opacity-70 hover:opacity-100 rounded-md",
                "text-primary hover:bg-primary/10"
              ),
              nav_button_previous: "absolute left-2",
              nav_button_next: "absolute right-2",
              table: "w-full border-collapse space-y-1 mt-2",
              head_row: "flex",
              head_cell: "text-muted-foreground rounded-md w-full text-sm pb-1",
              row: "flex w-full mt-1.5",
              cell: "w-full text-center text-sm p-0 relative aspect-square",
              day: cn(
                "h-full w-full p-0 font-normal rounded-md hover:bg-accent/50 focus-visible:ring-1 focus-visible:ring-primary focus-visible:z-10",
                "transition-colors"
              ),
              day_selected: 
                "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
              day_today: "bg-accent text-accent-foreground font-bold",
              day_outside: "text-muted-foreground/50 opacity-50",
              day_disabled: "text-muted-foreground opacity-50",
            }}
            components={{
              DayContent: (props) => {
                const isDue = dueDatesModifier.some(dueDate => isSameDay(dueDate, props.date));
                return (
                  <div className={cn(
                    "relative w-full h-full flex items-center justify-center rounded-md",
                    isDue && !props.selected && !props.today && "bg-primary/10",
                    props.selected && "bg-primary text-primary-foreground",
                    props.today && !props.selected && "bg-accent text-accent-foreground"
                  )}>
                    {props.date.getDate()}
                    {isDue && (
                      <span className={cn(
                        "absolute bottom-1.5 left-1/2 transform -translate-x-1/2 h-1.5 w-1.5 rounded-full",
                        props.selected ? "bg-primary-foreground" : props.today ? "bg-background" : "bg-primary"
                      )}></span>
                    )}
                  </div>
                );
              }
            }}
          />
        </CardContent>
      </Card>

      <div className="lg:col-span-1">
        <Card className="shadow-lg rounded-[var(--radius)] h-full flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">
              {selectedDate ? `Tasks for ${format(selectedDate, 'MMM d, yyyy')}` : 'Select a Day'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 flex-grow">
            <ScrollArea className="h-[calc(100%-1rem)] pr-3 scrollbar-thin"> {/* Adjust height as needed */}
              {selectedDate && tasksForSelectedDate.length > 0 ? (
                <ul className="space-y-2">
                  {tasksForSelectedDate.map(task => {
                    const priorityConfig = priorityBadgeClassConfig[task.priority];
                    return (
                      <li key={task.id}
                          className={cn(
                            "p-3 border rounded-md hover:shadow-md cursor-pointer transition-all",
                            "bg-card hover:border-primary"
                          )}
                          onClick={() => onEditTask(task)}
                      >
                        <p className="font-semibold text-sm text-card-foreground truncate">{task.title}</p>
                        <div className="flex items-center justify-between mt-1.5">
                          <Badge
                            variant="outline"
                            className={cn(
                              "capitalize text-xs px-2 py-0.5",
                              priorityConfig.baseBg,
                              priorityConfig.text,
                              priorityConfig.border
                            )}
                          >
                            {task.priority}
                          </Badge>
                           {task.taskVibe && (
                            <Badge variant="secondary" className="text-xs font-normal bg-muted/70 text-muted-foreground">
                                {task.taskVibe}
                            </Badge>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">
                  {selectedDate ? "No tasks due on this day." : "Select a day on the calendar to see tasks."}
                </p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

