import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, Clock, Heart, ArrowLeft, Camera } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

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
  claimed_by?: string;
  categories?: {
    name: string;
  };
}

export const TaskDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTask();
    }
  }, [id]);

  const fetchTask = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          categories:category_id (
            name
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setTask(data);
    } catch (error) {
      console.error('Error fetching task:', error);
      toast({
        title: "Error",
        description: "Failed to load task details",
        variant: "destructive",
      });
      navigate('/tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimTask = async () => {
    if (!profile || !task) return;

    setClaiming(true);
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          status: 'Claimed',
          claimed_by: profile.id,
        })
        .eq('id', task.id);

      if (error) throw error;

      toast({
        title: "Task claimed!",
        description: "You can now start working on this task.",
      });
      
      setTask({ ...task, status: 'Claimed', claimed_by: profile.id });
    } catch (error) {
      console.error('Error claiming task:', error);
      toast({
        title: "Error",
        description: "Failed to claim task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setClaiming(false);
    }
  };

  const handleStartWork = () => {
    navigate(`/tasks/${task?.id}/submit`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="p-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/tasks')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tasks
          </Button>
          <p className="text-muted-foreground">Task not found</p>
        </div>
      </div>
    );
  }

  const isUrgent = new Date(task.deadline).getTime() - new Date().getTime() < 24 * 60 * 60 * 1000;
  const isClaimed = task.status === 'Claimed' && task.claimed_by === profile?.id;
  const isAvailable = task.status === 'Available';

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/tasks')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tasks
        </Button>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-xl mb-2">{task.title}</CardTitle>
                <div className="flex items-center gap-2 mb-2">
                  {task.categories?.name && (
                    <Badge variant="secondary">
                      {task.categories.name}
                    </Badge>
                  )}
                  {isUrgent && (
                    <Badge variant="destructive">
                      Urgent
                    </Badge>
                  )}
                  <Badge variant={isAvailable ? 'default' : isClaimed ? 'secondary' : 'outline'}>
                    {task.status}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-1 text-primary font-bold text-xl">
                <Heart className="h-5 w-5 fill-current" />
                <span>{task.reward_luvs}</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{task.description}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{task.location_address}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Due {formatDistanceToNow(new Date(task.deadline), { addSuffix: true })}</span>
                <span className="text-xs">({format(new Date(task.deadline), 'PPP')})</span>
              </div>
            </div>

            {task.photos && task.photos.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Photos</h3>
                <div className="grid grid-cols-2 gap-2">
                  {task.photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`${task.title} photo ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4">
              {isAvailable && (
                <Button
                  onClick={handleClaimTask}
                  disabled={claiming}
                  className="w-full"
                  size="lg"
                >
                  {claiming ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Claiming...
                    </>
                  ) : (
                    'Claim This Task'
                  )}
                </Button>
              )}

              {isClaimed && (
                <Button
                  onClick={handleStartWork}
                  className="w-full"
                  size="lg"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Submit Proof
                </Button>
              )}

              {task.status === 'Claimed' && task.claimed_by !== profile?.id && (
                <div className="text-center text-muted-foreground">
                  This task has been claimed by another user
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TaskDetails;