import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  CheckCircle,
  AlertTriangle,
  User as UserIcon,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import { formatDate } from '../../utils/formatters';

interface HeaderProps {
  onOpenSidebar: () => void;
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSidebar, title }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead } = useNotifications();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/expenses?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-surface/90 backdrop-blur-sm border-b border-border flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-lg text-ink-secondary hover:text-ink hover:bg-surface-elevated transition-colors"
          aria-label="Open navigation drawer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg sm:text-xl font-display font-semibold text-ink tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative hidden md:block w-48 lg:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search expenses..."
            className="w-full bg-surface-elevated border border-border focus:border-accent focus:ring-1 focus:ring-accent rounded-lg pl-8 pr-3 py-1.5 text-xs text-ink placeholder:text-ink-muted transition-colors"
          />
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-muted" />
        </form>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-ink-secondary hover:text-ink hover:bg-surface-elevated transition-colors cursor-pointer"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          aria-label="Toggle visual theme"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="p-2 rounded-lg text-ink-secondary hover:text-ink hover:bg-surface-elevated transition-colors relative cursor-pointer"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-danger text-white rounded-full text-[10px] font-bold flex items-center justify-center tabular-nums">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface rounded-xl shadow-card border border-border py-3 z-50 text-ink">
              <div className="px-4 pb-2 border-b border-border flex items-center justify-between">
                <span className="font-semibold text-xs text-ink">
                  Notifications ({unreadCount} unread)
                </span>
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    navigate('/notifications');
                  }}
                  className="text-xs text-accent hover:underline font-medium cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-border/60">
                {notifications.length === 0 ? (
                  <p className="p-4 text-xs text-center text-ink-muted">No notifications</p>
                ) : (
                  notifications.slice(0, 4).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className={`p-3.5 hover:bg-surface-elevated cursor-pointer transition-colors ${
                        !n.read ? 'bg-accent-subtle/50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {n.type === 'BUDGET_EXCEEDED' || n.type === 'BUDGET_WARNING' ? (
                          <AlertTriangle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 overflow-hidden">
                          <p className="text-xs font-semibold text-ink truncate">{n.title}</p>
                          <p className="text-xs text-ink-secondary line-clamp-2 mt-0.5 leading-relaxed">{n.message}</p>
                          <p className="text-[11px] text-ink-muted mt-1">{formatDate(n.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu Avatar */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-surface-elevated transition-colors cursor-pointer"
            aria-label="User menu"
          >
            <div className="w-7 h-7 rounded-full bg-accent text-accent-contrast font-bold text-xs flex items-center justify-center shadow-subtle">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-surface rounded-xl shadow-card border border-border py-2 z-50 text-ink">
              <div className="px-4 py-2 border-b border-border">
                <p className="text-xs font-semibold text-ink truncate">{user?.name}</p>
                <p className="text-xs text-ink-muted truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  navigate('/profile');
                }}
                className="w-full text-left px-4 py-2 text-xs text-ink-secondary hover:text-ink hover:bg-surface-elevated flex items-center gap-2 cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5" />
                Profile
              </button>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                }}
                className="w-full text-left px-4 py-2 text-xs text-danger hover:bg-danger-subtle flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
