
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
import { Wand2, Smile, ThumbsUp, SparklesIcon, MessageSquareQuote, CalendarClock } from 'lucide-react';

// Define a common structure for suggestions that the dialog can handle
export interface AISuggestionsDialogCommonProps {
  suggestions: (AiTaskAssistantOutput & { imageReviewFeedback?: string }) | null;
  isOpen: boolean;
  onClose: () => void;
  onApplySuggestions: (appliedSuggestions: Partial<AiTaskAssistantOutput & { imageReviewFeedback?: string }>) => void;
}


export const AISuggestionsDialog: FC<AISuggestionsDialogCommonProps> = ({
  isOpen,
  onClose,
  suggestions,
  onApplySuggestions,
}) => {
  const [selectedGeneratedSubtasks, setSelectedGeneratedSubtasks] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && suggestions?.generatedSubtasks) {
      setSelectedGeneratedSubtasks(suggestions.generatedSubtasks);
    } else if (!isOpen) {
      setSelectedGeneratedSubtasks([]); 
    }
  }, [isOpen, suggestions?.generatedSubtasks]);

  if (!suggestions) return null;

  const handleSubtaskSelectionChange = (subtaskText: string, isChecked: boolean) => {
    setSelectedGeneratedSubtasks(prev =>
      isChecked ? [...prev, subtaskText] : prev.filter(st => st !== subtaskText)
    );
  };

  const handleApplyDescription = () => {
    if (suggestions.improvedDescription) {
      onApplySuggestions({ improvedDescription: suggestions.improvedDescription });
    }
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

  const handleApplyTaskVibe = () => {
    if (suggestions.suggestedTaskVibe) {
      onApplySuggestions({ suggestedTaskVibe: suggestions.suggestedTaskVibe });
    }
  };

  const handleApplyReminderDate = () => {
    if (suggestions.suggestedReminderDate) {
      onApplySuggestions({ suggestedReminderDate: suggestions.suggestedReminderDate });
    }
  };

  const handleApplyAllAndClose = () => {
    const applicableSuggestions: Partial<AiTaskAssistantOutput & { imageReviewFeedback?: string }> = {};
    if (suggestions.improvedDescription) {
        applicableSuggestions.improvedDescription = suggestions.improvedDescription;
    }
    if (selectedGeneratedSubtasks.length > 0 || (suggestions.generatedSubtasks && suggestions.generatedSubtasks.length === 0) ) {
        applicableSuggestions.generatedSubtasks = selectedGeneratedSubtasks;
    }
    
    if (suggestions.suggestedEmoji) {
        applicableSuggestions.suggestedEmoji = suggestions.suggestedEmoji;
    }
    if (suggestions.suggestedTagline) {
        applicableSuggestions.suggestedTagline = suggestions.suggestedTagline;
    }
    if (suggestions.suggestedImageQuery) { 
        applicableSuggestions.suggestedImageQuery = suggestions.suggestedImageQuery;
    }
    if (suggestions.suggestedTaskVibe) {
        applicableSuggestions.suggestedTaskVibe = suggestions.suggestedTaskVibe;
    }
    if (suggestions.suggestedReminderDate) {
        applicableSuggestions.suggestedReminderDate = suggestions.suggestedReminderDate;
    }

    if (Object.keys(applicableSuggestions).length > 0) {
      onApplySuggestions(applicableSuggestions);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>AI Suggestions</DialogTitle>
          <DialogDescription>
            Review and select the AI suggestions. Staged items will be applied when you save the task, or can be used directly (e.g., image query).
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] p-4 border rounded-md space-y-6">
          {suggestions.imageReviewFeedback && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <MessageSquareQuote className="mr-2 h-5 w-5 text-accent" />AI Image Review Feedback:
              </h3>
              <p className="text-sm bg-background p-3 rounded-md whitespace-pre-wrap shadow-sm">
                {suggestions.imageReviewFeedback}
              </p>
            </div>
          )}

          {suggestions.suggestedEmoji && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 flex items-center"><Smile className="mr-2 h-5 w-5 text-accent" />Suggested Emoji:</h3>
              <div className="flex items-center justify-between gap-3 bg-background p-3 rounded-md shadow-sm">
                <span className="text-3xl">{suggestions.suggestedEmoji}</span>
                <Button onClick={handleApplyEmoji} size="sm" variant="outline">
                  Stage this Emoji
                </Button>
              </div>
            </div>
          )}

          {suggestions.improvedDescription && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Improved Description:</h3>
              <p className="text-sm bg-background p-3 rounded-md whitespace-pre-wrap shadow-sm">
                {suggestions.improvedDescription}
              </p>
              <Button onClick={handleApplyDescription} size="sm" variant="outline" className="mt-3">Stage this Description</Button>
            </div>
          )}
          
          {suggestions.suggestedTagline && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 flex items-center"><ThumbsUp className="mr-2 h-5 w-5 text-accent" />Suggested Tagline:</h3>
              <div className="bg-background p-3 rounded-md shadow-sm">
                <p className="text-sm italic mb-2">
                  "{suggestions.suggestedTagline}"
                </p>
                <Button onClick={handleApplyTagline} size="sm" variant="outline">
                   Stage this Tagline
                </Button>
              </div>
            </div>
          )}

          {suggestions.suggestedTaskVibe && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 flex items-center"><SparklesIcon className="mr-2 h-5 w-5 text-accent" />Suggested Task Vibe:</h3>
              <div className="flex items-center justify-between gap-3 bg-background p-3 rounded-md shadow-sm">
                <p className="text-sm font-medium">"{suggestions.suggestedTaskVibe}"</p>
                <Button onClick={handleApplyTaskVibe} size="sm" variant="outline">Stage this Vibe</Button>
              </div>
            </div>
          )}

          {suggestions.suggestedReminderDate && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 flex items-center"><CalendarClock className="mr-2 h-5 w-5 text-accent" />Suggested Reminder Date:</h3>
              <div className="flex items-center justify-between gap-3 bg-background p-3 rounded-md shadow-sm">
                <p className="text-sm font-mono">{suggestions.suggestedReminderDate}</p>
                <Button onClick={handleApplyReminderDate} size="sm" variant="outline">Stage this Reminder</Button>
              </div>
            </div>
          )}

          {suggestions.suggestedImageQuery && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 flex items-center"><Wand2 className="mr-2 h-5 w-5 text-accent" />Suggested Image Query:</h3>
              <div className="bg-background p-3 rounded-md shadow-sm">
                <p className="text-sm font-mono mb-2">
                  {suggestions.suggestedImageQuery}
                </p>
                <Button onClick={handleApplyImageQuery} size="sm" variant="outline">
                  Stage this Query
                </Button>
              </div>
            </div>
          )}


          {suggestions.generatedSubtasks && suggestions.generatedSubtasks.length > 0 && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Generated Subtasks:</h3>
              <ul className="space-y-2.5">
                {suggestions.generatedSubtasks.map((subtask, index) => (
                  <li key={index} className="flex items-center gap-3 bg-background p-3 rounded-md shadow-sm">
                    <Checkbox
                      id={`ai-subtask-${index}`}
                      checked={selectedGeneratedSubtasks.includes(subtask)}
                      onCheckedChange={(checked) => handleSubtaskSelectionChange(subtask, !!checked)}
                    />
                    <Label htmlFor={`ai-subtask-${index}`} className="text-sm font-normal cursor-pointer flex-grow">
                      {subtask}
                    </Label>
                  </li>
                ))}
              </ul>
               <Button onClick={handleApplySelectedSubtasks} size="sm" variant="outline" className="mt-3">Stage Selected Subtasks</Button>
            </div>
          )}

          {suggestions.approachSuggestions && suggestions.approachSuggestions.length > 0 && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Approach Suggestions (for your reference):</h3>
              <ul className="list-disc list-inside space-y-1.5 pl-4 text-sm">
                {suggestions.approachSuggestions.map((approach, index) => (
                  <li key={index}>{approach}</li>
                ))}
              </ul>
            </div>
          )}
        </ScrollArea>
        <DialogFooter className="gap-2 sm:justify-between pt-4">
          <Button variant="ghost" onClick={onClose}>Close</Button>
          <Button onClick={handleApplyAllAndClose} className="bg-primary hover:bg-primary/90 text-primary-foreground">Apply All Staged &amp; Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
