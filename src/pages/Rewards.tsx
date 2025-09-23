import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Award, 
  Gift, 
  Calendar, 
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

const Rewards = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [items, setItems] = useState<RedemptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  useEffect(() => {
    fetchRedemptionItems();
  }, []);

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
        title: "Error loading rewards",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (item: RedemptionItem) => {
    if (!profile || profile.luv_balance < item.price_in_luvs) {
      toast({
        title: "Insufficient LUVs",
        description: `You need ${item.price_in_luvs} LUVs to redeem this item.`,
        variant: "destructive",
      });
      return;
    }

    setRedeeming(item.id);
    try {
      // Update user's LUV balance
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ 
          luv_balance: profile.luv_balance - item.price_in_luvs 
        })
        .eq("id", profile.id);

      if (updateError) throw updateError;

      // Create transaction record with redemption details
      const { error: transactionError } = await supabase
        .from("luv_transactions")
        .insert({
          from_user_id: profile.id,
          to_user_id: null, // Redemption doesn't have a recipient
          amount: -item.price_in_luvs,
          description: `Redeemed: ${item.name} from ${item.partner_name}${item.redemption_code ? ` | Code: ${item.redemption_code}` : ''}`
        });

      if (transactionError) throw transactionError;

      toast({
        title: "Redemption successful! 🎉",
        description: item.redemption_code 
          ? `You've redeemed ${item.name}. Your redemption code: ${item.redemption_code}. This code is also saved in your transaction history.`
          : `You've redeemed ${item.name}. Check your email for details and view your transaction history for records.`,
        duration: 10000, // 10 seconds to give time to read and copy the code
      });

      // Refresh profile to update balance
      await new Promise(resolve => setTimeout(resolve, 500));
      window.location.reload();

    } catch (error: any) {
      toast({
        title: "Redemption failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setRedeeming(null);
    }
  };

  const isItemValid = (item: RedemptionItem) => {
    const now = new Date();
    const validFrom = new Date(item.validity_start);
    const validUntil = new Date(item.validity_end);
    return now >= validFrom && now <= validUntil;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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
            <p className="text-muted-foreground mt-2">Loading rewards...</p>
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
          <div className="text-center">
            <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
              <Gift className="h-8 w-8" />
              Rewards
            </h1>
            <p className="text-muted-foreground">Redeem your LUVs for amazing rewards</p>
          </div>

          {/* User's LUV Balance */}
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Your LUV Balance</p>
                  <p className="text-3xl font-bold text-primary">{profile.luv_balance} LUVs</p>
                </div>
                <Award className="h-12 w-12 text-primary/60" />
              </div>
            </CardContent>
          </Card>

          {/* Rewards Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Gift className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No rewards available</h3>
                <p className="text-muted-foreground">Check back soon for new redemption items!</p>
              </div>
            ) : (
              items.map((item) => {
                const isValid = isItemValid(item);
                const canAfford = profile.luv_balance >= item.price_in_luvs;
                const canRedeem = isValid && canAfford;

                return (
                  <Card key={item.id} className={`relative ${!isValid ? 'opacity-60' : ''}`}>
                    {!isValid && (
                      <Badge className="absolute top-2 right-2 bg-red-500/10 text-red-500">
                        <Clock className="h-3 w-3 mr-1" />
                        Expired
                      </Badge>
                    )}
                    
                    <CardHeader>
                      <CardTitle className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold">{item.name}</h3>
                          <p className="text-sm text-muted-foreground font-normal">
                            by {item.partner_name}
                          </p>
                        </div>
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
                        
                        <div className="text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Valid: {formatDate(item.validity_start)} - {formatDate(item.validity_end)}
                          </div>
                        </div>
                      </div>

                      {!canAfford && isValid && (
                        <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-2 rounded">
                          <AlertCircle className="h-4 w-4" />
                          <span>Need {item.price_in_luvs - profile.luv_balance} more LUVs</span>
                        </div>
                      )}

                      <Button
                        onClick={() => handleRedeem(item)}
                        disabled={!canRedeem || redeeming === item.id}
                        className="w-full"
                        variant={canRedeem ? "default" : "secondary"}
                      >
                        {redeeming === item.id ? (
                          <>
                            <Clock className="h-4 w-4 mr-2 animate-spin" />
                            Redeeming...
                          </>
                        ) : !isValid ? (
                          <>
                            <Clock className="h-4 w-4 mr-2" />
                            Expired
                          </>
                        ) : !canAfford ? (
                          <>
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Insufficient LUVs
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Redeem Now
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Rewards;