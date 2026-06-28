import type { LucideIcon } from 'lucide-react';
import { cn } from '../ui/utils';

type KpiStatTone = 'good' | 'warning' | 'critical' | 'neutral';

const TONE_STYLES: Record<
  KpiStatTone,
  { border: string; bg: string; value: string; label: string; icon: string }
> = {
  good: {
    border: 'border-emerald-200',
    bg: 'bg-emerald-50/80',
    value: 'text-emerald-900',
    label: 'text-emerald-800/80',
    icon: 'from-emerald-500 to-teal-600',
  },
  warning: {
    border: 'border-amber-200',
    bg: 'bg-amber-50/80',
    value: 'text-amber-950',
    label: 'text-amber-900/80',
    icon: 'from-amber-500 to-orange-600',
  },
  critical: {
    border: 'border-red-200',
    bg: 'bg-red-50/80',
    value: 'text-red-950',
    label: 'text-red-900/80',
    icon: 'from-red-500 to-rose-600',
  },
  neutral: {
    border: 'border-violet-200',
    bg: 'bg-violet-50/80',
    value: 'text-violet-950',
    label: 'text-violet-900/80',
    icon: 'from-violet-500 to-purple-600',
  },
};

interface KpiStatCardProps {
  label: string;
  value: string;
  hint?: string;
  tone?: KpiStatTone;
  icon?: LucideIcon;
  className?: string;
}

/** Carte KPI à contraste garanti (texte foncé sur fond clair) */
export function KpiStatCard({
  label,
  value,
  hint,
  tone = 'neutral',
  icon: Icon,
  className,
}: KpiStatCardProps) {
  const t = TONE_STYLES[tone];

  return (
    <div
      className={cn(
        'rounded-xl border p-3 sm:p-4 shadow-sm min-w-0',
        t.border,
        t.bg,
        className
      )}
    >
      <div className="flex items-start justify-between gap-2 min-w-0">
        <div className="min-w-0 flex-1">
          <p className={cn('text-[10px] sm:text-xs font-semibold uppercase tracking-wide', t.label)}>
            {label}
          </p>
          <p className={cn('text-2xl sm:text-3xl font-bold mt-1 break-words', t.value)}>{value}</p>
          {hint ? <p className="text-[10px] sm:text-xs text-stone-600 mt-1 line-clamp-2">{hint}</p> : null}
        </div>
        {Icon ? (
          <div className={cn('p-2 rounded-lg bg-gradient-to-br text-white shadow-sm shrink-0', t.icon)}>
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
