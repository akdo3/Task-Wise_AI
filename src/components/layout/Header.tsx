
"use client";
import type { FC } from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle, Moon, Sun, Settings2, BarChartHorizontalBig, LayoutGrid, List } from "lucide-react";
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
}

export const Header: FC<HeaderProps> = ({ onAddTask, onOpenSettings, onOpenStats, currentView, onSetView }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-card sticky top-0 z-50 border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo />
        </div>
        <div className="flex items-center gap-1.5"> {/* Reduced gap for denser feel */}
          <Button 
            onClick={() => onSetView('grid')} 
            variant="ghost" 
            size="icon" 
            aria-label="Grid View"
            className={cn(currentView === 'grid' && "bg-accent text-accent-foreground hover:bg-accent/90")}
          >
            <LayoutGrid className="h-5 w-5" />
          </Button>
          <Button 
            onClick={() => onSetView('compactList')} 
            variant="ghost" 
            size="icon" 
            aria-label="List View"
            className={cn(currentView === 'compactList' && "bg-accent text-accent-foreground hover:bg-accent/90")}
          >
            <List className="h-5 w-5" />
          </Button>

          <div className="h-6 w-px bg-border mx-1.5"></div> {/* Separator */}

          <Button onClick={onOpenStats} variant="ghost" size="icon" aria-label="Open Statistics">
            <BarChartHorizontalBig className="h-5 w-5" />
          </Button>
          <Button onClick={onOpenSettings} variant="ghost" size="icon" aria-label="Open Settings">
            <Settings2 className="h-5 w-5" />
          </Button>
          <Button onClick={toggleTheme} variant="ghost" size="icon" aria-label="Toggle theme">
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
          <Button onClick={onAddTask} size="default" className="font-semibold"> {/* Changed to default size */}
            <PlusCircle className="mr-2 h-5 w-5" />
            Add Task
          </Button>
        </div>
      </div>
    </header>
  );
};
