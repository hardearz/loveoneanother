import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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

interface TaskCardProps {
  task: Task;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const navigate = useNavigate();

  const handleTaskClick = () => {
    navigate(`/tasks/${task.id}`);
  };

  const isUrgent = new Date(task.deadline).getTime() - new Date().getTime() < 24 * 60 * 60 * 1000;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={handleTaskClick}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-foreground mb-1 line-clamp-2">
              {task.title}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              {task.categories?.name && (
                <Badge variant="secondary" className="text-xs">
                  {task.categories.name}
                </Badge>
              )}
              {isUrgent && (
                <Badge variant="destructive" className="text-xs">
                  Urgent
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 text-primary font-bold">
            <Heart className="h-4 w-4 fill-current" />
            <span>{task.reward_luvs}</span>
          </div>
        </div>

        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
          {task.description}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">{task.location_address}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Due {formatDistanceToNow(new Date(task.deadline), { addSuffix: true })}</span>
          </div>
        </div>

        {task.photos && task.photos.length > 0 && (
          <div className="mb-4">
            <img
              src={task.photos[0]}
              alt={task.title}
              className="w-full h-32 object-cover rounded-lg"
            />
          </div>
        )}

        <Button 
          className="w-full" 
          onClick={(e) => {
            e.stopPropagation();
            handleTaskClick();
          }}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};