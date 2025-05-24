"use client";
import type { FC } from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Logo } from "@/components/icons/Logo";

interface HeaderProps {
  onAddTask: () => void;
}

export const Header: FC<HeaderProps> = ({ onAddTask }) => {
  return (
    <header className="bg-card sticky top-0 z-50 border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo />
        </div>
        <Button onClick={onAddTask} size="lg" className="font-semibold">
          <PlusCircle className="mr-2 h-5 w-5" />
          Add Task
        </Button>
      </div>
    </header>
  );
};
