import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal dialog */}
        <div
          className={cn(
            'relative transform overflow-hidden rounded-xl bg-surface text-left shadow-card transition-all w-full border border-border p-6 z-10 text-ink',
            maxWidthClasses[maxWidth]
          )}
        >
          <div className="flex items-start justify-between pb-3.5 border-b border-border">
            <div>
              <h3 className="text-base font-semibold text-ink font-sans">{title}</h3>
              {description && (
                <p className="mt-1 text-xs text-ink-muted leading-relaxed">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-ink-muted hover:text-ink hover:bg-surface-elevated transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4">{children}</div>
        </div>
      </div>
    </div>
  );
};
