import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Eye, CheckCircle, XCircle, Clock } from "lucide-react";

interface Task {
  id: string;
  title: string;
  status: string;
  reward_luvs: number;
  deadline: string;
  created_at: string;
  claimed_by?: string;
  proof_text?: string;
}

const TaskManagement = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching tasks",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "Claimed": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "Pending Approval": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "Completed": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "Rejected": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending Approval": return <Clock className="h-4 w-4" />;
      case "Completed": return <CheckCircle className="h-4 w-4" />;
      case "Rejected": return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === "all") return true;
    return task.status === filter;
  });

  const pendingApprovalCount = tasks.filter(t => t.status === "Pending Approval").length;

  if (profile?.role !== 'admin') {
    return (
      <>
        <AppHeader />
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
            <p className="text-muted-foreground">You don't have permission to access this page.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AppHeader />
      <div className="container mx-auto px-4 py-6 pb-20">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Task Management</h1>
            <p className="text-muted-foreground">Manage tasks and review submissions</p>
          </div>
          <Button onClick={() => navigate("/admin/tasks/new")} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Task
          </Button>
        </div>

        {pendingApprovalCount > 0 && (
          <Card className="mb-6 border-yellow-500/20 bg-yellow-500/5">
            <CardHeader>
              <CardTitle className="text-yellow-600 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {pendingApprovalCount} Task{pendingApprovalCount > 1 ? 's' : ''} Pending Approval
              </CardTitle>
            </CardHeader>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
              >
                All Tasks ({tasks.length})
              </Button>
              <Button
                variant={filter === "Pending Approval" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("Pending Approval")}
              >
                Pending Approval ({tasks.filter(t => t.status === "Pending Approval").length})
              </Button>
              <Button
                variant={filter === "Available" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("Available")}
              >
                Available ({tasks.filter(t => t.status === "Available").length})
              </Button>
              <Button
                variant={filter === "Completed" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("Completed")}
              >
                Completed ({tasks.filter(t => t.status === "Completed").length})
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Loading tasks...</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No tasks found for the selected filter.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reward</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.title}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(task.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(task.status)}
                            {task.status}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>{task.reward_luvs} LUVs</TableCell>
                      <TableCell>{new Date(task.deadline).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/tasks/${task.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {task.status === "Pending Approval" && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => navigate(`/admin/tasks/${task.id}/approve`)}
                            >
                              Review
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default TaskManagement;