import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle,
  Clock,
  Ban,
  Target,
  Package,
  AlertCircle,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  Pencil,
  Trash2,
} from 'lucide-react';
import { PipelineStage } from '../types/planning';
import { useProjectContext } from '../context/ProjectContext';
import { filterByActiveProject } from '../utils/projectMatch';
import { DEMO_PIPELINE_BY_PROJECT } from '../data/multiProjectDemoFixtures';
import { mergeDemoData } from '../utils/demoDataMerge';
import { PageBackHeader } from './shared/PageBackHeader';
import { ViewShell, ViewHeader, viewGrids, TableWrap, AppIcon, IconButton, ActionButton } from './shared';

type PageMode = 'list' | 'view' | 'edit';

const INITIAL_PIPELINE: PipelineStage[] = [
  {
    id: 'stage-1',
    name: 'Cadrage',
    order: 1,
    status: 'completed',
    progress: 100,
    objectives: [
      'Définir le périmètre du projet',
      'Identifier les parties prenantes',
      'Établir le budget prévisionnel',
    ],
    deliverables: ['Charte projet validée', 'Budget approuvé', 'Équipe constituée'],
    exitCriteria: [
      'Comité de pilotage approuve le cadrage',
      'Budget validé par la direction',
      'Équipe affectée au projet',
    ],
    tasks: ['task-1', 'task-2', 'task-3'],
    startDate: '2025-10-01',
    endDate: '2025-10-31',
    estimatedDuration: 30,
  },
  {
    id: 'stage-2',
    name: 'Conception',
    order: 2,
    status: 'in-progress',
    progress: 65,
    objectives: [
      "Concevoir l'architecture hardware",
      "Développer l'IA de reconnaissance émotionnelle",
      "Designer l'interface utilisateur",
    ],
    deliverables: [
      'Schémas électroniques validés',
      'Modèle IA entraîné (v1)',
      'Maquettes UX/UI validées',
    ],
    exitCriteria: [
      "Tous les schémas approuvés par l'équipe technique",
      'IA atteint 80% de précision minimum',
      'Tests utilisateurs positifs sur les maquettes',
    ],
    tasks: ['task-4', 'task-5', 'task-6', 'task-7'],
    startDate: '2025-11-01',
    endDate: '2026-02-28',
    estimatedDuration: 120,
  },
  {
    id: 'stage-3',
    name: 'Développement',
    order: 3,
    status: 'in-progress',
    progress: 40,
    objectives: [
      'Assembler les prototypes hardware',
      'Intégrer le firmware embarqué',
      "Développer l'application mobile",
    ],
    deliverables: ['3 prototypes fonctionnels', 'Firmware V1 opérationnel', 'Application mobile beta'],
    exitCriteria: [
      'Prototypes passent les tests fonctionnels de base',
      'Firmware stable sans crash critique',
      'Application mobile installable et fonctionnelle',
    ],
    tasks: ['task-8', 'task-9', 'task-10'],
    startDate: '2026-01-15',
    endDate: '2026-04-15',
    estimatedDuration: 90,
  },
  {
    id: 'stage-4',
    name: 'Tests & Validation',
    order: 4,
    status: 'not-started',
    progress: 0,
    objectives: [
      'Effectuer les tests fonctionnels complets',
      'Valider la conformité sécurité EN71',
      'Réaliser les tests utilisateurs avec enfants',
    ],
    deliverables: [
      'Rapport de tests fonctionnels',
      'Certificat de conformité EN71',
      'Rapport tests utilisateurs (20 enfants)',
    ],
    exitCriteria: [
      '95% des tests fonctionnels réussis',
      'Conformité EN71 obtenue',
      'Satisfaction utilisateurs > 4/5',
    ],
    tasks: [],
    startDate: '2026-04-16',
    endDate: '2026-06-15',
    estimatedDuration: 60,
  },
  {
    id: 'stage-5',
    name: 'Validation finale',
    order: 5,
    status: 'not-started',
    progress: 0,
    objectives: [
      'Corriger les défauts identifiés',
      'Finaliser la documentation',
      'Préparer la livraison',
    ],
    deliverables: [
      'Prototype final validé',
      'Documentation technique complète',
      'Présentation finale au comité',
    ],
    exitCriteria: [
      'Tous les défauts critiques corrigés',
      'Documentation qualité complète et validée',
      'Comité de pilotage valide la livraison',
    ],
    tasks: [],
    startDate: '2026-06-16',
    endDate: '2026-06-30',
    estimatedDuration: 14,
  },
];

type StageForm = {
  name: string;
  status: PipelineStage['status'];
  progress: number;
  objectivesText: string;
};

const emptyStageForm = (): StageForm => ({
  name: '',
  status: 'not-started',
  progress: 0,
  objectivesText: '',
});

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
  const { matchesProject, activeProjectSlug } = useProjectContext();
  const [pageMode, setPageMode] = useState<PageMode>('list');
  const [stages, setStages] = useState<PipelineStage[]>(INITIAL_PIPELINE);
  const [selectedStage, setSelectedStage] = useState<PipelineStage | null>(null);
  const [form, setForm] = useState<StageForm>(emptyStageForm());

  useEffect(() => {
    try {
      const raw = localStorage.getItem('popilot:pipeline-local');
      const saved = raw ? (JSON.parse(raw) as PipelineStage[]) : [];
      setStages(mergeDemoData(saved, DEMO_PIPELINE_BY_PROJECT, INITIAL_PIPELINE));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('popilot:pipeline-local', JSON.stringify(stages));
    } catch {}
  }, [stages]);

  const scopedStages = useMemo(
    () => filterByActiveProject(stages, matchesProject),
    [stages, matchesProject]
  );

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

  const openEdit = (stage: PipelineStage) => {
    setSelectedStage(stage);
    setForm({
      name: stage.name,
      status: stage.status,
      progress: stage.progress,
      objectivesText: stage.objectives.join('\n'),
    });
    setPageMode('edit');
  };

  const saveStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStage) return;
    const updated: PipelineStage = {
      ...selectedStage,
      name: form.name,
      status: form.status,
      progress: form.progress,
      objectives: form.objectivesText
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean),
    };
    setStages((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setSelectedStage(updated);
    setPageMode('view');
  };

  const removeStage = (id: string) => {
    setStages((prev) => prev.filter((s) => s.id !== id));
    setSelectedStage(null);
    setPageMode('list');
  };

  if (pageMode === 'edit' && selectedStage) {
    return (
      <ViewShell narrow>
        <PageBackHeader
          title="Modifier l'étape"
          subtitle={`Étape ${selectedStage.order} / ${scopedStages.length}`}
          onBack={() => setPageMode('view')}
        />
        <form onSubmit={saveStage} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 shadow-sm">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as PipelineStage['status'] })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="not-started">À venir</option>
                <option value="in-progress">En cours</option>
                <option value="completed">Complété</option>
                <option value="blocked">Bloqué</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Progression (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={form.progress}
                onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Objectifs (un par ligne)
            </label>
            <textarea
              rows={5}
              value={form.objectivesText}
              onChange={(e) => setForm({ ...form, objectivesText: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setPageMode('view')}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button type="submit" className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              Enregistrer
            </button>
          </div>
        </form>
      </ViewShell>
    );
  }

  if (pageMode === 'view' && selectedStage) {
    const stage = scopedStages.find((s) => s.id === selectedStage.id) ?? selectedStage;
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
                <div className="text-4xl font-bold">{stage.progress}%</div>
                <div className="text-blue-100 text-sm mt-1">
                  <StatusLabel status={stage.status} />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-blue-600" />
                Objectifs
              </h3>
              <ul className="space-y-2">
                {stage.objectives.map((obj, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Target className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                <Package className="w-5 h-5 text-purple-600" />
                Livrables attendus
              </h3>
              <ul className="space-y-2">
                {stage.deliverables.map((deliv, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Package className="w-4 h-4 text-purple-600 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">{deliv}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Critères de sortie (Definition of Done)
              </h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <ul className="space-y-2">
                  {stage.exitCriteria.map((criteria, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{criteria}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Durée estimée</div>
                <div className="text-xl font-bold text-gray-900">{stage.estimatedDuration} jours</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Tâches associées</div>
                <div className="text-xl font-bold text-gray-900">{stage.tasks.length}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Statut</div>
                <div className="text-sm font-bold">
                  <StatusLabel status={stage.status} />
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
        title="Pipeline du Projet POPY"
        subtitle="Vision macro : grandes étapes, objectifs, livrables et critères de sortie"
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

      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Flux du projet</h2>
        <div className="relative">
          <div className="absolute top-12 left-0 right-0 h-1 bg-gray-200 z-0" />
          <div className="relative z-10 flex justify-between">
            {scopedStages.map((stage, idx) => (
              <div key={stage.id} className="flex flex-col items-center" style={{ width: '18%' }}>
                <button
                  type="button"
                  onClick={() => openView(stage)}
                  className={`w-24 h-24 rounded-full border-4 ${getStatusColor(stage.status)} flex items-center justify-center mb-3 hover:scale-110 transition-transform cursor-pointer shadow-lg`}
                >
                  {getStatusIcon(stage.status)}
                </button>
                <div className="text-center">
                  <h3 className="font-bold text-gray-900 mb-1">{stage.name}</h3>
                  <div className="text-xs text-gray-600 mb-2">
                    {stage.startDate && stage.endDate && (
                      <>
                        {new Date(stage.startDate).toLocaleDateString('fr-FR', { month: 'short' })} -{' '}
                        {new Date(stage.endDate).toLocaleDateString('fr-FR', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </>
                    )}
                  </div>
                  <div className="text-sm font-semibold text-blue-600">{stage.progress}%</div>
                </div>
                {idx < scopedStages.length - 1 && (
                  <ArrowRight
                    className="w-6 h-6 text-gray-400 absolute"
                    style={{ left: '50%', transform: 'translateX(50px) translateY(-36px)' }}
                  />
                )}
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
            <h3 className="font-semibold text-green-900 text-lg mb-2 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Progression automatique du pipeline
            </h3>
            <p className="text-sm text-green-800 mb-3">
              POPILOT surveille en temps réel l'avancement de chaque étape. Quand tous les critères de
              sortie sont remplis, l'étape passe automatiquement à « Complétée » et le projet avance
              visuellement dans le pipeline.
            </p>
            <ul className="text-sm text-green-800 space-y-1">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                Les tâches complétées mettent à jour la progression de l'étape
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                Les livrables validés sont comptabilisés automatiquement
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                Alerte si une étape ne progresse plus depuis X jours (risque de blocage)
              </li>
            </ul>
          </div>
        </div>
      </div>

      {scopedStages.some((s) => s.status === 'blocked') && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 text-lg mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
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
