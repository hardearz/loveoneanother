import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Gift, Calendar, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CreateRedemptionItem = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    partner_name: "",
    price_in_luvs: "",
    redemption_code: "",
    validity_start: "",
    validity_end: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.partner_name || 
        !formData.price_in_luvs || !formData.validity_start || !formData.validity_end) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (new Date(formData.validity_start) >= new Date(formData.validity_end)) {
      toast({
        title: "Invalid dates",
        description: "End date must be after start date.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("redemption_items")
        .insert({
          name: formData.name,
          description: formData.description,
          partner_name: formData.partner_name,
          price_in_luvs: parseInt(formData.price_in_luvs),
          redemption_code: formData.redemption_code || null,
          validity_start: formData.validity_start,
          validity_end: formData.validity_end,
        });

      if (error) throw error;

      toast({
        title: "Redemption item created",
        description: "The new redemption item has been added successfully.",
      });

      navigate("/admin/redemption");
    } catch (error: any) {
      toast({
        title: "Error creating item",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

  return (
    <>
      <AppHeader />
      <div className="container mx-auto px-4 py-6 pb-20">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Plus className="h-8 w-8" />
              Create Redemption Item
            </h1>
            <p className="text-muted-foreground">Add a new reward item for users to redeem</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Item Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Item Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="e.g., $10 Amazon Gift Card"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="partner_name">Partner/Brand *</Label>
                    <Input
                      id="partner_name"
                      value={formData.partner_name}
                      onChange={(e) => handleChange("partner_name", e.target.value)}
                      placeholder="e.g., Amazon"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Describe what users get when they redeem this item..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price_in_luvs">Price (LUVs) *</Label>
                    <Input
                      id="price_in_luvs"
                      type="number"
                      min="1"
                      value={formData.price_in_luvs}
                      onChange={(e) => handleChange("price_in_luvs", e.target.value)}
                      placeholder="e.g., 100"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="redemption_code">Redemption Code</Label>
                    <Input
                      id="redemption_code"
                      value={formData.redemption_code}
                      onChange={(e) => handleChange("redemption_code", e.target.value)}
                      placeholder="Optional code users receive"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="validity_start">Valid From *</Label>
                    <Input
                      id="validity_start"
                      type="datetime-local"
                      value={formData.validity_start}
                      onChange={(e) => handleChange("validity_start", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="validity_end">Valid Until *</Label>
                    <Input
                      id="validity_end"
                      type="datetime-local"
                      value={formData.validity_end}
                      onChange={(e) => handleChange("validity_end", e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? "Creating..." : "Create Item"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/admin/redemption")}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default CreateRedemptionItem;