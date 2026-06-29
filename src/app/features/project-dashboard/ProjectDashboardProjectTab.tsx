import type { Project } from '../../types';
import {
  getPriorityLabel,
  getPriorityBadge,
  getStatusColor,
  getStatusLabel,
} from '../projects/components/projectPresentation';

interface ProjectDashboardProjectTabProps {
  activeProject: Project | null;
}

export function ProjectDashboardProjectTab({ activeProject }: ProjectDashboardProjectTabProps) {
  if (!activeProject) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center min-w-0">
        <p className="text-slate-600 font-medium">Aucun projet sélectionné</p>
        <p className="text-sm text-slate-500 mt-2">
          Choisissez un projet dans le menu en haut de l&apos;écran.
        </p>
      </div>
    );
  }

  const budgetUsed = activeProject.budget?.used ?? 0;
  const budgetTotal = activeProject.budget?.total ?? 0;
  const budgetPct = budgetTotal > 0 ? Math.round((budgetUsed / budgetTotal) * 100) : 0;

  return (
    <div className="space-y-4 min-w-0">
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />
        <div className="p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 break-words">
                {activeProject.name}
              </h3>
              {activeProject.description ? (
                <p className="text-sm text-slate-600 mt-2 leading-relaxed break-words">
                  {activeProject.description}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-2 mt-3">
                <span className={`saas-badge ${getStatusColor(activeProject.status)}`}>
                  {getStatusLabel(activeProject.status)}
                </span>
                <span className={`saas-badge ${getPriorityBadge(activeProject.priority).cls}`}>
                  Priorité {getPriorityLabel(activeProject.priority)}
                </span>
              </div>
            </div>
            <div className="text-center sm:text-right shrink-0">
              <p className="text-3xl sm:text-4xl font-bold text-indigo-700">{activeProject.progress}%</p>
              <p className="text-xs text-slate-500 mt-1">Avancement</p>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
              <span>Progression globale</span>
              <span>{activeProject.progress}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 transition-all"
                style={{ width: `${activeProject.progress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <MetricCard
              label="Date de début"
              value={
                activeProject.startDate
                  ? new Date(activeProject.startDate).toLocaleDateString('fr-FR')
                  : '—'
              }
            />
            <MetricCard
              label="Échéance"
              value={new Date(activeProject.deadline).toLocaleDateString('fr-FR')}
            />
            <MetricCard
              label="Budget consommé"
              value={`${(budgetUsed / 1000).toFixed(0)}k€ / ${(budgetTotal / 1000).toFixed(0)}k€`}
              hint={`${budgetPct}% utilisé`}
            />
            <MetricCard
              label="Équipe"
              value={String(activeProject.team?.length ?? 0)}
              hint="membre(s) référencé(s)"
            />
          </div>
        </div>
      </div>

      {/* Tableau desktop */}
      <div className="hidden md:block rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Projet</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Avancement</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Statut</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Priorité</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Échéance</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Budget</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-slate-50/80">
              <td className="px-4 py-4 font-medium text-slate-900">{activeProject.name}</td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2 max-w-[140px]">
                  <div className="flex-1 h-2 rounded-full bg-slate-200">
                    <div
                      className="h-2 rounded-full bg-indigo-600"
                      style={{ width: `${activeProject.progress}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-600">{activeProject.progress}%</span>
                </div>
              </td>
              <td className="px-4 py-4">
                <span className={`saas-badge ${getStatusColor(activeProject.status)}`}>
                  {getStatusLabel(activeProject.status)}
                </span>
              </td>
              <td className="px-4 py-4">
                <span className={`saas-badge ${getPriorityBadge(activeProject.priority).cls}`}>
                  {getPriorityLabel(activeProject.priority)}
                </span>
              </td>
              <td className="px-4 py-4 text-slate-600">
                {new Date(activeProject.deadline).toLocaleDateString('fr-FR')}
              </td>
              <td className="px-4 py-4 text-slate-600">
                {(budgetUsed / 1000).toFixed(0)}k€ / {(budgetTotal / 1000).toFixed(0)}k€
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MetricCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 min-w-0">
      <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-slate-900 mt-1 break-words">{value}</p>
      {hint ? <p className="text-xs text-slate-500 mt-0.5">{hint}</p> : null}
    </div>
  );
}
