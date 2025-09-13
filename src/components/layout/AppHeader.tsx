import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Button } from '@/components/ui/button';
import { LogOut, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AppHeader: React.FC = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Heart className="h-6 w-6 text-primary" fill="currentColor" />
        <h1 className="text-xl font-bold text-foreground">LOA</h1>
      </div>
      
      <div className="flex items-center space-x-3">
        <button
          onClick={handleProfileClick}
          className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
        >
          <UserAvatar
            firstName={profile?.first_name}
            lastName={profile?.last_name}
            profilePhoto={profile?.profile_photo}
            size="sm"
          />
        </button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSignOut}
          className="text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};