import { useEffect, useState } from 'react';
import {
  Check,
  CheckCircle,
  Clock,
  Ban,
  TrendingUp,
  RefreshCw,
  Pencil,
  Plus,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { PipelineStage } from '../types/planning';
import { useProjectContext } from '../context/ProjectContext';
import { usePipeline } from '../context/PipelineContext';
import { evaluateStage } from '../utils/pipelineSync';
import { PageBackHeader } from './shared/PageBackHeader';
import { ViewShell, ViewHeader, ActionButton } from './shared';
import { TaskStatusBadge } from './shared/displayHelpers';
import { useNavigate } from 'react-router';
import { getRoutePath } from '../routes/viewRoutes';
import { calculateTaskProgress } from '../data/testData';

type PageMode = 'list' | 'view' | 'edit' | 'create';

type StageForm = {
  name: string;
  purposeText: string;
  startDate: string;
  endDate: string;
  estimatedDuration: string;
};

const emptyStageForm = (): StageForm => ({
  name: '',
  purposeText: '',
  startDate: '',
  endDate: '',
  estimatedDuration: '',
});

function daysBetween(start: string, end: string): number | null {
  if (!start || !end) return null;
  const startMs = new Date(`${start}T00:00:00`).getTime();
  const endMs = new Date(`${end}T00:00:00`).getTime();
  if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs < startMs) return null;
  return Math.round((endMs - startMs) / (1000 * 60 * 60 * 24));
}

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function syncDurationFromDates(startDate: string, endDate: string): string {
  const days = daysBetween(startDate, endDate);
  return days !== null ? String(days) : '';
}

function linesToArray(text: string) {
  return text.split('\n').map((l) => l.trim()).filter(Boolean);
}

function StatusLabel({ status }: { status: PipelineStage['status'] }) {
  switch (status) {
    case 'completed':
      return (
        <span className="inline-flex items-center gap-1.5">
          <Check className="w-4 h-4 text-green-600" />
          Complété
        </span>
      );
    case 'in-progress':
      return (
        <span className="inline-flex items-center gap-1.5">
          <RefreshCw className="w-4 h-4 text-blue-600" />
          En cours
        </span>
      );
    case 'blocked':
      return (
        <span className="inline-flex items-center gap-1.5">
          <Ban className="w-4 h-4 text-red-600" />
          Bloqué
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-gray-500" />
          À venir
        </span>
      );
  }
}

export function PipelineView() {
  const navigate = useNavigate();
  const { activeProject, activeProjectSlug } = useProjectContext();
  const {
    scopedStages,
    tasks,
    documents,
    updateStage,
    addStage,
    removeStage: removeStageFromContext,
    getRelatedForStage,
    refresh,
  } = usePipeline();
  const [pageMode, setPageMode] = useState<PageMode>('list');
  const [selectedStage, setSelectedStage] = useState<PipelineStage | null>(null);
  const [form, setForm] = useState<StageForm>(emptyStageForm());

  useEffect(() => {
    refresh();
  }, [refresh]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'in-progress':
        return <Clock className="w-6 h-6 text-blue-600" />;
      case 'blocked':
        return <Ban className="w-6 h-6 text-red-600" />;
      default:
        return <Clock className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-500 bg-green-50';
      case 'in-progress':
        return 'border-blue-500 bg-blue-50';
      case 'blocked':
        return 'border-red-500 bg-red-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const overallProgress = scopedStages.length
    ? Math.round(scopedStages.reduce((acc, stage) => acc + stage.progress, 0) / scopedStages.length)
    : 0;

  const openView = (stage: PipelineStage) => {
    setSelectedStage(stage);
    setPageMode('view');
  };

  const openCreate = () => {
    setForm(emptyStageForm());
    setSelectedStage(null);
    setPageMode('create');
  };

  const openEdit = (stage: PipelineStage) => {
    setSelectedStage(stage);
    const startDate = stage.startDate ?? '';
    const endDate = stage.endDate ?? '';
    const durationFromDates = syncDurationFromDates(startDate, endDate);
    setForm({
      name: stage.name,
      purposeText: stage.objectives.join('\n'),
      startDate,
      endDate,
      estimatedDuration:
        durationFromDates || (stage.estimatedDuration != null ? String(stage.estimatedDuration) : ''),
    });
    setPageMode('edit');
  };

  const handleStartDateChange = (startDate: string) => {
    setForm((prev) => {
      const next = { ...prev, startDate };
      if (startDate && prev.endDate) {
        next.estimatedDuration = syncDurationFromDates(startDate, prev.endDate);
      } else if (startDate && prev.estimatedDuration) {
        const days = Number(prev.estimatedDuration);
        if (days > 0) next.endDate = addDays(startDate, days);
      }
      return next;
    });
  };

  const handleEndDateChange = (endDate: string) => {
    setForm((prev) => {
      const next = { ...prev, endDate };
      if (prev.startDate && endDate) {
        next.estimatedDuration = syncDurationFromDates(prev.startDate, endDate);
      } else if (endDate && prev.estimatedDuration) {
        const days = Number(prev.estimatedDuration);
        if (days > 0) next.startDate = addDays(endDate, -days);
      }
      return next;
    });
  };

  const handleDurationChange = (estimatedDuration: string) => {
    setForm((prev) => {
      const next = { ...prev, estimatedDuration };
      const days = Number(estimatedDuration);
      if (!estimatedDuration || days <= 0) return next;
      if (prev.startDate) {
        next.endDate = addDays(prev.startDate, days);
      } else if (prev.endDate) {
        next.startDate = addDays(prev.endDate, -days);
      }
      return next;
    });
  };

  const durationFromDates = Boolean(form.startDate && form.endDate);

  const buildStageFromForm = (base?: PipelineStage): PipelineStage => ({
    id: base?.id ?? `stage-${Date.now()}`,
    projectId: activeProjectSlug ?? 'popy',
    name: form.name.trim(),
    order: base?.order ?? scopedStages.length + 1,
    status: base?.status ?? 'not-started',
    progress: base?.progress ?? 0,
    objectives: linesToArray(form.purposeText),
    deliverables: base?.deliverables ?? [],
    exitCriteria: base?.exitCriteria ?? [],
    tasks: base?.tasks ?? [],
    startDate: form.startDate || undefined,
    endDate: form.endDate || undefined,
    estimatedDuration:
      (form.startDate && form.endDate
        ? daysBetween(form.startDate, form.endDate)
        : Number(form.estimatedDuration)) || undefined,
  });

  const saveStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (pageMode === 'create') {
      addStage(buildStageFromForm());
      setPageMode('list');
    } else if (selectedStage) {
      const updated = buildStageFromForm(selectedStage);
      updateStage(updated);
      setSelectedStage(updated);
      setPageMode('view');
    }
    setForm(emptyStageForm());
    refresh();
  };

  const removeStage = (id: string) => {
    removeStageFromContext(id);
    setSelectedStage(null);
    setPageMode('list');
    refresh();
  };

  const stageForm = (onCancel: () => void, submitLabel: string, linkedTaskCount = 0) => (
    <form onSubmit={saveStage} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5 shadow-sm">
      <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
        <p className="font-medium mb-1">Comment fonctionne une étape ?</p>
        <p className="text-blue-800">
          Le <strong>suivi réel</strong> (progression, livrables, conditions de sortie) passe par les{' '}
          <strong>tâches</strong> et <strong>documents</strong> liés à l&apos;étape — pas par des champs
          texte libres. Ici vous définissez uniquement le cadre de l&apos;étape.
        </p>
        {linkedTaskCount > 0 && (
          <p className="mt-2 text-blue-700">
            {linkedTaskCount} tâche(s) déjà liée(s) — modifiez-les depuis l&apos;onglet Tâches.
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l&apos;étape *</label>
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Ex : Cadrage, Conception, Tests..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
            max={form.endDate || undefined}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
          <input
            type="date"
            value={form.endDate}
            onChange={(e) => handleEndDateChange(e.target.value)}
            min={form.startDate || undefined}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Durée (jours)
            {durationFromDates && (
              <span className="ml-1 font-normal text-gray-500">— calculée</span>
            )}
          </label>
          <input
            type="number"
            min={1}
            value={form.estimatedDuration}
            onChange={(e) => handleDurationChange(e.target.value)}
            readOnly={durationFromDates}
            placeholder={durationFromDates ? undefined : 'Ex : 30'}
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${
              durationFromDates ? 'bg-gray-50 text-gray-700 cursor-default' : ''
            }`}
          />
          <p className="text-xs text-gray-500 mt-1">
            {durationFromDates
              ? 'Mise à jour automatique à partir des dates.'
              : 'Saisissez la durée pour calculer la date manquante, ou les deux dates pour obtenir la durée.'}
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Intention de l&apos;étape <span className="font-normal text-gray-500">(optionnel)</span>
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Décrivez le but de cette étape — une ligne par point. Ce texte est informatif ; la progression
          est calculée automatiquement depuis les tâches liées.
        </p>
        <textarea
          rows={4}
          value={form.purposeText}
          onChange={(e) => setForm({ ...form, purposeText: e.target.value })}
          placeholder={'Ex :\nDéfinir le périmètre du projet\nIdentifier les parties prenantes\nÉtablir le budget prévisionnel'}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          Annuler
        </button>
        <button type="submit" className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          {submitLabel}
        </button>
      </div>
    </form>
  );

  if (pageMode === 'create') {
    return (
      <ViewShell narrow>
        <PageBackHeader title="Nouvelle étape pipeline" subtitle={activeProject?.name} onBack={() => setPageMode('list')} />
        {stageForm(() => setPageMode('list'), 'Créer l\'étape')}
      </ViewShell>
    );
  }

  if (pageMode === 'edit' && selectedStage) {
    return (
      <ViewShell narrow>
        <PageBackHeader
          title="Modifier l'étape"
          subtitle={`Étape ${selectedStage.order} / ${scopedStages.length}`}
          onBack={() => setPageMode('view')}
        />
        {stageForm(() => setPageMode('view'), 'Enregistrer', selectedStage.tasks.length)}
      </ViewShell>
    );
  }

  if (pageMode === 'view' && selectedStage) {
    const stage = scopedStages.find((s) => s.id === selectedStage.id) ?? selectedStage;
    const related = getRelatedForStage(stage.id);
    const linkedTasks = tasks.filter((t) => stage.tasks.includes(t.id) || t.stageId === stage.id);
    const gate = evaluateStage(stage, tasks, documents);
    return (
      <ViewShell>
        <PageBackHeader
          title={stage.name}
          subtitle={`Étape ${stage.order} / ${scopedStages.length}`}
          onBack={() => {
            setPageMode('list');
            setSelectedStage(null);
          }}
          actions={
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => openEdit(stage)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Pencil className="w-4 h-4" />
                Modifier
              </button>
              <button
                type="button"
                onClick={() => removeStage(stage.id)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 text-red-700 rounded-lg hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>
            </div>
          }
        />

        <div className="bg-white rounded-xl border-2 border-blue-300 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 mt-1">Progression</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{gate.progress}%</div>
                <div className="text-blue-100 text-sm mt-1">
                  <StatusLabel status={gate.status} />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {gate.blockers.length > 0 ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <h3 className="font-semibold text-amber-900 flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5" />
                  Conditions pour passer à l&apos;étape suivante
                </h3>
                <ul className="text-sm text-amber-900 space-y-1">
                  {gate.blockers.map((b) => (
                    <li key={b}>• {b}</li>
                  ))}
                </ul>
              </div>
            ) : gate.canAdvance ? (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 shrink-0" />
                Toutes les conditions sont remplies — l&apos;étape peut être considérée comme complétée.
              </div>
            ) : null}

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Tâches liées ({linkedTasks.length})
              </h3>
              {linkedTasks.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Aucune tâche liée. Assignez une étape pipeline depuis l&apos;onglet Tâches.
                </p>
              ) : (
                <ul className="space-y-2">
                  {linkedTasks.map((task) => (
                    <li key={task.id}>
                      <button
                        type="button"
                        onClick={() => navigate(`/${getRoutePath('tasks')}`)}
                        className="w-full text-left flex items-center justify-between gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                      >
                        <span className="font-medium text-gray-900">{task.title}</span>
                        <span className="flex items-center gap-2 shrink-0">
                          <TaskStatusBadge status={task.status} />
                          <span className="text-xs text-gray-600">{calculateTaskProgress(task)}%</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Documents liés ({related.documents.length})
              </h3>
              {related.documents.length === 0 ? (
                <p className="text-sm text-gray-500">Aucun document rattaché à cette étape.</p>
              ) : (
                <ul className="space-y-2">
                  {related.documents.map((doc) => (
                    <li key={doc.id}>
                      <button
                        type="button"
                        onClick={() => navigate(`/${getRoutePath('documentation')}`)}
                        className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50"
                      >
                        <span className="font-medium text-gray-900">{doc.title}</span>
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${doc.status === 'validated' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                          {doc.status === 'validated' ? 'Validé' : 'Brouillon'}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Risques liés ({related.risks.length})
              </h3>
              {related.risks.length === 0 ? (
                <p className="text-sm text-gray-500">Aucun risque rattaché à cette étape.</p>
              ) : (
                <ul className="space-y-2">
                  {related.risks.map((risk) => (
                    <li key={risk.id}>
                      <button
                        type="button"
                        onClick={() => navigate(`/${getRoutePath('risks')}`)}
                        className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50"
                      >
                        <span className="font-medium text-gray-900">{risk.title}</span>
                        <span className="text-xs text-gray-500 ml-2">{risk.status}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {(stage.objectives.length > 0 || stage.deliverables.length > 0 || stage.exitCriteria.length > 0) && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Cadre de référence (informatif)
                </p>
                {stage.objectives.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">Intention</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                      {stage.objectives.map((obj) => (
                        <li key={obj}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {stage.deliverables.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">Livrables attendus</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                      {stage.deliverables.map((deliv) => (
                        <li key={deliv}>{deliv}</li>
                      ))}
                    </ul>
                    <p className="text-xs text-gray-500 mt-1">
                      Suivi opérationnel via les documents et tâches liés ci-dessus.
                    </p>
                  </div>
                )}
                {stage.exitCriteria.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">Critères de sortie</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                      {stage.exitCriteria.map((criteria) => (
                        <li key={criteria}>{criteria}</li>
                      ))}
                    </ul>
                    <p className="text-xs text-gray-500 mt-1">
                      Vérification automatique via les tâches terminées et documents critiques validés.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Durée estimée</div>
                <div className="text-xl font-bold text-gray-900">{stage.estimatedDuration} jours</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Tâches associées</div>
                <div className="text-xl font-bold text-gray-900">{linkedTasks.length}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Statut</div>
                <div className="text-sm font-bold">
                  <StatusLabel status={gate.status} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </ViewShell>
    );
  }

  return (
    <ViewShell>
      <ViewHeader
        title={activeProject ? `Pipeline — ${activeProject.name}` : 'Pipeline du projet'}
        subtitle="Étapes synchronisées avec les tâches, documents et risques du projet"
        actions={
          <ActionButton icon={Plus} onClick={openCreate}>
            Nouvelle étape
          </ActionButton>
        }
      />

      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Avancement global du projet</h2>
            <p className="text-purple-100 mt-1">
              {scopedStages.filter((s) => s.status === 'completed').length} / {scopedStages.length} étapes
              complétées
            </p>
          </div>
          <div className="text-5xl font-bold">{overallProgress}%</div>
        </div>
        <div className="w-full bg-white/20 rounded-full h-4">
          <div
            className="bg-white h-4 rounded-full transition-all"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Flux du projet</h2>
        <div className="relative">
          <div className="absolute top-10 md:top-12 left-[10%] right-[10%] h-0.5 bg-gray-200 z-0" />
          <div className="relative z-10 flex justify-between gap-2">
            {scopedStages.map((stage) => (
              <div
                key={stage.id}
                className="flex flex-col items-center flex-1 min-w-0"
              >
                <button
                  type="button"
                  onClick={() => openView(stage)}
                  className={`w-20 h-20 md:w-24 md:h-24 rounded-full border-4 ${getStatusColor(stage.status)} flex items-center justify-center mb-3 hover:scale-105 transition-transform cursor-pointer shadow-md`}
                >
                  {getStatusIcon(stage.status)}
                </button>
                <div className="text-center w-full px-1">
                  <h3 className="font-bold text-gray-900 text-sm md:text-base mb-1 leading-tight">{stage.name}</h3>
                  {stage.startDate && stage.endDate && (
                    <div className="text-xs text-gray-500 mb-1">
                      {new Date(stage.startDate).toLocaleDateString('fr-FR', { month: 'short' })} –{' '}
                      {new Date(stage.endDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                    </div>
                  )}
                  <div className="text-sm font-semibold text-blue-600">{stage.progress}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-green-600 text-white rounded-lg">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-green-900 text-lg mb-2">
              Progression automatique du pipeline
            </h3>
            <p className="text-sm text-green-800 mb-3">
              La progression de chaque étape est recalculée automatiquement lorsque vous modifiez
              les tâches (onglet Tâches), validez des documents ou mettez à jour les risques liés.
            </p>
            <ul className="text-sm text-green-800 space-y-1">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                % d&apos;avancement = moyenne des tâches liées à l&apos;étape
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                Documents critiques validés requis pour clôturer une étape
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                Alerte si une tâche liée est bloquée
              </li>
            </ul>
          </div>
        </div>
      </div>

      {scopedStages.some((s) => s.status === 'blocked') && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-red-600 mt-1 shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 text-lg mb-2">
                Étapes bloquées
              </h3>
              <p className="text-sm text-red-800">
                Certaines étapes sont bloquées et nécessitent une intervention immédiate :
              </p>
              <ul className="mt-2 space-y-1">
                {scopedStages
                  .filter((s) => s.status === 'blocked')
                  .map((stage) => (
                    <li key={stage.id} className="text-sm text-red-800">
                      • <strong>{stage.name}</strong> - Action requise
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </ViewShell>
  );
}
