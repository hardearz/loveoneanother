import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AppHeader } from '@/components/layout/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Search, History, Gift, Calendar, MapPin, Coins, Upload, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Task {
  id: string;
  title: string;
  description: string;
  location_address: string;
  deadline: string;
  reward_luvs: number;
  status: string;
  category_id: string;
  admin_rejection_message?: string;
}

export default function Dashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [claimedTasks, setClaimedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchClaimedTasks();
    }
  }, [profile]);

  const fetchClaimedTasks = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('claimed_by', profile.id)
        .in('status', ['Claimed', 'Pending Approval', 'Rejected']);

      if (error) {
        console.error('Error fetching claimed tasks:', error);
        return;
      }

      setClaimedTasks(data || []);
    } catch (error) {
      console.error('Error in fetchClaimedTasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Claimed':
        return 'bg-blue-500/10 text-blue-500';
      case 'Pending Approval':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'Rejected':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const handleReleaseTask = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: 'Available',
          claimed_by: null,
          proof_text: null,
          admin_rejection_message: null
        })
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: "Task released",
        description: "The task has been returned to available tasks."
      });

      fetchClaimedTasks(); // Refresh the list
    } catch (error: any) {
      toast({
        title: "Error releasing task",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="p-4 space-y-6">
        {/* Welcome Section */}
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {profile?.first_name}!
          </h1>
          <p className="text-muted-foreground">Ready to make a difference in your community?</p>
        </div>

        {/* LUV Balance Card */}
        <Card className="card-elevated luv-gradient text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center space-x-2 text-2xl">
              <Coins className="h-6 w-6" />
              <span>Your LUV Balance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold mb-2">{profile?.luv_balance || 0}</div>
            <p className="text-lg opacity-90">LUV Tokens</p>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={() => navigate('/tasks')}
            className="h-20 flex flex-col items-center justify-center space-y-2"
            variant="outline"
          >
            <Search className="h-6 w-6" />
            <span>Find Tasks</span>
          </Button>
          
          <Button
            onClick={() => navigate('/history')}
            className="h-20 flex flex-col items-center justify-center space-y-2"
            variant="outline"
          >
            <History className="h-6 w-6" />
            <span>Work History</span>
          </Button>
          
          <Button
            onClick={() => navigate('/redeem')}
            className="h-20 flex flex-col items-center justify-center space-y-2"
            variant="outline"
          >
            <Gift className="h-6 w-6" />
            <span>Redeem Rewards</span>
          </Button>
        </div>

        {/* Claimed Tasks */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-primary" />
              <span>Your Active Tasks</span>
            </CardTitle>
            <CardDescription>
              Tasks you've claimed and are working on
            </CardDescription>
          </CardHeader>
          <CardContent>
            {claimedTasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  You haven't claimed any tasks yet.
                </p>
                <Button onClick={() => navigate('/tasks')}>
                  Find Your First Task
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {claimedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 
                        className="font-semibold text-foreground cursor-pointer hover:text-primary"
                        onClick={() => navigate(`/tasks/${task.id}`)}
                      >
                        {task.title}
                      </h3>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                    </div>
                    
                    <p 
                      className="text-muted-foreground text-sm mb-3 cursor-pointer"
                      onClick={() => navigate(`/tasks/${task.id}`)}
                    >
                      {task.description.substring(0, 120)}...
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{task.location_address}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(task.deadline)}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 text-secondary font-semibold">
                        <Coins className="h-4 w-4" />
                        <span>{task.reward_luvs} LUV</span>
                      </div>
                    </div>

                    {/* Show rejection message for rejected tasks */}
                    {task.status === 'Rejected' && task.admin_rejection_message && (
                      <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg mb-3">
                        <p className="text-sm text-red-600">
                          <strong>Rejection reason:</strong> {task.admin_rejection_message}
                        </p>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      {task.status === 'Claimed' && (
                        <>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/tasks/${task.id}/submit`);
                            }}
                            className="flex-1"
                          >
                            <Upload className="h-4 w-4 mr-1" />
                            Submit Proof
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => handleReleaseTask(task.id, e)}
                            className="flex-1"
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Release Task
                          </Button>
                        </>
                      )}
                      
                      {task.status === 'Rejected' && (
                        <>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/tasks/${task.id}/submit`);
                            }}
                            className="flex-1"
                          >
                            <Upload className="h-4 w-4 mr-1" />
                            Resubmit Proof
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => handleReleaseTask(task.id, e)}
                            className="flex-1"
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Release Task
                          </Button>
                        </>
                      )}

                      {task.status === 'Pending Approval' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/tasks/${task.id}/submit`);
                          }}
                          className="w-full"
                        >
                          View Submission
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}