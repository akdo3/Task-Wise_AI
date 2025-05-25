
"use client";

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Priority } from '@/types';
import { X } from 'lucide-react';

export interface DialogFilterState {
  priority: Priority | 'all';
  dueDate: string;
  tags: string;
}

interface FilterDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentDialogFilters: DialogFilterState;
  onApplyFilters: (filters: DialogFilterState) => void;
  onResetAllFilters: () => void; // To reset all filters on the main page
  initialDialogFilters: DialogFilterState; // For resetting dialog fields to initial state
}

export const FilterDialog: FC<FilterDialogProps> = ({
  isOpen,
  onOpenChange,
  currentDialogFilters,
  onApplyFilters,
  onResetAllFilters,
  initialDialogFilters,
}) => {
  const [dialogFilters, setDialogFilters] = useState<DialogFilterState>(currentDialogFilters);

  // Sync dialog state if currentDialogFilters prop changes (e.g., after a global reset)
  useEffect(() => {
    setDialogFilters(currentDialogFilters);
  }, [currentDialogFilters, isOpen]); // Re-sync when dialog opens or external filters change

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDialogFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof DialogFilterState, value: string) => {
    setDialogFilters(prev => ({ ...prev, [name]: value as Priority | 'all' }));
  };

  const handleApply = () => {
    onApplyFilters(dialogFilters);
    onOpenChange(false); // Close dialog on apply
  };
  
  const handleDialogReset = () => {
    // Resets only the dialog's fields to their initial state,
    // allowing users to discard changes made within the dialog.
    setDialogFilters(initialDialogFilters);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-[var(--radius)]">
        <DialogHeader>
          <DialogTitle className="text-xl">Filter Tasks</DialogTitle>
          <DialogDescription>
            Refine your task list by applying filters.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div>
            <Label htmlFor="priority-dialog" className="text-sm font-medium text-foreground">Priority</Label>
            <Select
              name="priority"
              value={dialogFilters.priority}
              onValueChange={(value) => handleSelectChange('priority', value)}
            >
              <SelectTrigger id="priority-dialog" className="mt-1.5">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="dueDate-dialog" className="text-sm font-medium text-foreground">Due Date</Label>
            <Input
              id="dueDate-dialog"
              name="dueDate"
              type="date"
              value={dialogFilters.dueDate}
              onChange={handleInputChange}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="tags-dialog" className="text-sm font-medium text-foreground">Tags</Label>
            <Input
              id="tags-dialog"
              name="tags"
              placeholder="e.g., work,personal"
              value={dialogFilters.tags}
              onChange={handleInputChange}
              className="mt-1.5"
            />
          </div>
        </div>

        <DialogFooter className="pt-4 gap-2 sm:justify-between">
          <Button onClick={onResetAllFilters} variant="ghost" className="sm:mr-auto">
             <X className="mr-2 h-4 w-4" /> Reset All Filters
          </Button>
          <div className="flex gap-2">
            <Button onClick={handleDialogReset} variant="outline">Clear Dialog</Button>
            <Button onClick={handleApply} className="bg-primary hover:bg-primary/90 text-primary-foreground">Apply Filters</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
