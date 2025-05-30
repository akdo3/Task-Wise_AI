
"use client";

import type { FC } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTheme } from '@/hooks/useTheme';
import type { CurrentView } from '@/types';
import { Sun, Moon, LayoutGrid, List, Trello, CalendarDays, GanttChartSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: CurrentView;
  onSetView: (view: CurrentView) => void;
}

const viewOptions: { value: CurrentView; label: string; icon: JSX.Element, disabled?: boolean, comingSoon?: boolean }[] = [
  { value: 'grid', label: 'Grid View', icon: <LayoutGrid className="mr-2 h-4 w-4" /> },
  { value: 'compactList', label: 'List View', icon: <List className="mr-2 h-4 w-4" /> },
  { value: 'kanban', label: 'Kanban Board', icon: <Trello className="mr-2 h-4 w-4" /> },
  { value: 'calendar', label: 'Calendar View', icon: <CalendarDays className="mr-2 h-4 w-4" /> },
  { value: 'gantt', label: 'Gantt Chart', icon: <GanttChartSquare className="mr-2 h-4 w-4" />, disabled: true, comingSoon: true },
];

export const SettingsDialog: FC<SettingsDialogProps> = ({ isOpen, onClose, currentView, onSetView }) => {
  const { theme, setSpecificTheme } = useTheme();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md rounded-[var(--radius)]">
        <DialogHeader>
          <DialogTitle className="text-xl">Application Settings</DialogTitle>
          <DialogDescription>
            Manage your application preferences here.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          <div>
            <h3 className="text-md font-semibold mb-3 text-foreground">Appearance</h3>
            <div className="space-y-3">
              <div>
                <Label className="text-sm text-muted-foreground">Theme</Label>
                <div className="flex items-center space-x-2 mt-1.5">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSpecificTheme('light')}
                    className={cn("flex-1", theme === 'light' && "bg-primary text-primary-foreground hover:bg-primary/90")}
                  >
                    <Sun className="mr-2 h-4 w-4" /> Light
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSpecificTheme('dark')}
                     className={cn("flex-1", theme === 'dark' && "bg-primary text-primary-foreground hover:bg-primary/90")}
                  >
                    <Moon className="mr-2 h-4 w-4" /> Dark
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <h3 className="text-md font-semibold mb-3 text-foreground">View Mode</h3>
            <RadioGroup
              value={currentView}
              onValueChange={(value) => onSetView(value as CurrentView)}
              className="space-y-2"
            >
              {viewOptions.map(option => (
                <Label
                  key={option.value}
                  htmlFor={`view-${option.value}`}
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-md border cursor-pointer hover:bg-muted/50 transition-colors",
                    currentView === option.value && "bg-muted border-primary ring-1 ring-primary",
                    option.disabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
                  )}
                >
                  <RadioGroupItem value={option.value} id={`view-${option.value}`} disabled={option.disabled} />
                  {option.icon}
                  <span className="flex-grow">{option.label}</span>
                  {option.comingSoon && <span className="text-xs text-muted-foreground">(Coming Soon)</span>}
                </Label>
              ))}
            </RadioGroup>
          </div>

          <div className="pt-4 border-t border-border">
             <p className="text-sm text-muted-foreground text-center">More settings coming soon!</p>
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button onClick={onClose} variant="outline">Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
