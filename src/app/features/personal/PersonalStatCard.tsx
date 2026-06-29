import type { LucideIcon } from 'lucide-react';
import { cn } from '../../components/ui/utils';

type PersonalStatTone = 'sky' | 'good' | 'violet' | 'amber';

const TONE: Record<
  PersonalStatTone,
  { border: string; bg: string; value: string; label: string; icon: string }
> = {
  sky: {
    border: 'border-sky-200',
    bg: 'bg-sky-50/90',
    value: 'text-sky-950',
    label: 'text-sky-900/80',
    icon: 'from-sky-500 to-blue-600',
  },
  good: {
    border: 'border-emerald-200',
    bg: 'bg-emerald-50/90',
    value: 'text-emerald-950',
    label: 'text-emerald-900/80',
    icon: 'from-emerald-500 to-teal-600',
  },
  violet: {
    border: 'border-violet-200',
    bg: 'bg-violet-50/90',
    value: 'text-violet-950',
    label: 'text-violet-900/80',
    icon: 'from-violet-500 to-purple-600',
  },
  amber: {
    border: 'border-amber-200',
    bg: 'bg-amber-50/90',
    value: 'text-amber-950',
    label: 'text-amber-900/80',
    icon: 'from-amber-500 to-orange-600',
  },
};

interface PersonalStatCardProps {
  label: string;
  value: string;
  hint?: string;
  tone?: PersonalStatTone;
  icon?: LucideIcon;
  className?: string;
}

export function PersonalStatCard({
  label,
  value,
  hint,
  tone = 'sky',
  icon: Icon,
  className,
}: PersonalStatCardProps) {
  const t = TONE[tone];
  return (
    <div className={cn('rounded-xl border p-3 sm:p-4 shadow-sm min-w-0', t.border, t.bg, className)}>
      <div className="flex items-start justify-between gap-2">
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
