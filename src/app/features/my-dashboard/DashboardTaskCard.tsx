import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  FolderKanban,
  ListTodo,
} from 'lucide-react';
import type { DashboardTask, DashboardTaskStatus } from '../../types/dashboard';
import {
  daysUntilDue,
  getStatusLabel,
  isTaskUrgent,
  priorityChipClass,
  priorityLabel,
  statusBadgeClass,
  taskAccentBar,
  taskIconWrapClass,
} from './dashboardPresentation';
import { DashboardCardShell } from './DashboardCardShell';
import { cn } from '../../components/ui/utils';

interface DashboardTaskCardProps {
  task: DashboardTask;
  compact?: boolean;
}

function TaskStatusIcon({ status }: { status: DashboardTaskStatus }) {
  switch (status) {
    case 'done':
      return <CheckCircle2 className="w-5 h-5" />;
    case 'in-progress':
      return <Clock className="w-5 h-5" />;
    case 'blocked':
      return <AlertTriangle className="w-5 h-5" />;
    default:
      return <ListTodo className="w-5 h-5" />;
  }
}

export function DashboardTaskCard({ task, compact = false }: DashboardTaskCardProps) {
  const urgent = isTaskUrgent(task);
  const days = daysUntilDue(task.dueDate);

  return (
    <DashboardCardShell accent={taskAccentBar(task.status, urgent)}>
      <div className={cn('p-4', compact && 'sm:p-4')}>
        <div className="flex gap-3 sm:gap-4">
          <div
            className={cn(
              'shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ring-4 ring-white shadow-sm',
              taskIconWrapClass(task.status, urgent)
            )}
          >
            <TaskStatusIcon status={task.status} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3
                className={cn(
                  'font-semibold text-slate-900 leading-snug',
                  compact ? 'text-sm line-clamp-2' : 'text-base'
                )}
              >
                {task.title}
              </h3>
              <span
                className={cn(
                  'text-[10px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full border shrink-0',
                  statusBadgeClass(task.status)
                )}
              >
                {getStatusLabel(task.status)}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-2.5">
              <MetaChip icon={FolderKanban}>{task.project}</MetaChip>
              <span
                className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-medium border',
                  priorityChipClass(task.priority)
                )}
              >
                {priorityLabel(task.priority)}
              </span>
              <MetaChip
                icon={urgent ? AlertTriangle : Calendar}
                className={urgent ? 'text-red-700 bg-red-50 border-red-100' : undefined}
              >
                {urgent ? `${days}j restants` : `J-${days}`}
              </MetaChip>
            </div>
          </div>

          <ProgressRing progress={task.progress} urgent={urgent} />
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-[10px] sm:text-xs mb-1.5">
            <span className="font-medium text-slate-500 uppercase tracking-wide">Avancement</span>
            <span className="font-bold text-slate-800">{task.progress}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                urgent
                  ? 'bg-gradient-to-r from-red-500 to-rose-500'
                  : 'bg-gradient-to-r from-sky-500 to-blue-600'
              )}
              style={{ width: `${task.progress}%` }}
            />
          </div>
        </div>
      </div>
    </DashboardCardShell>
  );
}

function MetaChip({
  icon: Icon,
  children,
  className,
}: {
  icon: typeof FolderKanban;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-medium border border-slate-200 bg-slate-50 text-slate-600',
        className
      )}
    >
      <Icon className="w-3 h-3 shrink-0 opacity-70" />
      {children}
    </span>
  );
}

function ProgressRing({ progress, urgent }: { progress: number; urgent: boolean }) {
  const size = 44;
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="hidden sm:flex shrink-0 relative w-11 h-11 items-center justify-center">
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-slate-100"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={urgent ? 'text-red-500' : 'text-sky-500'}
        />
      </svg>
      <span className="absolute text-[10px] font-bold text-slate-700">{progress}</span>
    </div>
  );
}
