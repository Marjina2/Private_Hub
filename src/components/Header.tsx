import React from 'react';
import { Moon, Sun, LogOut, Shield, Settings, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const { logout, isAdmin, currentUser, pendingInvitations } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <header className="backdrop-blur-lg bg-white/10 dark:bg-black/20 border-b border-white/20">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Private Hub</h1>
            {currentUser && (
              <p className="text-xs text-slate-300">Welcome, {currentUser.name}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Notifications */}
          {pendingInvitations.length > 0 && (
            <button
              onClick={() => navigate('/invitations')}
              className="relative p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              title={`${pendingInvitations.length} pending invitation(s)`}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {pendingInvitations.length}
              </span>
            </button>
          )}

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Admin Panel"
            >
              <Settings className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={handleLogout}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
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