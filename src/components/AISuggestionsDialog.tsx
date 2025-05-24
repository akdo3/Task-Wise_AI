
"use client";

import type { FC } from 'react';
import { useState, useEffect } from 'react';
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
import { Label } from "@/components/ui/label";
import type { AiTaskAssistantOutput } from "@/ai/flows/ai-task-assistant";
import { Wand2 } from 'lucide-react';

interface AISuggestionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  suggestions: AiTaskAssistantOutput | null; // This will be the raw AI output
  onApplySuggestions: (appliedSuggestions: Partial<AiTaskAssistantOutput>) => void;
}

export const AISuggestionsDialog: FC<AISuggestionsDialogProps> = ({
  isOpen,
  onClose,
  suggestions,
  onApplySuggestions,
}) => {
  const [selectedGeneratedSubtasks, setSelectedGeneratedSubtasks] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && suggestions?.generatedSubtasks) {
      // Pre-select all newly suggested subtasks when the dialog opens or suggestions change
      setSelectedGeneratedSubtasks(suggestions.generatedSubtasks);
    } else if (!isOpen) {
      setSelectedGeneratedSubtasks([]); // Clear selection when dialog closes
    }
  }, [isOpen, suggestions?.generatedSubtasks]);

  if (!suggestions) return null;

  const handleSubtaskSelectionChange = (subtaskText: string, isChecked: boolean) => {
    setSelectedGeneratedSubtasks(prev =>
      isChecked ? [...prev, subtaskText] : prev.filter(st => st !== subtaskText)
    );
  };

  const handleApplyDescription = () => {
    onApplySuggestions({ improvedDescription: suggestions.improvedDescription });
  };

  const handleApplySelectedSubtasks = () => {
    onApplySuggestions({ generatedSubtasks: selectedGeneratedSubtasks });
  };
  
  const handleApplyEmoji = () => {
    if (suggestions.suggestedEmoji) {
      onApplySuggestions({ suggestedEmoji: suggestions.suggestedEmoji });
    }
  };

  const handleApplyTagline = () => {
    if (suggestions.suggestedTagline) {
      onApplySuggestions({ suggestedTagline: suggestions.suggestedTagline });
    }
  };

  const handleApplyImageQuery = () => {
    if (suggestions.suggestedImageQuery) {
      onApplySuggestions({ suggestedImageQuery: suggestions.suggestedImageQuery });
    }
  };

  const handleApplyAll = () => {
    const applicableSuggestions: Partial<AiTaskAssistantOutput> = {};
    if (suggestions.improvedDescription) {
        applicableSuggestions.improvedDescription = suggestions.improvedDescription;
    }
    applicableSuggestions.generatedSubtasks = selectedGeneratedSubtasks;
    
    if (suggestions.suggestedEmoji) {
        applicableSuggestions.suggestedEmoji = suggestions.suggestedEmoji;
    }
    if (suggestions.suggestedTagline) {
        applicableSuggestions.suggestedTagline = suggestions.suggestedTagline;
    }
    if (suggestions.suggestedImageQuery) {
        applicableSuggestions.suggestedImageQuery = suggestions.suggestedImageQuery;
    }
    // approachSuggestions are for viewing, not direct application to form fields

    onApplySuggestions(applicableSuggestions);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>AI Task Suggestions</DialogTitle>
          <DialogDescription>
            Review and select the AI suggestions to enhance your task. Click "Apply All Staged" or choose individual suggestions.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] p-4 border rounded-md space-y-6">
          {suggestions.suggestedEmoji && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Suggested Emoji:</h3>
              <div className="flex items-center gap-3 bg-muted p-3 rounded-md">
                <span className="text-3xl">{suggestions.suggestedEmoji}</span>
                <Button onClick={handleApplyEmoji} size="sm" variant="outline">Stage this Emoji</Button>
              </div>
            </div>
          )}

          {suggestions.improvedDescription && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Improved Description:</h3>
              <p className="text-sm bg-muted p-3 rounded-md whitespace-pre-wrap">
                {suggestions.improvedDescription}
              </p>
              <Button onClick={handleApplyDescription} size="sm" variant="outline" className="mt-2">Stage this Description</Button>
            </div>
          )}
          
          {suggestions.suggestedTagline && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Suggested Tagline:</h3>
              <p className="text-sm bg-muted p-3 rounded-md italic">
                "{suggestions.suggestedTagline}"
              </p>
              <Button onClick={handleApplyTagline} size="sm" variant="outline" className="mt-2">Stage this Tagline</Button>
            </div>
          )}

          {suggestions.suggestedImageQuery && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Suggested Image Generation Query:</h3>
              <p className="text-sm bg-muted p-3 rounded-md font-mono">
                {suggestions.suggestedImageQuery}
              </p>
              <Button onClick={handleApplyImageQuery} size="sm" variant="outline" className="mt-2">
                <Wand2 className="mr-2 h-4 w-4" /> Stage this Query
              </Button>
            </div>
          )}


          {suggestions.generatedSubtasks && suggestions.generatedSubtasks.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Generated Subtasks:</h3>
              <ul className="space-y-2.5">
                {suggestions.generatedSubtasks.map((subtask, index) => (
                  <li key={index} className="flex items-center gap-3 bg-muted p-3 rounded-md">
                    <Checkbox
                      id={`ai-subtask-${index}`}
                      checked={selectedGeneratedSubtasks.includes(subtask)}
                      onCheckedChange={(checked) => handleSubtaskSelectionChange(subtask, !!checked)}
                    />
                    <Label htmlFor={`ai-subtask-${index}`} className="text-sm font-normal cursor-pointer">
                      {subtask}
                    </Label>
                  </li>
                ))}
              </ul>
               <Button onClick={handleApplySelectedSubtasks} size="sm" variant="outline" className="mt-3">Stage Selected Subtasks</Button>
            </div>
          )}

          {suggestions.approachSuggestions && suggestions.approachSuggestions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Approach Suggestions (for your reference):</h3>
              <ul className="list-disc list-inside space-y-1.5 pl-4">
                {suggestions.approachSuggestions.map((approach, index) => (
                  <li key={index} className="text-sm">{approach}</li>
                ))}
              </ul>
            </div>
          )}
        </ScrollArea>
        <DialogFooter className="gap-2 sm:justify-between pt-4">
          <Button variant="outline" onClick={onClose}>Close & Discard Staged</Button>
          <Button onClick={handleApplyAll} className="bg-accent hover:bg-accent/90 text-accent-foreground">Apply All Staged & Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
