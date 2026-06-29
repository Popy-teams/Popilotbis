import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { DashboardCardShell } from './DashboardCardShell';
import { cn } from '../../components/ui/utils';

type QuickNavTone = 'sky' | 'violet' | 'emerald';

const TONE: Record<
  QuickNavTone,
  { accent: string; icon: string; value: string; hover: string }
> = {
  sky: {
    accent: 'from-sky-400 to-blue-600',
    icon: 'bg-sky-100 text-sky-700',
    value: 'text-sky-900',
    hover: 'hover:border-sky-200',
  },
  violet: {
    accent: 'from-violet-400 to-purple-600',
    icon: 'bg-violet-100 text-violet-700',
    value: 'text-violet-900',
    hover: 'hover:border-violet-200',
  },
  emerald: {
    accent: 'from-emerald-400 to-teal-600',
    icon: 'bg-emerald-100 text-emerald-700',
    value: 'text-emerald-900',
    hover: 'hover:border-emerald-200',
  },
};

interface DashboardQuickNavCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
  hint: string;
  onClick: () => void;
  tone: QuickNavTone;
}

export function DashboardQuickNavCard({
  icon: Icon,
  title,
  value,
  hint,
  onClick,
  tone,
}: DashboardQuickNavCardProps) {
  const t = TONE[tone];

  return (
    <button type="button" onClick={onClick} className="text-left w-full min-w-0 group">
      <DashboardCardShell accent={t.accent} className={cn(t.hover)}>
        <div className="p-4 sm:p-5 flex items-center gap-4">
          <div className={cn('shrink-0 p-3 rounded-2xl', t.icon)}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
            <p className={cn('text-2xl sm:text-3xl font-bold mt-0.5 tabular-nums', t.value)}>{value}</p>
            <p className="text-xs text-slate-500 mt-1 line-clamp-1">{hint}</p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all shrink-0" />
        </div>
      </DashboardCardShell>
    </button>
  );
}
