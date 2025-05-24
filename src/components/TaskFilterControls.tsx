"use client";
import type { FC } from 'react';
import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';
import type { Priority } from '@/types';

export interface FilterState {
  priority: Priority | 'all';
  dueDate: string; // YYYY-MM-DD or empty
  tags: string; // Comma-separated string of tags
  searchTerm: string;
}

interface TaskFilterControlsProps {
  onFilterChange: (filters: FilterState) => void;
  initialFilters: FilterState;
}

export const TaskFilterControls: FC<TaskFilterControlsProps> = ({ onFilterChange, initialFilters }) => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSelectChange = (name: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  const handleResetFilters = () => {
    setFilters(initialFilters);
    onFilterChange(initialFilters);
  };

  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-grow min-w-[200px] sm:min-w-[240px]">
          <label htmlFor="searchTerm" className="block text-sm font-medium text-foreground mb-1">Search Tasks</label>
          <Input
            id="searchTerm"
            name="searchTerm"
            placeholder="Search by title or description..."
            value={filters.searchTerm}
            onChange={handleInputChange}
          />
        </div>
        <div className="flex-grow min-w-[150px] sm:min-w-[180px]">
          <label htmlFor="priority" className="block text-sm font-medium text-foreground mb-1">Priority</label>
          <Select
            name="priority"
            value={filters.priority}
            onValueChange={(value) => handleSelectChange('priority', value)}
          >
            <SelectTrigger>
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
        <div className="flex-grow min-w-[150px] sm:min-w-[180px]">
          <label htmlFor="dueDate" className="block text-sm font-medium text-foreground mb-1">Due Date</label>
          <Input
            id="dueDate"
            name="dueDate"
            type="date"
            value={filters.dueDate}
            onChange={handleInputChange}
          />
        </div>
        <div className="flex-grow min-w-[150px] sm:min-w-[180px]">
          <label htmlFor="tags" className="block text-sm font-medium text-foreground mb-1">Tags</label>
          <Input
            id="tags"
            name="tags"
            placeholder="e.g., work,home"
            value={filters.tags}
            onChange={handleInputChange}
          />
        </div>
         <div className="ml-auto pt-1"> {/* Using ml-auto to push to the right, pt-1 for alignment with taller inputs */}
          <Button onClick={handleResetFilters} variant="ghost">
            <X className="mr-2 h-4 w-4" /> Reset
          </Button>
        </div>
      </div>
    </div>
  );
};
