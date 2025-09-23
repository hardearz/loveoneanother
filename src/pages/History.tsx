import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AppHeader } from "@/components/layout/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  History as HistoryIcon, 
  Award, 
  CheckCircle, 
  Clock, 
  XCircle, 
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  MapPin,
  Download,
  FileText
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { pdf } from '@react-pdf/renderer';
import { VolunteerResumeDocument } from "@/components/pdf/VolunteerResumeDocument";

interface TaskHistory {
  id: string;
  title: string;
  description: string;
  location_address: string;
  reward_luvs: number;
  deadline: string;
  status: string;
  proof_text?: string;
  admin_rejection_message?: string;
  created_at: string;
  categories?: {
    name: string;
  };
}

interface LuvTransaction {
  id: string;
  amount: number;
  description: string;
  created_at: string;
  task_id?: string;
  tasks?: {
    title: string;
  };
}

const History = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [tasks, setTasks] = useState<TaskHistory[]>([]);
  const [transactions, setTransactions] = useState<LuvTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchHistory();
    }
  }, [profile]);

  const fetchHistory = async () => {
    try {
      // Fetch task history with category information
      const { data: taskData, error: taskError } = await supabase
        .from("tasks")
        .select(`
          *,
          categories (
            name
          )
        `)
        .eq("claimed_by", profile?.id)
        .order("created_at", { ascending: false });

      if (taskError) throw taskError;

      // Fetch LUV transactions - include both earnings (to_user_id) and redemptions (from_user_id)
      const { data: transactionData, error: transactionError } = await supabase
        .from("luv_transactions")
        .select(`
          *,
          tasks (
            title
          )
        `)
        .or(`to_user_id.eq.${profile?.id},from_user_id.eq.${profile?.id}`)
        .order("created_at", { ascending: false });

      if (transactionError) throw transactionError;

      setTasks(taskData || []);
      setTransactions(transactionData || []);
    } catch (error: any) {
      toast({
        title: "Error loading history",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      const blob = await pdf(
        <VolunteerResumeDocument 
          profile={profile} 
          completedTasks={completedTasks} 
        />
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${profile.first_name}_${profile.last_name}_Volunteer_Resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "PDF Generated Successfully",
        description: "Your volunteer resume has been downloaded.",
      });
    } catch (error: any) {
      toast({
        title: "Error generating PDF",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const completedTasks = tasks.filter(task => task.status === 'Completed');
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return (
          <Badge className="bg-green-500/10 text-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "Pending Approval":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-500">
            <Clock className="h-3 w-3 mr-1" />
            Pending Review
          </Badge>
        );
      case "Rejected":
        return (
          <Badge className="bg-red-500/10 text-red-500">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      case "Claimed":
        return (
          <Badge className="bg-blue-500/10 text-blue-500">
            <Clock className="h-3 w-3 mr-1" />
            In Progress
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (!profile) {
    return (
      <>
        <AppHeader />
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading...</p>
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
            <p className="text-muted-foreground mt-2">Loading your history...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AppHeader />
      <div className="container mx-auto px-4 py-6 pb-20">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
                <HistoryIcon className="h-8 w-8" />
                Work History
              </h1>
              <p className="text-muted-foreground">Track your completed tasks and earned LUVs</p>
          </div>

          {/* PDF Export Info */}
          {completedTasks.length > 0 && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900">Professional Volunteer Resume</p>
                    <p className="text-blue-700 mt-1">
                      Export your completed volunteer work as a professional PDF resume. Perfect for job applications, college admissions, or showcasing your community contributions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
            
            {/* Export to PDF Button */}
            {completedTasks.length > 0 && (
              <div className="flex flex-col items-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportPDF}
                  disabled={loading}
                  className="flex items-center gap-2 shadow-sm hover:shadow-md transition-shadow"
                >
                  <Download className="h-4 w-4" />
                  Export Resume PDF
                </Button>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <FileText className="h-3 w-3" />
                  <span>{completedTasks.length} completed task{completedTasks.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            )}
          </div>

          <Tabs defaultValue="tasks" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tasks">Task History</TabsTrigger>
              <TabsTrigger value="transactions">LUV Transactions</TabsTrigger>
            </TabsList>

            <TabsContent value="tasks" className="space-y-4">
              {tasks.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No tasks yet</h3>
                    <p className="text-muted-foreground">
                      Start claiming and completing tasks to see your history here.
                    </p>
                    <Button 
                      className="mt-4" 
                      onClick={() => navigate("/tasks")}
                    >
                      Find Tasks
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                tasks.map((task) => (
                  <Card key={task.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{task.title}</span>
                        {getStatusBadge(task.status)}
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

                      {task.status === "Rejected" && task.admin_rejection_message && (
                        <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                          <p className="text-red-600 font-medium text-sm">Rejection Reason:</p>
                          <p className="text-red-600 text-sm">{task.admin_rejection_message}</p>
                        </div>
                      )}

                      {task.status === "Claimed" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => navigate(`/tasks/${task.id}/submit`)}
                          >
                            Submit Proof
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/tasks/${task.id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground">
                        Claimed on {new Date(task.created_at).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="transactions" className="space-y-4">
              {transactions.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No transactions yet</h3>
                    <p className="text-muted-foreground">
                      Complete tasks to start earning LUVs and see your transaction history.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                transactions.map((transaction) => {
                  // Extract redemption code if present in description
                  const codeMatch = transaction.description.match(/Code: ([^|]+)/);
                  const redemptionCode = codeMatch ? codeMatch[1].trim() : null;
                  const isRedemption = transaction.amount < 0;
                  
                  return (
                    <Card key={transaction.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${isRedemption ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                              {isRedemption ? (
                                <ArrowUpRight className="h-4 w-4 text-red-500" />
                              ) : (
                                <ArrowDownLeft className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{transaction.description.split(' | ')[0]}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(transaction.created_at).toLocaleDateString()} at{" "}
                                {new Date(transaction.created_at).toLocaleTimeString()}
                              </p>
                              {transaction.tasks?.title && (
                                <p className="text-sm text-muted-foreground">
                                  Task: {transaction.tasks.title}
                                </p>
                              )}
                              {redemptionCode && (
                                <div className="mt-2 p-2 bg-muted rounded border-l-4 border-primary">
                                  <p className="text-sm font-medium text-primary">Redemption Code:</p>
                                  <p className="font-mono text-sm bg-background px-2 py-1 rounded mt-1 border">
                                    {redemptionCode}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    💡 Save this code for your redemption
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-bold ${isRedemption ? 'text-red-600' : 'text-green-600'}`}>
                              {isRedemption ? '' : '+'}{transaction.amount} LUVs
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default History;