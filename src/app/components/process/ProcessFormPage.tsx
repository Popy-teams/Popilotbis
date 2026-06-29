import { useMemo, useState } from 'react';
import {
  Activity,
  CheckSquare,
  LifeBuoy,
  Link2,
  Package,
  Plus,
  Save,
  Shield,
  Square,
  Target,
  Trash2,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ProcessData } from '../../data/testProcesses';
import { TEST_TEAM_MEMBERS, getTasksByProject } from '../../data/testData';
import { PageBackHeader } from '../shared/PageBackHeader';
import { ViewShell, FormSelect, LineItemsEditor, normalizeLineItems } from '../shared';

type ProcessStep = ProcessData['steps'][number];
type ProcessType = ProcessData['type'];

const PROCESS_TYPES: {
  value: ProcessType;
  label: string;
  subtitle: string;
  icon: LucideIcon;
}[] = [
  { value: 'pilotage', label: 'Processus de pilotage', subtitle: 'DÉCIDER', icon: Target },
  { value: 'realisation', label: 'Processus de réalisation', subtitle: 'FAIRE', icon: Package },
  { value: 'support', label: 'Processus support', subtitle: 'PERMETTRE', icon: LifeBuoy },
  { value: 'qualite', label: 'Processus qualité & risques', subtitle: 'SÉCURISER', icon: Shield },
  { value: 'amelioration', label: "Processus d'amélioration continue", subtitle: 'AMÉLIORER', icon: TrendingUp },
  { value: 'indicateurs', label: 'Indicateurs de suivi', subtitle: 'MESURER', icon: Activity },
];

function toLineItems(values?: string[]) {
  return values?.length ? [...values] : [];
}

function calcProgress(steps: ProcessStep[]) {
  if (steps.length === 0) return 0;
  return Math.round((steps.filter((s) => s.status === 'done').length / steps.length) * 100);
}

function calcStatus(steps: ProcessStep[]): ProcessData['status'] {
  const done = steps.filter((s) => s.status === 'done').length;
  if (done === 0) return 'todo';
  if (done === steps.length) return 'done';
  return 'in-progress';
}

interface ProcessFormPageProps {
  mode: 'create' | 'edit';
  projectId: string;
  projectName?: string;
  defaultType?: ProcessType;
  initial?: ProcessData | null;
  onSubmit: (process: ProcessData) => void;
  onCancel: () => void;
}

export function ProcessFormPage({
  mode,
  projectId,
  projectName,
  defaultType = 'pilotage',
  initial,
  onSubmit,
  onCancel,
}: ProcessFormPageProps) {
  const tasks = useMemo(() => getTasksByProject(projectId), [projectId]);

  const [form, setForm] = useState({
    type: initial?.type ?? defaultType,
    title: initial?.title ?? '',
    objective: initial?.objective ?? '',
    trigger: initial?.trigger ?? '',
    responsible: initial?.responsible ?? '',
    contributors: toLineItems(initial?.contributors),
    deliverables: toLineItems(initial?.deliverables),
    validationCriteria: toLineItems(initial?.validationCriteria),
    risks: toLineItems(initial?.risks),
    improvementLink: initial?.improvementLink ?? '',
  });

  const [steps, setSteps] = useState<ProcessStep[]>(
    initial?.steps?.length
      ? initial.steps.map((s) => ({ ...s }))
      : [{ id: `step-${Date.now()}`, title: '', description: '', status: 'todo' }]
  );

  const [assignedMembers, setAssignedMembers] = useState<string[]>(initial?.assignedTo ?? []);
  const [linkedTasks, setLinkedTasks] = useState<string[]>(initial?.linkedTasks ?? []);
  const [showTaskSelector, setShowTaskSelector] = useState(false);
  const [currentStepForTask, setCurrentStepForTask] = useState<string | null>(null);

  const progress = calcProgress(steps);
  const status = calcStatus(steps);

  const addStep = () => {
    setSteps((prev) => [
      ...prev,
      { id: `step-${Date.now()}`, title: '', description: '', status: 'todo' },
    ]);
  };

  const removeStep = (id: string) => {
    if (steps.length <= 1) return;
    const removed = steps.find((s) => s.id === id);
    setSteps((prev) => prev.filter((s) => s.id !== id));
    if (removed?.taskId) {
      setLinkedTasks((prev) => prev.filter((tid) => tid !== removed.taskId));
    }
  };

  const updateStep = (id: string, field: keyof ProcessStep, value: ProcessStep[keyof ProcessStep]) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const linkTaskToStep = (stepId: string, taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    let stepStatus: ProcessStep['status'] = 'todo';
    if (task.status === 'done') stepStatus = 'done';
    else if (task.status === 'in-progress' || task.status === 'blocked') stepStatus = 'in-progress';

    setSteps((prev) =>
      prev.map((s) =>
        s.id === stepId
          ? {
              ...s,
              taskId,
              title: s.title.trim() ? s.title : task.title,
              description: s.description.trim() ? s.description : task.description ?? '',
              status: stepStatus,
            }
          : s
      )
    );

    setLinkedTasks((prev) => (prev.includes(taskId) ? prev : [...prev, taskId]));
    setShowTaskSelector(false);
    setCurrentStepForTask(null);
  };

  const unlinkTaskFromStep = (stepId: string) => {
    const step = steps.find((s) => s.id === stepId);
    if (step?.taskId) {
      setLinkedTasks((prev) => prev.filter((id) => id !== step.taskId));
      updateStep(stepId, 'taskId', undefined);
    }
  };

  const toggleMember = (memberId: string) => {
    setAssignedMembers((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const availableTasks = tasks.filter((t) => !linkedTasks.includes(t.id));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validSteps = steps.filter((s) => s.title.trim());
    if (validSteps.length === 0) return;

    const next: ProcessData = {
      id: initial?.id ?? `process-${Date.now()}`,
      projectId,
      type: form.type,
      title: form.title.trim(),
      objective: form.objective.trim(),
      trigger: form.trigger.trim() || undefined,
      responsible: form.responsible.trim(),
      contributors: normalizeLineItems(form.contributors),
      steps: validSteps,
      deliverables: normalizeLineItems(form.deliverables),
      validationCriteria: normalizeLineItems(form.validationCriteria),
      risks: normalizeLineItems(form.risks),
      improvementLink: form.improvementLink.trim() || undefined,
      assignedTo: assignedMembers,
      linkedTasks,
      status,
      progress: calcProgress(validSteps),
      createdAt: initial?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSubmit(next);
  };

  return (
    <ViewShell narrow>
      <PageBackHeader
        title={mode === 'create' ? 'Créer un processus' : 'Modifier le processus'}
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            {projectName ? <span>{projectName}</span> : null}
            <span className="text-indigo-600 font-medium">Progression : {progress}%</span>
          </span>
        }
        onBack={onCancel}
      />

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 space-y-6 shadow-sm">
        <section>
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Type de processus ISO 9001 *</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {PROCESS_TYPES.map((type) => {
              const TypeIcon = type.icon;
              const selected = form.type === type.value;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setForm({ ...form, type: type.value })}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    selected
                      ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <TypeIcon className={`w-5 h-5 mb-2 ${selected ? 'text-indigo-600' : 'text-gray-500'}`} />
                  <div className="text-xs font-bold text-gray-900">{type.subtitle}</div>
                  <div className="text-xs text-gray-600 mt-0.5 line-clamp-2">{type.label}</div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Titre du processus *</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ex : Validation prototype V0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Objectif *</label>
            <textarea
              required
              rows={2}
              value={form.objective}
              onChange={(e) => setForm({ ...form, objective: e.target.value })}
              placeholder="Décrire clairement l'objectif à atteindre"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Quand il s&apos;applique (déclencheur)</label>
            <input
              value={form.trigger}
              onChange={(e) => setForm({ ...form, trigger: e.target.value })}
              placeholder="Ex : Avant chaque déploiement de version"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Responsable *</label>
            <input
              required
              value={form.responsible}
              onChange={(e) => setForm({ ...form, responsible: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Lien amélioration continue</label>
            <input
              value={form.improvementLink}
              onChange={(e) => setForm({ ...form, improvementLink: e.target.value })}
              placeholder="Référence action d'amélioration"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="md:col-span-2">
            <LineItemsEditor
              label="Contributeurs"
              hint="Personnes impliquées en soutien du responsable."
              items={form.contributors}
              onChange={(contributors) => setForm({ ...form, contributors })}
              placeholder="Ex. Sonia Laurent"
              addLabel="Ajouter un contributeur"
              emptyLabel="Ajouter un contributeur"
            />
          </div>
        </section>

        <section className="rounded-xl border-2 border-indigo-200 bg-indigo-50/50 p-4">
          <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600 shrink-0" />
            Membres assignés ({assignedMembers.length})
          </label>
          <div className="flex flex-wrap gap-2">
            {TEST_TEAM_MEMBERS.map((member) => {
              const assigned = assignedMembers.includes(member.id);
              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => toggleMember(member.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                    assigned
                      ? 'border-indigo-500 bg-indigo-600 text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-indigo-300'
                  }`}
                >
                  {assigned ? <CheckSquare className="w-4 h-4 shrink-0" /> : <Square className="w-4 h-4 shrink-0" />}
                  <span className="font-medium">{member.name}</span>
                  <span className="text-xs opacity-75">({member.role})</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-xl border-2 border-green-200 bg-green-50/50 p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Link2 className="w-5 h-5 text-green-600 shrink-0" />
              Étapes ({steps.filter((s) => s.status === 'done').length}/{steps.length} validées) *
            </label>
            <button
              type="button"
              onClick={addStep}
              className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus className="w-4 h-4" />
              Ajouter une étape
            </button>
          </div>

          <div className="space-y-3">
            {steps.map((step, index) => {
              const linkedTask = tasks.find((t) => t.id === step.taskId);
              return (
                <div key={step.id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          required
                          value={step.title}
                          onChange={(e) => updateStep(step.id, 'title', e.target.value)}
                          placeholder="Nom de l'étape"
                          className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                        <FormSelect
                          size="sm"
                          value={step.status}
                          onChange={(e) =>
                            updateStep(step.id, 'status', e.target.value as ProcessStep['status'])
                          }
                          wrapperClassName="w-full sm:w-36"
                        >
                          <option value="todo">À faire</option>
                          <option value="in-progress">En cours</option>
                          <option value="done">Validé</option>
                        </FormSelect>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentStepForTask(step.id);
                              setShowTaskSelector(true);
                            }}
                            className={`flex-1 sm:flex-none px-3 py-2 border-2 rounded-lg text-sm font-medium inline-flex items-center justify-center gap-1 ${
                              linkedTask
                                ? 'bg-green-50 border-green-500 text-green-700'
                                : 'bg-white border-indigo-300 text-indigo-700'
                            }`}
                          >
                            <Link2 className="w-4 h-4 shrink-0" />
                            {linkedTask ? 'Liée' : 'Lier tâche'}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeStep(step.id)}
                            disabled={steps.length === 1}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 disabled:opacity-40"
                            aria-label="Supprimer l'étape"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {linkedTask ? (
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                          <Link2 className="w-3 h-3 text-green-600 shrink-0" />
                          <span>
                            Tâche liée : <strong>{linkedTask.title}</strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => unlinkTaskFromStep(step.id)}
                            className="ml-auto text-red-600 hover:text-red-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : null}

                      <textarea
                        rows={2}
                        value={step.description}
                        onChange={(e) => updateStep(step.id, 'description', e.target.value)}
                        placeholder="Description de l'étape (optionnel)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LineItemsEditor
            label="Livrables"
            hint="Documents, artefacts ou résultats attendus à la fin du processus."
            items={form.deliverables}
            onChange={(deliverables) => setForm({ ...form, deliverables })}
            placeholder="Ex. Document de vision produit"
            addLabel="Ajouter un livrable"
            emptyLabel="Ajouter un livrable"
          />
          <LineItemsEditor
            label="Critères de validation"
            hint="Conditions à remplir pour considérer le processus comme validé."
            items={form.validationCriteria}
            onChange={(validationCriteria) => setForm({ ...form, validationCriteria })}
            placeholder="Ex. Validation du PO"
            addLabel="Ajouter un critère"
            emptyLabel="Ajouter un critère"
          />
          <div className="md:col-span-2">
            <LineItemsEditor
              label="Risques identifiés"
              hint="Menaces ou points de vigilance liés à ce processus."
              items={form.risks}
              onChange={(risks) => setForm({ ...form, risks })}
              placeholder="Ex. Retard sur les livraisons"
              addLabel="Ajouter un risque"
              emptyLabel="Ajouter un risque"
            />
          </div>
        </section>

        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-gray-200">
          <div className="text-sm text-gray-600 sm:flex-1">
            Statut calculé :{' '}
            <strong>
              {status === 'done' ? 'Terminé' : status === 'in-progress' ? 'En cours' : 'À faire'}
            </strong>
            {' · '}
            {progress}% d&apos;avancement
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="flex-1 sm:flex-none px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 inline-flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {mode === 'create' ? 'Créer le processus' : 'Enregistrer'}
          </button>
        </div>
      </form>

      {showTaskSelector && currentStepForTask ? (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col border border-indigo-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-indigo-50 rounded-t-xl">
              <h3 className="text-lg font-bold text-gray-900">
                Lier une tâche ({availableTasks.length} disponibles)
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowTaskSelector(false);
                  setCurrentStepForTask(null);
                }}
                className="p-2 hover:bg-indigo-100 rounded-lg"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              {availableTasks.length === 0 ? (
                <p className="text-center py-8 text-gray-500">Aucune tâche disponible à lier.</p>
              ) : (
                <div className="space-y-2">
                  {availableTasks.map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => linkTaskToStep(currentStepForTask, task.id)}
                      className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all"
                    >
                      <div className="font-semibold text-gray-900">{task.title}</div>
                      {task.description ? (
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      ) : null}
                      <p className="text-xs text-gray-500 mt-2">Assignée à : {task.assignedToName}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </ViewShell>
  );
}
