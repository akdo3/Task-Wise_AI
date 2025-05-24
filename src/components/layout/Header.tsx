
"use client";
import type { FC } from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle, Moon, Sun } from "lucide-react";
import { Logo } from "@/components/icons/Logo";
import { useTheme } from '@/hooks/useTheme'; // Import the new hook

interface HeaderProps {
  onAddTask: () => void;
}

export const Header: FC<HeaderProps> = ({ onAddTask }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-card sticky top-0 z-50 border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo />
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={onAddTask} size="lg" className="font-semibold">
            <PlusCircle className="mr-2 h-5 w-5" />
            Add Task
          </Button>
          <Button onClick={toggleTheme} variant="ghost" size="icon" aria-label="Toggle theme">
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </header>
  );
};
