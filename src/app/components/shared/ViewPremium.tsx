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
  {
    border: string;
    gradient: string;
    glow1: string;
    glow2: string;
    accentBar: string;
    badge: string;
    badgeIcon: string;
    sidePanel: string;
    shadow: string;
  }
> = {
  indigo: {
    border: 'border-indigo-100/90',
    gradient: 'from-indigo-50/90 via-white to-violet-50/70',
    glow1: 'bg-indigo-200/35',
    glow2: 'bg-violet-200/25',
    accentBar: 'from-indigo-400 via-violet-400 to-indigo-300',
    badge: 'bg-white/90 border-indigo-100 text-indigo-700',
    badgeIcon: 'text-indigo-500',
    sidePanel: 'bg-white/75 border-indigo-100/80 shadow-sm',
    shadow: 'shadow-indigo-100/50',
  },
  violet: {
    border: 'border-violet-100/90',
    gradient: 'from-violet-50/90 via-white to-purple-50/70',
    glow1: 'bg-violet-200/35',
    glow2: 'bg-purple-200/25',
    accentBar: 'from-violet-400 via-purple-400 to-fuchsia-300',
    badge: 'bg-white/90 border-violet-100 text-violet-700',
    badgeIcon: 'text-violet-500',
    sidePanel: 'bg-white/75 border-violet-100/80 shadow-sm',
    shadow: 'shadow-violet-100/50',
  },
  emerald: {
    border: 'border-emerald-100/90',
    gradient: 'from-emerald-50/90 via-white to-teal-50/70',
    glow1: 'bg-emerald-200/35',
    glow2: 'bg-teal-200/25',
    accentBar: 'from-emerald-400 via-teal-400 to-emerald-300',
    badge: 'bg-white/90 border-emerald-100 text-emerald-700',
    badgeIcon: 'text-emerald-500',
    sidePanel: 'bg-white/75 border-emerald-100/80 shadow-sm',
    shadow: 'shadow-emerald-100/50',
  },
  rose: {
    border: 'border-rose-100/90',
    gradient: 'from-rose-50/90 via-white to-pink-50/70',
    glow1: 'bg-rose-200/35',
    glow2: 'bg-pink-200/25',
    accentBar: 'from-rose-400 via-pink-400 to-rose-300',
    badge: 'bg-white/90 border-rose-100 text-rose-700',
    badgeIcon: 'text-rose-500',
    sidePanel: 'bg-white/75 border-rose-100/80 shadow-sm',
    shadow: 'shadow-rose-100/50',
  },
  amber: {
    border: 'border-amber-100/90',
    gradient: 'from-amber-50/90 via-white to-orange-50/70',
    glow1: 'bg-amber-200/35',
    glow2: 'bg-orange-200/25',
    accentBar: 'from-amber-400 via-orange-400 to-amber-300',
    badge: 'bg-white/90 border-amber-100 text-amber-800',
    badgeIcon: 'text-amber-600',
    sidePanel: 'bg-white/75 border-amber-100/80 shadow-sm',
    shadow: 'shadow-amber-100/50',
  },
  cyan: {
    border: 'border-cyan-100/90',
    gradient: 'from-cyan-50/90 via-white to-sky-50/70',
    glow1: 'bg-cyan-200/35',
    glow2: 'bg-sky-200/25',
    accentBar: 'from-cyan-400 via-sky-400 to-cyan-300',
    badge: 'bg-white/90 border-cyan-100 text-cyan-800',
    badgeIcon: 'text-cyan-600',
    sidePanel: 'bg-white/75 border-cyan-100/80 shadow-sm',
    shadow: 'shadow-cyan-100/50',
  },
  slate: {
    border: 'border-slate-200/90',
    gradient: 'from-slate-50/90 via-white to-slate-100/70',
    glow1: 'bg-slate-200/35',
    glow2: 'bg-slate-300/20',
    accentBar: 'from-slate-400 via-slate-500 to-slate-400',
    badge: 'bg-white/90 border-slate-200 text-slate-700',
    badgeIcon: 'text-slate-500',
    sidePanel: 'bg-white/75 border-slate-200/80 shadow-sm',
    shadow: 'shadow-slate-200/50',
  },
  red: {
    border: 'border-red-100/90',
    gradient: 'from-red-50/90 via-white to-rose-50/70',
    glow1: 'bg-red-200/30',
    glow2: 'bg-rose-200/25',
    accentBar: 'from-red-400 via-rose-400 to-red-300',
    badge: 'bg-white/90 border-red-100 text-red-700',
    badgeIcon: 'text-red-500',
    sidePanel: 'bg-white/75 border-red-100/80 shadow-sm',
    shadow: 'shadow-red-100/50',
  },
  blue: {
    border: 'border-blue-100/90',
    gradient: 'from-blue-50/90 via-white to-indigo-50/70',
    glow1: 'bg-blue-200/35',
    glow2: 'bg-indigo-200/25',
    accentBar: 'from-blue-400 via-indigo-400 to-blue-300',
    badge: 'bg-white/90 border-blue-100 text-blue-700',
    badgeIcon: 'text-blue-500',
    sidePanel: 'bg-white/75 border-blue-100/80 shadow-sm',
    shadow: 'shadow-blue-100/50',
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
    <HeroSurfaceContext.Provider value={false}>
      <div
        className={cn(
          'relative overflow-hidden rounded-[1.5rem] border shadow-sm',
          t.border,
          `bg-gradient-to-br ${t.gradient}`,
          t.shadow
        )}
      >
      <div className={cn('absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r opacity-80', t.accentBar)} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.85)_0%,_transparent_55%)]" />
      <div className={cn('absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl', t.glow1)} />
      <div className={cn('absolute -bottom-32 -left-16 w-72 h-72 rounded-full blur-3xl', t.glow2)} />

      <div className="relative p-4 sm:p-6 lg:p-10">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 sm:gap-6 lg:gap-8">
          <div className="max-w-2xl min-w-0 flex-1">
            {badge ? (
              <div
                className={cn(
                  'inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold mb-3 sm:mb-4 backdrop-blur-sm shadow-sm max-w-full',
                  t.badge
                )}
              >
                <BadgeIcon className={cn('w-3.5 h-3.5 shrink-0', t.badgeIcon)} />
                <span className="truncate">{badge}</span>
              </div>
            ) : null}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight text-slate-900 break-words">
              {title}
            </h1>
            {subtitle ? (
              <div className="mt-2 sm:mt-3 text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl break-words">
                {subtitle}
              </div>
            ) : null}
            {actions ? <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row flex-wrap gap-2 [&>*]:w-full sm:[&>*]:w-auto">{actions}</div> : null}
          </div>
          {sidePanel ? (
            <div
              className={cn(
                'w-full lg:w-[min(100%,22rem)] shrink-0 rounded-2xl backdrop-blur-md p-4 sm:p-5',
                t.sidePanel
              )}
            >
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
          'rounded-xl bg-white/90 border border-slate-200/80 p-3 sm:p-4 shadow-sm backdrop-blur-sm',
          className
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold">{label}</p>
            <p className="font-bold text-xl sm:text-2xl mt-1 truncate text-slate-900">{value}</p>
            {hint ? <p className="text-[10px] text-slate-400 mt-0.5">{hint}</p> : null}
          </div>
          {Icon ? (
            <div className={cn('p-2 rounded-lg bg-gradient-to-br shrink-0 text-white shadow-sm', gradient)}>
              <Icon className="w-4 h-4" />
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl sm:rounded-2xl border border-slate-200/80 bg-white p-3 sm:p-4 lg:p-5 shadow-sm hover:shadow-lg transition-all duration-300 group min-w-0',
        className
      )}
    >
      <div
        className={cn(
          'absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 rounded-full blur-2xl opacity-20 bg-gradient-to-br group-hover:opacity-30 transition-opacity',
          gradient
        )}
      />
      <div className="relative flex items-start justify-between gap-2 sm:gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-slate-500 leading-tight">{label}</p>
          <p className={cn('text-xl sm:text-2xl lg:text-3xl font-bold mt-1 sm:mt-2 bg-gradient-to-r bg-clip-text text-transparent break-words', gradient)}>
            {value}
          </p>
          {hint ? <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1">{hint}</p> : null}
        </div>
        {Icon ? (
          <div className={cn('p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-gradient-to-br text-white shadow-md shrink-0', gradient)}>
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
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
    2: 'grid grid-cols-1 min-[400px]:grid-cols-2 gap-3 sm:gap-4',
    3: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4',
    4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4',
    5: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4',
    6: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4',
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
        <div className="p-2 rounded-lg bg-stone-100 text-stone-700 shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h2 className="font-bold text-stone-900 text-lg tracking-tight">{title}</h2>
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
    <div className="w-full min-w-0 max-w-full">
      <div
        className={cn(
          'grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap gap-1 p-1 rounded-xl bg-stone-100/90 border border-stone-200/90 w-full',
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function ViewTabBtn({
  active,
  onClick,
  icon: Icon,
  children,
  mobileLabel,
}: {
  active: boolean;
  onClick: () => void;
  icon?: LucideIcon;
  children: ReactNode;
  /** Libellé court affiché sous lg quand la grille est serrée */
  mobileLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg transition-all w-full lg:w-auto min-w-0',
        active
          ? 'bg-white text-stone-900 shadow-sm border border-stone-200/90'
          : 'text-stone-500 hover:text-stone-800 hover:bg-white/60'
      )}
    >
      {Icon ? <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> : null}
      {mobileLabel ? (
        <>
          <span className="lg:hidden truncate">{mobileLabel}</span>
          <span className="hidden lg:inline">{children}</span>
        </>
      ) : (
        <span className="truncate">{children}</span>
      )}
    </button>
  );
}

export function ViewFilterPanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-stone-200/90 bg-white p-4 sm:p-5 shadow-sm',
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
  const lightGradients: Record<HeroTheme, { bar: string; bg: string; badge: string; title: string; sub: string }> = {
    indigo: { bar: 'from-indigo-400 to-violet-400', bg: 'from-indigo-50 via-white to-violet-50', badge: 'text-indigo-700 border-indigo-100', title: 'text-slate-900', sub: 'text-slate-600' },
    violet: { bar: 'from-violet-400 to-purple-400', bg: 'from-violet-50 via-white to-purple-50', badge: 'text-violet-700 border-violet-100', title: 'text-slate-900', sub: 'text-slate-600' },
    emerald: { bar: 'from-emerald-400 to-teal-400', bg: 'from-emerald-50 via-white to-teal-50', badge: 'text-emerald-700 border-emerald-100', title: 'text-slate-900', sub: 'text-slate-600' },
    rose: { bar: 'from-rose-400 to-pink-400', bg: 'from-rose-50 via-white to-pink-50', badge: 'text-rose-700 border-rose-100', title: 'text-slate-900', sub: 'text-slate-600' },
    amber: { bar: 'from-amber-400 to-orange-400', bg: 'from-amber-50 via-white to-orange-50', badge: 'text-amber-800 border-amber-100', title: 'text-slate-900', sub: 'text-slate-600' },
    cyan: { bar: 'from-cyan-400 to-sky-400', bg: 'from-cyan-50 via-white to-sky-50', badge: 'text-cyan-800 border-cyan-100', title: 'text-slate-900', sub: 'text-slate-600' },
    slate: { bar: 'from-slate-400 to-slate-500', bg: 'from-slate-50 via-white to-slate-100', badge: 'text-slate-700 border-slate-200', title: 'text-slate-900', sub: 'text-slate-600' },
    red: { bar: 'from-red-400 to-rose-400', bg: 'from-red-50 via-white to-rose-50', badge: 'text-red-700 border-red-100', title: 'text-slate-900', sub: 'text-slate-600' },
    blue: { bar: 'from-blue-400 to-indigo-400', bg: 'from-blue-50 via-white to-indigo-50', badge: 'text-blue-700 border-blue-100', title: 'text-slate-900', sub: 'text-slate-600' },
  };
  const lg = lightGradients[theme];

  return (
    <div className={cn('relative overflow-hidden rounded-xl sm:rounded-[1.25rem] border border-slate-200/80 p-4 sm:p-6 lg:p-8 shadow-sm bg-gradient-to-br min-w-0', lg.bg)}>
      <div className={cn('absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r', lg.bar)} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4 mb-3 sm:mb-4 relative min-w-0">
        <div className="min-w-0 flex-1">
          <h2 className={cn('text-lg sm:text-xl lg:text-2xl font-bold tracking-tight break-words', lg.title)}>{title}</h2>
          {subtitle ? <p className={cn('mt-1 text-xs sm:text-sm break-words', lg.sub)}>{subtitle}</p> : null}
        </div>
        {value ? <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 shrink-0">{value}</div> : null}
      </div>
      {progress !== undefined ? (
        <div className="w-full bg-slate-200/60 rounded-full h-3 sm:h-4 relative">
          <div
            className={cn('h-3 sm:h-4 rounded-full transition-all shadow-sm bg-gradient-to-r', lg.bar)}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      ) : null}
      {children}
    </div>
  );
}
