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
    <div className="mb-8 p-6 bg-card rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <div>
          <label htmlFor="searchTerm" className="block text-sm font-medium text-foreground mb-1">Search Tasks</label>
          <Input
            id="searchTerm"
            name="searchTerm"
            placeholder="Search by title or description..."
            value={filters.searchTerm}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-foreground mb-1">Filter by Priority</label>
          <Select
            name="priority"
            value={filters.priority}
            onValueChange={(value) => handleSelectChange('priority', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Priorities" />
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
          <label htmlFor="dueDate" className="block text-sm font-medium text-foreground mb-1">Filter by Due Date</label>
          <Input
            id="dueDate"
            name="dueDate"
            type="date"
            value={filters.dueDate}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-foreground mb-1">Filter by Tags</label>
          <Input
            id="tags"
            name="tags"
            placeholder="e.g., work,personal"
            value={filters.tags}
            onChange={handleInputChange}
          />
        </div>
         <div className="lg:col-span-4 flex justify-end">
          <Button onClick={handleResetFilters} variant="outline">
            <X className="mr-2 h-4 w-4" /> Reset Filters
          </Button>
        </div>
      </div>
    </div>
  );
};
