import type { LucideIcon } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '../../../components/ui/utils';
import { BUDGET_ACCENT_THEMES, type BudgetRichAccent } from './budgetThemes';

const FOOTER_HOVER: Record<BudgetRichAccent, string> = {
  bom: 'group-hover:bg-emerald-50/60 group-hover:text-emerald-800',
  quote: 'group-hover:bg-violet-50/60 group-hover:text-violet-800',
  supplier: 'group-hover:bg-sky-50/60 group-hover:text-sky-800',
  funding: 'group-hover:bg-amber-50/60 group-hover:text-amber-900',
  tracking: 'group-hover:bg-emerald-50/60 group-hover:text-emerald-800',
};

const FOOTER_ARROW: Record<BudgetRichAccent, string> = {
  bom: 'text-emerald-600',
  quote: 'text-violet-600',
  supplier: 'text-sky-600',
  funding: 'text-amber-600',
  tracking: 'text-emerald-600',
};

export function BudgetRichCard({
  accent,
  icon: Icon,
  title,
  subtitle,
  badge,
  highlight,
  stats,
  tags,
  progress,
  footerLabel = 'Ouvrir',
  footer,
  onClick,
  categoryGradient,
}: {
  accent: BudgetRichAccent;
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  highlight?: ReactNode;
  stats?: { label: string; value: ReactNode; icon?: LucideIcon }[];
  tags?: ReactNode;
  progress?: { label: string; pct: number; fillStyle?: CSSProperties };
  footerLabel?: string;
  footer?: ReactNode;
  onClick?: () => void;
  categoryGradient?: string;
}) {
  const theme = BUDGET_ACCENT_THEMES[accent];
  const topBar = categoryGradient ? `bg-gradient-to-r ${categoryGradient}` : `bg-gradient-to-r ${theme.gradient}`;

  const inner = (
    <>
      <div className={cn('h-[3px] w-full', topBar)} />

      <div className="relative px-5 pt-5 pb-4">
        <div
          className={cn(
            'absolute -top-2 right-3 w-32 h-32 rounded-full blur-3xl opacity-[0.14] bg-gradient-to-br pointer-events-none',
            categoryGradient ?? theme.gradient
          )}
        />

        <div className="relative flex items-start gap-4">
          <div
            className={cn(
              'p-2.5 rounded-xl bg-gradient-to-br text-white shadow-md shadow-slate-300/30 shrink-0 ring-1 ring-white/20',
              theme.gradient
            )}
          >
            <Icon className="w-[18px] h-[18px]" strokeWidth={2.25} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h3 className="text-[15px] font-semibold text-slate-900 tracking-tight leading-snug">{title}</h3>
              {badge}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">{subtitle}</p>
            )}
          </div>

          {(highlight != null && highlight !== false) ? (
            <div className="flex flex-col items-end shrink-0">
              {typeof highlight === 'string' || typeof highlight === 'number' ? (
                <div
                  className={cn(
                    'text-base sm:text-lg font-bold bg-gradient-to-r bg-clip-text text-transparent tabular-nums leading-none',
                    theme.gradient
                  )}
                >
                  {highlight}
                </div>
              ) : (
                <div className="pt-0.5">{highlight}</div>
              )}
            </div>
          ) : null}
        </div>

        {stats && stats.length > 0 && (
          <div className="mt-4 flex rounded-xl border border-slate-100 bg-slate-50/80 overflow-hidden divide-x divide-slate-100">
            {stats.map((s) => (
              <div key={s.label} className="flex-1 min-w-0 px-2 py-2.5 text-center">
                {s.icon && <s.icon className="w-3 h-3 text-slate-400 mx-auto mb-1" aria-hidden />}
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 leading-none truncate">
                  {s.label}
                </p>
                <p className="text-xs font-semibold text-slate-800 mt-1 tabular-nums truncate">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {progress && (
          <div className="mt-3.5">
            <div className="flex justify-between text-[10px] font-semibold text-slate-500 mb-1.5">
              <span>{progress.label}</span>
              <span className="tabular-nums">{Math.round(progress.pct)} %</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-500', theme.bar)}
                style={{ width: `${Math.min(100, progress.pct)}%`, ...progress.fillStyle }}
              />
            </div>
          </div>
        )}

        {tags && <div className="mt-3.5 flex flex-wrap gap-1.5">{tags}</div>}
      </div>

      {footer ? (
        <div className="border-t border-slate-100/90 bg-slate-50/40">{footer}</div>
      ) : onClick ? (
        <div
          className={cn(
            'px-5 py-3 border-t border-slate-100/90 bg-slate-50/40 flex items-center justify-between transition-colors',
            FOOTER_HOVER[accent]
          )}
        >
          <span className="text-xs font-semibold text-slate-600 transition-colors">{footerLabel}</span>
          <span
            className={cn(
              'flex items-center opacity-60 group-hover:opacity-100 transition-all group-hover:translate-x-0.5',
              FOOTER_ARROW[accent]
            )}
          >
            <ArrowUpRight className="w-4 h-4" />
          </span>
        </div>
      ) : null}
    </>
  );

  const shell = cn(
    'group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white',
    'shadow-[0_1px_3px_rgba(15,23,42,0.04)] hover:shadow-[0_12px_40px_-12px_rgba(15,23,42,0.12)]',
    'hover:border-slate-300/70 transition-all duration-300 text-left w-full',
    onClick && 'hover:-translate-y-0.5 cursor-pointer'
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={shell}>
        {inner}
      </button>
    );
  }

  return <article className={shell}>{inner}</article>;
}

export function BudgetCardFooterActions({
  onView,
  onEdit,
  viewLabel = 'Consulter',
  editLabel = 'Modifier',
}: {
  onView: () => void;
  onEdit: () => void;
  viewLabel?: string;
  editLabel?: string;
}) {
  return (
    <div className="flex gap-2 px-4 py-3">
      <button
        type="button"
        onClick={onView}
        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 bg-white border border-slate-200/90 hover:bg-slate-50 hover:border-slate-300 transition-colors"
      >
        {viewLabel}
      </button>
      <button
        type="button"
        onClick={onEdit}
        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition-colors"
      >
        {editLabel}
      </button>
    </div>
  );
}

export function BudgetSummaryStrip({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-1">{children}</div>;
}

export function BudgetEmptyPanel({ title, description }: { title: string; description: string }) {
  return (
    <div className="mt-4 rounded-2xl border border-dashed border-slate-200/80 bg-gradient-to-b from-slate-50/80 to-white px-6 py-14 text-center">
      <div className="mx-auto w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
        <span className="text-slate-400 text-lg">—</span>
      </div>
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">{description}</p>
    </div>
  );
}

export function BudgetPipelineCard({
  count,
  label,
  pct,
}: {
  count: number;
  label: string;
  pct: number;
}) {
  const active = count > 0;
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border p-3.5 text-center transition-all duration-200',
        active
          ? 'border-emerald-200/70 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5'
          : 'border-slate-100 bg-slate-50/50'
      )}
    >
      <div
        className={cn(
          'absolute top-0 left-0 right-0 h-0.5',
          active ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-slate-200'
        )}
      />
      <p
        className={cn(
          'text-2xl font-bold tabular-nums leading-none',
          active
            ? 'bg-gradient-to-br from-slate-800 to-slate-600 bg-clip-text text-transparent'
            : 'text-slate-300'
        )}
      >
        {count}
      </p>
      <p className="text-[10px] font-semibold text-slate-500 mt-2 leading-tight min-h-[2.5em] flex items-center justify-center px-0.5">
        {label}
      </p>
      <div className="mt-2.5 h-1 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            active ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-transparent'
          )}
          style={{ width: `${Math.max(pct, active ? 10 : 0)}%` }}
        />
      </div>
    </div>
  );
}
