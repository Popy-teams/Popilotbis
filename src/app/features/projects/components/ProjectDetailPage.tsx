import { Archive, Calendar, Clock, DollarSign, Edit2, Eye, EyeOff, Flag, Target, Trash2, Users } from 'lucide-react';
import { Project } from '../../../types';
import { ViewShell, PageBackHeader, ActionButton, AppIcon, viewGrids } from '../../../components/shared';
import {
  formatBudget,
  getDaysUntilDeadline,
  getPriorityBadge,
  getPriorityLabel,
  getStatusColor,
  getStatusHint,
  getStatusLabel,
  getProjectBudget,
  getBudgetUsagePercent,
  withEffectiveStatus,
} from './projectPresentation';

interface MemberOption {
  id: string;
  name: string;
  initials: string;
}

interface ProjectDetailPageProps {
  project: Project;
  members?: MemberOption[];
  onBack: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

export function ProjectDetailPage({
  project: rawProject,
  members = [],
  onBack,
  onEdit,
  onArchive,
  onDelete,
}: ProjectDetailPageProps) {
  const project = withEffectiveStatus(rawProject);
  const priority = getPriorityBadge(project.priority);
  const PriorityIcon = priority.icon;
  const budget = getProjectBudget(project);
  const budgetRate = getBudgetUsagePercent(project);
  const daysLeft = getDaysUntilDeadline(project.deadline);

  const participantNames =
    project.participantIds?.length && members.length
      ? members.filter((m) => project.participantIds!.includes(m.id))
      : members.filter((m) => project.team?.includes(m.initials));

  return (
    <ViewShell>
      <PageBackHeader
        title={project.name}
        subtitle="Fiche projet — consultation détaillée"
        onBack={onBack}
        actions={
          <>
            <ActionButton variant="secondary" icon={Edit2} onClick={onEdit} className="!rounded-xl">
              Modifier
            </ActionButton>
            <ActionButton variant="secondary" icon={Archive} onClick={onArchive} className="!rounded-xl">
              Archiver
            </ActionButton>
            <ActionButton variant="danger" icon={Trash2} onClick={onDelete} className="!rounded-xl">
              Supprimer
            </ActionButton>
          </>
        }
      />

      {/* En-tête hero */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm mb-6">
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-500" />
        <div className="p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex items-start gap-4 min-w-0">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/25">
                <AppIcon icon={Target} size="lg" className="text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`saas-badge ${getStatusColor(project.status)}`}>
                    {getStatusLabel(project.status)}
                  </span>
                  <span className={`saas-badge ${priority.cls} inline-flex items-center gap-1`}>
                    <PriorityIcon className="w-3 h-3" />
                    Priorité {getPriorityLabel(project.priority)}
                  </span>
                  {project.isRestricted ? (
                    <span className="saas-badge saas-badge-neutral inline-flex items-center gap-1">
                      <EyeOff className="w-3 h-3" /> Restreint
                    </span>
                  ) : (
                    <span className="saas-badge saas-badge-neutral inline-flex items-center gap-1">
                      <Eye className="w-3 h-3" /> Public
                    </span>
                  )}
                </div>
                <p className="text-slate-700 leading-relaxed break-words">
                  {project.description || 'Aucune description renseignée.'}
                </p>
                <p className="mt-3 text-xs text-slate-500 flex items-center gap-1.5">
                  <AppIcon icon={Clock} size="xs" />
                  {getStatusHint(project.status, project.deadline)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
              <span>Avancement global</span>
              <span className="font-semibold text-slate-800">{project.progress}%</span>
            </div>
            <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all"
                style={{ width: `${Math.max(0, Math.min(100, project.progress))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className={`${viewGrids.stats4} mb-6`}>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <AppIcon icon={Flag} size="xs" />
            Statut
          </div>
          <p className="font-semibold text-slate-900">{getStatusLabel(project.status)}</p>
          <p className="text-xs text-slate-500 mt-1">Calculé automatiquement</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <AppIcon icon={Calendar} size="xs" />
            Échéance
          </div>
          <p className="font-semibold text-slate-900">
            {new Date(project.deadline).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {daysLeft < 0
              ? `${Math.abs(daysLeft)} j. de retard`
              : daysLeft === 0
              ? "Aujourd'hui"
              : `Dans ${daysLeft} j.`}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <AppIcon icon={DollarSign} size="xs" />
            Budget
          </div>
          <p className="font-semibold text-slate-900">{formatBudget(budget.used)}</p>
          <p className="text-xs text-slate-500 mt-1">
            sur {formatBudget(budget.total)} ({budgetRate} %)
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <AppIcon icon={Users} size="xs" />
            Équipe
          </div>
          <p className="font-semibold text-slate-900">{participantNames.length || project.team?.length || 0}</p>
          <p className="text-xs text-slate-500 mt-1">membre{(participantNames.length || 0) > 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Planning */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <AppIcon icon={Calendar} size="sm" className="text-indigo-600" />
            Planning
          </h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4 py-2 border-b border-slate-100">
              <dt className="text-slate-500">Date de début</dt>
              <dd className="font-medium text-slate-900">
                {project.startDate
                  ? new Date(project.startDate).toLocaleDateString('fr-FR')
                  : '—'}
              </dd>
            </div>
            <div className="flex justify-between gap-4 py-2 border-b border-slate-100">
              <dt className="text-slate-500">Date d&apos;échéance</dt>
              <dd className="font-medium text-slate-900">
                {new Date(project.deadline).toLocaleDateString('fr-FR')}
              </dd>
            </div>
            <div className="flex justify-between gap-4 py-2">
              <dt className="text-slate-500">Jours restants</dt>
              <dd
                className={`font-medium ${
                  daysLeft < 0 ? 'text-red-600' : daysLeft <= 14 ? 'text-amber-600' : 'text-emerald-600'
                }`}
              >
                {daysLeft < 0 ? `${Math.abs(daysLeft)} j. dépassés` : `${daysLeft} j.`}
              </dd>
            </div>
          </dl>
        </section>

        {/* Budget détail */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <AppIcon icon={DollarSign} size="sm" className="text-emerald-600" />
            Budget
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Consommé</span>
              <span className="font-medium">{formatBudget(budget.used)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Enveloppe totale</span>
              <span className="font-medium">{formatBudget(budget.total)}</span>
            </div>
            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden mt-2">
              <div
                className={`h-full rounded-full ${budgetRate > 90 ? 'bg-red-500' : budgetRate > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(100, budgetRate)}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 pt-1">{budgetRate} % du budget consommé</p>
          </div>
        </section>

        {/* Équipe */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 lg:col-span-2">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <AppIcon icon={Users} size="sm" className="text-violet-600" />
            Participants
          </h3>
          {participantNames.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {participantNames.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                    {m.initials}
                  </span>
                  <span className="text-sm font-medium text-slate-800">{m.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(project.team || []).map((initials) => (
                <span key={initials} className="saas-badge saas-badge-neutral">
                  {initials}
                </span>
              ))}
              {!project.team?.length && (
                <p className="text-sm text-slate-500">Aucun participant renseigné.</p>
              )}
            </div>
          )}
        </section>
      </div>
    </ViewShell>
  );
}
