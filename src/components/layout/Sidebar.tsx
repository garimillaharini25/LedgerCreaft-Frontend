import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Wallet,
  Tags,
  Bell,
  User as UserIcon,
  Settings,
  LogOut,
  Info,
  X,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { cn } from '../../utils/cn';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Expenses', path: '/expenses', icon: Receipt },
    { label: 'Budgets', path: '/budgets', icon: Wallet },
    { label: 'Analytics', path: '/analytics', icon: PieChart },
    { label: 'Categories', path: '/categories', icon: Tags },
    { label: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
    { label: 'Profile', path: '/profile', icon: UserIcon },
    { label: 'Settings', path: '/settings', icon: Settings },
    { label: 'About', path: '/about', icon: Info },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar drawer */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-40 w-64 bg-surface border-r border-border flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-border">
          <NavLink to="/dashboard" onClick={onClose} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent text-accent-contrast flex items-center justify-center font-bold shadow-subtle">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <span className="font-display font-semibold text-lg text-ink leading-tight tracking-tight block">
                Expense Tracker
              </span>
              <span className="text-[11px] text-ink-muted uppercase tracking-wider font-sans font-medium">
                Personal Ledger
              </span>
            </div>
          </NavLink>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-md text-ink-muted hover:text-ink hover:bg-surface-elevated transition-colors"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150',
                  isActive
                    ? 'bg-accent-subtle text-accent font-semibold'
                    : 'text-ink-secondary hover:text-ink hover:bg-surface-elevated'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <item.icon
                      className={cn(
                        'w-4 h-4 transition-colors',
                        isActive ? 'text-accent' : 'text-ink-muted'
                      )}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-danger text-white tabular-nums">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User profile & Logout footer */}
        <div className="p-3.5 border-t border-border bg-surface-elevated/50">
          <div className="flex items-center gap-3 mb-2.5 px-1.5">
            <div className="w-8 h-8 rounded-full bg-surface border border-border text-accent flex items-center justify-center font-semibold text-xs shadow-subtle shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-ink truncate leading-tight">{user?.name}</p>
              <p className="text-xs text-ink-muted truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger-subtle rounded-md transition-colors cursor-pointer border border-transparent hover:border-danger/20"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
