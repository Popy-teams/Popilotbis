import { Plus } from 'lucide-react';
import { FormSelect, SearchField } from '../shared';

interface TasksToolbarProps {
  projectName: string;
  query: string;
  statusFilter: string;
  priorityFilter: string;
  stats: {
    total: number;
    inProgress: number;
    done: number;
    overdue: number;
    avgProgress: number;
  };
  onQueryChange: (v: string) => void;
  onStatusFilterChange: (v: string) => void;
  onPriorityFilterChange: (v: string) => void;
  onCreate: () => void;
}

const STATUS_PILLS = [
  { id: 'all', label: 'Toutes' },
  { id: 'todo', label: 'À faire' },
  { id: 'in-progress', label: 'En cours' },
  { id: 'blocked', label: 'Bloquées' },
  { id: 'done', label: 'Terminées' },
] as const;

export function TasksToolbar({
  projectName,
  query,
  statusFilter,
  priorityFilter,
  stats,
  onQueryChange,
  onStatusFilterChange,
  onPriorityFilterChange,
  onCreate,
}: TasksToolbarProps) {
  return (
    <>
      <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-50/80 via-white to-slate-50 p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Tâches
            </h1>
            <p className="text-slate-600 mt-1 text-sm sm:text-base">{projectName}</p>
          </div>
          <button
            type="button"
            onClick={onCreate}
            className="w-full sm:w-auto justify-center flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 shadow-sm shadow-indigo-500/20 transition-colors"
          >
            <Plus className="w-5 h-5 shrink-0" />
            Nouvelle tâche
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3">
          <StatCard label="Total" value={String(stats.total)} />
          <StatCard label="En cours" value={String(stats.inProgress)} accent="text-blue-600" />
          <StatCard label="Terminées" value={String(stats.done)} accent="text-emerald-600" />
          <StatCard label="En retard" value={String(stats.overdue)} accent="text-red-600" />
          <StatCard label="Avancement moy." value={`${stats.avgProgress}%`} className="col-span-2 sm:col-span-1" />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 shadow-sm space-y-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <SearchField
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Rechercher une tâche…"
            className="border-0 bg-transparent shadow-none focus:shadow-none min-h-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUS_PILLS.map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => onStatusFilterChange(pill.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === pill.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-1 border-t border-slate-100">
          <div className="w-full sm:w-48">
            <FormSelect
              value={priorityFilter}
              onChange={(e) => onPriorityFilterChange(e.target.value)}
              size="sm"
            >
              <option value="all">Toutes priorités</option>
              <option value="high">Haute</option>
              <option value="medium">Moyenne</option>
              <option value="low">Basse</option>
            </FormSelect>
          </div>
        </div>
      </section>
    </>
  );
}

function StatCard({
  label,
  value,
  accent,
  className = '',
}: {
  label: string;
  value: string;
  accent?: string;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white px-3 py-2.5 sm:px-4 sm:py-3 ${className}`}>
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-lg sm:text-xl font-semibold ${accent ?? 'text-slate-900'}`}>{value}</p>
    </div>
  );
}
