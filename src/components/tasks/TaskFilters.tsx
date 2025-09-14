import React from 'react';
import { Button } from '@/components/ui/button';

interface Category {
  id: string;
  name: string;
}

interface TaskFiltersProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <Button
        variant={selectedCategory === '' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onCategoryChange('')}
        className="shrink-0"
      >
        All
      </Button>
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? 'default' : 'outline'}
          size="sm"
          onClick={() => onCategoryChange(category.id)}
          className="shrink-0"
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
};