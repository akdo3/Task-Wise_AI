
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
import { CalendarIcon, PlusCircle, Trash2, Sparkles, X, Image as ImageIcon } from 'lucide-react'; // Added ImageIcon
import type { Task, Subtask, Priority, AiTaskFormInput } from '@/types';
import { useToast } from "@/hooks/use-toast";
import type { AiTaskAssistantOutput } from "@/ai/flows/ai-task-assistant";

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
  imageUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')), // Restored imageUrl field
});

export type TaskFormData = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  task?: Task | null;
  onSubmit: (data: TaskFormData) => void;
  onCancel: () => void;
  onGetAiSuggestions: (data: AiTaskFormInput) => Promise<AiTaskAssistantOutput | { error: string } | undefined>;
  openAiSuggestionsDialog: (suggestions: AiTaskAssistantOutput) => void;
}

export const TaskForm: FC<TaskFormProps> = ({ task, onSubmit, onCancel, onGetAiSuggestions, openAiSuggestionsDialog }) => {
  const { toast } = useToast();
  const [currentTag, setCurrentTag] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
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

  const { fields: subtaskFields, append: appendSubtask, remove: removeSubtask } = useFieldArray({
    control,
    name: 'subtasks',
  });

  const tags = watch('tags') || [];

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        dueDate: task.dueDate ? parseISO(task.dueDate) : undefined,
        reminderDate: task.reminderDate ? parseISO(task.reminderDate) : undefined,
        tags: task.tags || [],
        subtasks: task.subtasks || [],
        delegatedTo: task.delegatedTo || '',
        imageUrl: task.imageUrl || '',
      });
    } else {
      reset({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: undefined,
        reminderDate: undefined,
        tags: [],
        subtasks: [],
        delegatedTo: '',
        imageUrl: '',
      });
    }
  }, [task, reset]);

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim()) && tags.length < 5) {
      setValue('tags', [...tags, currentTag.trim()]);
      setCurrentTag('');
    } else if (tags.length >= 5) {
        toast({ variant: "destructive", title: "Tag Limit Reached", description: "You can add a maximum of 5 tags."});
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValue('tags', tags.filter((tag) => tag !== tagToRemove));
  };
  
  const handleFormSubmit = (data: TaskFormData) => {
    onSubmit(data); 
  };

  const handleAiAssist = async () => {
    const formData = watch();
    const aiInput: AiTaskFormInput = {
      description: formData.description || formData.title, 
      subtasks: formData.subtasks?.map(st => st.text) || [],
      priority: formData.priority || 'medium',
      dueDate: formData.dueDate ? format(formData.dueDate, 'yyyy-MM-dd') : '',
      reminder: formData.reminderDate ? format(formData.reminderDate, 'yyyy-MM-dd') : '',
      tags: formData.tags || [],
      imageUrl: formData.imageUrl || '',
    };

    setIsAiLoading(true);
    const suggestions = await onGetAiSuggestions(aiInput);
    setIsAiLoading(false);

    if (suggestions && !('error' in suggestions)) {
      openAiSuggestionsDialog(suggestions);
    } else if (suggestions && 'error' in suggestions) {
      toast({
        variant: "destructive",
        title: "AI Assistance Error",
        description: suggestions.error,
      });
    }
  };


  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8 p-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
        <div>
          <Label htmlFor="title" className="text-sm font-medium">Title</Label>
          <Input id="title" {...register('title')} aria-invalid={errors.title ? "true" : "false"} className="mt-1.5"/>
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
          {tags.map((tag) => (
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
        <div className="relative mt-1.5">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input 
                id="imageUrl" 
                {...register('imageUrl')} 
                placeholder="https://example.com/image.png" 
                className="pl-10"
                aria-invalid={errors.imageUrl ? "true" : "false"}
            />
        </div>
        {errors.imageUrl && <p className="text-xs text-destructive mt-1.5">{errors.imageUrl.message}</p>}
      </div>
      
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} className="px-6">Cancel</Button>
        <Button type="button" onClick={handleAiAssist} variant="outline" disabled={isAiLoading} className="px-6">
            <Sparkles className="mr-2 h-4 w-4" /> {isAiLoading ? 'Thinking...' : 'AI Assist'}
        </Button>
        <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6">
          {task ? 'Save Changes' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};
