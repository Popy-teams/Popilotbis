import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../ui/utils';
import { ViewHero, type HeroTheme } from './ViewPremium';

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
  badge?: string;
  badgeIcon?: LucideIcon;
  theme?: HeroTheme;
  actions?: ReactNode;
  sidePanel?: ReactNode;
  stats?: ReactNode;
  /** simple = ancien en-tête texte ; premium = bannière hero (défaut) */
  variant?: 'premium' | 'simple';
}

/** En-tête de liste premium (bannière hero) ou simple */
export function ViewHeader({
  title,
  subtitle,
  badge,
  badgeIcon,
  theme = 'indigo',
  actions,
  sidePanel,
  stats,
  variant = 'premium',
}: ViewHeaderProps) {
  if (variant === 'simple') {
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

  return (
    <ViewHero
      title={title}
      subtitle={subtitle}
      badge={badge}
      badgeIcon={badgeIcon}
      theme={theme}
      actions={actions}
      sidePanel={sidePanel}
      stats={stats}
    />
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
