
"use client";
import type { FC } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // New import
import { PlusCircle, Moon, Sun, Settings2, BarChartHorizontalBig, LayoutGrid, List, Filter, Search, Trello, CalendarDays as CalendarIconLucide, GanttChartSquare } from "lucide-react"; // Added Filter, Trello, Calendar, Gantt
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
          >
            <Filter className="h-5 w-5" />
          </Button>
          
          <div className="h-6 w-px bg-border mx-1"></div>

          <Button 
            onClick={() => onSetView('grid')} 
            variant="ghost" 
            size="icon" 
            aria-label="Grid View"
            className={cn(currentView === 'grid' && "bg-accent text-accent-foreground hover:bg-accent/90")}
            title="Grid View"
          >
            <LayoutGrid className="h-5 w-5" />
          </Button>
          <Button 
            onClick={() => onSetView('compactList')} 
            variant="ghost" 
            size="icon" 
            aria-label="List View"
            className={cn(currentView === 'compactList' && "bg-accent text-accent-foreground hover:bg-accent/90")}
            title="List View"
          >
            <List className="h-5 w-5" />
          </Button>
           <Button 
            onClick={() => onSetView('kanban')} 
            variant="ghost" 
            size="icon" 
            aria-label="Kanban View"
            className={cn(currentView === 'kanban' && "bg-accent text-accent-foreground hover:bg-accent/90")}
            title="Kanban View"
          >
            <Trello className="h-5 w-5" />
          </Button>
          {/* Placeholder buttons for future views */}
           <Button 
            onClick={() => onSetView('calendar')} 
            variant="ghost" 
            size="icon" 
            aria-label="Calendar View (Coming Soon)"
            className={cn(currentView === 'calendar' && "bg-accent text-accent-foreground hover:bg-accent/90", "opacity-50 cursor-not-allowed")}
            title="Calendar View (Coming Soon)"
            disabled
          >
            <CalendarIconLucide className="h-5 w-5" />
          </Button>
           <Button 
            onClick={() => onSetView('gantt')} 
            variant="ghost" 
            size="icon" 
            aria-label="Gantt Chart View (Coming Soon)"
            className={cn(currentView === 'gantt' && "bg-accent text-accent-foreground hover:bg-accent/90", "opacity-50 cursor-not-allowed")}
            title="Gantt Chart View (Coming Soon)"
            disabled
          >
            <GanttChartSquare className="h-5 w-5" />
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
