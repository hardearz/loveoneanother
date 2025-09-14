import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, User, Award, History } from 'lucide-react';

export const BottomNavigation: React.FC = () => {
  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/tasks', icon: Search, label: 'Tasks' },
    { path: '/rewards', icon: Award, label: 'Rewards' },
    { path: '/history', icon: History, label: 'History' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-2 z-50">
      <div className="flex justify-around items-center max-w-lg mx-auto">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs mt-1 font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};