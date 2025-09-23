import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Plus, 
  Gift, 
  Calendar, 
  Award, 
  Edit, 
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RedemptionItem {
  id: string;
  name: string;
  description: string;
  partner_name: string;
  price_in_luvs: number;
  redemption_code?: string;
  validity_start: string;
  validity_end: string;
  created_at: string;
}

const RedemptionManagement = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [items, setItems] = useState<RedemptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchRedemptionItems();
    }
  }, [profile]);

  const fetchRedemptionItems = async () => {
    try {
      const { data, error } = await supabase
        .from("redemption_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading items",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this redemption item?")) {
      return;
    }

    setDeleting(itemId);
    try {
      const { error } = await supabase
        .from("redemption_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      toast({
        title: "Item deleted",
        description: "The redemption item has been removed.",
      });

      setItems(items.filter(item => item.id !== itemId));
    } catch (error: any) {
      toast({
        title: "Error deleting item",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  const getStatusBadge = (item: RedemptionItem) => {
    const now = new Date();
    const validFrom = new Date(item.validity_start);
    const validUntil = new Date(item.validity_end);

    if (now < validFrom) {
      return (
        <Badge className="bg-blue-500/10 text-blue-500">
          <Clock className="h-3 w-3 mr-1" />
          Upcoming
        </Badge>
      );
    } else if (now > validUntil) {
      return (
        <Badge className="bg-red-500/10 text-red-500">
          <AlertCircle className="h-3 w-3 mr-1" />
          Expired
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-green-500/10 text-green-500">
          <CheckCircle className="h-3 w-3 mr-1" />
          Active
        </Badge>
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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
            <p className="text-muted-foreground mt-2">Loading redemption items...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AppHeader />
      <div className="container mx-auto px-4 py-6 pb-20">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Gift className="h-8 w-8" />
                Redemption Management
              </h1>
              <p className="text-muted-foreground">Manage reward items that users can redeem</p>
            </div>
            <Button
              onClick={() => navigate("/admin/redemption/new")}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add New Item
            </Button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                    <p className="text-2xl font-bold">{items.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Items</p>
                    <p className="text-2xl font-bold">
                      {items.filter(item => {
                        const now = new Date();
                        return now >= new Date(item.validity_start) && now <= new Date(item.validity_end);
                      }).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Expired Items</p>
                    <p className="text-2xl font-bold">
                      {items.filter(item => new Date() > new Date(item.validity_end)).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Items Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Gift className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No redemption items</h3>
                <p className="text-muted-foreground mb-4">Create your first redemption item to get started.</p>
                <Button onClick={() => navigate("/admin/redemption/new")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Item
                </Button>
              </div>
            ) : (
              items.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <CardTitle className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold">{item.name}</h3>
                        <p className="text-sm text-muted-foreground font-normal">
                          by {item.partner_name}
                        </p>
                      </div>
                      {getStatusBadge(item)}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Price:</span>
                        <div className="flex items-center gap-1">
                          <Award className="h-4 w-4 text-primary" />
                          <span className="font-bold text-primary">{item.price_in_luvs} LUVs</span>
                        </div>
                      </div>
                      
                      {item.redemption_code && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Code:</span>
                          <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                            {item.redemption_code}
                          </span>
                        </div>
                      )}
                      
                      <div className="text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Valid: {formatDate(item.validity_start)} - {formatDate(item.validity_end)}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => navigate(`/admin/redemption/${item.id}/edit`)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        disabled={deleting === item.id}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default RedemptionManagement;