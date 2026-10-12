import React from 'react';
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  Info,
  ShieldAlert,
  Clock,
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { formatDate } from '../../utils/formatters';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';

export const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'BUDGET_EXCEEDED':
        return <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
      case 'BUDGET_WARNING':
        return <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'SYSTEM':
        return <Info className="w-4 h-4 text-brand-600 dark:text-brand-400" />;
      default:
        return <Bell className="w-4 h-4 text-ink-muted" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-ink tracking-tight">
            Notifications
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            Budget threshold triggers, monthly cap warnings, and system updates.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            leftIcon={<CheckCheck className="w-3.5 h-3.5" />}
          >
            Mark all read ({unreadCount})
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-xs text-ink-muted">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            icon={Bell}
            title="All caught up"
            description="No pending alerts. When a monthly budget reaches its warning threshold, alerts will be logged here."
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card
              key={n.id}
              onClick={() => !n.read && markAsRead(n.id)}
              className={`p-4 transition-colors cursor-pointer ${
                !n.read
                  ? 'border-brand-500/40 bg-brand-500/[0.04]'
                  : 'hover:bg-canvas/50'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded border border-border bg-paper shrink-0 mt-0.5">
                  {getNotificationIcon(n.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3
                      className={`text-sm font-semibold truncate ${
                        !n.read ? 'text-ink' : 'text-ink-muted'
                      }`}
                    >
                      {n.title}
                    </h3>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0" />
                    )}
                  </div>

                  <p className="mt-1 text-xs text-ink-muted leading-relaxed">
                    {n.message}
                  </p>

                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-ink-muted tabular-nums">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(n.createdAt)}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
