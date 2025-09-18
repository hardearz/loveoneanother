import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Upload, CheckCircle, Clock, MapPin, Calendar, Award } from "lucide-react";

interface TaskData {
  id: string;
  title: string;
  description: string;
  location_address: string;
  reward_luvs: number;
  deadline: string;
  status: string;
  claimed_by?: string;
  proof_text?: string;
}

const TaskSubmit = () => {
  const { id } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [task, setTask] = useState<TaskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [proofText, setProofText] = useState("");

  useEffect(() => {
    if (id) {
      fetchTask();
    }
  }, [id]);

  const fetchTask = async () => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      
      // Check if user has permission to submit
      if (data.claimed_by !== profile?.id) {
        toast({
          title: "Access denied",
          description: "You can only submit proof for tasks you have claimed.",
          variant: "destructive"
        });
        navigate("/tasks");
        return;
      }

      setTask(data);
      setProofText(data.proof_text || "");
    } catch (error: any) {
      toast({
        title: "Error fetching task",
        description: error.message,
        variant: "destructive"
      });
      navigate("/tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!task || !proofText.trim()) {
      toast({
        title: "Proof required",
        description: "Please provide a description of the work you completed.",
        variant: "destructive"
      });
      return;
    }
    
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ 
          proof_text: proofText,
          status: "Pending Approval"
        })
        .eq("id", task.id);

      if (error) throw error;

      toast({
        title: "Proof submitted successfully",
        description: "Your work has been submitted for admin review. You'll be notified once it's approved."
      });

      navigate("/tasks");
    } catch (error: any) {
      toast({
        title: "Error submitting proof",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

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

  const isAlreadySubmitted = task.status === "Pending Approval" || task.status === "Completed" || task.status === "Rejected";

  return (
    <>
      <AppHeader />
      <div className="container mx-auto px-4 py-6 pb-20">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/tasks/${task.id}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Submit Work Proof</h1>
            <p className="text-muted-foreground">Provide evidence of your completed work</p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Task Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{task.title}</span>
                <Badge className={
                  task.status === "Claimed" ? "bg-blue-500/10 text-blue-500" :
                  task.status === "Pending Approval" ? "bg-yellow-500/10 text-yellow-500" :
                  task.status === "Completed" ? "bg-green-500/10 text-green-500" :
                  "bg-red-500/10 text-red-500"
                }>
                  {task.status === "Pending Approval" && <Clock className="h-3 w-3 mr-1" />}
                  {task.status === "Completed" && <CheckCircle className="h-3 w-3 mr-1" />}
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

          {/* Proof Submission Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Work Proof
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isAlreadySubmitted ? (
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-medium mb-2">Your submitted proof:</p>
                    <p className="whitespace-pre-wrap">{task.proof_text}</p>
                  </div>
                  
                  {task.status === "Pending Approval" && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-600">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">Awaiting Review</span>
                      </div>
                      <p className="text-sm mt-1">Your work has been submitted and is being reviewed by an administrator.</p>
                    </div>
                  )}
                  
                  {task.status === "Completed" && (
                    <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-medium">Work Approved</span>
                      </div>
                      <p className="text-sm mt-1">Congratulations! Your work has been approved and {task.reward_luvs} LUVs have been added to your account.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="proof">Describe the work you completed</Label>
                    <Textarea
                      id="proof"
                      value={proofText}
                      onChange={(e) => setProofText(e.target.value)}
                      placeholder="Provide detailed description of what you did, how you completed the task, any challenges faced, and any additional relevant information..."
                      rows={8}
                      className="min-h-[200px]"
                    />
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
                    <p className="text-sm text-blue-600">
                      <strong>Tip:</strong> Provide as much detail as possible about your work. 
                      Include what you did, how you did it, and any observations or results. 
                      This helps administrators quickly approve your submission.
                    </p>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      onClick={handleSubmit}
                      disabled={submitting || !proofText.trim()}
                      className="flex-1"
                    >
                      {submitting ? "Submitting..." : "Submit Work Proof"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/tasks/${task.id}`)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default TaskSubmit;