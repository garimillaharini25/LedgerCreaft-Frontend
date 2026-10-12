import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  type = 'text',
  className,
  id,
  value,
  helperText,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

  const actualType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full">
      <label htmlFor={inputId} className="block text-xs font-semibold text-ink-secondary mb-1.5">
        {label}
      </label>

      <div className="relative group">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-muted group-focus-within:text-accent transition-colors">
            {icon}
          </div>
        )}

        <input
          id={inputId}
          type={actualType}
          value={value}
          className={cn(
            'block w-full rounded-lg border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent disabled:bg-surface-elevated disabled:opacity-60',
            icon ? 'pl-10' : 'pl-3.5',
            isPassword ? 'pr-10' : 'pr-3.5',
            error
              ? 'border-danger focus:border-danger focus:ring-danger'
              : 'border-border focus:border-accent',
            className
          )}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-ink-muted hover:text-ink focus:outline-none cursor-pointer"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>

      {error ? (
        <p className="mt-1.5 text-xs text-danger font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-ink-muted">{helperText}</p>
      ) : null}
    </div>
  );
};
