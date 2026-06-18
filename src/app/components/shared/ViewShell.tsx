import type { ReactNode } from 'react';
import { cn } from '../ui/utils';

interface ViewShellProps {
  children: ReactNode;
  narrow?: boolean;
  className?: string;
}

/** Conteneur page responsive standard pour tous les onglets */
export function ViewShell({ children, narrow = false, className }: ViewShellProps) {
  return (
    <div className={cn('view-shell', narrow && 'view-shell-narrow', className)}>
      {children}
    </div>
  );
}

interface ViewHeaderProps {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
}

/** En-tete de liste (sans bouton retour) */
export function ViewHeader({ title, subtitle, actions }: ViewHeaderProps) {
  return (
    <div className="view-header">
      <div className="min-w-0">
        <h1 className="page-title">{title}</h1>
        {subtitle ? <div className="text-sm sm:text-base text-gray-600 mt-1">{subtitle}</div> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2 w-full sm:w-auto">{actions}</div> : null}
    </div>
  );
}

/** Grilles responsives reutilisables */
export const viewGrids = {
  stats2: 'grid-stats-2',
  stats3: 'grid-stats-3',
  stats4: 'grid-stats-4',
  stats5: 'grid-stats-5',
  stats6: 'grid-stats-6',
  cards2: 'grid grid-cols-1 md:grid-cols-2 gap-4',
  cards3: 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4',
} as const;

export function TableWrap({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('table-wrap', className)}>{children}</div>;
}
