import React from 'react';
import { cn } from '../../utils/cn';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  helperText?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  className,
  id,
  helperText,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-ink-secondary mb-1.5">
          {label}
        </label>
      )}

      <select
        id={selectId}
        className={cn(
          'block w-full rounded-lg border bg-surface px-3.5 py-2.5 text-sm text-ink transition-colors focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent disabled:opacity-60 cursor-pointer',
          error
            ? 'border-danger focus:border-danger focus:ring-danger'
            : 'border-border focus:border-accent',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-surface text-ink">
            {opt.label}
          </option>
        ))}
      </select>

      {error ? (
        <p className="mt-1.5 text-xs text-danger font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-ink-muted">{helperText}</p>
      ) : null}
    </div>
  );
};
