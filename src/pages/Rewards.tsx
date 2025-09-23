import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
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

interface UserRedemption {
  id: string;
  redemption_item_id: string;
  redeemed_at: string;
  luvs_spent: number;
}

const Rewards = () => {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [items, setItems] = useState<RedemptionItem[]>([]);
  const [userRedemptions, setUserRedemptions] = useState<UserRedemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [redemptionSuccess, setRedemptionSuccess] = useState<{
    show: boolean;
    item: RedemptionItem | null;
    redemptionCode: string | null;
  }>({ show: false, item: null, redemptionCode: null });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Use the secure function to fetch public redemption items (no codes exposed)
      const { data: itemsData, error: itemsError } = await supabase
        .rpc("get_public_redemption_items");

      if (itemsError) throw itemsError;

      // Fetch user's redemptions to know which codes they can see
      const { data: redemptionsData, error: redemptionsError } = await supabase
        .from("user_redemptions")
        .select(`
          *,
          redemption_items(*)
        `)
        .order("redeemed_at", { ascending: false });

      if (redemptionsError) throw redemptionsError;

      // For items the user has redeemed, merge with the full details including codes
      let itemsWithCodes = itemsData || [];
      if (redemptionsData && redemptionsData.length > 0) {
        // Create a map of redeemed items with their full data (including codes)
        const redeemedItemsMap = new Map();
        redemptionsData.forEach(redemption => {
          if (redemption.redemption_items) {
            redeemedItemsMap.set(redemption.redemption_item_id, redemption.redemption_items);
          }
        });

        // Merge the data - replace items the user has redeemed with full data including codes
        itemsWithCodes = itemsData.map(item => {
          const redeemedItem = redeemedItemsMap.get(item.id);
          return redeemedItem || item; // Use redeemed item data if available, otherwise use public data
        });
      }

      setItems(itemsWithCodes);
      setUserRedemptions(redemptionsData || []);
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
      // Use the secure redemption function
      const { data, error } = await supabase.rpc('redeem_item', {
        item_id: item.id
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; redemption_code?: string; redemption_id?: string };

      if (!result.success) {
        throw new Error(result.error || 'Redemption failed');
      }

      // Show success dialog with redemption code
      setRedemptionSuccess({ 
        show: true, 
        item, 
        redemptionCode: result.redemption_code || null 
      });

      // Refresh profile and data
      await Promise.all([
        refreshProfile(),
        fetchData()
      ]);

      toast({
        title: "Redemption successful!",
        description: `You've redeemed ${item.name}. Check the dialog for your redemption code.`,
      });

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
                const hasRedeemed = userRedemptions.some(r => r.redemption_item_id === item.id);
                const canRedeem = isValid && canAfford && !hasRedeemed;

                return (
                  <Card key={item.id} className={`relative ${!isValid ? 'opacity-60' : hasRedeemed ? 'border-green-200 bg-green-50/50' : ''}`}>
                    {!isValid && (
                      <Badge className="absolute top-2 right-2 bg-red-500/10 text-red-500">
                        <Clock className="h-3 w-3 mr-1" />
                        Expired
                      </Badge>
                    )}
                    {hasRedeemed && (
                      <Badge className="absolute top-2 right-2 bg-green-500/10 text-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Redeemed
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

                      {!canAfford && isValid && !hasRedeemed && (
                        <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-2 rounded">
                          <AlertCircle className="h-4 w-4" />
                          <span>Need {item.price_in_luvs - profile.luv_balance} more LUVs</span>
                        </div>
                      )}

                      {hasRedeemed && item.redemption_code && (
                        <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                          <p className="text-sm font-medium text-green-800 mb-1">Your Code:</p>
                          <p className="font-mono text-lg font-bold text-green-900 tracking-wider">
                            {item.redemption_code}
                          </p>
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
                        ) : hasRedeemed ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Already Redeemed
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

        {/* Success Dialog */}
        <AlertDialog open={redemptionSuccess.show} onOpenChange={(open) => !open && setRedemptionSuccess({ show: false, item: null, redemptionCode: null })}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-center text-green-600">
                🎉 Redemption Successful!
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center space-y-4">
                <div>
                  <p className="font-medium">You've successfully redeemed:</p>
                  <p className="text-lg font-bold">{redemptionSuccess.item?.name}</p>
                  <p className="text-sm text-muted-foreground">from {redemptionSuccess.item?.partner_name}</p>
                </div>
                
                {redemptionSuccess.redemptionCode && (
                  <div className="bg-muted p-4 rounded-lg border">
                    <p className="font-medium text-primary mb-2">Your Redemption Code:</p>
                    <div className="bg-background p-3 rounded border-2 border-primary/20">
                      <p className="font-mono text-lg font-bold text-center tracking-wider">
                        {redemptionSuccess.redemptionCode}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      💡 Save this code! You can also view it in your redeemed items.
                    </p>
                  </div>
                )}
                
                {!redemptionSuccess.redemptionCode && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm">Check your email for redemption details or contact the partner directly.</p>
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setRedemptionSuccess({ show: false, item: null, redemptionCode: null })}>
                Got it!
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
};

export default Rewards;