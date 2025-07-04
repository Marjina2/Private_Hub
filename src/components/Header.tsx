import React from 'react';
import { Moon, Sun, LogOut, Shield } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const { logout } = useAuth();

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
    }
  };

  return (
    <header className="backdrop-blur-lg bg-white/10 dark:bg-black/20 border-b border-white/20">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Private Hub</h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <button
            onClick={handleLogout}
            className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 hover:text-white transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;