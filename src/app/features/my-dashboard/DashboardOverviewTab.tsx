import { ArrowRight, Sparkles } from 'lucide-react';
import type { DashboardStats, DashboardUserData } from '../../types/dashboard';
import type { DashboardTab } from '../../types/dashboard';
import { ViewHighlightBanner } from '../../components/shared';
import { DashboardSection } from './DashboardCardShell';
import { DashboardTaskCard } from './DashboardTaskCard';
import { DashboardQuickNavCard } from './DashboardQuickNavCard';
import { getPriorityTasks } from './dashboardPresentation';
import { CheckSquare, Target, Calendar } from 'lucide-react';

interface DashboardOverviewTabProps {
  firstName: string;
  stats: DashboardStats;
  data: DashboardUserData;
  onGoTab: (tab: DashboardTab) => void;
}

export function DashboardOverviewTab({
  firstName,
  stats,
  data,
  onGoTab,
}: DashboardOverviewTabProps) {
  const priorityTasks = getPriorityTasks(data.tasks);

  return (
    <div className="space-y-5 sm:space-y-6 min-w-0">
      <ViewHighlightBanner
        title={`Bonjour, ${firstName}`}
        subtitle={`${stats.inProgress} tâche(s) en cours · ${stats.urgent} urgente(s) · charge ${stats.workload}%`}
        value={`${stats.workload}%`}
        progress={stats.workload}
        theme="blue"
      />

      <DashboardSection
        title="Priorités du moment"
        icon={<Sparkles className="w-5 h-5 text-sky-600" />}
        action={
          data.tasks.length > 0 ? (
            <button
              type="button"
              onClick={() => onGoTab('tasks')}
              className="text-xs sm:text-sm font-semibold text-sky-700 hover:text-sky-900 inline-flex items-center gap-1"
            >
              Toutes les tâches
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : null
        }
      >
        {priorityTasks.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {priorityTasks.map((task) => (
              <DashboardTaskCard key={task.id} task={task} compact />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
            Aucune tâche active pour le projet sélectionné.
          </p>
        )}
      </DashboardSection>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <DashboardQuickNavCard
          icon={CheckSquare}
          title="Mes tâches"
          value={String(data.tasks.length)}
          hint={`${stats.inProgress} en cours`}
          onClick={() => onGoTab('tasks')}
          tone="sky"
        />
        <DashboardQuickNavCard
          icon={Target}
          title="Objectifs"
          value={String(data.objectives.length)}
          hint={`${data.trophies.length} trophée(s)`}
          onClick={() => onGoTab('goals')}
          tone="violet"
        />
        <DashboardQuickNavCard
          icon={Calendar}
          title="Agenda"
          value={String(data.meetings.length + data.actions.length)}
          hint={`${stats.pendingActions} action(s) en attente`}
          onClick={() => onGoTab('agenda')}
          tone="emerald"
        />
      </div>
    </div>
  );
}
