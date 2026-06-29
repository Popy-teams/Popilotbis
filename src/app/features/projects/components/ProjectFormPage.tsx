import { useMemo } from 'react';
import {
  Calendar,
  DollarSign,
  Eye,
  EyeOff,
  FileText,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';
import { Project } from '../../../types';
import {
  ViewShell,
  PageBackHeader,
  ActionButton,
  AppIcon,
  viewGrids,
} from '../../../components/shared';
import {
  computeProjectStatus,
  getPriorityBadge,
  getStatusColor,
  getStatusHint,
  getStatusLabel,
} from './projectPresentation';

interface MemberOption {
  id: string;
  name: string;
  initials: string;
}

export interface ProjectFormValues {
  name: string;
  description: string;
  priority: Project['priority'];
  startDate: string;
  deadline: string;
  budgetTotal: string;
  selectedMembers: string[];
  isRestricted: boolean;
}

interface ProjectFormPageProps {
  title: string;
  subtitle: string;
  values: ProjectFormValues;
  members: MemberOption[];
  submitLabel: string;
  submitError?: string;
  progress?: number;
  onBack: () => void;
  onChange: (values: ProjectFormValues) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10';

const labelClass = 'block text-sm font-medium text-slate-700 mb-1.5';

export function ProjectFormPage({
  title,
  subtitle,
  values,
  members,
  submitLabel,
  submitError,
  progress = 0,
  onBack,
  onChange,
  onSubmit,
}: ProjectFormPageProps) {
  const previewStatus = useMemo(
    () =>
      values.deadline
        ? computeProjectStatus({ deadline: values.deadline, progress })
        : null,
    [values.deadline, progress]
  );

  const toggleMember = (memberId: string) => {
    const selectedMembers = values.selectedMembers.includes(memberId)
      ? values.selectedMembers.filter((id) => id !== memberId)
      : [...values.selectedMembers, memberId];
    onChange({ ...values, selectedMembers });
  };

  return (
    <ViewShell>
      <PageBackHeader title={title} subtitle={subtitle} onBack={onBack} />

      <form onSubmit={onSubmit} noValidate className="space-y-6">
        {submitError ? (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {submitError}
          </div>
        ) : null}
        {/* Statut automatique */}
        {previewStatus && (
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 sm:p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <AppIcon icon={Sparkles} size="sm" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Statut calculé automatiquement</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Basé sur la date d&apos;échéance{progress > 0 ? ' et l&apos;avancement' : ''} — non modifiable manuellement
                  </p>
                </div>
              </div>
              <span className={`saas-badge ${getStatusColor(previewStatus)} self-start sm:self-center`}>
                {getStatusLabel(previewStatus)}
              </span>
            </div>
            {values.deadline && (
              <p className="mt-3 text-xs text-slate-600 border-t border-slate-100 pt-3">
                {getStatusHint(previewStatus, values.deadline)}
              </p>
            )}
          </div>
        )}

        {/* Informations générales */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-3 pb-1 border-b border-slate-100">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <AppIcon icon={Target} size="sm" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Informations générales</h2>
              <p className="text-xs text-slate-500">Identité et description du projet</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={labelClass} htmlFor="project-name">
                Nom du projet *
              </label>
              <input
                id="project-name"
                type="text"
                required
                value={values.name}
                onChange={(e) => onChange({ ...values, name: e.target.value })}
                className={inputClass}
                placeholder="Ex. Popy — Assistant vocal"
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass} htmlFor="project-description">
                Description *
              </label>
              <textarea
                id="project-description"
                required
                rows={4}
                value={values.description}
                onChange={(e) => onChange({ ...values, description: e.target.value })}
                className={inputClass}
                placeholder="Objectifs, périmètre et livrables attendus…"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="project-priority">
                Priorité *
              </label>
              <select
                id="project-priority"
                value={values.priority}
                onChange={(e) => onChange({ ...values, priority: e.target.value as Project['priority'] })}
                className={inputClass}
              >
                <option value="high">Élevée</option>
                <option value="medium">Moyenne</option>
                <option value="low">Basse</option>
              </select>
            </div>
          </div>
        </section>

        {/* Planning & budget */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-3 pb-1 border-b border-slate-100">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <AppIcon icon={Calendar} size="sm" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Planning & budget</h2>
              <p className="text-xs text-slate-500">Dates clés et enveloppe financière</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="project-start">
                Date de début
              </label>
              <input
                id="project-start"
                type="date"
                value={values.startDate}
                onChange={(e) => onChange({ ...values, startDate: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="project-deadline">
                Date d&apos;échéance *
              </label>
              <input
                id="project-deadline"
                type="date"
                required
                value={values.deadline}
                onChange={(e) => onChange({ ...values, deadline: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass} htmlFor="project-budget">
                Budget total (EUR)
              </label>
              <div className="relative">
                <AppIcon
                  icon={DollarSign}
                  size="sm"
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  id="project-budget"
                  type="number"
                  min="0"
                  step="1"
                  value={values.budgetTotal}
                  onChange={(e) => onChange({ ...values, budgetTotal: e.target.value })}
                  className={`${inputClass} pl-10`}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Visibilité */}
        <section className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50/80 to-white p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                <AppIcon icon={values.isRestricted ? EyeOff : Eye} size="sm" />
              </div>
              <div>
                <h2 className="font-semibold text-violet-950">Visibilité du projet</h2>
                <p className="text-xs text-violet-700 mt-0.5 max-w-md">
                  {values.isRestricted
                    ? 'Seuls les participants sélectionnés et les administrateurs voient ce projet.'
                    : 'Tous les utilisateurs connectés peuvent consulter ce projet.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onChange({ ...values, isRestricted: !values.isRestricted })}
              className={`relative shrink-0 w-12 h-7 rounded-full transition-colors ${
                values.isRestricted ? 'bg-violet-600' : 'bg-slate-300'
              }`}
              aria-label="Restreindre la visibilité"
            >
              <span
                className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                  values.isRestricted ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>
        </section>

        {/* Équipe */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-1 border-b border-slate-100">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <AppIcon icon={Users} size="sm" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">
                Participants {values.isRestricted ? '(visibilité + équipe)' : '(équipe)'}
              </h2>
              <p className="text-xs text-slate-500">Membres impliqués dans le projet</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {members.map((member) => {
              const selected = values.selectedMembers.includes(member.id);
              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => toggleMember(member.id)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl border text-left transition-all ${
                    selected
                      ? 'border-indigo-400 bg-indigo-50/80 text-indigo-900 shadow-sm ring-1 ring-indigo-200'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      selected ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {member.initials}
                  </span>
                  <span className="text-sm font-medium truncate">{member.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
          <ActionButton type="button" variant="secondary" onClick={onBack} className="!rounded-xl !py-3">
            Annuler
          </ActionButton>
          <ActionButton type="submit" variant="primary" icon={FileText} className="!rounded-xl !py-3 !shadow-lg !shadow-indigo-500/20">
            {submitLabel}
          </ActionButton>
        </div>
      </form>
    </ViewShell>
  );
}
