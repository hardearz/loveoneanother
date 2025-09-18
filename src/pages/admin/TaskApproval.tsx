import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, CheckCircle, XCircle, User, Calendar, MapPin, Award } from "lucide-react";

interface TaskData {
  id: string;
  title: string;
  description: string;
  location_address: string;
  reward_luvs: number;
  deadline: string;
  status: string;
  proof_text?: string;
  proof_media?: string[];
  claimed_by?: string;
  profiles?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

const TaskApproval = () => {
  const { id } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [task, setTask] = useState<TaskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [rejectionMessage, setRejectionMessage] = useState("");

  useEffect(() => {
    if (id) {
      fetchTask();
    }
  }, [id]);

  const fetchTask = async () => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select(`
          *,
          profiles:claimed_by (
            first_name,
            last_name,
            email
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setTask(data);
    } catch (error: any) {
      toast({
        title: "Error fetching task",
        description: error.message,
        variant: "destructive"
      });
      navigate("/admin/tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!task || !task.claimed_by) return;
    
    setProcessing(true);
    try {
      // Start a transaction to update task and create LUV transaction
      const { error: taskError } = await supabase
        .from("tasks")
        .update({ status: "Completed" })
        .eq("id", task.id);

      if (taskError) throw taskError;

      // Create LUV transaction
      const { error: transactionError } = await supabase
        .from("luv_transactions")
        .insert({
          from_user_id: task.claimed_by,
          to_user_id: task.claimed_by,
          task_id: task.id,
          amount: task.reward_luvs,
          description: `Task completion reward: ${task.title}`
        });

      if (transactionError) throw transactionError;

      // Update user's LUV balance
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("luv_balance")
        .eq("id", task.claimed_by)
        .single();

      if (userProfile) {
        await supabase
          .from("profiles")
          .update({ luv_balance: userProfile.luv_balance + task.reward_luvs })
          .eq("id", task.claimed_by);
      }

      toast({
        title: "Task approved successfully",
        description: `${task.reward_luvs} LUVs have been awarded to the user.`
      });

      navigate("/admin/tasks");
    } catch (error: any) {
      toast({
        title: "Error approving task",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!task || !rejectionMessage.trim()) {
      toast({
        title: "Rejection message required",
        description: "Please provide a reason for rejection.",
        variant: "destructive"
      });
      return;
    }
    
    setProcessing(true);
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ 
          status: "Rejected",
          admin_rejection_message: rejectionMessage,
          claimed_by: null // Release the task
        })
        .eq("id", task.id);

      if (error) throw error;

      toast({
        title: "Task rejected",
        description: "The task has been rejected and released for other users."
      });

      navigate("/admin/tasks");
    } catch (error: any) {
      toast({
        title: "Error rejecting task",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

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

  if (loading) {
    return (
      <>
        <AppHeader />
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading task details...</p>
          </div>
        </div>
      </>
    );
  }

  if (!task) {
    return (
      <>
        <AppHeader />
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive">Task Not Found</h1>
            <p className="text-muted-foreground">The requested task could not be found.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AppHeader />
      <div className="container mx-auto px-4 py-6 pb-20">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/tasks")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Review Task Submission</h1>
            <p className="text-muted-foreground">Approve or reject the submitted work</p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Task Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{task.title}</span>
                <Badge className={task.status === "Pending Approval" ? "bg-yellow-500/10 text-yellow-500" : ""}>
                  {task.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{task.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{task.location_address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span>{task.reward_luvs} LUVs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submitted by */}
          {task.profiles && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Submitted by
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{task.profiles.first_name} {task.profiles.last_name}</p>
                <p className="text-muted-foreground">{task.profiles.email}</p>
              </CardContent>
            </Card>
          )}

          {/* Proof Submission */}
          <Card>
            <CardHeader>
              <CardTitle>Work Proof</CardTitle>
            </CardHeader>
            <CardContent>
              {task.proof_text ? (
                <div className="bg-muted p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">{task.proof_text}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">No proof text submitted.</p>
              )}
              
              {task.proof_media && task.proof_media.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Attached Media:</p>
                  {/* Media would be displayed here - placeholder for now */}
                  <p className="text-muted-foreground text-sm">{task.proof_media.length} file(s) attached</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Admin Actions */}
          {task.status === "Pending Approval" && (
            <Card>
              <CardHeader>
                <CardTitle>Admin Review</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rejection">Rejection Message (if rejecting)</Label>
                  <Textarea
                    id="rejection"
                    value={rejectionMessage}
                    onChange={(e) => setRejectionMessage(e.target.value)}
                    placeholder="Provide detailed feedback on why the work is being rejected..."
                    rows={4}
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={handleApprove}
                    disabled={processing}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {processing ? "Approving..." : "Approve & Award LUVs"}
                  </Button>
                  <Button
                    onClick={handleReject}
                    disabled={processing || !rejectionMessage.trim()}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {processing ? "Rejecting..." : "Reject Submission"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default TaskApproval;