import type { ReactNode } from 'react';
import { cn } from '../../components/ui/utils';

interface DashboardCardShellProps {
  accent?: string;
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function DashboardCardShell({
  accent = 'from-slate-400 to-slate-500',
  children,
  className,
  hover = true,
}: DashboardCardShellProps) {
  return (
    <article
      className={cn(
        'relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm min-w-0',
        hover && 'hover:shadow-md hover:border-slate-300/80 transition-all duration-200',
        className
      )}
    >
      <div className={cn('h-1 bg-gradient-to-r', accent)} />
      {children}
    </article>
  );
}

interface DashboardSectionProps {
  title: string;
  icon: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function DashboardSection({ title, icon, action, children, className }: DashboardSectionProps) {
  return (
    <section className={cn('min-w-0', className)}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
          {icon}
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
