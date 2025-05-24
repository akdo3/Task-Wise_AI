"use client";

import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO } from 'date-fns';
import { CalendarIcon, PlusCircle, Trash2, Sparkles, X, Image as ImageIcon, Wand2, Lightbulb, Loader2, SearchCheck } from 'lucide-react';
import type { Task, Subtask, Priority, AiTaskFormInput } from '@/types';
import { useToast } from "@/hooks/use-toast";
import type { AiTaskAssistantOutput } from "@/ai/flows/ai-task-assistant";
import { generateImageForTask as generateImageAction, suggestRandomTask as suggestRandomTaskAction } from '@/lib/actions'; 

const taskFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  priority: z.enum(['low', 'medium', 'high'] as [Priority, ...Priority[]]),
  dueDate: z.date().optional(),
  reminderDate: z.date().optional(),
  tags: z.array(z.string().max(20, 'Tag is too long')).max(5, 'Maximum 5 tags').optional(),
  subtasks: z.array(z.object({ 
    id: z.string(), 
    text: z.string().min(1, 'Subtask text cannot be empty').max(100, 'Subtask is too long'), 
    completed: z.boolean() 
  })).max(10, 'Maximum 10 subtasks').optional(),
  delegatedTo: z.string().max(50, 'Delegatee name is too long').optional(),
  imageUrl: z.string().url({ message: "Please enter a valid URL or data URI." }).optional().or(z.literal('')),
});

export type TaskFormData = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  task?: Task | null;
  onSubmit: (data: TaskFormData) => void;
  onCancel: () => void;
  onGetAiSuggestions: (data: AiTaskFormInput) => Promise<AiTaskAssistantOutput | { error: string } | undefined>;
  onReviewImage: (imageUrl: string, title: string, description?: string) => Promise<void>;
  activeImageQuery?: string | null;
  onClearActiveImageQuery: () => void;
  stagedEmoji?: string | null;
  onClearStagedEmoji: () => void;
}

export const TaskForm: FC<TaskFormProps> = ({ 
  task, 
  onSubmit, 
  onCancel, 
  onGetAiSuggestions, 
  onReviewImage,
  activeImageQuery, 
  onClearActiveImageQuery,
  stagedEmoji,
  onClearStagedEmoji 
}) => {
  const { toast } = useToast();
  const [currentTag, setCurrentTag] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isImageGenerating, setIsImageGenerating] = useState(false);
  const [isImageReviewing, setIsImageReviewing] = useState(false);
  const [isInspireMeLoading, setIsInspireMeLoading] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      priority: task?.priority || 'medium',
      dueDate: task?.dueDate ? parseISO(task.dueDate) : undefined,
      reminderDate: task?.reminderDate ? parseISO(task.reminderDate) : undefined,
      tags: task?.tags || [],
      subtasks: task?.subtasks || [],
      delegatedTo: task?.delegatedTo || '',
      imageUrl: task?.imageUrl || '', 
    },
  });

  const { fields: subtaskFields, append: appendSubtask, remove: removeSubtask, replace: replaceSubtasks } = useFieldArray({
    control,
    name: 'subtasks',
  });

  const watchedTags = watch('tags') || [];
  const currentTitle = watch('title');
  const currentImageUrl = watch('imageUrl');
  const currentFormTitle = watch('title');


  useEffect(() => {
    let titleToSet = task?.title || '';
    if (stagedEmoji) {
      const emojiPattern = /^\p{Emoji_Presentation}\s*/u;
      const currentTitleWithoutEmoji = titleToSet.replace(emojiPattern, '').trimStart();
       if (!titleToSet.startsWith(stagedEmoji + ' ')) {
         titleToSet = `${stagedEmoji} ${currentTitleWithoutEmoji}`;
       }
    } else if (task?.title) {
       titleToSet = task.title;
    }

    reset({
      title: titleToSet,
      description: task?.description || '',
      priority: task?.priority || 'medium',
      dueDate: task?.dueDate ? parseISO(task.dueDate) : undefined,
      reminderDate: task?.reminderDate ? parseISO(task.reminderDate) : undefined,
      tags: task?.tags || [],
      subtasks: task?.subtasks || [],
      delegatedTo: task?.delegatedTo || '',
      imageUrl: task?.imageUrl || '',
    });
  }, [task, reset, stagedEmoji]);

  useEffect(() => {
    const currentTitleValue = getValues('title');
    let newTitle = currentTitleValue;
    const emojiPattern = /^\p{Emoji_Presentation}\s*/u; 

    if (stagedEmoji) {
      const titleWithoutEmoji = currentTitleValue.replace(emojiPattern, '').trimStart();
      if (!currentTitleValue.startsWith(stagedEmoji + ' ')) {
        newTitle = `${stagedEmoji} ${titleWithoutEmoji}`;
      }
    } else {
      newTitle = currentTitleValue.replace(emojiPattern, '').trimStart();
    }
    
    if (newTitle !== currentTitleValue) {
      setValue('title', newTitle, { shouldValidate: true, shouldDirty: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stagedEmoji, setValue]); 


  const handleAddTag = () => {
    if (currentTag.trim() && !watchedTags.includes(currentTag.trim()) && watchedTags.length < 5) {
      setValue('tags', [...watchedTags, currentTag.trim()]);
      setCurrentTag('');
    } else if (watchedTags.length >= 5) {
        toast({ variant: "destructive", title: "Tag Limit Reached", description: "You can add a maximum of 5 tags."});
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValue('tags', watchedTags.filter((tag) => tag !== tagToRemove));
  };
  
  const handleFormSubmit = (data: TaskFormData) => {
    let submittedData = { ...data };
    const emojiPattern = /^\p{Emoji_Presentation}\s*/u;
    if (stagedEmoji) {
      const titleWithoutEmoji = data.title.replace(emojiPattern, '').trimStart();
      if (!data.title.startsWith(stagedEmoji + ' ')) {
        submittedData.title = `${stagedEmoji} ${titleWithoutEmoji}`;
      }
    } else {
      submittedData.title = data.title.replace(emojiPattern, '').trimStart();
    }
    onSubmit(submittedData); 
  };

  const handleAiAssist = async () => {
    const formData = watch(); 
    let currentTitleForAI = formData.title || '';
    const emojiPattern = /^\p{Emoji_Presentation}\s*/u;
    if (stagedEmoji) {
      const titleWithoutEmoji = currentTitleForAI.replace(emojiPattern, '').trimStart();
      if (!currentTitleForAI.startsWith(stagedEmoji + ' ')) {
         currentTitleForAI = `${stagedEmoji} ${titleWithoutEmoji}`;
      }
    } else {
      currentTitleForAI = currentTitleForAI.replace(emojiPattern, '').trimStart();
    }

    const aiInput: AiTaskFormInput = {
      description: formData.description || currentTitleForAI || "New Task", 
      subtasks: formData.subtasks?.map(st => st.text) || [],
      priority: formData.priority || 'medium',
      dueDate: formData.dueDate ? format(formData.dueDate, 'yyyy-MM-dd') : '',
      reminder: formData.reminderDate ? format(formData.reminderDate, 'yyyy-MM-dd') : '',
      tags: formData.tags || [],
      imageUrl: formData.imageUrl || '',
    };

    if (!aiInput.description && !currentTitleForAI) {
        toast({ variant: "destructive", title: "Title or Description Required", description: "Please provide a title or description for AI assistance."});
        return;
    }

    setIsAiLoading(true);
    await onGetAiSuggestions(aiInput); 
    setIsAiLoading(false);
  };

  const handleTriggerImageReview = async () => {
    const title = getValues('title');
    const description = getValues('description');
    const imageUrl = getValues('imageUrl');

    if (!imageUrl || imageUrl.startsWith('data:') || imageUrl.startsWith('https://placehold.co')) {
      toast({ variant: "destructive", title: "Invalid Image for Review", description: "Please provide a valid, non-generated external image URL to review."});
      return;
    }
    if (!title) {
       toast({ variant: "destructive", title: "Title Required", description: "Please provide a task title for image review context."});
      return;
    }

    setIsImageReviewing(true);
    await onReviewImage(imageUrl, title, description);
    setIsImageReviewing(false);
  };

  const handleGenerateImage = async () => {
    const currentTitleValue = getValues('title');
    const currentDescription = getValues('description');

    if (!currentTitleValue && !activeImageQuery) {
      toast({
        variant: "destructive",
        title: "Title or AI Query Required",
        description: "Please enter a task title or have an AI-suggested query to generate an image.",
      });
      return;
    }

    setIsImageGenerating(true);
    const result = await generateImageAction({ 
        taskTitle: currentTitleValue, 
        taskDescription: currentDescription,
        imageQuery: activeImageQuery || undefined 
    });
    setIsImageGenerating(false);

    if (result && !('error' in result) && result.imageDataUri) {
      setValue('imageUrl', result.imageDataUri, { shouldValidate: true });
      toast({
        title: "Image Generated",
        description: `AI has generated an image ${activeImageQuery ? "using the suggested query." : "for your task."}`,
      });
      onClearActiveImageQuery(); // Clear query after successful generation
    } else {
      const errorMessage = (result && 'error' in result) ? result.error : "Failed to generate image."
      toast({
        variant: "destructive",
        title: "Image Generation Error",
        description: errorMessage,
      });
    }
  };

  const handleInspireMe = async () => {
    setIsInspireMeLoading(true);
    const result = await suggestRandomTaskAction();
    setIsInspireMeLoading(false);

    if (result && !('error' in result)) {
      let toastMessage = "";
      if (result.suggestedTitle) {
        const titleToSet = stagedEmoji ? `${stagedEmoji} ${result.suggestedTitle}` : result.suggestedTitle;
        setValue('title', titleToSet, { shouldValidate: true });
        toastMessage += `Suggested title: "${result.suggestedTitle}". `;
      }
      if (result.suggestedDescription) {
        setValue('description', result.suggestedDescription, { shouldValidate: true });
         toastMessage += `Description added. `;
      }
      if (result.suggestedPriority) {
        setValue('priority', result.suggestedPriority, { shouldValidate: true });
         toastMessage += `Priority set to ${result.suggestedPriority}. `;
      }

      if (result.suggestedTags && result.suggestedTags.length > 0) {
        const currentTags = getValues('tags') || [];
        const newTagsToAdd = result.suggestedTags.filter(
          (tag) => !currentTags.includes(tag) && currentTags.length + (currentTags.includes(tag) ? 0 : 1) <= 5
        );
        
        if (newTagsToAdd.length > 0) {
          const finalNewTags = newTagsToAdd.slice(0, 5 - currentTags.length);
          setValue('tags', [...currentTags, ...finalNewTags]);
          if (finalNewTags.length > 0) {
             toastMessage += `Tags: ${finalNewTags.join(', ')} added. `;
          }
        }
      }
      
      if (result.suggestedSubtasks && result.suggestedSubtasks.length > 0) {
        const currentSubtasks = getValues('subtasks') || [];
        const newAiSubtasks: Subtask[] = result.suggestedSubtasks
          .slice(0, 10 - currentSubtasks.length) 
          .map(stText => ({
            id: crypto.randomUUID(),
            text: stText,
            completed: false,
          }));
        
        if (newAiSubtasks.length > 0) {
          const allSubtasks = [...currentSubtasks, ...newAiSubtasks].slice(0,10);
          replaceSubtasks(allSubtasks); 
          toastMessage += `Subtasks: ${newAiSubtasks.map(s => s.text).join(', ')} added.`;
        }
      }

      if (toastMessage) {
        toast({
          title: "Task Idea Sparked!",
          description: toastMessage.trim(),
        });
      } else if (!result.suggestedTitle) {
         toast({
            variant: "default",
            title: "AI Suggestion",
            description: "The AI couldn't come up with a title this time, try again!",
        });
      }

    } else {
      const errorMessage = (result && 'error' in result) ? result.error : "Failed to get a task suggestion.";
      toast({
        variant: "destructive",
        title: "Suggestion Error",
        description: errorMessage,
      });
    }
  };

  const canReviewImage = currentImageUrl && !currentImageUrl.startsWith('data:') && !currentImageUrl.startsWith('https://placehold.co');

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8 p-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              {stagedEmoji && (
                <div className="flex items-center gap-1 bg-accent/10 px-2 py-1 rounded-md">
                  <span className="text-xl">{stagedEmoji}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={onClearStagedEmoji}
                    className="h-5 w-5 text-muted-foreground hover:text-destructive"
                    aria-label="Clear staged emoji"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <Label htmlFor="title" className="text-sm font-medium">Title</Label>
            </div>
            {!task && !currentFormTitle && (
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={handleInspireMe} 
                disabled={isInspireMeLoading}
                className="text-xs text-accent hover:text-accent/80"
              >
                {isInspireMeLoading ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Lightbulb className="mr-1.5 h-3.5 w-3.5" />
                )}
                Inspire Me!
              </Button>
            )}
          </div>
          <Input id="title" {...register('title')} aria-invalid={errors.title ? "true" : "false"} />
          {errors.title && <p className="text-xs text-destructive mt-1.5">{errors.title.message}</p>}
        </div>
        <div>
          <Label htmlFor="priority" className="text-sm font-medium">Priority</Label>
          <Controller
            name="priority"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description" className="text-sm font-medium">Description (Optional)</Label>
        <Textarea id="description" {...register('description')} rows={5} className="mt-1.5"/>
        {errors.description && <p className="text-xs text-destructive mt-1.5">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
        <div>
          <Label htmlFor="dueDate" className="text-sm font-medium">Due Date (Optional)</Label>
          <Controller
            name="dueDate"
            control={control}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal mt-1.5"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          />
        </div>
        <div>
          <Label htmlFor="reminderDate" className="text-sm font-medium">Reminder Date (Optional)</Label>
           <Controller
            name="reminderDate"
            control={control}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal mt-1.5"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="subtasks" className="text-sm font-medium">Subtasks (Optional)</Label>
        {subtaskFields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-2 mt-2">
            <Controller
                name={`subtasks.${index}.completed`}
                control={control}
                render={({ field: controllerField }) => (
                   <input 
                      type="checkbox" 
                      checked={controllerField.value} 
                      onChange={controllerField.onChange} 
                      className="h-4 w-4 rounded border-primary text-primary focus:ring-primary shrink-0 mt-0.5" 
                    />
                )}
              />
            <Input
              {...register(`subtasks.${index}.text`)}
              placeholder={`Subtask ${index + 1}`}
              className="flex-grow text-sm"
            />
            <Button type="button" variant="ghost" size="icon" onClick={() => removeSubtask(index)} className="shrink-0">
              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
            </Button>
          </div>
        ))}
        {errors.subtasks && errors.subtasks.message && <p className="text-xs text-destructive mt-1.5">{errors.subtasks.message}</p>}
        {errors.subtasks?.root?.message && <p className="text-xs text-destructive mt-1.5">{errors.subtasks.root.message}</p>}
        {subtaskFields.map((field, index) => errors.subtasks?.[index]?.text && <p key={field.id} className="text-xs text-destructive mt-1.5">{errors.subtasks[index]?.text?.message}</p>)}

        {subtaskFields.length < 10 && (
            <Button type="button" variant="outline" size="sm" onClick={() => appendSubtask({ id: crypto.randomUUID(), text: '', completed: false })} className="mt-3">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Subtask
            </Button>
        )}
      </div>

      <div>
        <Label htmlFor="tags" className="text-sm font-medium">Tags (Optional, max 5)</Label>
        <div className="flex items-center gap-2 mt-1.5">
          <Input
            id="tag-input"
            value={currentTag}
            onChange={(e) => setCurrentTag(e.target.value)}
            placeholder="Type and press Enter or click Add"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag();}}}
            className="text-sm"
          />
          <Button type="button" variant="outline" onClick={handleAddTag} className="shrink-0">Add</Button>
        </div>
        {errors.tags && <p className="text-xs text-destructive mt-1.5">{errors.tags.message}</p>}
        <div className="flex flex-wrap gap-2 mt-2.5">
          {watchedTags.map((tag) => (
            <span key={tag} className="bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full text-xs flex items-center font-medium">
              {tag}
              <Button type="button" variant="ghost" size="icon" className="ml-1.5 h-4 w-4" onClick={() => handleRemoveTag(tag)}>
                <X className="h-3 w-3" />
              </Button>
            </span>
          ))}
        </div>
      </div>

      <div>
          <Label htmlFor="delegatedTo" className="text-sm font-medium">Delegate To (Optional)</Label>
          <Input id="delegatedTo" {...register('delegatedTo')} placeholder="Team member name or email" className="mt-1.5"/>
          {errors.delegatedTo && <p className="text-xs text-destructive mt-1.5">{errors.delegatedTo.message}</p>}
      </div>
      
      <div>
        <Label htmlFor="imageUrl" className="text-sm font-medium">Image URL (Optional)</Label>
        <div className="flex items-center gap-2 mt-1.5">
            <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input 
                    id="imageUrl" 
                    {...register('imageUrl')} 
                    placeholder="https://example.com/image.png or generate one" 
                    className="pl-10"
                    aria-invalid={errors.imageUrl ? "true" : "false"}
                />
            </div>
             {canReviewImage && (
              <Button type="button" variant="outline" onClick={handleTriggerImageReview} disabled={isImageReviewing || !currentTitle} className="shrink-0">
                {isImageReviewing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SearchCheck className="mr-2 h-4 w-4" />}
                {isImageReviewing ? 'Reviewing...' : 'AI Review Image'}
              </Button>
            )}
            <Button type="button" variant="outline" onClick={handleGenerateImage} disabled={isImageGenerating} className="shrink-0">
                 {isImageGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                {isImageGenerating ? 'Generating...' : (activeImageQuery ? 'Generate with AI Query' : 'Generate Image')}
            </Button>
        </div>
        {errors.imageUrl && <p className="text-xs text-destructive mt-1.5">{errors.imageUrl.message}</p>}
        {activeImageQuery && (
          <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2 p-2 bg-muted rounded-md">
            <Sparkles className="h-3 w-3 text-accent"/>
            <span>Using AI query for generation: "<em>{activeImageQuery}</em>"</span>
            <Button type="button" variant="ghost" size="icon" onClick={onClearActiveImageQuery} className="h-5 w-5 ml-auto">
              <X className="h-3 w-3"/>
              <span className="sr-only">Clear AI image query</span>
            </Button>
          </div>
        )}
      </div>
      
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} className="px-6">Cancel</Button>
        <Button type="button" onClick={handleAiAssist} variant="outline" disabled={isAiLoading} className="px-6">
            {isAiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4 animate-pulse" />}
            {isAiLoading ? 'Thinking...' : 'AI Assist'}
        </Button>
        <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6">
          {task ? 'Save Changes' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};
