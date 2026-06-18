import { useState, useEffect, useMemo } from 'react';
import { useProjectContext } from '../context/ProjectContext';
import {
  ChevronRight,
  Plus,
  GitBranch,
  Target,
  Package,
  LifeBuoy,
  Shield,
  TrendingUp,
  Activity,
  Edit2,
  Trash2,
  User,
  Users,
  FileText,
  CheckCircle,
  Circle,
  Clock,
  AlertTriangle,
  Pencil,
} from 'lucide-react';
import { PageBackHeader } from './shared/PageBackHeader';
import { TEST_PROCESSES, ProcessData } from '../data/testProcesses';
import { ViewShell, ViewHeader, AppIcon, ActionButton } from './shared';
import { ProcessFormPage } from './process/ProcessFormPage';

type PageMode = 'list' | 'create' | 'view' | 'edit';

type ProcessType = ProcessData['type'];

export function ProcessView() {
  const { activeProject, activeProjectSlug, matchesProject } = useProjectContext();
  const [pageMode, setPageMode] = useState<PageMode>('list');
  const [selectedProcess, setSelectedProcess] = useState<ProcessData | null>(null);
  const [processes, setProcesses] = useState<ProcessData[]>([]);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string | null>(null);
  const [createType, setCreateType] = useState<ProcessType>('pilotage');

  useEffect(() => {
    if (activeProject) {
      const testProcesses = TEST_PROCESSES.filter((p) =>
        matchesProject(p.projectId ?? 'popy')
      ).map((p) => ({
        ...p,
        projectId: activeProjectSlug ?? activeProject.id,
      }));
      setProcesses(testProcesses);
    } else {
      setProcesses([]);
    }
  }, [activeProject, activeProjectSlug, matchesProject]);

  const processTypes = [
    { type: 'pilotage' as const, label: 'Processus de pilotage', subtitle: 'DÉCIDER', icon: Target, color: 'indigo', description: 'Donner la direction et arbitrer' },
    { type: 'realisation' as const, label: 'Processus de réalisation', subtitle: 'FAIRE', icon: Package, color: 'blue', description: 'Construire le robot et les outils' },
    { type: 'support' as const, label: 'Processus support', subtitle: 'PERMETTRE', icon: LifeBuoy, color: 'green', description: 'Soutenir sans bloquer' },
    { type: 'qualite' as const, label: 'Processus qualité & risques', subtitle: 'SÉCURISER', icon: Shield, color: 'orange', description: 'Empêcher les mauvaises surprises' },
    { type: 'amelioration' as const, label: "Processus d'amélioration continue", subtitle: 'AMÉLIORER', icon: TrendingUp, color: 'purple', description: 'Apprendre et corriger' },
    { type: 'indicateurs' as const, label: 'Indicateurs de suivi', subtitle: 'MESURER', icon: Activity, color: 'pink', description: 'Piloter avec des faits' },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string; hover: string }> = {
      indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-900', hover: 'hover:bg-indigo-100' },
      blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', hover: 'hover:bg-blue-100' },
      green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900', hover: 'hover:bg-green-100' },
      orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-900', hover: 'hover:bg-orange-100' },
      purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-900', hover: 'hover:bg-purple-100' },
      pink: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-900', hover: 'hover:bg-pink-100' },
    };
    return colors[color] || colors.indigo;
  };

  const getProcessConfig = (type: string) => {
    const found = processTypes.find((t) => t.type === type);
    return found ?? processTypes[0];
  };

  const calcProgress = (steps: ProcessData['steps']) => {
    if (steps.length === 0) return 0;
    return Math.round((steps.filter((s) => s.status === 'done').length / steps.length) * 100);
  };

  const handleDeleteProcess = (processId: string, processTitle: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le processus "${processTitle}" ?\n\nCette action est irréversible.`)) {
      setProcesses(processes.filter((p) => p.id !== processId));
      if (selectedProcess?.id === processId) {
        setSelectedProcess(null);
        setPageMode('list');
      }
    }
  };

  const openCreate = (type?: ProcessType) => {
    setCreateType(type ?? 'pilotage');
    setSelectedProcess(null);
    setPageMode('create');
  };

  const openEdit = (process: ProcessData) => {
    setSelectedProcess(process);
    setPageMode('edit');
  };

  const openView = (process: ProcessData) => {
    setSelectedProcess(process);
    setPageMode('view');
  };

  const handleSaveProcess = (next: ProcessData) => {
    if (pageMode === 'create') {
      setProcesses((prev) => [...prev, next]);
      setPageMode('list');
    } else {
      setProcesses((prev) => prev.map((p) => (p.id === next.id ? next : p)));
      setSelectedProcess(next);
      setPageMode('view');
    }
  };

  if ((pageMode === 'create' || pageMode === 'edit') && activeProject) {
    return (
      <ProcessFormPage
        mode={pageMode}
        projectId={activeProjectSlug ?? activeProject.id}
        projectName={activeProject.name}
        defaultType={createType}
        initial={pageMode === 'edit' ? selectedProcess : null}
        onSubmit={handleSaveProcess}
        onCancel={() => setPageMode(pageMode === 'edit' && selectedProcess ? 'view' : 'list')}
      />
    );
  }

  if (pageMode === 'view' && selectedProcess && activeProject) {
    const process = selectedProcess;
    const config = getProcessConfig(process.type);
    const Icon = config.icon;
    const doneSteps = process.steps.filter((s) => s.status === 'done').length;

    const getStepStatusIcon = (status: string) => {
      switch (status) {
        case 'done':
          return <CheckCircle className="w-5 h-5 text-green-600" />;
        case 'in-progress':
          return <Clock className="w-5 h-5 text-blue-600" />;
        default:
          return <Circle className="w-5 h-5 text-gray-400" />;
      }
    };

    return (
      <ViewShell>
        <PageBackHeader
          title={process.title}
          subtitle={
            <span className="flex items-center gap-2 flex-wrap">
              <span className={`text-sm font-medium ${getColorClasses(config.color).text}`}>{config.subtitle}</span>
              <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                <Target className="w-4 h-4" />
                {process.objective}
              </span>
            </span>
          }
          onBack={() => { setPageMode('list'); setSelectedProcess(null); }}
          actions={
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => openEdit(process)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Pencil className="w-4 h-4" />
                Modifier
              </button>
              <button
                type="button"
                onClick={() => handleDeleteProcess(process.id, process.title)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 text-red-700 rounded-lg hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>
            </div>
          }
        />

        <div className={`rounded-xl border-2 ${getColorClasses(config.color).border} overflow-hidden`}>
          <div className={`${getColorClasses(config.color).bg} p-6 flex items-start gap-4`}>
            <div className={`w-14 h-14 rounded-lg bg-${config.color}-600 flex items-center justify-center shrink-0`}>
              <Icon className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-4 text-sm text-gray-700">
                <span className="inline-flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {process.responsible}
                </span>
                <span>
                  {doneSteps} / {process.steps.length} étapes — {process.progress}%
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ChevronRight className="w-5 h-5 text-indigo-600" />
                Carte du processus
              </h3>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {process.steps.map((step, index) => (
                    <div key={step.id} className="flex items-center shrink-0">
                      <div
                        className={`flex flex-col items-center p-4 rounded-lg border-2 min-w-[120px] ${
                          step.status === 'done'
                            ? 'border-green-300 bg-green-50'
                            : step.status === 'in-progress'
                            ? 'border-blue-300 bg-blue-50'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 ${
                            step.status === 'done'
                              ? 'bg-green-600 text-white'
                              : step.status === 'in-progress'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-300 text-gray-700'
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div className="text-xs font-semibold text-center text-gray-900 line-clamp-2">{step.title}</div>
                      </div>
                      {index < process.steps.length - 1 && (
                        <ChevronRight className="w-6 h-6 text-gray-400 mx-1 shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 space-y-3">
                <h3 className="font-semibold text-gray-900">Informations clés</h3>
                {process.trigger && (
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">Quand il s&apos;applique</div>
                    <div className="text-sm text-gray-900">{process.trigger}</div>
                  </div>
                )}
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Responsable
                  </div>
                  <div className="text-sm font-semibold text-gray-900">{process.responsible}</div>
                </div>
                {process.contributors.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      Contributeurs
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {process.contributors.map((c, idx) => (
                        <span key={idx} className="text-xs px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full">{c}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg border-2 border-indigo-200">
                <div className="bg-indigo-50 px-5 py-3 border-b border-indigo-200">
                  <h3 className="font-semibold text-indigo-900 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Étapes
                  </h3>
                </div>
                <div className="p-5 space-y-3">
                  {process.steps.map((step, index) => (
                    <div key={step.id} className="flex items-start gap-3">
                      {getStepStatusIcon(step.status)}
                      <div>
                        <div className={`font-medium ${step.status === 'done' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                          {index + 1}. {step.title}
                        </div>
                        {step.description && <div className="text-xs text-gray-600 mt-0.5">{step.description}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {process.deliverables.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-600" />
                    Livrables attendus
                  </h3>
                </div>
                <div className="p-5 space-y-2">
                  {process.deliverables.map((d, idx) => (
                    <div key={idx} className="text-sm text-gray-700">{idx + 1}. {d}</div>
                  ))}
                </div>
              </div>
            )}

            {process.validationCriteria.length > 0 && (
              <div className="bg-white rounded-lg border border-blue-200">
                <div className="bg-blue-50 px-5 py-3 border-b border-blue-200">
                  <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Critères de validation
                  </h3>
                </div>
                <div className="p-5 space-y-2">
                  {process.validationCriteria.map((criterion, idx) => (
                    <div key={idx} className="text-sm text-gray-700">{idx + 1}. {criterion}</div>
                  ))}
                </div>
              </div>
            )}

            {process.improvementLink ? (
              <div className="bg-white rounded-lg border border-purple-200 p-5">
                <h3 className="font-semibold text-purple-900 mb-1">Lien amélioration continue</h3>
                <p className="text-sm text-gray-700">{process.improvementLink}</p>
              </div>
            ) : null}

            {process.risks.length > 0 && (
              <div className="bg-white rounded-lg border border-orange-200">
                <div className="bg-orange-50 px-5 py-3 border-b border-orange-200">
                  <h3 className="font-semibold text-orange-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Risques fréquents
                  </h3>
                </div>
                <div className="p-5 space-y-2">
                  {process.risks.map((risk, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                      {risk}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </ViewShell>
    );
  }

  if (!activeProject) {
    return (
      <ViewShell>
        <ViewHeader
          title="Approche processus"
          subtitle="Sélectionnez un projet dans l'en-tête pour afficher ses processus."
        />
      </ViewShell>
    );
  }

  return (
    <ViewShell>
      <ViewHeader
        title={activeProject.name}
        subtitle="Cartographie des processus ISO 9001"
        actions={
          <ActionButton icon={Plus} onClick={() => openCreate()}>Créer un processus</ActionButton>
        }
      />

      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-xl border-2 border-indigo-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <GitBranch className="w-6 h-6 text-indigo-600" />
          Cartographie globale des processus
        </h2>
        <p className="text-sm text-gray-700 mb-6 leading-relaxed">
          Vue macro – L&apos;approche processus ISO 9001 structure le projet en 4 grandes catégories.
          <strong> Cliquez sur une catégorie pour voir les processus associés.</strong>
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          {processTypes.slice(0, 4).map((typeConfig) => {
            const Icon = typeConfig.icon;
            const count = processes.filter((p) => p.type === typeConfig.type).length;
            return (
              <button
                key={typeConfig.type}
                onClick={() => setSelectedTypeFilter(selectedTypeFilter === typeConfig.type ? null : typeConfig.type)}
                className={`bg-white rounded-lg border-2 p-5 text-left transition-all hover:shadow-lg ${
                  selectedTypeFilter === typeConfig.type
                    ? `border-${typeConfig.color}-500 shadow-lg ring-2 ring-${typeConfig.color}-200`
                    : `border-${typeConfig.color}-300 hover:border-${typeConfig.color}-400`
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg bg-${typeConfig.color}-600 flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-bold text-${typeConfig.color}-900`}>{typeConfig.label}</h3>
                    <p className={`text-xs text-${typeConfig.color}-600`}>{typeConfig.subtitle}</p>
                  </div>
                  {count > 0 && (
                    <div className={`w-8 h-8 rounded-full bg-${typeConfig.color}-600 text-white flex items-center justify-center font-bold text-sm`}>
                      {count}
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600">{typeConfig.description}</p>
              </button>
            );
          })}
        </div>
        <div className="mt-6 bg-white/60 rounded-lg p-4 border border-indigo-200">
          <p className="text-sm text-gray-700 leading-relaxed">
            <strong className="text-indigo-900">Logique ISO 9001 :</strong> Les processus de pilotage donnent la direction,
            les processus de réalisation produisent les livrables, les processus support fournissent les moyens nécessaires,
            et les processus d&apos;amélioration garantissent la performance et l&apos;apprentissage continu.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Processus détaillés</h2>
          {selectedTypeFilter && (
            <button onClick={() => setSelectedTypeFilter(null)} className="text-sm text-indigo-600 hover:text-indigo-800">
              Afficher tous les processus
            </button>
          )}
        </div>

        {processTypes
          .filter((typeConfig) => !selectedTypeFilter || typeConfig.type === selectedTypeFilter)
          .map((typeConfig) => {
            const typeProcesses = processes.filter((p) => p.type === typeConfig.type);
            const colors = getColorClasses(typeConfig.color);
            const Icon = typeConfig.icon;

            return (
              <div
                key={typeConfig.type}
                className={`bg-white rounded-xl border ${colors.border} overflow-hidden ${
                  selectedTypeFilter === typeConfig.type ? `ring-2 ring-offset-2 ring-${typeConfig.color}-400` : ''
                }`}
              >
                <div className={`${colors.bg} px-6 py-4 border-b ${colors.border}`}>
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${colors.text}`} />
                    <div className="flex-1">
                      <h3 className={`font-bold ${colors.text}`}>{typeConfig.label}</h3>
                      <p className="text-sm text-gray-600">{typeConfig.subtitle} • {typeConfig.description}</p>
                    </div>
                    {typeProcesses.length > 0 && (
                      <div className={`px-3 py-1 rounded-full ${colors.bg} ${colors.border} border`}>
                        <span className={`text-sm font-semibold ${colors.text}`}>{typeProcesses.length} processus</span>
                      </div>
                    )}
                    <button
                      onClick={() => openCreate(typeConfig.type)}
                      className={`text-sm px-3 py-1.5 ${colors.bg} ${colors.border} border rounded-lg ${colors.hover} transition-colors`}
                    >
                      + Ajouter
                    </button>
                  </div>
                </div>

                {typeProcesses.length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-500 text-sm">
                    Aucun processus créé pour cette catégorie
                    <div className="mt-3">
                      <button
                        onClick={() => openCreate(typeConfig.type)}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        + Créer le premier processus
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {typeProcesses.map((process) => (
                      <div key={process.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <button onClick={() => openView(process)} className="flex-1 text-left">
                            <h4 className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors">{process.title}</h4>
                            <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                              <Target className="w-3 h-3 shrink-0" />
                              {process.objective}
                            </p>
                            <div className="flex items-center gap-1 mt-3 mb-2">
                              {process.steps.slice(0, 8).map((step, idx) => (
                                <div
                                  key={step.id}
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                    step.status === 'done'
                                      ? 'bg-green-500 text-white'
                                      : step.status === 'in-progress'
                                      ? 'bg-blue-500 text-white'
                                      : 'bg-gray-200 text-gray-600'
                                  }`}
                                  title={step.title}
                                >
                                  {idx + 1}
                                </div>
                              ))}
                              {process.steps.length > 8 && (
                                <span className="text-xs text-gray-500 ml-1">+{process.steps.length - 8}</span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded inline-flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {process.responsible}
                              </span>
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                {process.steps.filter((s) => s.status === 'done').length}/{process.steps.length} étapes validées
                              </span>
                              {process.contributors.slice(0, 2).map((contributor, idx) => (
                                <span key={idx} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">{contributor}</span>
                              ))}
                              {process.contributors.length > 2 && (
                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                  +{process.contributors.length - 2} autres
                                </span>
                              )}
                            </div>
                          </button>
                          <div className="flex items-center gap-2 ml-4">
                            <button onClick={() => openEdit(process)} className="p-2 hover:bg-gray-100 rounded transition-colors">
                              <Edit2 className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => handleDeleteProcess(process.id, process.title)}
                              className="p-2 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </ViewShell>
  );
}
