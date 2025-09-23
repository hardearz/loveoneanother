import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AppHeader } from '@/components/layout/AppHeader';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { Loader2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Task {
  id: string;
  title: string;
  description: string;
  location_address: string;
  reward_luvs: number;
  deadline: string;
  status: string;
  category_id: string;
  photos?: string[];
  categories?: {
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
}

export const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      // Fetch available tasks with category info
      const { data: tasksData } = await supabase
        .from('tasks')
        .select(`
          *,
          categories:category_id (
            name
          )
        `)
        .eq('status', 'Available')
        .order('created_at', { ascending: false });

      setCategories(categoriesData || []);
      setTasks(tasksData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || task.category_id === selectedCategory;
    const matchesLocation = !locationFilter || 
                           task.location_address.toLowerCase().includes(locationFilter.toLowerCase());
    
    return matchesSearch && matchesCategory && matchesLocation;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-background pb-20">
        <div className="p-4">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">Available Tasks</h1>
            <p className="text-muted-foreground">Find and claim tasks to earn LUVs</p>
          </div>

        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
          
          <div className="flex gap-2 overflow-x-auto">
            <Input
              placeholder="Filter by location..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="min-w-48"
            />
            <Button
              variant="outline"
              size="icon"
              className="shrink-0"
            >
              <MapPin className="h-4 w-4" />
            </Button>
          </div>

          <TaskFilters
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        {/* Tasks Grid */}
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No tasks found matching your criteria</p>
              <Button onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
                setLocationFilter('');
              }}>
                Clear Filters
              </Button>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))
          )}
        </div>
        </div>
      </div>
    </>
  );
};

export default Tasks;