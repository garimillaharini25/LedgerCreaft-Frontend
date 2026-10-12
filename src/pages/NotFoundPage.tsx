import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-canvas text-ink">
      <div className="text-center space-y-4 max-w-sm">
        <span className="text-xs uppercase tracking-widest text-ink-muted font-mono">Error 404</span>
        <h1 className="text-3xl font-serif font-bold text-ink tracking-tight">Page Not Found</h1>
        <p className="text-xs text-ink-muted leading-relaxed">
          The requested path does not exist or may have been relocated.
        </p>
        <div className="pt-2 flex justify-center">
          <Link to="/dashboard">
            <Button variant="primary" size="md" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
