
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
    onApplySuggestions({ generatedSubtasks: suggestions.generatedSubtasks });
    onClose();
  };
  
  const handleApplyEmoji = () => {
    if (suggestions.suggestedEmoji) {
      onApplySuggestions({ suggestedEmoji: suggestions.suggestedEmoji });
      onClose(); // Or keep open if user might apply more
    }
  };

  const handleApplyTagline = () => {
    if (suggestions.suggestedTagline) {
      onApplySuggestions({ suggestedTagline: suggestions.suggestedTagline });
      onClose(); // Or keep open
    }
  };

  const handleApplyAll = () => {
    onApplySuggestions({
      improvedDescription: suggestions.improvedDescription,
      generatedSubtasks: suggestions.generatedSubtasks,
      suggestedEmoji: suggestions.suggestedEmoji,
      suggestedTagline: suggestions.suggestedTagline,
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
            Review the suggestions from AI to enhance your task. Click "Apply All Applicable" or choose specific suggestions.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] p-4 border rounded-md space-y-6">
          {suggestions.suggestedEmoji && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Suggested Emoji:</h3>
              <div className="flex items-center gap-3 bg-muted p-3 rounded-md">
                <span className="text-3xl">{suggestions.suggestedEmoji}</span>
                <Button onClick={handleApplyEmoji} size="sm">Use this Emoji</Button>
              </div>
            </div>
          )}

          {suggestions.improvedDescription && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Improved Description:</h3>
              <p className="text-sm bg-muted p-3 rounded-md whitespace-pre-wrap">
                {suggestions.improvedDescription}
              </p>
              <Button onClick={handleApplyDescription} size="sm" className="mt-2">Use this Description</Button>
            </div>
          )}
          
          {suggestions.suggestedTagline && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Suggested Tagline:</h3>
              <p className="text-sm bg-muted p-3 rounded-md italic">
                "{suggestions.suggestedTagline}"
              </p>
              <Button onClick={handleApplyTagline} size="sm" className="mt-2">Use this Tagline</Button>
            </div>
          )}


          {suggestions.generatedSubtasks && suggestions.generatedSubtasks.length > 0 && (
            <div>
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
            <div>
              <h3 className="text-lg font-semibold mb-2">Approach Suggestions:</h3>
              <ul className="list-disc list-inside space-y-1 pl-4">
                {suggestions.approachSuggestions.map((approach, index) => (
                  <li key={index} className="text-sm">{approach}</li>
                ))}
              </ul>
            </div>
          )}
        </ScrollArea>
        <DialogFooter className="gap-2 sm:justify-between pt-4">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={handleApplyAll} className="bg-accent hover:bg-accent/90 text-accent-foreground">Apply All Applicable</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
