import { useEffect, useMemo, useState } from 'react';
import {
  Map,
  Megaphone,
  Plus,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import { useProjectContext } from '../context/ProjectContext';
import { filterByActiveProject } from '../utils/projectMatch';
import { DEMO_MARKETING_BY_PROJECT } from '../data/multiProjectDemoFixtures';
import { mergeDemoData } from '../utils/demoDataMerge';
import { INITIAL_MARKETING_ACTIONS, ROADMAP_PHASES } from '../data/marketingDemoData';
import { loadRoadmapForProject, saveRoadmapForProject, applyPhaseTheme } from '../utils/marketingRoadmapStorage';
import {
  MARKETING_STORAGE_KEY,
  type MarketingAction,
  type MarketingActionStatus,
  type MarketingPageMode,
  type MarketingPhase,
  type MarketingTab,
  type RoadmapPhase,
  type RoadmapPhaseFormValues,
  type StrategyPillar,
} from '../types/marketing';
import {
  ViewShell,
  ViewHeader,
  ViewStatCard,
  ViewStatsGrid,
  ActionButton,
} from './shared';
import { MarketingActionFormPage } from './marketing/MarketingActionFormPage';
import { MarketingActionDetailPage } from './marketing/MarketingActionDetailPage';
import { MarketingPhaseFormPage } from './marketing/MarketingPhaseFormPage';
import { MarketingOverviewTab } from './marketing/MarketingOverviewTab';
import { MarketingActionsTab } from './marketing/MarketingActionsTab';
import { MarketingRoadmapTab } from './marketing/MarketingRoadmapTab';
import { MarketingStrategiesTab } from './marketing/MarketingStrategiesTab';
import { MarketingChannelsTab } from './marketing/MarketingChannelsTab';
import { MarketingCharts } from './marketing/MarketingCharts';
import { MarketingStrategyDetailPage } from './marketing/MarketingStrategyDetailPage';
import { MarketingPhaseDetailPage } from './marketing/MarketingPhaseDetailPage';
import { MarketingTabNav } from './marketing/MarketingTabNav';
import {
  actionToFormValues,
  buildActionFromForm,
  buildPhaseFromForm,
  computeActionStats,
  emptyActionForm,
  phaseToFormValues,
} from './marketing/marketingPresentation';
import type { MarketingActionFormValues } from '../types/marketing';

export function MarketingStrategyView() {
  const { matchesProject, activeProject, activeProjectSlug, ready } = useProjectContext();
  const [pageMode, setPageMode] = useState<MarketingPageMode>('list');
  const [activeTab, setActiveTab] = useState<MarketingTab>('overview');
  const [activePhase, setActivePhase] = useState<MarketingPhase>('year1');
  const [activeChannelId, setActiveChannelId] = useState('instagram');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPhase, setFilterPhase] = useState<MarketingPhase | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<MarketingActionStatus | 'all'>('all');
  const [actions, setActions] = useState<MarketingAction[]>(INITIAL_MARKETING_ACTIONS);
  const [phases, setPhases] = useState<RoadmapPhase[]>(ROADMAP_PHASES.map(applyPhaseTheme));
  const [selectedAction, setSelectedAction] = useState<MarketingAction | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyPillar | null>(null);
  const [selectedPhaseId, setSelectedPhaseId] = useState<MarketingPhase | null>(null);
  const [form, setForm] = useState<MarketingActionFormValues>(emptyActionForm());
  const [phaseForm, setPhaseForm] = useState<RoadmapPhaseFormValues | null>(null);

  const projectId = activeProjectSlug ?? 'popy';

  useEffect(() => {
    try {
      const raw = localStorage.getItem(MARKETING_STORAGE_KEY);
      const saved = raw ? (JSON.parse(raw) as MarketingAction[]) : [];
      setActions(mergeDemoData(saved, DEMO_MARKETING_BY_PROJECT, INITIAL_MARKETING_ACTIONS));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    setPhases(loadRoadmapForProject(projectId));
  }, [ready, projectId]);

  useEffect(() => {
    try {
      localStorage.setItem(MARKETING_STORAGE_KEY, JSON.stringify(actions));
    } catch {
      /* ignore */
    }
  }, [actions]);

  useEffect(() => {
    if (!ready) return;
    saveRoadmapForProject(projectId, phases);
  }, [phases, projectId, ready]);

  const scopedActions = useMemo(
    () => filterByActiveProject(actions, matchesProject, activeProjectSlug ?? 'popy'),
    [actions, matchesProject, activeProjectSlug]
  );

  const filteredActions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return scopedActions.filter((a) => {
      if (filterPhase !== 'all' && a.phase !== filterPhase) return false;
      if (filterStatus !== 'all' && a.status !== filterStatus) return false;
      if (!q) return true;
      return (
        a.title.toLowerCase().includes(q) ||
        a.channel.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q)
      );
    });
  }, [scopedActions, searchQuery, filterPhase, filterStatus]);

  const stats = useMemo(() => computeActionStats(scopedActions), [scopedActions]);
  const currentPhase = phases.find((p) => p.id === activePhase)!;

  const goList = () => {
    setPageMode('list');
    setSelectedAction(null);
    setSelectedStrategy(null);
    setSelectedPhaseId(null);
    setPhaseForm(null);
  };

  const openCreate = () => {
    setForm(emptyActionForm());
    setSelectedAction(null);
    setPageMode('create');
  };

  const openView = (action: MarketingAction) => {
    setSelectedAction(action);
    setPageMode('view');
  };

  const openEdit = (action: MarketingAction) => {
    setSelectedAction(action);
    setForm(actionToFormValues(action));
    setPageMode('edit');
  };

  const openStrategyView = (pillar: StrategyPillar) => {
    setSelectedStrategy(pillar);
    setPageMode('strategy-view');
  };

  const openPhaseView = (phase: MarketingPhase) => {
    setSelectedPhaseId(phase);
    setActivePhase(phase);
    setPageMode('phase-view');
  };

  const openPhaseEdit = (phaseId: MarketingPhase) => {
    const phase = phases.find((p) => p.id === phaseId);
    if (!phase) return;
    setSelectedPhaseId(phaseId);
    setActivePhase(phaseId);
    setPhaseForm(phaseToFormValues(phase));
    setPageMode('phase-edit');
  };

  const handleActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pageMode === 'create') {
      const next = buildActionFromForm(form, undefined, projectId);
      setActions((prev) => [next, ...prev]);
      setSelectedAction(next);
      setPageMode('view');
    } else if (pageMode === 'edit' && selectedAction) {
      const next = buildActionFromForm(form, selectedAction, projectId);
      setActions((prev) => prev.map((item) => (item.id === next.id ? next : item)));
      setSelectedAction(next);
      setPageMode('view');
    }
    setForm(emptyActionForm());
  };

  const handlePhaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phaseForm || !selectedPhaseId) return;
    const base = phases.find((p) => p.id === selectedPhaseId);
    if (!base) return;
    const next = applyPhaseTheme(buildPhaseFromForm(phaseForm, base));
    setPhases((prev) => prev.map((p) => (p.id === next.id ? next : p)));
    setPhaseForm(null);
    setPageMode('phase-view');
  };

  const removeAction = (id: string) => {
    setActions((prev) => prev.filter((a) => a.id !== id));
    goList();
  };

  if (!ready) {
    return (
      <ViewShell>
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-violet-200 border-t-violet-600 animate-spin" />
          <p className="text-sm text-stone-500">Chargement de la stratégie marketing…</p>
        </div>
      </ViewShell>
    );
  }

  if (pageMode === 'create' || pageMode === 'edit') {
    return (
      <MarketingActionFormPage
        mode={pageMode === 'create' ? 'create' : 'edit'}
        values={form}
        phases={phases}
        onChange={setForm}
        onBack={() => {
          if (selectedAction && pageMode === 'edit') setPageMode('view');
          else goList();
        }}
        onSubmit={handleActionSubmit}
      />
    );
  }

  if (pageMode === 'phase-edit' && phaseForm && selectedPhaseId) {
    const phase = phases.find((p) => p.id === selectedPhaseId)!;
    return (
      <MarketingPhaseFormPage
        phaseYear={phase.year}
        values={phaseForm}
        onChange={setPhaseForm}
        onBack={() => {
          if (selectedPhaseId) setPageMode('phase-view');
          else goList();
        }}
        onSubmit={handlePhaseSubmit}
      />
    );
  }

  if (pageMode === 'view' && selectedAction) {
    const action = scopedActions.find((a) => a.id === selectedAction.id) ?? selectedAction;
    return (
      <MarketingActionDetailPage
        action={action}
        phases={phases}
        onBack={goList}
        onEdit={() => openEdit(action)}
        onDelete={() => removeAction(action.id)}
      />
    );
  }

  if (pageMode === 'strategy-view' && selectedStrategy) {
    return <MarketingStrategyDetailPage pillar={selectedStrategy} onBack={goList} />;
  }

  if (pageMode === 'phase-view' && selectedPhaseId) {
    const phase = phases.find((p) => p.id === selectedPhaseId)!;
    return (
      <MarketingPhaseDetailPage
        phase={phase}
        onBack={goList}
        onEdit={() => openPhaseEdit(selectedPhaseId)}
      />
    );
  }

  return (
    <ViewShell>
      <ViewHeader
        title="Stratégie marketing"
        subtitle={
          activeProject
            ? `${activeProject.name} — Roadmap 5 ans`
            : 'Choisissez un projet dans le menu en haut'
        }
        badge="Marketing · ISO §5.1"
        badgeIcon={Sparkles}
        theme="violet"
        sidePanel={
          activeProject ? (
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-[11px] uppercase tracking-wide font-semibold text-violet-700">Projet actif</p>
                <p className="font-semibold text-stone-900 mt-0.5">{activeProject.name}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide font-semibold text-stone-500">Phase roadmap</p>
                <p className="font-medium text-stone-800 mt-0.5">{currentPhase.year}</p>
                <p className="text-stone-600 text-xs">{currentPhase.label}</p>
              </div>
              <div className="pt-2 border-t border-violet-100">
                <p className="text-[11px] uppercase tracking-wide font-semibold text-stone-500">Actions</p>
                <p className="text-2xl font-bold text-violet-700 mt-0.5">{stats.total}</p>
                <p className="text-xs text-stone-500">{stats.inProgress} en cours · {stats.planned} planifiées</p>
              </div>
            </div>
          ) : undefined
        }
        actions={
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <ActionButton icon={Plus} onClick={openCreate} className="w-full sm:w-auto justify-center">
              Nouvelle action
            </ActionButton>
          </div>
        }
      />

      <ViewStatsGrid cols={2} className="sm:hidden">
        <ViewStatCard label="Actions" value={String(stats.total)} gradient="from-violet-500 to-purple-600" icon={Megaphone} />
        <ViewStatCard label="En cours" value={String(stats.inProgress)} gradient="from-fuchsia-500 to-pink-600" icon={TrendingUp} />
      </ViewStatsGrid>

      <ViewStatsGrid cols={4} className="hidden sm:grid">
        <ViewStatCard label="Actions totales" value={String(stats.total)} gradient="from-violet-500 to-purple-600" icon={Megaphone} />
        <ViewStatCard label="En cours" value={String(stats.inProgress)} gradient="from-fuchsia-500 to-pink-600" icon={TrendingUp} />
        <ViewStatCard label="Planifiées" value={String(stats.planned)} gradient="from-stone-400 to-stone-600" icon={Target} />
        <ViewStatCard label="Coût cible An 3" value="265 €" hint="-69% vs An 1" gradient="from-emerald-500 to-teal-600" icon={Map} />
      </ViewStatsGrid>

      <MarketingTabNav activeTab={activeTab} onChange={setActiveTab} stats={stats} />

      <div className="rounded-xl sm:rounded-2xl border border-stone-200/90 bg-white p-3 sm:p-4 md:p-6 shadow-sm min-w-0 overflow-hidden">
        {activeTab === 'overview' && (
          <MarketingOverviewTab
            phases={phases}
            actions={scopedActions}
            activePhase={activePhase}
            onPhaseChange={setActivePhase}
            onViewPhase={openPhaseView}
            onEditPhase={openPhaseEdit}
            onViewAction={openView}
            onCreateAction={openCreate}
            onGoDigital={() => setActiveTab('digital')}
            onGoPillars={() => setActiveTab('pillars')}
            onGoRoadmap={() => setActiveTab('roadmap')}
          />
        )}

        {activeTab === 'actions' && (
          <MarketingActionsTab
            phases={phases}
            actions={filteredActions}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterPhase={filterPhase}
            onFilterPhaseChange={setFilterPhase}
            filterStatus={filterStatus}
            onFilterStatusChange={setFilterStatus}
            onCreate={openCreate}
            onView={openView}
            onEdit={openEdit}
          />
        )}

        {activeTab === 'roadmap' && (
          <MarketingRoadmapTab
            phases={phases}
            actions={scopedActions}
            activePhase={activePhase}
            onPhaseChange={setActivePhase}
            onViewPhase={openPhaseView}
            onEditPhase={openPhaseEdit}
          />
        )}

        {activeTab === 'pillars' && <MarketingStrategiesTab onViewStrategy={openStrategyView} />}

        {activeTab === 'digital' && (
          <MarketingChannelsTab activeChannelId={activeChannelId} onChannelChange={setActiveChannelId} />
        )}

        {activeTab === 'indicators' && <MarketingCharts actions={scopedActions} />}
      </div>
    </ViewShell>
  );
}
