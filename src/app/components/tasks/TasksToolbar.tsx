import {
  Plus,
  CheckSquare,
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import { FormSelect, SearchField, ViewHero, ViewStatCard, ViewStatsGrid, ViewFilterPanel, ViewTabPills, ViewTabBtn } from '../shared';

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
      <ViewHero
        title="Tâches"
        subtitle="Suivi Kanban, priorités et synchronisation automatique avec le pipeline du projet."
        badge={`${projectName} · Exécution`}
        badgeIcon={CheckSquare}
        theme="indigo"
        actions={
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex items-center gap-2 bg-white text-indigo-900 px-4 py-2.5 rounded-xl hover:bg-indigo-50 font-semibold shadow-md transition-colors"
          >
            <Plus className="w-5 h-5 shrink-0" />
            Nouvelle tâche
          </button>
        }
        stats={
          <ViewStatsGrid cols={5}>
            <ViewStatCard label="Total" value={String(stats.total)} gradient="from-slate-500 to-slate-700" icon={CheckSquare} onDark />
            <ViewStatCard label="En cours" value={String(stats.inProgress)} gradient="from-blue-500 to-cyan-500" icon={PlayCircle} onDark />
            <ViewStatCard label="Terminées" value={String(stats.done)} gradient="from-emerald-500 to-teal-500" icon={CheckCircle2} onDark />
            <ViewStatCard label="En retard" value={String(stats.overdue)} gradient="from-red-500 to-rose-500" icon={AlertTriangle} onDark />
            <ViewStatCard label="Avancement moy." value={`${stats.avgProgress}%`} gradient="from-violet-500 to-purple-500" icon={TrendingUp} onDark />
          </ViewStatsGrid>
        }
      />

      <ViewFilterPanel className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Recherche</label>
          <SearchField
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Rechercher une tâche…"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Statut</label>
          <ViewTabPills>
            {STATUS_PILLS.map((pill) => (
              <ViewTabBtn
                key={pill.id}
                active={statusFilter === pill.id}
                onClick={() => onStatusFilterChange(pill.id)}
              >
                {pill.label}
              </ViewTabBtn>
            ))}
          </ViewTabPills>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end gap-3 pt-1 border-t border-slate-100">
          <div className="w-full sm:w-48">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Priorité</label>
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
      </ViewFilterPanel>
    </>
  );
}
