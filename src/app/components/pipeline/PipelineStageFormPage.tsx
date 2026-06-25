import {
  Calendar,
  CheckSquare,
  ExternalLink,
  FileText,
  GitBranch,
  Plus,
  Sparkles,
  Target,
  Trash2,
} from 'lucide-react';
import type { PipelineStage } from '../../types/planning';
import type { ISODocument } from '../../types/documents';
import type { Risk } from '../../types/risks';
import type { TestTask } from '../../data/testData';
import { calculateTaskProgress } from '../../data/testData';
import type { StageGateResult } from '../../utils/pipelineSync';
import { ViewShell, PageBackHeader, ActionButton, AppIcon } from '../shared';
import { TaskStatusBadge } from '../shared/displayHelpers';

export interface PipelineStageFormValues {
  name: string;
  objectives: string[];
  startDate: string;
  endDate: string;
  estimatedDuration: string;
}

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10';

const labelClass = 'block text-sm font-medium text-slate-700 mb-1.5';

const readOnlyClass =
  'w-full rounded-xl border border-slate-200 bg-slate-100/80 px-4 py-3 text-sm text-slate-600 cursor-default';

function statusBadgeClass(status: PipelineStage['status']) {
  switch (status) {
    case 'completed':
      return 'bg-emerald-100 text-emerald-800';
    case 'in-progress':
      return 'bg-blue-100 text-blue-800';
    case 'blocked':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

function statusLabel(status: PipelineStage['status']) {
  switch (status) {
    case 'completed':
      return 'Complétée';
    case 'in-progress':
      return 'En cours';
    case 'blocked':
      return 'Bloquée';
    default:
      return 'À venir';
  }
}

interface PipelineStageFormPageProps {
  title: string;
  subtitle: string;
  mode: 'create' | 'edit';
  values: PipelineStageFormValues;
  durationFromDates: boolean;
  submitLabel: string;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onNameChange: (name: string) => void;
  onObjectivesChange: (objectives: string[]) => void;
  onStartDateChange: (startDate: string) => void;
  onEndDateChange: (endDate: string) => void;
  onDurationChange: (estimatedDuration: string) => void;
  gate?: StageGateResult;
  linkedTasks?: TestTask[];
  linkedDocuments?: ISODocument[];
  linkedRisks?: Risk[];
  referenceDeliverables?: string[];
  referenceExitCriteria?: string[];
  onOpenTasks?: () => void;
  onOpenDocuments?: () => void;
  onOpenRisks?: () => void;
}

export function PipelineStageFormPage({
  title,
  subtitle,
  mode,
  values,
  durationFromDates,
  submitLabel,
  onBack,
  onSubmit,
  onNameChange,
  onObjectivesChange,
  onStartDateChange,
  onEndDateChange,
  onDurationChange,
  gate,
  linkedTasks = [],
  linkedDocuments = [],
  linkedRisks = [],
  referenceDeliverables = [],
  referenceExitCriteria = [],
  onOpenTasks,
  onOpenDocuments,
  onOpenRisks,
}: PipelineStageFormPageProps) {
  const showLinkedSection = mode === 'edit';

  return (
    <ViewShell>
      <PageBackHeader title={title} subtitle={subtitle} onBack={onBack} />

      <form onSubmit={onSubmit} className="space-y-6">
        {mode === 'edit' && gate && (
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 sm:p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <AppIcon icon={Sparkles} size="sm" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Progression calculée automatiquement</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Basée sur les tâches liées et les documents critiques — non modifiable ici
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 self-start sm:self-center">
                <span className="text-2xl font-bold text-slate-900">{gate.progress}%</span>
                <span className={`saas-badge ${statusBadgeClass(gate.status)}`}>
                  {statusLabel(gate.status)}
                </span>
              </div>
            </div>
            {gate.blockers.length > 0 && (
              <ul className="mt-3 pt-3 border-t border-slate-100 text-xs text-amber-800 space-y-1">
                {gate.blockers.map((b) => (
                  <li key={b}>• {b}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-3 pb-1 border-b border-slate-100">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
              <AppIcon icon={GitBranch} size="sm" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Identité de l&apos;étape</h2>
              <p className="text-xs text-slate-500">Nom affiché dans le flux du projet</p>
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="stage-name">
              Nom de l&apos;étape *
            </label>
            <input
              id="stage-name"
              type="text"
              required
              value={values.name}
              onChange={(e) => onNameChange(e.target.value)}
              className={inputClass}
              placeholder="Ex. Cadrage, Conception, Tests & validation"
            />
          </div>

          <ObjectivesEditor objectives={values.objectives} onChange={onObjectivesChange} />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-3 pb-1 border-b border-slate-100">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <AppIcon icon={Calendar} size="sm" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Planning</h2>
              <p className="text-xs text-slate-500">
                Les deux dates calculent la durée ; la durée seule recalcule la date manquante
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass} htmlFor="stage-start">
                Date de début
              </label>
              <input
                id="stage-start"
                type="date"
                value={values.startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                max={values.endDate || undefined}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="stage-end">
                Date de fin
              </label>
              <input
                id="stage-end"
                type="date"
                value={values.endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                min={values.startDate || undefined}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="stage-duration">
                Durée (jours)
                {durationFromDates && (
                  <span className="ml-1 font-normal text-slate-400">— auto</span>
                )}
              </label>
              <input
                id="stage-duration"
                type="number"
                min={1}
                value={values.estimatedDuration}
                onChange={(e) => onDurationChange(e.target.value)}
                readOnly={durationFromDates}
                placeholder={durationFromDates ? undefined : '30'}
                className={durationFromDates ? readOnlyClass : inputClass}
              />
            </div>
          </div>
        </section>

        {showLinkedSection && (
          <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-3 pb-1 border-b border-slate-100">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <AppIcon icon={CheckSquare} size="sm" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">Suivi opérationnel</h2>
                <p className="text-xs text-slate-500">
                  Lié depuis les onglets Tâches, Documentation et Risques — modifiable là-bas uniquement
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <LinkedPanel
                title="Tâches"
                count={linkedTasks.length}
                emptyText="Aucune tâche — assignez une étape pipeline dans l'onglet Tâches."
                onOpen={onOpenTasks}
              >
                {linkedTasks.slice(0, 4).map((task) => (
                  <li key={task.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate text-slate-800">{task.title}</span>
                    <span className="shrink-0 flex items-center gap-1.5">
                      <TaskStatusBadge status={task.status} />
                      <span className="text-xs text-slate-500">{calculateTaskProgress(task)}%</span>
                    </span>
                  </li>
                ))}
                {linkedTasks.length > 4 && (
                  <li className="text-xs text-slate-500">+ {linkedTasks.length - 4} autre(s)</li>
                )}
              </LinkedPanel>

              <LinkedPanel
                title="Documents"
                count={linkedDocuments.length}
                emptyText="Aucun document lié à cette étape."
                onOpen={onOpenDocuments}
              >
                {linkedDocuments.slice(0, 4).map((doc) => (
                  <li key={doc.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate text-slate-800">{doc.title}</span>
                    <span
                      className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${
                        doc.status === 'validated'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {doc.status === 'validated' ? 'Validé' : 'Brouillon'}
                    </span>
                  </li>
                ))}
              </LinkedPanel>

              <LinkedPanel
                title="Risques"
                count={linkedRisks.length}
                emptyText="Aucun risque lié à cette étape."
                onOpen={onOpenRisks}
              >
                {linkedRisks.slice(0, 4).map((risk) => (
                  <li key={risk.id} className="text-sm text-slate-800 truncate">
                    {risk.title}
                  </li>
                ))}
              </LinkedPanel>
            </div>
          </section>
        )}

        {mode === 'edit' && (referenceDeliverables.length > 0 || referenceExitCriteria.length > 0) && (
          <section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-1 border-b border-slate-200/80">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-200/80 text-slate-600">
                <AppIcon icon={Target} size="sm" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-800">Cadre de référence</h2>
                <p className="text-xs text-slate-500">Données méthodologiques — lecture seule</p>
              </div>
            </div>
            {referenceDeliverables.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-2">Livrables attendus</h3>
                <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                  {referenceDeliverables.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </div>
            )}
            {referenceExitCriteria.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-2">Critères de sortie</h3>
                <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                  {referenceExitCriteria.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {mode === 'create' && (
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 text-sm text-indigo-900">
            Après création, liez des tâches et documents depuis leurs onglets respectifs pour alimenter
            la progression de cette étape.
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
          <ActionButton type="button" variant="secondary" onClick={onBack} className="!rounded-xl !py-3">
            Annuler
          </ActionButton>
          <ActionButton
            type="submit"
            variant="primary"
            icon={FileText}
            className="!rounded-xl !py-3 !shadow-lg !shadow-indigo-500/20"
          >
            {submitLabel}
          </ActionButton>
        </div>
      </form>
    </ViewShell>
  );
}

function ObjectivesEditor({
  objectives,
  onChange,
}: {
  objectives: string[];
  onChange: (objectives: string[]) => void;
}) {
  const addObjective = () => onChange([...objectives, '']);

  const updateObjective = (index: number, value: string) => {
    onChange(objectives.map((item, i) => (i === index ? value : item)));
  };

  const removeObjective = (index: number) => {
    onChange(objectives.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div>
        <p className={labelClass}>Objectifs de l&apos;étape</p>
        <p className="text-xs text-slate-500">
          Décrivez ce que cette phase doit accomplir — visible dans la fiche étape.
        </p>
      </div>

      {objectives.length === 0 ? (
        <div className="rounded-xl border border-dashed border-violet-200 bg-violet-50/30 px-4 py-8 text-center">
          <p className="text-sm text-slate-600 mb-4">Aucun objectif pour le moment.</p>
          <button
            type="button"
            onClick={addObjective}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-violet-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter un objectif
          </button>
        </div>
      ) : (
        <>
          <ul className="space-y-2">
            {objectives.map((objective, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="mt-2.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-xs font-bold text-violet-700">
                  {index + 1}
                </span>
                <input
                  type="text"
                  value={objective}
                  onChange={(e) => updateObjective(index, e.target.value)}
                  placeholder="Ex. Valider le périmètre avec le comité de pilotage"
                  className={`${inputClass} flex-1 min-w-0`}
                />
                <button
                  type="button"
                  onClick={() => removeObjective(index)}
                  className="mt-2 p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  aria-label={`Supprimer l'objectif ${index + 1}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={addObjective}
            className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-white px-4 py-2 text-sm font-medium text-violet-700 hover:bg-violet-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter un objectif
          </button>
        </>
      )}
    </div>
  );
}

function LinkedPanel({
  title,
  count,
  emptyText,
  onOpen,
  children,
}: {
  title: string;
  count: number;
  emptyText: string;
  onOpen?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900">
          {title} <span className="text-slate-400 font-normal">({count})</span>
        </h3>
        {onOpen && (
          <button
            type="button"
            onClick={onOpen}
            className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800"
          >
            Ouvrir
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {count === 0 ? (
        <p className="text-xs text-slate-500 leading-relaxed">{emptyText}</p>
      ) : (
        <ul className="space-y-2">{children}</ul>
      )}
    </div>
  );
}
