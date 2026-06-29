import {
  AlertTriangle,
  ArrowRight,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  Lightbulb,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';
import type { Project } from '../../types';
import type { ProjectDashboardAlert, ProjectDashboardStats, ProjectDashboardTab } from '../../types/projectDashboard';
import { ViewHighlightBanner } from '../../components/shared';
import {
  getDaysUntilDeadline,
  getPriorityLabel,
  getProjectBudget,
  getStatusColor,
  getStatusHint,
  getStatusLabel,
} from '../projects/components/projectPresentation';
import {
  getHealthAssessment,
  getOverviewPriorityMessage,
  severityBadgeClass,
} from './projectDashboardPresentation';
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
  const assessment = getHealthAssessment(stats.healthScore, stats.criticalAlerts, stats.warningAlerts);
  const priorityMessage = getOverviewPriorityMessage(stats, alerts.length);
  const previewAlerts = alerts.slice(0, 3);
  const circumference = 553;
  const dash = (stats.healthScore / 100) * circumference;

  const bannerTheme =
    assessment.bannerTheme === 'emerald'
      ? 'emerald'
      : assessment.bannerTheme === 'amber'
        ? 'amber'
        : 'red';

  return (
    <div className="space-y-5 sm:space-y-6 min-w-0">
      <ViewHighlightBanner
        title={activeProject ? activeProject.name : 'Pilotage projet'}
        subtitle={`${assessment.label} · ${stats.tasksInProgress} tâche(s) · ${alerts.length} alerte(s)`}
        value={`${stats.healthScore}%`}
        progress={stats.healthScore}
        theme={bannerTheme}
      />

      {priorityMessage ? (
        <div
          className={`rounded-2xl border px-4 py-3.5 sm:px-5 sm:py-4 flex flex-col sm:flex-row sm:items-center gap-3 ${
            stats.criticalAlerts > 0
              ? 'border-red-200 bg-red-50/80'
              : 'border-amber-200 bg-amber-50/80'
          }`}
        >
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <Lightbulb
              className={`w-5 h-5 shrink-0 mt-0.5 ${
                stats.criticalAlerts > 0 ? 'text-red-600' : 'text-amber-600'
              }`}
            />
            <div>
              <p className="text-sm font-semibold text-slate-900">Que faire maintenant ?</p>
              <p className="text-sm text-slate-600 mt-0.5 leading-relaxed">{priorityMessage}</p>
            </div>
          </div>
          {stats.criticalAlerts > 0 ? (
            <button
              type="button"
              onClick={() => onGoTab('alerts')}
              className="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
            >
              Voir les alertes
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      ) : null}

      {/* Santé — carte principale */}
      <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-5 sm:p-7 text-white shadow-lg overflow-hidden relative">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-center">
          <div className="space-y-4 min-w-0">
            <div>
              <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider">
                Indicateur de santé
              </p>
              <h2 className="text-xl sm:text-2xl font-bold mt-1">{assessment.label}</h2>
              <p className="text-indigo-100 text-sm mt-1.5 leading-relaxed">{assessment.hint}</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <KpiChip label="Projets" value={String(stats.activeProjects)} onClick={() => onGoTab('project')} />
              <KpiChip label="Tâches" value={String(stats.tasksInProgress)} />
              <KpiChip
                label="Critiques"
                value={String(stats.criticalAlerts)}
                highlight={stats.criticalAlerts > 0}
                onClick={() => onGoTab('alerts')}
              />
              <KpiChip
                label="Avancement"
                value={`${stats.projectProgress}%`}
                onClick={() => onGoTab('project')}
              />
            </div>
          </div>
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto lg:mx-0 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 192 192" aria-hidden>
              <circle cx="96" cy="96" r="88" stroke="rgba(255,255,255,0.2)" strokeWidth="12" fill="none" />
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="white"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${dash} ${circumference}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl sm:text-4xl font-bold tabular-nums">{stats.healthScore}%</span>
              <span className="text-[11px] text-indigo-200 font-medium">Santé</span>
            </div>
          </div>
        </div>
      </div>

      {/* Projet + alertes côte à côte */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5">
        <OverviewPanel
          title="Projet actif"
          icon={<Briefcase className="w-5 h-5 text-indigo-600" />}
          actionLabel="Fiche complète"
          onAction={() => onGoTab('project')}
        >
          {activeProject ? (
            <ProjectFocusCard project={activeProject} onOpen={() => onGoTab('project')} />
          ) : (
            <EmptyHint
              message="Sélectionnez un projet dans le menu en haut de l'écran pour afficher son suivi."
            />
          )}
        </OverviewPanel>

        <OverviewPanel
          title="Alertes à traiter"
          icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
          actionLabel={alerts.length > 0 ? 'Tout voir' : 'Créer une alerte'}
          onAction={() => onGoTab('alerts')}
        >
          {previewAlerts.length === 0 ? (
            <EmptyHint
              message="Aucune alerte — le projet est calme sur ce point."
              positive
            />
          ) : (
            <ul className="space-y-2">
              {previewAlerts.map((alert, index) => (
                <li key={alert.id}>
                  <button
                    type="button"
                    onClick={() => onGoTab('alerts')}
                    className="w-full text-left flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-slate-200 hover:shadow-sm px-3 py-3 transition-all min-w-0"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-500">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-800 line-clamp-2 leading-snug">{alert.message}</p>
                      <span
                        className={`inline-flex mt-1.5 saas-badge border text-[10px] ${severityBadgeClass(alert.severity)}`}
                      >
                        {alert.severity === 'critical' ? 'Critique' : 'Avertissement'}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 shrink-0 mt-1" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </OverviewPanel>
      </div>

      {/* Navigation intuitive */}
      <section className="min-w-0">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <Sparkles className="w-5 h-5 text-violet-600" />
          <h3 className="font-semibold text-slate-900">Aller plus loin</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          <ProjectDashboardQuickCard
            icon={AlertTriangle}
            title="Alertes"
            value={String(alerts.length)}
            hint={
              stats.criticalAlerts > 0
                ? `${stats.criticalAlerts} critique(s) à traiter`
                : 'Suivi des risques projet'
            }
            tone="red"
            onClick={() => onGoTab('alerts')}
          />
          <ProjectDashboardQuickCard
            icon={Target}
            title="Projet"
            value={activeProject ? `${stats.projectProgress}%` : '—'}
            hint={activeProject?.name ?? 'Choisir un projet'}
            tone="indigo"
            onClick={() => onGoTab('project')}
          />
          <ProjectDashboardQuickCard
            icon={Clock}
            title="Tâches"
            value={String(stats.tasksInProgress)}
            hint="En cours ou bloquées"
            tone="sky"
            onClick={() => onGoTab('actions')}
          />
          <ProjectDashboardQuickCard
            icon={Zap}
            title="Actions"
            value="3"
            hint="Créer, planifier, rapporter"
            tone="violet"
            onClick={() => onGoTab('actions')}
          />
        </div>
      </section>
    </div>
  );
}

function OverviewPanel({
  title,
  icon,
  actionLabel,
  onAction,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  actionLabel: string;
  onAction: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-sm min-w-0 flex flex-col h-full">
      <div className="flex items-center justify-between gap-2 mb-4">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2 min-w-0">
          {icon}
          <span className="truncate">{title}</span>
        </h3>
        <button
          type="button"
          onClick={onAction}
          className="text-xs sm:text-sm font-semibold text-indigo-700 hover:text-indigo-900 inline-flex items-center gap-1 shrink-0"
        >
          {actionLabel}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </section>
  );
}

function KpiChip({
  label,
  value,
  highlight,
  onClick,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  onClick?: () => void;
}) {
  const className = `rounded-xl px-3 py-2.5 text-center transition-colors ${
    highlight
      ? 'bg-red-500/25 border border-red-300/40 hover:bg-red-500/35'
      : 'bg-white/10 border border-white/15 hover:bg-white/15'
  } ${onClick ? 'cursor-pointer' : ''}`;

  const inner = (
    <>
      <p className="text-base sm:text-lg font-bold tabular-nums">{value}</p>
      <p className="text-[10px] sm:text-[11px] text-indigo-100">{label}</p>
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {inner}
      </button>
    );
  }
  return <div className={className}>{inner}</div>;
}

function EmptyHint({ message, positive }: { message: string; positive?: boolean }) {
  return (
    <div
      className={`rounded-xl border border-dashed p-6 text-center text-sm leading-relaxed ${
        positive
          ? 'border-emerald-200 bg-emerald-50/50 text-emerald-800'
          : 'border-slate-200 bg-slate-50/50 text-slate-500'
      }`}
    >
      {positive ? (
        <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
      ) : null}
      {message}
    </div>
  );
}

function ProjectFocusCard({ project, onOpen }: { project: Project; onOpen: () => void }) {
  const { used, total } = getProjectBudget(project);
  const budgetPct = total > 0 ? Math.round((used / total) * 100) : 0;
  const daysLeft = getDaysUntilDeadline(project.deadline);
  const deadlineLabel =
    daysLeft < 0
      ? `En retard de ${Math.abs(daysLeft)} j`
      : daysLeft === 0
        ? "Échéance aujourd'hui"
        : `J-${daysLeft}`;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full text-left rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/50 p-4 sm:p-5 hover:shadow-md hover:border-indigo-200 transition-all min-w-0 group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="font-semibold text-slate-900 text-base sm:text-lg break-words group-hover:text-indigo-800 transition-colors">
            {project.name}
          </h4>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className={`saas-badge ${getStatusColor(project.status)}`}>
              {getStatusLabel(project.status)}
            </span>
            <span className="saas-badge saas-badge-neutral">
              {getPriorityLabel(project.priority)}
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl sm:text-3xl font-bold text-indigo-700 tabular-nums">{project.progress}%</p>
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Avancement</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Progression</span>
            <span>{project.progress}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-600"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Budget consommé</span>
            <span>{budgetPct}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                budgetPct > 90 ? 'bg-red-500' : budgetPct > 75 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(budgetPct, 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2 min-w-0">
          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] uppercase font-semibold text-slate-400">Échéance</p>
            <p className="text-xs font-semibold text-slate-800 truncate">{deadlineLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <Target className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] uppercase font-semibold text-slate-400">Budget</p>
            <p className="text-xs font-semibold text-slate-800 truncate">
              {(used / 1000).toFixed(0)}k / {(total / 1000).toFixed(0)}k€
            </p>
          </div>
        </div>
      </div>

      {project.deadline ? (
        <p className="text-xs text-slate-500 mt-3 line-clamp-2">
          {getStatusHint(project.status, project.deadline)}
        </p>
      ) : null}
    </button>
  );
}
