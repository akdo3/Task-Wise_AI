"use client";

import type { FC } from 'react';
import { useEffect, useState, useCallback } from 'react';
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
import { CalendarIcon, PlusCircle, Trash2, UploadCloud, Sparkles, X } from 'lucide-react';
import type { Task, Subtask, Priority, AiTaskFormInput } from '@/types';
import Image from 'next/image';
import { useToast } from "@/hooks/use-toast";
import type { AiTaskAssistantOutput } from "@/ai/flows/ai-task-assistant";

const taskFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high'] as [Priority, ...Priority[]]),
  dueDate: z.date().optional(),
  reminderDate: z.date().optional(),
  tags: z.array(z.string()).optional(),
  subtasks: z.array(z.object({ id: z.string(), text: z.string(), completed: z.boolean() })).optional(),
  delegatedTo: z.string().optional(),
  imageUrl: z.string().optional(), // For storing data URI
});

export type TaskFormData = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  task?: Task | null;
  onSubmit: (data: TaskFormData, aiSuggestions?: AiTaskAssistantOutput) => void;
  onCancel: () => void;
  onGetAiSuggestions: (data: AiTaskFormInput) => Promise<AiTaskAssistantOutput | { error: string } | undefined>;
  openAiSuggestionsDialog: (suggestions: AiTaskAssistantOutput) => void;
}

export const TaskForm: FC<TaskFormProps> = ({ task, onSubmit, onCancel, onGetAiSuggestions, openAiSuggestionsDialog }) => {
  const { toast } = useToast();
  const [currentTag, setCurrentTag] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(task?.imageUrl || null);
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
      imageUrl: task?.imageUrl || undefined,
    },
  });

  const { fields: subtaskFields, append: appendSubtask, remove: removeSubtask, update: updateSubtask } = useFieldArray({
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
        imageUrl: task.imageUrl || undefined,
      });
      setImagePreview(task.imageUrl || null);
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
        imageUrl: undefined,
      });
      setImagePreview(null);
    }
  }, [task, reset]);

  const handleAddTag = () => {
    if (currentTag && !tags.includes(currentTag)) {
      setValue('tags', [...tags, currentTag]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValue('tags', tags.filter((tag) => tag !== tagToRemove));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setImagePreview(dataUri);
        setValue('imageUrl', dataUri);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleFormSubmit = (data: TaskFormData) => {
    onSubmit(data);
  };

  const handleAiAssist = async () => {
    const formData = watch();
    const aiInput: AiTaskFormInput = {
      description: formData.description || formData.title, // Use title if description is empty
      subtasks: formData.subtasks?.map(st => st.text) || [],
      priority: formData.priority || 'medium',
      dueDate: formData.dueDate ? format(formData.dueDate, 'yyyy-MM-dd') : '',
      reminder: formData.reminderDate ? format(formData.reminderDate, 'yyyy-MM-dd') : '',
      tags: formData.tags || [],
      image: formData.imageUrl,
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
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 p-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" {...register('title')} aria-invalid={errors.title ? "true" : "false"} />
          {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
        </div>
        <div>
          <Label htmlFor="priority">Priority</Label>
          <Controller
            name="priority"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
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
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register('description')} rows={4} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="dueDate">Due Date</Label>
          <Controller
            name="dueDate"
            control={control}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
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
          <Label htmlFor="reminderDate">Reminder Date</Label>
           <Controller
            name="reminderDate"
            control={control}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
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
        <Label htmlFor="subtasks">Subtasks</Label>
        {subtaskFields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-2 mb-2">
            <Input
              {...register(`subtasks.${index}.text`)}
              placeholder={`Subtask ${index + 1}`}
              className="flex-grow"
            />
             <Controller
                name={`subtasks.${index}.completed`}
                control={control}
                render={({ field: controllerField }) => (
                   <input type="checkbox" checked={controllerField.value} onChange={controllerField.onChange} className="h-5 w-5 rounded border-primary text-primary focus:ring-primary" />
                )}
              />
            <Button type="button" variant="ghost" size="icon" onClick={() => removeSubtask(index)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => appendSubtask({ id: crypto.randomUUID(), text: '', completed: false })}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Subtask
        </Button>
      </div>

      <div>
        <Label htmlFor="tags">Tags</Label>
        <div className="flex items-center gap-2 mb-2">
          <Input
            id="tag-input"
            value={currentTag}
            onChange={(e) => setCurrentTag(e.target.value)}
            placeholder="Add a tag"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag();}}}
          />
          <Button type="button" variant="outline" onClick={handleAddTag}>Add Tag</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center">
              {tag}
              <Button type="button" variant="ghost" size="icon" className="ml-1 h-5 w-5" onClick={() => handleRemoveTag(tag)}>
                <X className="h-3 w-3" />
              </Button>
            </span>
          ))}
        </div>
      </div>

      <div>
          <Label htmlFor="delegatedTo">Delegate To</Label>
          <Input id="delegatedTo" {...register('delegatedTo')} placeholder="Team member name or email" />
      </div>

      <div>
        <Label htmlFor="imageUpload">Task Image</Label>
        <Input id="imageUpload" type="file" accept="image/*" onChange={handleImageUpload} className="mb-2" />
        {imagePreview && (
          <div className="mt-2 relative w-full h-48 border rounded-md overflow-hidden">
            <Image src={imagePreview} alt="Image Preview" layout="fill" objectFit="cover" data-ai-hint="task relevant"/>
          </div>
        )}
      </div>
      
      <div className="flex justify-end gap-4 mt-8">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="button" onClick={handleAiAssist} variant="outline" disabled={isAiLoading}>
            <Sparkles className="mr-2 h-4 w-4" /> {isAiLoading ? 'Getting Suggestions...' : 'AI Assist'}
        </Button>
        <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
          {task ? 'Save Changes' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};
