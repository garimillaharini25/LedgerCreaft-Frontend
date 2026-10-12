import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  color?: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  color,
  className,
}) => {
  const variantStyles = {
    default: 'bg-surface-subtle text-ink-secondary border-border',
    success: 'bg-success-subtle text-success border-success/20',
    warning: 'bg-warning-subtle text-warning border-warning/20',
    danger: 'bg-danger-subtle text-danger border-danger/20',
    info: 'bg-accent-subtle text-accent border-accent/20',
  };

  const customStyle = color
    ? {
        backgroundColor: `${color}18`,
        color: color,
        borderColor: `${color}35`,
      }
    : undefined;

  return (
    <span
      style={customStyle}
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border tabular-nums',
        !color && variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
