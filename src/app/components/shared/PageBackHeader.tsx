import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { AppIcon } from './icons';
import { cn } from '../ui/utils';

interface PageBackHeaderProps {
  title: string;
  subtitle?: ReactNode;
  onBack: () => void;
  actions?: ReactNode;
  className?: string;
}

export function PageBackHeader({ title, subtitle, onBack, actions, className }: PageBackHeaderProps) {
  return (
    <div className={cn('view-header mb-4 sm:mb-6', className)}>
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <button
          type="button"
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
          aria-label="Retour"
        >
          <AppIcon icon={ArrowLeft} size="md" className="text-gray-600" />
        </button>
        <div className="min-w-0">
          <h1 className="page-title break-words">{title}</h1>
          {subtitle ? <div className="text-sm sm:text-base text-gray-600 mt-1">{subtitle}</div> : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap gap-2 w-full sm:w-auto sm:shrink-0">{actions}</div> : null}
    </div>
  );
}
