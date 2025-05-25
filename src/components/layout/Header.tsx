
"use client";
import type { FC } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Moon, Sun, Settings2, BarChartHorizontalBig, LayoutGrid, List, Filter, Search, Trello, CalendarDays as CalendarIconLucide, GanttChartSquare, Eye } from "lucide-react";
import { Logo } from "@/components/icons/Logo";
import { useTheme } from '@/hooks/useTheme';
import type { CurrentView } from '@/types';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onAddTask: () => void;
  onOpenSettings: () => void;
  onOpenStats: () => void;
  currentView: CurrentView;
  onSetView: (view: CurrentView) => void;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  onOpenFilterDialog: () => void;
}

const implementedViews: CurrentView[] = ['grid', 'compactList', 'kanban'];

const viewIcons: Record<CurrentView, JSX.Element> = {
  grid: <LayoutGrid className="h-5 w-5" />,
  compactList: <List className="h-5 w-5" />,
  kanban: <Trello className="h-5 w-5" />,
  calendar: <CalendarIconLucide className="h-5 w-5" />, // For future use in settings
  gantt: <GanttChartSquare className="h-5 w-5" />, // For future use in settings
};

const viewNames: Record<CurrentView, string> = {
  grid: "Grid",
  compactList: "List",
  kanban: "Kanban",
  calendar: "Calendar",
  gantt: "Gantt",
};

export const Header: FC<HeaderProps> = ({
  onAddTask,
  onOpenSettings,
  onOpenStats,
  currentView,
  onSetView,
  searchTerm,
  onSearchTermChange,
  onOpenFilterDialog,
}) => {
  const { theme, toggleTheme } = useTheme();

  const handleCycleView = () => {
    const currentIndex = implementedViews.indexOf(currentView);
    const nextIndex = (currentIndex + 1) % implementedViews.length;
    onSetView(implementedViews[nextIndex]);
  };

  return (
    <header className="bg-card sticky top-0 z-50 border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Logo />
        </div>

        <div className="flex-grow max-w-sm md:max-w-md lg:max-w-lg relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tasks..."
            className="pl-10 h-9 w-full"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1">
          <Button
            onClick={onOpenFilterDialog}
            variant="ghost"
            size="icon"
            aria-label="Open Filters"
            title="Filter Tasks"
          >
            <Filter className="h-5 w-5" />
          </Button>

          <div className="h-6 w-px bg-border mx-1"></div>
          
          <Button
            onClick={handleCycleView}
            variant="outline"
            size="default"
            className="h-9 px-3"
            aria-label={`Current view: ${viewNames[currentView]}. Click to cycle view.`}
            title={`Cycle View (Current: ${viewNames[currentView]})`}
          >
            {viewIcons[currentView]}
            <span className="ml-2 hidden sm:inline">{viewNames[currentView]}</span>
          </Button>


          <div className="h-6 w-px bg-border mx-1"></div>

          <Button onClick={onOpenStats} variant="ghost" size="icon" aria-label="Open Statistics" title="Open Statistics">
            <BarChartHorizontalBig className="h-5 w-5" />
          </Button>
          <Button onClick={onOpenSettings} variant="ghost" size="icon" aria-label="Open Settings" title="Open Settings">
            <Settings2 className="h-5 w-5" />
          </Button>
          <Button onClick={toggleTheme} variant="ghost" size="icon" aria-label="Toggle theme" title="Toggle Theme">
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
          <Button onClick={onAddTask} size="default" className="font-semibold">
            <PlusCircle className="mr-2 h-5 w-5" />
            Add Task
          </Button>
        </div>
      </div>
    </header>
  );
};
