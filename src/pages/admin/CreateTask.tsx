import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Calendar, MapPin, Award } from "lucide-react";

const CreateTask = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location_address: "",
    reward_luvs: "",
    deadline: "",
    category_id: ""
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("*");
    setCategories(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profile?.role !== 'admin') return;
    
    setLoading(true);
    try {
      const { error } = await supabase.from("tasks").insert({
        ...formData,
        reward_luvs: parseInt(formData.reward_luvs),
        deadline: new Date(formData.deadline).toISOString()
      });

      if (error) throw error;

      toast({
        title: "Task created successfully",
        description: "The task is now available for users to claim."
      });
      
      navigate("/admin/tasks");
    } catch (error: any) {
      toast({
        title: "Error creating task",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <AppHeader />
      <div className="container mx-auto px-4 py-6 pb-20">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/tasks")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Create New Task</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Task Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Enter task title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Detailed task description"
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category_id} onValueChange={(value) => handleChange("category_id", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={formData.location_address}
                    onChange={(e) => handleChange("location_address", e.target.value)}
                    placeholder="Task location address"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reward" className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Reward (LUVs)
                  </Label>
                  <Input
                    id="reward"
                    type="number"
                    min="1"
                    value={formData.reward_luvs}
                    onChange={(e) => handleChange("reward_luvs", e.target.value)}
                    placeholder="Enter reward amount"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Deadline
                </Label>
                <Input
                  id="deadline"
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={(e) => handleChange("deadline", e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Creating..." : "Create Task"}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate("/admin/tasks")}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default CreateTask;