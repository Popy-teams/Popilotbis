import { useMemo, useState } from 'react';
import type { DashboardTask, DashboardTaskStatus } from '../../types/dashboard';
import { ViewEmptyState } from '../../components/shared';
import { DashboardTaskCard } from './DashboardTaskCard';
import { getStatusLabel } from './dashboardPresentation';
import { cn } from '../../components/ui/utils';

type TaskFilter = 'all' | DashboardTaskStatus;

interface DashboardTasksTabProps {
  tasks: DashboardTask[];
}

export function DashboardTasksTab({ tasks }: DashboardTasksTabProps) {
  const [filter, setFilter] = useState<TaskFilter>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return tasks;
    return tasks.filter((t) => t.status === filter);
  }, [tasks, filter]);

  const filters: { id: TaskFilter; label: string }[] = [
    { id: 'all', label: 'Toutes' },
    { id: 'in-progress', label: 'En cours' },
    { id: 'todo', label: 'À faire' },
    { id: 'blocked', label: 'Bloquées' },
    { id: 'done', label: 'Terminées' },
  ];

  return (
    <div className="space-y-4 min-w-0">
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {filters.map((f) => {
          const count =
            f.id === 'all' ? tasks.length : tasks.filter((t) => t.status === f.id).length;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                'shrink-0 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border transition-colors',
                filter === f.id
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              )}
            >
              {f.label}
              {count > 0 ? ` (${count})` : ''}
            </button>
          );
        })}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-3 sm:gap-4">
          {filtered.map((task) => (
            <DashboardTaskCard key={task.id} task={task} />
          ))}
        </div>
      ) : (
        <ViewEmptyState
          title="Aucune tâche"
          description={
            filter === 'all'
              ? 'Aucune tâche assignée pour le projet actif.'
              : `Aucune tâche avec le statut « ${getStatusLabel(filter as DashboardTaskStatus)} ».`
          }
        />
      )}
    </div>
  );
}
