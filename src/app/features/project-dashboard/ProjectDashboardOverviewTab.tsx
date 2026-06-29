import { ArrowRight, Award, CheckCircle, Clock, Target, AlertTriangle } from 'lucide-react';
import type { Project } from '../../types';
import type { ProjectDashboardAlert, ProjectDashboardStats, ProjectDashboardTab } from '../../types/projectDashboard';
import { ViewHighlightBanner, ViewStatCard, ViewStatsGrid } from '../../components/shared';
import { getPriorityLabel, getStatusColor, getStatusLabel } from '../projects/components/projectPresentation';
import { severityBadgeClass } from './projectDashboardPresentation';
import { ProjectDashboardQuickCard } from './ProjectDashboardQuickCard';

interface ProjectDashboardOverviewTabProps {
  stats: ProjectDashboardStats;
  activeProject: Project | null;
  alerts: ProjectDashboardAlert[];
  onGoTab: (tab: ProjectDashboardTab) => void;
}

export function ProjectDashboardOverviewTab({
  stats,
  activeProject,
  alerts,
  onGoTab,
}: ProjectDashboardOverviewTabProps) {
  const circumference = 553;
  const dash = (stats.healthScore / 100) * circumference;
  const previewAlerts = alerts.slice(0, 3);

  return (
    <div className="space-y-4 sm:space-y-5 min-w-0">
      <ViewHighlightBanner
        title={activeProject ? `Pilotage — ${activeProject.name}` : 'Pilotage projet'}
        subtitle={`${stats.activeProjects} projet(s) actif(s) · ${stats.tasksInProgress} tâche(s) en cours · ${stats.criticalAlerts} alerte(s) critique(s)`}
        value={`${stats.healthScore}%`}
        progress={stats.healthScore}
        theme="indigo"
      />

      <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-5 sm:p-8 text-white shadow-lg overflow-hidden relative">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
          <div className="flex-1 w-full space-y-4">
            <div className="flex items-center gap-3">
              <Award className="w-9 h-9 sm:w-10 sm:h-10 shrink-0" />
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Santé du projet</h2>
                <p className="text-indigo-100 text-sm">Avancement, alertes et charge opérationnelle</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              <MiniStat label="Projets" value={String(stats.activeProjects)} />
              <MiniStat label="Tâches" value={String(stats.tasksInProgress)} />
              <MiniStat label="Critiques" value={String(stats.criticalAlerts)} />
              <MiniStat
                label="Réussite"
                value={stats.successRate != null ? `${stats.successRate}%` : '—'}
              />
            </div>
          </div>
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 192 192">
              <circle cx="96" cy="96" r="88" stroke="rgba(255,255,255,0.2)" strokeWidth="14" fill="none" />
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="white"
                strokeWidth="14"
                fill="none"
                strokeDasharray={`${dash} ${circumference}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl sm:text-5xl font-bold">{stats.healthScore}%</span>
              <span className="text-xs text-indigo-200">Santé</span>
            </div>
          </div>
        </div>
      </div>

      <ViewStatsGrid cols={2} className="sm:grid-cols-4">
        <ViewStatCard
          label="Projets actifs"
          value={String(stats.activeProjects)}
          gradient="from-indigo-500 to-violet-600"
          icon={Target}
        />
        <ViewStatCard
          label="Tâches en cours"
          value={String(stats.tasksInProgress)}
          gradient="from-amber-500 to-orange-500"
          icon={Clock}
        />
        <ViewStatCard
          label="Taux de réussite"
          value={stats.successRate != null ? `${stats.successRate}%` : '—'}
          gradient="from-emerald-500 to-teal-600"
          icon={CheckCircle}
        />
        <ViewStatCard
          label="Alertes critiques"
          value={String(stats.criticalAlerts)}
          gradient="from-red-500 to-rose-600"
          icon={AlertTriangle}
        />
      </ViewStatsGrid>

      <section className="rounded-xl sm:rounded-2xl border border-stone-200/90 bg-white p-4 sm:p-5 shadow-sm min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <h3 className="font-semibold text-stone-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Alertes à traiter
          </h3>
          <button
            type="button"
            onClick={() => onGoTab('alerts')}
            className="text-sm font-medium text-indigo-700 hover:text-indigo-900 inline-flex items-center gap-1"
          >
            Gérer les alertes
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        {previewAlerts.length === 0 ? (
          <p className="text-sm text-slate-500 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-5 text-center">
            Aucune alerte pour ce projet.
          </p>
        ) : (
          <ul className="space-y-2">
            {previewAlerts.map((alert) => (
              <li
                key={alert.id}
                className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2.5 min-w-0"
              >
                <AlertTriangle
                  className={`w-4 h-4 shrink-0 mt-0.5 ${alert.severity === 'critical' ? 'text-red-600' : 'text-amber-600'}`}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-800 break-words">{alert.message}</p>
                  <span className={`inline-flex mt-1.5 saas-badge border text-[10px] ${severityBadgeClass(alert.severity)}`}>
                    {alert.severity === 'critical' ? 'Critique' : 'Avertissement'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {activeProject ? (
        <section className="rounded-xl sm:rounded-2xl border border-stone-200/90 bg-white p-4 sm:p-5 shadow-sm min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <h3 className="font-semibold text-stone-900">Projet en cours</h3>
            <button
              type="button"
              onClick={() => onGoTab('project')}
              className="text-sm font-medium text-indigo-700 hover:text-indigo-900 inline-flex items-center gap-1"
            >
              Voir le détail
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <ProjectSnapshotCard project={activeProject} />
        </section>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <ProjectDashboardQuickCard
          title="Alertes"
          hint={`${alerts.length} signalée(s)`}
          value={String(stats.criticalAlerts)}
          tone="red"
          onClick={() => onGoTab('alerts')}
        />
        <ProjectDashboardQuickCard
          title="Projet actif"
          hint={activeProject?.name ?? 'Aucun projet'}
          value={activeProject ? `${stats.projectProgress}%` : '—'}
          tone="indigo"
          onClick={() => onGoTab('project')}
        />
        <ProjectDashboardQuickCard
          title="Actions rapides"
          hint="Créer, planifier, rapporter"
          value="3"
          tone="violet"
          onClick={() => onGoTab('actions')}
        />
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/10 border border-white/15 px-3 py-2.5 text-center">
      <p className="text-lg sm:text-xl font-bold">{value}</p>
      <p className="text-[11px] text-indigo-100">{label}</p>
    </div>
  );
}

function ProjectSnapshotCard({ project }: { project: Project }) {
  const budgetUsed = project.budget?.used ?? 0;
  const budgetTotal = project.budget?.total ?? 0;
  const budgetPct = budgetTotal > 0 ? Math.round((budgetUsed / budgetTotal) * 100) : 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 sm:p-5 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="min-w-0">
          <h4 className="font-semibold text-slate-900 text-base break-words">{project.name}</h4>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className={`saas-badge ${getStatusColor(project.status)}`}>
              {getStatusLabel(project.status)}
            </span>
            <span className="saas-badge saas-badge-neutral">
              Priorité {getPriorityLabel(project.priority)}
            </span>
          </div>
        </div>
        <p className="text-2xl font-bold text-indigo-700 shrink-0">{project.progress}%</p>
      </div>
      <div className="mt-4 h-2 rounded-full bg-slate-200 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-600"
          style={{ width: `${project.progress}%` }}
        />
      </div>
      <div className="grid grid-cols-2 gap-3 mt-4 text-xs text-slate-600">
        <div>
          <p className="text-slate-400 uppercase tracking-wide text-[10px] font-semibold">Échéance</p>
          <p className="font-medium text-slate-800 mt-0.5">
            {new Date(project.deadline).toLocaleDateString('fr-FR')}
          </p>
        </div>
        <div>
          <p className="text-slate-400 uppercase tracking-wide text-[10px] font-semibold">Budget</p>
          <p className="font-medium text-slate-800 mt-0.5">
            {(budgetUsed / 1000).toFixed(0)}k€ / {(budgetTotal / 1000).toFixed(0)}k€ ({budgetPct}%)
          </p>
        </div>
      </div>
    </div>
  );
}
