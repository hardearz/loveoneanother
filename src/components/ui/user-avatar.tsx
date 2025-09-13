import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';

interface UserAvatarProps {
  firstName?: string;
  lastName?: string;
  profilePhoto?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  firstName = '',
  lastName = '',
  profilePhoto,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  };

  const getInitials = () => {
    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();
    return firstInitial + lastInitial || '?';
  };

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      {profilePhoto && (
        <AvatarImage src={profilePhoto} alt={`${firstName} ${lastName}`} />
      )}
      <AvatarFallback className="bg-primary text-primary-foreground font-medium">
        {getInitials() !== '?' ? getInitials() : <User className="h-4 w-4" />}
      </AvatarFallback>
    </Avatar>
  );
};