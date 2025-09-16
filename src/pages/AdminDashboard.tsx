import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AppHeader } from '@/components/layout/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Users, CheckSquare, Gift, BarChart3, Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalUsers: number;
  activeTasks: number;
  completedTasks: number;
  pendingApprovals: number;
}

interface RecentTask {
  id: string;
  title: string;
  status: string;
  reward_luvs: number;
  created_at: string;
  claimed_by: string | null;
}

export default function AdminDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeTasks: 0,
    completedTasks: 0,
    pendingApprovals: 0
  });
  const [recentTasks, setRecentTasks] = useState<RecentTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchDashboardData();
    }
  }, [profile]);

  const fetchDashboardData = async () => {
    try {
      // Fetch user count
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch task stats
      const { data: tasks } = await supabase
        .from('tasks')
        .select('id, status');

      // Fetch recent tasks
      const { data: recentTasksData } = await supabase
        .from('tasks')
        .select('id, title, status, reward_luvs, created_at, claimed_by')
        .order('created_at', { ascending: false })
        .limit(5);

      if (tasks) {
        const activeTasks = tasks.filter(t => t.status === 'Available').length;
        const completedTasks = tasks.filter(t => t.status === 'Completed').length;
        const pendingApprovals = tasks.filter(t => t.status === 'Pending Approval').length;

        setStats({
          totalUsers: userCount || 0,
          activeTasks,
          completedTasks,
          pendingApprovals
        });
      }

      setRecentTasks(recentTasksData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-success text-success-foreground';
      case 'Claimed':
        return 'bg-info text-info-foreground';
      case 'Pending Approval':
        return 'bg-warning text-warning-foreground';
      case 'Completed':
        return 'bg-primary text-primary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
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
            <p className="text-muted-foreground">Loading admin dashboard...</p>
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
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">Welcome back, {profile?.first_name}! Manage your community platform.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="card-elevated">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Registered community members
              </p>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeTasks}</div>
              <p className="text-xs text-muted-foreground">
                Available for claiming
              </p>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
              <p className="text-xs text-muted-foreground">
                Tasks awaiting review
              </p>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedTasks}</div>
              <p className="text-xs text-muted-foreground">
                Successfully finished
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={() => navigate('/admin/tasks/new')}
            className="h-20 flex flex-col items-center justify-center space-y-2"
            variant="default"
          >
            <Plus className="h-6 w-6" />
            <span>Create Task</span>
          </Button>
          
          <Button
            onClick={() => navigate('/admin/tasks')}
            className="h-20 flex flex-col items-center justify-center space-y-2"
            variant="outline"
          >
            <CheckSquare className="h-6 w-6" />
            <span>Manage Tasks</span>
          </Button>
          
          <Button
            onClick={() => navigate('/admin/users')}
            className="h-20 flex flex-col items-center justify-center space-y-2"
            variant="outline"
          >
            <Users className="h-6 w-6" />
            <span>Manage Users</span>
          </Button>
        </div>

        {/* Recent Tasks */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-primary" />
              <span>Recent Tasks</span>
            </CardTitle>
            <CardDescription>
              Latest tasks created in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentTasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No tasks created yet.
                </p>
                <Button onClick={() => navigate('/admin/tasks/new')}>
                  Create First Task
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/tasks/${task.id}`)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-foreground">{task.title}</h3>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Created: {formatDate(task.created_at)}</span>
                      <div className="flex items-center space-x-1 text-secondary font-semibold">
                        <Gift className="h-4 w-4" />
                        <span>{task.reward_luvs} LUV</span>
                      </div>
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