import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { cn } from '../../components/ui/utils';

export type QuickCardTone = 'indigo' | 'violet' | 'red' | 'sky' | 'emerald';

const TONE: Record<
  QuickCardTone,
  { accent: string; icon: string; value: string; hover: string }
> = {
  indigo: {
    accent: 'from-indigo-500 to-violet-600',
    icon: 'bg-indigo-100 text-indigo-700',
    value: 'text-indigo-900',
    hover: 'hover:border-indigo-200 hover:shadow-indigo-100/40',
  },
  violet: {
    accent: 'from-violet-500 to-purple-600',
    icon: 'bg-violet-100 text-violet-700',
    value: 'text-violet-900',
    hover: 'hover:border-violet-200 hover:shadow-violet-100/40',
  },
  red: {
    accent: 'from-red-500 to-rose-600',
    icon: 'bg-red-100 text-red-700',
    value: 'text-red-900',
    hover: 'hover:border-red-200 hover:shadow-red-100/40',
  },
  sky: {
    accent: 'from-sky-500 to-blue-600',
    icon: 'bg-sky-100 text-sky-700',
    value: 'text-sky-900',
    hover: 'hover:border-sky-200 hover:shadow-sky-100/40',
  },
  emerald: {
    accent: 'from-emerald-500 to-teal-600',
    icon: 'bg-emerald-100 text-emerald-700',
    value: 'text-emerald-900',
    hover: 'hover:border-emerald-200 hover:shadow-emerald-100/40',
  },
};

interface ProjectDashboardQuickCardProps {
  icon: LucideIcon;
  title: string;
  hint: string;
  value: string;
  tone: QuickCardTone;
  onClick: () => void;
}

export function ProjectDashboardQuickCard({
  icon: Icon,
  title,
  hint,
  value,
  tone,
  onClick,
}: ProjectDashboardQuickCardProps) {
  const t = TONE[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group text-left w-full min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all duration-200',
        t.hover,
        'hover:shadow-md'
      )}
    >
      <div className={cn('h-1 bg-gradient-to-r', t.accent)} />
      <div className="p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
        <div className={cn('shrink-0 p-2.5 sm:p-3 rounded-xl', t.icon)}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
          <p className={cn('text-xl sm:text-2xl font-bold mt-0.5 tabular-nums', t.value)}>{value}</p>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-snug">{hint}</p>
        </div>
        <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all shrink-0" />
      </div>
    </button>
  );
}
