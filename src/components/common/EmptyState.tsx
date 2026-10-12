import React from 'react';
import { Button } from './Button';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-dashed border-border rounded-xl bg-surface/50">
      <div className="w-12 h-12 rounded-xl bg-surface-subtle border border-border flex items-center justify-center text-ink-muted mb-3.5 shadow-subtle">
        <Icon className="w-5 h-5 text-accent" />
      </div>
      <h3 className="text-base font-semibold text-ink mb-1 font-sans">{title}</h3>
      <p className="text-sm text-ink-secondary max-w-sm mb-5 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} variant="primary" size="md">
          {actionText}
        </Button>
      )}
    </div>
  );
};
