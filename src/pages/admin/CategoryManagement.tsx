import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Plus, 
  Folder, 
  Edit, 
  Trash2,
  Save,
  X,
  AlertCircle
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  created_at: string;
  task_count?: number;
}

const CategoryManagement = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingNew, setCreatingNew] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchCategories();
    }
  }, [profile]);

  const fetchCategories = async () => {
    try {
      // Get categories with task counts
      const { data, error } = await supabase
        .from("categories")
        .select(`
          *,
          tasks:tasks(count)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Process the data to add task counts
      const categoriesWithCounts = data.map(category => ({
        ...category,
        task_count: category.tasks?.[0]?.count || 0
      }));

      setCategories(categoriesWithCounts);
    } catch (error: any) {
      toast({
        title: "Error loading categories",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Category name required",
        description: "Please enter a name for the category.",
        variant: "destructive",
      });
      return;
    }

    setCreatingNew(true);
    try {
      const { data, error } = await supabase
        .from("categories")
        .insert({ name: newCategoryName.trim() })
        .select()
        .single();

      if (error) throw error;

      setCategories([{ ...data, task_count: 0 }, ...categories]);
      setNewCategoryName("");
      
      toast({
        title: "Category created",
        description: `"${data.name}" has been added successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Error creating category",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCreatingNew(false);
    }
  };

  const handleEditCategory = async (categoryId: string) => {
    if (!editingName.trim()) {
      toast({
        title: "Category name required",
        description: "Please enter a name for the category.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("categories")
        .update({ name: editingName.trim() })
        .eq("id", categoryId);

      if (error) throw error;

      setCategories(categories.map(cat => 
        cat.id === categoryId 
          ? { ...cat, name: editingName.trim() }
          : cat
      ));

      setEditingId(null);
      setEditingName("");

      toast({
        title: "Category updated",
        description: "The category has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating category",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    const category = categories.find(c => c.id === categoryId);
    
    if (category && category.task_count > 0) {
      toast({
        title: "Cannot delete category",
        description: `"${categoryName}" has ${category.task_count} task(s). Please reassign or remove the tasks first.`,
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete the category "${categoryName}"?`)) {
      return;
    }

    setDeleting(categoryId);
    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", categoryId);

      if (error) throw error;

      setCategories(categories.filter(cat => cat.id !== categoryId));

      toast({
        title: "Category deleted",
        description: `"${categoryName}" has been removed.`,
      });
    } catch (error: any) {
      toast({
        title: "Error deleting category",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditingName(category.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
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
            <p className="text-muted-foreground mt-2">Loading categories...</p>
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
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Folder className="h-8 w-8" />
                Category Management
              </h1>
              <p className="text-muted-foreground">Organize tasks by creating and managing categories</p>
            </div>
          </div>

          {/* Create New Category */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="new-category">Category Name</Label>
                  <Input
                    id="new-category"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Enter category name..."
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateCategory()}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleCreateCategory}
                    disabled={creatingNew || !newCategoryName.trim()}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {creatingNew ? "Creating..." : "Create"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Categories List */}
          <Card>
            <CardHeader>
              <CardTitle>Existing Categories ({categories.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {categories.length === 0 ? (
                <div className="text-center py-8">
                  <Folder className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No categories yet</h3>
                  <p className="text-muted-foreground">Create your first category to start organizing tasks.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Folder className="h-5 w-5 text-muted-foreground" />
                        
                        {editingId === category.id ? (
                          <div className="flex-1 flex gap-2">
                            <Input
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') handleEditCategory(category.id);
                                if (e.key === 'Escape') cancelEdit();
                              }}
                              className="flex-1"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              onClick={() => handleEditCategory(category.id)}
                              disabled={!editingName.trim()}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEdit}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className="flex-1">
                              <h3 className="font-medium">{category.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                Created {new Date(category.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            
                            <Badge variant="secondary" className="ml-auto mr-4">
                              {category.task_count} task{category.task_count !== 1 ? 's' : ''}
                            </Badge>
                          </>
                        )}
                      </div>

                      {editingId !== category.id && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEdit(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteCategory(category.id, category.name)}
                            disabled={deleting === category.id}
                            className={category.task_count > 0 ? "text-muted-foreground" : "text-red-600 hover:text-red-700"}
                          >
                            {deleting === category.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                            ) : category.task_count > 0 ? (
                              <AlertCircle className="h-4 w-4" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Help Text */}
          <Card className="bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900">Category Management Tips:</p>
                  <ul className="text-blue-700 mt-1 space-y-1">
                    <li>• Categories help organize tasks for easier discovery</li>
                    <li>• Categories with existing tasks cannot be deleted</li>
                    <li>• Users can filter tasks by category when browsing</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default CategoryManagement;