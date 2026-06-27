import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Sparkles } from 'lucide-react';
import { cn } from '../ui/utils';
import { HeroSurfaceContext } from './HeroSurfaceContext';

export type HeroTheme =
  | 'indigo'
  | 'violet'
  | 'emerald'
  | 'rose'
  | 'amber'
  | 'cyan'
  | 'slate'
  | 'red'
  | 'blue';

const THEME_STYLES: Record<
  HeroTheme,
  { border: string; gradient: string; glow1: string; glow2: string }
> = {
  indigo: {
    border: 'border-indigo-200/60',
    gradient: 'from-indigo-950 via-indigo-900 to-violet-900',
    glow1: 'bg-violet-500/20',
    glow2: 'bg-indigo-400/15',
  },
  violet: {
    border: 'border-violet-200/60',
    gradient: 'from-violet-950 via-purple-900 to-indigo-900',
    glow1: 'bg-purple-500/20',
    glow2: 'bg-violet-400/15',
  },
  emerald: {
    border: 'border-emerald-200/60',
    gradient: 'from-emerald-950 via-emerald-900 to-teal-900',
    glow1: 'bg-teal-500/20',
    glow2: 'bg-emerald-400/15',
  },
  rose: {
    border: 'border-rose-200/60',
    gradient: 'from-rose-950 via-rose-900 to-red-900',
    glow1: 'bg-red-500/20',
    glow2: 'bg-rose-400/15',
  },
  amber: {
    border: 'border-amber-200/60',
    gradient: 'from-amber-950 via-orange-900 to-amber-900',
    glow1: 'bg-orange-500/20',
    glow2: 'bg-amber-400/15',
  },
  cyan: {
    border: 'border-cyan-200/60',
    gradient: 'from-cyan-950 via-cyan-900 to-blue-900',
    glow1: 'bg-blue-500/20',
    glow2: 'bg-cyan-400/15',
  },
  slate: {
    border: 'border-slate-300/60',
    gradient: 'from-slate-900 via-slate-800 to-slate-900',
    glow1: 'bg-slate-500/20',
    glow2: 'bg-slate-400/15',
  },
  red: {
    border: 'border-red-200/60',
    gradient: 'from-red-950 via-red-900 to-rose-900',
    glow1: 'bg-rose-500/20',
    glow2: 'bg-red-400/15',
  },
  blue: {
    border: 'border-blue-200/60',
    gradient: 'from-blue-950 via-blue-900 to-indigo-900',
    glow1: 'bg-indigo-500/20',
    glow2: 'bg-blue-400/15',
  },
};

export interface ViewHeroProps {
  title: string;
  subtitle?: ReactNode;
  badge?: string;
  badgeIcon?: LucideIcon;
  theme?: HeroTheme;
  actions?: ReactNode;
  sidePanel?: ReactNode;
  stats?: ReactNode;
  children?: ReactNode;
}

export function ViewHero({
  title,
  subtitle,
  badge,
  badgeIcon: BadgeIcon = Sparkles,
  theme = 'indigo',
  actions,
  sidePanel,
  stats,
  children,
}: ViewHeroProps) {
  const t = THEME_STYLES[theme];

  return (
    <HeroSurfaceContext.Provider value={true}>
      <div
        className={cn(
          'relative overflow-hidden rounded-[1.5rem] border text-white shadow-xl',
          t.border,
          `bg-gradient-to-br ${t.gradient}`,
          theme === 'indigo' && 'shadow-indigo-900/20',
          theme === 'violet' && 'shadow-violet-900/20',
          theme === 'emerald' && 'shadow-emerald-900/20',
          theme === 'rose' && 'shadow-rose-900/20',
          theme === 'red' && 'shadow-red-900/20'
        )}
      >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.12)_0%,_transparent_50%)]" />
      <div className={cn('absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl', t.glow1)} />
      <div className={cn('absolute -bottom-32 -left-16 w-72 h-72 rounded-full blur-3xl', t.glow2)} />

      <div className="relative p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-8">
          <div className="max-w-2xl min-w-0">
            {badge ? (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-medium text-white/90 mb-4 backdrop-blur-sm">
                <BadgeIcon className="w-3.5 h-3.5" />
                {badge}
              </div>
            ) : null}
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">{title}</h1>
            {subtitle ? (
              <div className="mt-3 text-white/80 text-sm sm:text-base leading-relaxed max-w-xl">
                {subtitle}
              </div>
            ) : null}
            {actions ? <div className="mt-6 flex flex-wrap gap-2">{actions}</div> : null}
          </div>
          {sidePanel ? (
            <div className="xl:w-[min(100%,22rem)] shrink-0 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-5">
              {sidePanel}
            </div>
          ) : null}
        </div>

        {stats ? <div className="mt-8">{stats}</div> : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </div>
    </HeroSurfaceContext.Provider>
  );
}

export interface ViewStatCardProps {
  label: string;
  value: string;
  gradient?: string;
  icon?: LucideIcon;
  hint?: string;
  className?: string;
  /** Variante claire pour intégration dans un hero sombre */
  onDark?: boolean;
}

export function ViewStatCard({
  label,
  value,
  gradient = 'from-indigo-500 to-violet-500',
  icon: Icon,
  hint,
  className,
  onDark = false,
}: ViewStatCardProps) {
  if (onDark) {
    return (
      <div
        className={cn(
          'rounded-xl bg-white/10 border border-white/10 p-3 sm:p-4 backdrop-blur-sm',
          className
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wide text-white/70 font-semibold">{label}</p>
            <p className="font-bold text-xl sm:text-2xl mt-1 truncate">{value}</p>
            {hint ? <p className="text-[10px] text-white/60 mt-0.5">{hint}</p> : null}
          </div>
          {Icon ? (
            <div className={cn('p-2 rounded-lg bg-gradient-to-br shrink-0', gradient)}>
              <Icon className="w-4 h-4 text-white" />
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-lg transition-all duration-300 group',
        className
      )}
    >
      <div
        className={cn(
          'absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-20 bg-gradient-to-br group-hover:opacity-30 transition-opacity',
          gradient
        )}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className={cn('text-3xl font-bold mt-2 bg-gradient-to-r bg-clip-text text-transparent', gradient)}>
            {value}
          </p>
          {hint ? <p className="text-xs text-slate-400 mt-1">{hint}</p> : null}
        </div>
        {Icon ? (
          <div className={cn('p-2.5 rounded-xl bg-gradient-to-br text-white shadow-md shrink-0', gradient)}>
            <Icon className="w-5 h-5" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function ViewStatsGrid({
  children,
  cols = 4,
  className,
}: {
  children: ReactNode;
  cols?: 2 | 3 | 4 | 5 | 6;
  className?: string;
}) {
  const gridClass = {
    2: 'grid grid-cols-2 gap-4',
    3: 'grid grid-cols-1 sm:grid-cols-3 gap-4',
    4: 'grid grid-cols-2 lg:grid-cols-4 gap-4',
    5: 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4',
    6: 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4',
  }[cols];

  return <div className={cn(gridClass, className)}>{children}</div>;
}

export function ViewSectionTitle({
  icon: Icon,
  title,
  count,
  action,
}: {
  icon: LucideIcon;
  title: string;
  count?: number;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h2 className="font-bold text-slate-900 text-lg tracking-tight">{title}</h2>
          {count !== undefined ? (
            <p className="text-xs text-slate-500">
              {count} élément{count > 1 ? 's' : ''}
            </p>
          ) : null}
        </div>
      </div>
      {action}
    </div>
  );
}

export function ViewTabPills({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'inline-flex p-1 rounded-2xl bg-slate-100/80 border border-slate-200/80 gap-1 flex-wrap',
        className
      )}
    >
      {children}
    </div>
  );
}

export function ViewTabBtn({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon?: LucideIcon;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all',
        active
          ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/80'
          : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
      )}
    >
      {Icon ? <Icon className="w-4 h-4" /> : null}
      {children}
    </button>
  );
}

export function ViewFilterPanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm',
        className
      )}
    >
      {children}
    </div>
  );
}

export function ViewEmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden py-16 text-center rounded-[1.25rem] border border-dashed border-slate-200 bg-gradient-to-b from-slate-50 to-white">
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-indigo-100/40 blur-3xl" />
      <Icon className="w-12 h-12 text-slate-300 mx-auto mb-4 relative" />
      <p className="text-base font-semibold text-slate-700 relative">{title}</p>
      {description ? (
        <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto relative">{description}</p>
      ) : null}
      {action ? <div className="mt-4 relative">{action}</div> : null}
    </div>
  );
}

/** Bandeau de progression / highlight */
export function ViewHighlightBanner({
  title,
  subtitle,
  value,
  progress,
  theme = 'violet',
  children,
}: {
  title: string;
  subtitle?: string;
  value?: string;
  progress?: number;
  theme?: HeroTheme;
  children?: ReactNode;
}) {
  const gradients: Record<HeroTheme, string> = {
    indigo: 'from-indigo-600 to-violet-600',
    violet: 'from-violet-600 to-purple-600',
    emerald: 'from-emerald-600 to-teal-600',
    rose: 'from-rose-600 to-red-600',
    amber: 'from-amber-600 to-orange-600',
    cyan: 'from-cyan-600 to-blue-600',
    slate: 'from-slate-700 to-slate-900',
    red: 'from-red-600 to-rose-600',
    blue: 'from-blue-600 to-indigo-600',
  };

  return (
    <div className={cn('rounded-[1.25rem] text-white p-6 sm:p-8 shadow-lg bg-gradient-to-r', gradients[theme])}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h2>
          {subtitle ? <p className="text-white/80 mt-1 text-sm">{subtitle}</p> : null}
        </div>
        {value ? <div className="text-4xl sm:text-5xl font-bold shrink-0">{value}</div> : null}
      </div>
      {progress !== undefined ? (
        <div className="w-full bg-white/20 rounded-full h-3 sm:h-4">
          <div
            className="bg-white h-3 sm:h-4 rounded-full transition-all shadow-sm"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      ) : null}
      {children}
    </div>
  );
}
