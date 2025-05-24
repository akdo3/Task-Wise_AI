"use client";

import type { FC } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import type { AiTaskAssistantOutput } from "@/ai/flows/ai-task-assistant";
import type { Subtask } from "@/types";

interface AISuggestionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  suggestions: AiTaskAssistantOutput | null;
  onApplySuggestions: (appliedSuggestions: Partial<AiTaskAssistantOutput>) => void;
}

export const AISuggestionsDialog: FC<AISuggestionsDialogProps> = ({
  isOpen,
  onClose,
  suggestions,
  onApplySuggestions,
}) => {
  if (!suggestions) return null;

  const handleApplyDescription = () => {
    onApplySuggestions({ improvedDescription: suggestions.improvedDescription });
    onClose();
  };

  const handleApplySubtasks = () => {
    // This assumes you want to add all generated subtasks.
    // A more complex UI would allow selecting specific subtasks.
    onApplySuggestions({ generatedSubtasks: suggestions.generatedSubtasks });
    onClose();
  };
  
  const handleApplyAll = () => {
    onApplySuggestions({
      improvedDescription: suggestions.improvedDescription,
      generatedSubtasks: suggestions.generatedSubtasks,
      // approachSuggestions are for viewing, not direct application to form fields
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>AI Task Suggestions</DialogTitle>
          <DialogDescription>
            Review the suggestions from AI to enhance your task.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] p-4 border rounded-md">
          {suggestions.improvedDescription && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Improved Description:</h3>
              <p className="text-sm bg-muted p-3 rounded-md whitespace-pre-wrap">
                {suggestions.improvedDescription}
              </p>
              <Button onClick={handleApplyDescription} size="sm" className="mt-2">Use this Description</Button>
            </div>
          )}

          {suggestions.generatedSubtasks && suggestions.generatedSubtasks.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Generated Subtasks:</h3>
              <ul className="space-y-2">
                {suggestions.generatedSubtasks.map((subtask, index) => (
                  <li key={index} className="text-sm bg-muted p-3 rounded-md">
                    {subtask}
                  </li>
                ))}
              </ul>
               <Button onClick={handleApplySubtasks} size="sm" className="mt-2">Add these Subtasks</Button>
            </div>
          )}

          {suggestions.approachSuggestions && suggestions.approachSuggestions.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Approach Suggestions:</h3>
              <ul className="list-disc list-inside space-y-1 pl-4">
                {suggestions.approachSuggestions.map((approach, index) => (
                  <li key={index} className="text-sm">{approach}</li>
                ))}
              </ul>
            </div>
          )}
        </ScrollArea>
        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={handleApplyAll} className="bg-accent hover:bg-accent/90 text-accent-foreground">Apply All Applicable</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
