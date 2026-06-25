import {
  Calendar,
  CheckSquare,
  ClipboardList,
  FileText,
  FolderKanban,
  GitBranch,
  Link2,
  Plus,
  Sparkles,
  Trash2,
  User,
} from 'lucide-react';
import type { PipelineStage } from '../../types/planning';
import type { TestTask, TestTeamMember } from '../../data/testData';
import { calculateTaskProgress } from '../../data/testData';
import { ViewShell, PageBackHeader, ActionButton, AppIcon, FormSelect } from '../shared';
import { TaskStatusBadge } from '../shared/displayHelpers';

export interface TaskSubtaskFormItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskFormValues {
  title: string;
  description: string;
  status: TestTask['status'];
  priority: TestTask['priority'];
  assignedTo: string;
  dueDate: string;
  stageId: string;
  progress: string;
  subtasks: TaskSubtaskFormItem[];
}

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10';

const labelClass = 'block text-sm font-medium text-slate-700 mb-1.5';

export function taskToFormValues(task: TestTask): TaskFormValues {
  return {
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    assignedTo: task.assignedTo,
    dueDate: task.dueDate,
    stageId: task.stageId ?? '',
    progress: String(task.progress),
    subtasks: task.subtasks.map((st) => ({ ...st })),
  };
}

export function emptyTaskForm(defaultAssignee: string): TaskFormValues {
  return {
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assignedTo: defaultAssignee,
    dueDate: '',
    stageId: '',
    progress: '0',
    subtasks: [],
  };
}

export function formValuesToTask(
  values: TaskFormValues,
  base: Partial<TestTask> & Pick<TestTask, 'id'>,
  members: TestTeamMember[],
  projectId: string,
  projectName: string
): TestTask {
  const subtasks = values.subtasks
    .map((st) => ({ ...st, title: st.title.trim() }))
    .filter((st) => st.title.length > 0);

  const progress =
    subtasks.length > 0
      ? Math.round((subtasks.filter((st) => st.completed).length / subtasks.length) * 100)
      : Math.min(100, Math.max(0, Number(values.progress) || 0));

  const assignedToName = members.find((m) => m.id === values.assignedTo)?.name ?? values.assignedTo;

  return {
    id: base.id,
    title: values.title.trim(),
    description: values.description.trim(),
    status: values.status,
    priority: values.priority,
    assignedTo: values.assignedTo,
    assignedToName,
    projectId,
    projectName,
    dueDate: values.dueDate,
    progress,
    subtasks,
    linkedToProcesses: base.linkedToProcesses,
    linkedToProcessSteps: base.linkedToProcessSteps,
    stageId: values.stageId || undefined,
  };
}

interface TaskFormPageProps {
  mode: 'create' | 'edit';
  title: string;
  subtitle: string;
  values: TaskFormValues;
  members: TestTeamMember[];
  stages: PipelineStage[];
  linkedProcessCount?: number;
  submitLabel: string;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (values: TaskFormValues) => void;
}

export function TaskFormPage({
  mode,
  title,
  subtitle,
  values,
  members,
  stages,
  linkedProcessCount = 0,
  submitLabel,
  onBack,
  onSubmit,
  onChange,
}: TaskFormPageProps) {
  const previewTask = {
    progress: Number(values.progress) || 0,
    subtasks: values.subtasks,
  } as TestTask;
  const computedProgress = calculateTaskProgress(previewTask);
  const hasSubtasks = values.subtasks.some((st) => st.title.trim().length > 0);

  const patch = (partial: Partial<TaskFormValues>) => onChange({ ...values, ...partial });

  const addSubtask = () => {
    patch({
      subtasks: [...values.subtasks, { id: `st-${Date.now()}`, title: '', completed: false }],
    });
  };

  const updateSubtask = (index: number, partial: Partial<TaskSubtaskFormItem>) => {
    patch({
      subtasks: values.subtasks.map((st, i) => (i === index ? { ...st, ...partial } : st)),
    });
  };

  const removeSubtask = (index: number) => {
    patch({ subtasks: values.subtasks.filter((_, i) => i !== index) });
  };

  return (
    <ViewShell>
      <PageBackHeader title={title} subtitle={subtitle} onBack={onBack} />

      <form onSubmit={onSubmit} className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <AppIcon icon={Sparkles} size="sm" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Avancement de la tâche</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {hasSubtasks
                    ? 'Calculé automatiquement à partir des sous-tâches cochées'
                    : 'Saisissez un pourcentage ou ajoutez des sous-tâches'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 self-start sm:self-center">
              <span className="text-2xl font-bold text-slate-900">{computedProgress}%</span>
              <TaskStatusBadge status={values.status} />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-5">
          <SectionHeader icon={ClipboardList} title="Informations générales" subtitle="Titre et description de la tâche" />
          <div>
            <label className={labelClass} htmlFor="task-title">
              Titre *
            </label>
            <input
              id="task-title"
              type="text"
              required
              value={values.title}
              onChange={(e) => patch({ title: e.target.value })}
              className={inputClass}
              placeholder="Ex. Valider les tests de conformité EN71"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="task-description">
              Description
            </label>
            <textarea
              id="task-description"
              rows={4}
              value={values.description}
              onChange={(e) => patch({ description: e.target.value })}
              className={inputClass}
              placeholder="Contexte, livrables attendus, critères de réussite…"
            />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-5">
          <SectionHeader icon={CheckSquare} title="Suivi" subtitle="Statut, priorité et avancement manuel" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="task-status">
                Statut
              </label>
              <FormSelect
                id="task-status"
                value={values.status}
                onChange={(e) => patch({ status: e.target.value as TestTask['status'] })}
              >
                <option value="todo">À faire</option>
                <option value="in-progress">En cours</option>
                <option value="blocked">Bloquée</option>
                <option value="done">Terminée</option>
              </FormSelect>
            </div>
            <div>
              <label className={labelClass} htmlFor="task-priority">
                Priorité
              </label>
              <FormSelect
                id="task-priority"
                value={values.priority}
                onChange={(e) => patch({ priority: e.target.value as TestTask['priority'] })}
              >
                <option value="high">Haute</option>
                <option value="medium">Moyenne</option>
                <option value="low">Basse</option>
              </FormSelect>
            </div>
            {!hasSubtasks && (
              <div className="md:col-span-2">
                <label className={labelClass} htmlFor="task-progress">
                  Avancement manuel (%)
                </label>
                <input
                  id="task-progress"
                  type="number"
                  min={0}
                  max={100}
                  value={values.progress}
                  onChange={(e) => patch({ progress: e.target.value })}
                  className={inputClass}
                />
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-5">
          <SectionHeader icon={Calendar} title="Planification" subtitle="Responsable et échéance" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="task-assignee">
                Assignée à
              </label>
              <FormSelect
                id="task-assignee"
                value={values.assignedTo}
                onChange={(e) => patch({ assignedTo: e.target.value })}
                leadingIconElement={<User className="w-4 h-4 text-slate-400" />}
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} — {m.role}
                  </option>
                ))}
              </FormSelect>
            </div>
            <div>
              <label className={labelClass} htmlFor="task-due">
                Échéance *
              </label>
              <input
                id="task-due"
                type="date"
                required
                value={values.dueDate}
                onChange={(e) => patch({ dueDate: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-5">
          <SectionHeader
            icon={FolderKanban}
            title="Pipeline projet"
            subtitle="Lie la tâche à une étape pour alimenter le pipeline"
          />
          <div>
            <label className={labelClass} htmlFor="task-stage">
              Étape pipeline
            </label>
            <FormSelect
              id="task-stage"
              value={values.stageId}
              onChange={(e) => patch({ stageId: e.target.value })}
              leadingIconElement={<GitBranch className="w-4 h-4 text-slate-400" />}
            >
              <option value="">Aucune étape</option>
              {stages.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.order}. {stage.name}
                </option>
              ))}
            </FormSelect>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1 border-b border-slate-100">
            <SectionHeader
              icon={CheckSquare}
              title="Sous-tâches"
              subtitle="Découpez le travail — l'avancement se met à jour automatiquement"
              inline
            />
            <button
              type="button"
              onClick={addSubtask}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              Ajouter une sous-tâche
            </button>
          </div>

          {values.subtasks.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6 rounded-xl border border-dashed border-slate-200">
              Aucune sous-tâche. Ajoutez-en pour suivre l&apos;avancement point par point.
            </p>
          ) : (
            <ul className="space-y-2">
              {values.subtasks.map((subtask, index) => (
                <li
                  key={subtask.id}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/50 p-2"
                >
                  <input
                    type="checkbox"
                    checked={subtask.completed}
                    onChange={(e) => updateSubtask(index, { completed: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 shrink-0"
                    aria-label={`Marquer la sous-tâche ${index + 1} comme terminée`}
                  />
                  <input
                    type="text"
                    value={subtask.title}
                    onChange={(e) => updateSubtask(index, { title: e.target.value })}
                    placeholder="Intitulé de la sous-tâche"
                    className={`${inputClass} flex-1 min-w-0 !py-2`}
                  />
                  <button
                    type="button"
                    onClick={() => removeSubtask(index)}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                    aria-label={`Supprimer la sous-tâche ${index + 1}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {mode === 'edit' && linkedProcessCount > 0 && (
          <section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                <AppIcon icon={Link2} size="sm" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-800">Processus ISO liés</h2>
                <p className="text-xs text-slate-500">
                  {linkedProcessCount} processus — modifiable depuis l&apos;onglet Processus
                </p>
              </div>
            </div>
          </section>
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

function SectionHeader({
  icon,
  title,
  subtitle,
  inline = false,
}: {
  icon: typeof Calendar;
  title: string;
  subtitle: string;
  inline?: boolean;
}) {
  if (inline) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <AppIcon icon={icon} size="sm" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-900">{title}</h2>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 pb-1 border-b border-slate-100">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
        <AppIcon icon={icon} size="sm" />
      </div>
      <div>
        <h2 className="font-semibold text-slate-900">{title}</h2>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}
