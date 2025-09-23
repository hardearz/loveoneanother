import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Award, Phone, Mail, Edit, Save, X, Lock } from "lucide-react";

const Profile = () => {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || "",
    last_name: profile?.last_name || "",
    phone_number: profile?.phone_number || "",
    email: profile?.email || "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSave = async () => {
    if (!profile) return;
    
    setLoading(true);
    try {
      // Update email in Supabase Auth if it changed
      if (formData.email !== profile.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: formData.email,
        });
        
        if (emailError) throw emailError;
      }

      // Update profile in database
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone_number: formData.phone_number || null,
          email: formData.email,
        })
        .eq("id", profile.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: formData.email !== profile.email 
          ? "Your profile has been updated successfully. Please check your new email for confirmation."
          : "Your profile has been updated successfully.",
      });

      await refreshProfile();
      setEditing(false);
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: profile?.first_name || "",
      last_name: profile?.last_name || "",
      phone_number: profile?.phone_number || "",
      email: profile?.email || "",
    });
    setEditing(false);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordChange = async () => {
    if (!profile) return;
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // First verify current password by attempting to sign in with it
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: passwordData.currentPassword,
      });

      if (verifyError) {
        toast({
          title: "Error",
          description: "Current password is incorrect",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setChangingPassword(false);
    } catch (error: any) {
      toast({
        title: "Error updating password",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordCancel = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setChangingPassword(false);
  };

  if (!profile) {
    return (
      <>
        <AppHeader />
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading profile...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AppHeader />
      <div className="container mx-auto px-4 py-6 pb-20">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-muted-foreground">Manage your account information</p>
          </div>

          {/* Profile Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </div>
                {!editing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {editing ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        value={formData.first_name}
                        onChange={(e) => handleChange("first_name", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        value={formData.last_name}
                        onChange={(e) => handleChange("last_name", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Phone Number</Label>
                    <Input
                      id="phone_number"
                      value={formData.phone_number}
                      onChange={(e) => handleChange("phone_number", e.target.value)}
                      placeholder="Enter your phone number (optional)"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex-1"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">First Name</p>
                      <p className="text-lg">{profile.first_name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Last Name</p>
                      <p className="text-lg">{profile.last_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.email}</span>
                  </div>

                  {profile.phone_number && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.phone_number}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'}>
                      {profile.role === 'admin' ? 'Administrator' : 'User'}
                    </Badge>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* LUV Balance - Only show for regular users */}
          {profile.role === 'user' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  LUV Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-4xl font-bold text-primary">{profile.luv_balance}</p>
                  <p className="text-muted-foreground">LUVs available</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                <p>{new Date(profile.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                <p>{new Date(profile.updated_at).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Password Change */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Change Password
                </div>
                {!changingPassword && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setChangingPassword(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {changingPassword ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      placeholder="Enter your current password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      placeholder="Enter your new password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      placeholder="Confirm your new password"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handlePasswordChange}
                      disabled={loading}
                      className="flex-1"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? "Updating..." : "Update Password"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handlePasswordCancel}
                      disabled={loading}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">
                  Click "Change Password" to update your account password. You'll need to enter your current password and your new password twice for confirmation.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Profile;