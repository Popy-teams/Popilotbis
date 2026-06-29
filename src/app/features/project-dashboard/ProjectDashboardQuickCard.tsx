import { ArrowRight } from 'lucide-react';
import { cn } from '../../components/ui/utils';

type QuickCardTone = 'indigo' | 'violet' | 'red' | 'sky';

const TONE: Record<
  QuickCardTone,
  { accent: string; ring: string; value: string; hover: string }
> = {
  indigo: {
    accent: 'from-indigo-500 to-violet-600',
    ring: 'ring-indigo-100',
    value: 'text-indigo-800',
    hover: 'hover:border-indigo-200 hover:shadow-indigo-100/50',
  },
  violet: {
    accent: 'from-violet-500 to-purple-600',
    ring: 'ring-violet-100',
    value: 'text-violet-800',
    hover: 'hover:border-violet-200 hover:shadow-violet-100/50',
  },
  red: {
    accent: 'from-red-500 to-rose-600',
    ring: 'ring-red-100',
    value: 'text-red-800',
    hover: 'hover:border-red-200 hover:shadow-red-100/50',
  },
  sky: {
    accent: 'from-sky-500 to-blue-600',
    ring: 'ring-sky-100',
    value: 'text-sky-800',
    hover: 'hover:border-sky-200 hover:shadow-sky-100/50',
  },
};

interface ProjectDashboardQuickCardProps {
  title: string;
  hint: string;
  value: string;
  tone: QuickCardTone;
  onClick: () => void;
}

export function ProjectDashboardQuickCard({
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
        'text-left w-full rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all duration-200 min-w-0',
        t.hover,
        'hover:shadow-md'
      )}
    >
      <div className={cn('h-1 bg-gradient-to-r', t.accent)} />
      <div className="p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
        <p className={cn('text-2xl sm:text-3xl font-bold mt-1', t.value)}>{value}</p>
        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{hint}</p>
        <span className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-slate-600">
          Ouvrir
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </button>
  );
}
