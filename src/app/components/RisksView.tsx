import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Lightbulb,
  Plus,
  Shield,
  Target,
} from 'lucide-react';
import {
  type AutoRiskSuggestion,
  type Risk,
  type RiskCategory,
  generateAutoRiskSuggestions,
} from '../types/risks';
import { useProjectContext } from '../context/ProjectContext';
import { usePipeline } from '../context/PipelineContext';
import { RISKS_STORAGE_KEY } from '../utils/pipelineSync';
import { DEMO_RISKS_BY_PROJECT } from '../data/multiProjectDemoFixtures';
import { mergeDemoData } from '../utils/demoDataMerge';
import { INITIAL_RISKS } from '../data/initialRisksData';
import {
  ViewShell,
  ViewHeader,
  ViewStatCard,
  ViewStatsGrid,
  ViewTabPills,
  ViewTabBtn,
  ActionButton,
} from './shared';
import { RiskFormPage } from './risks/RiskFormPage';
import { RiskDetailPage } from './risks/RiskDetailPage';
import { RisksRegistryTab } from './risks/RisksRegistryTab';
import { RisksMatrixTab } from './risks/RisksMatrixTab';
import { RisksSuggestionsTab } from './risks/RisksSuggestionsTab';
import { RisksIndicatorsTab } from './risks/RisksIndicatorsTab';
import { SuggestionDetailPage } from './risks/SuggestionDetailPage';
import { IndicatorFormPage } from './risks/IndicatorFormPage';
import {
  type RiskFormValues,
  type RiskIndicatorConfig,
  type RiskPageMode,
  type RiskTab,
  DEFAULT_RISK_INDICATORS,
  RISK_INDICATORS_STORAGE_KEY,
  buildRiskFromForm,
  computeRiskStats,
  emptyRiskForm,
  riskToFormValues,
  suggestionToFormValues,
} from './risks/riskPresentation';

const DISMISSED_SUGGESTIONS_KEY = 'popilot-dismissed-risk-suggestions';

export function RisksView() {
  const { matchesProject, activeProjectSlug } = useProjectContext();
  const { scopedStages } = usePipeline();

  const [pageMode, setPageMode] = useState<RiskPageMode>('list');
  const [activeTab, setActiveTab] = useState<RiskTab>('registry');
  const [filterCategory, setFilterCategory] = useState<RiskCategory | 'all'>('all');
  const [filterType, setFilterType] = useState<'all' | 'risk' | 'opportunity'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'closed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [risks, setRisks] = useState<Risk[]>(INITIAL_RISKS);
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<AutoRiskSuggestion | null>(null);
  const [selectedIndicator, setSelectedIndicator] = useState<RiskIndicatorConfig | null>(null);
  const [indicators, setIndicators] = useState<RiskIndicatorConfig[]>(DEFAULT_RISK_INDICATORS);
  const [dismissedSuggestionIds, setDismissedSuggestionIds] = useState<string[]>([]);
  const [form, setForm] = useState<RiskFormValues>(emptyRiskForm());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RISKS_STORAGE_KEY);
      const saved = raw ? (JSON.parse(raw) as Risk[]) : [];
      setRisks(mergeDemoData(saved, DEMO_RISKS_BY_PROJECT, INITIAL_RISKS));
    } catch {
      /* ignore */
    }
    try {
      const indRaw = localStorage.getItem(RISK_INDICATORS_STORAGE_KEY);
      if (indRaw) setIndicators(JSON.parse(indRaw) as RiskIndicatorConfig[]);
    } catch {
      /* ignore */
    }
    try {
      const disRaw = localStorage.getItem(DISMISSED_SUGGESTIONS_KEY);
      if (disRaw) setDismissedSuggestionIds(JSON.parse(disRaw) as string[]);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(RISKS_STORAGE_KEY, JSON.stringify(risks));
    } catch {
      /* ignore */
    }
  }, [risks]);

  useEffect(() => {
    try {
      localStorage.setItem(RISK_INDICATORS_STORAGE_KEY, JSON.stringify(indicators));
    } catch {
      /* ignore */
    }
  }, [indicators]);

  useEffect(() => {
    try {
      localStorage.setItem(DISMISSED_SUGGESTIONS_KEY, JSON.stringify(dismissedSuggestionIds));
    } catch {
      /* ignore */
    }
  }, [dismissedSuggestionIds]);

  const autoSuggestions = useMemo(
    () =>
      generateAutoRiskSuggestions({
        lateTasks: [{ id: 'task-late-1', title: 'Tests capteurs ToF' }],
        budgetStatus: { overrun: 12 },
        missingDocs: ['Étude de faisabilité réglementaire', 'Rapport tests EN71'],
        missingCompetences: ['IA embarquée', 'Design UX enfants'],
      }),
    []
  );

  const scopedRisks = useMemo(
    () => risks.filter((r) => matchesProject(r.projectId ?? 'popy')),
    [risks, matchesProject]
  );

  const stats = useMemo(() => computeRiskStats(scopedRisks), [scopedRisks]);
  const projectId = activeProjectSlug ?? 'popy';

  const goList = () => {
    setPageMode('list');
    setSelectedRisk(null);
    setSelectedSuggestion(null);
    setSelectedIndicator(null);
  };

  const openCreate = () => {
    setForm(emptyRiskForm());
    setSelectedRisk(null);
    setSelectedSuggestion(null);
    setPageMode('create');
  };

  const openView = (risk: Risk) => {
    setSelectedRisk(risk);
    setPageMode('view');
  };

  const openEdit = (risk: Risk) => {
    setSelectedRisk(risk);
    setForm(riskToFormValues(risk));
    setPageMode('edit');
  };

  const openCreateFromSuggestion = (suggestion: AutoRiskSuggestion) => {
    setSelectedSuggestion(suggestion);
    setForm(suggestionToFormValues(suggestion));
    setSelectedRisk(null);
    setPageMode('create');
  };

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (pageMode === 'create') {
      const next = buildRiskFromForm(form, undefined, projectId);
      if (selectedSuggestion) {
        next.autoDetected = true;
        next.autoDetectionSource = selectedSuggestion.sourceDetails;
      }
      setRisks((prev) => [next, ...prev]);
      if (selectedSuggestion) {
        setDismissedSuggestionIds((prev) => [...prev, selectedSuggestion.id]);
      }
      setSelectedRisk(next);
      setPageMode('view');
    } else if (pageMode === 'edit' && selectedRisk) {
      const next = buildRiskFromForm(form, selectedRisk, projectId);
      setRisks((prev) => prev.map((r) => (r.id === next.id ? next : r)));
      setSelectedRisk(next);
      setPageMode('view');
    }
    setForm(emptyRiskForm());
    setSelectedSuggestion(null);
  };

  const removeRisk = (id: string) => {
    setRisks((prev) => prev.filter((r) => r.id !== id));
    goList();
  };

  const dismissSuggestion = (id: string) => {
    setDismissedSuggestionIds((prev) => [...prev, id]);
    if (selectedSuggestion?.id === id) goList();
  };

  const visibleSuggestions = autoSuggestions.filter((s) => !dismissedSuggestionIds.includes(s.id));

  if (pageMode === 'create' || pageMode === 'edit') {
    return (
      <RiskFormPage
        mode={pageMode === 'create' ? 'create' : 'edit'}
        values={form}
        stages={scopedStages}
        onChange={setForm}
        onBack={() => {
          if (selectedSuggestion) {
            setPageMode('suggestion-view');
          } else if (selectedRisk && pageMode === 'edit') {
            setPageMode('view');
          } else {
            goList();
          }
        }}
        onSubmit={submitForm}
      />
    );
  }

  if (pageMode === 'view' && selectedRisk) {
    const risk = risks.find((r) => r.id === selectedRisk.id) ?? selectedRisk;
    return (
      <RiskDetailPage
        risk={risk}
        stages={scopedStages}
        onBack={goList}
        onEdit={() => openEdit(risk)}
        onDelete={() => removeRisk(risk.id)}
      />
    );
  }

  if (pageMode === 'suggestion-view' && selectedSuggestion) {
    return (
      <SuggestionDetailPage
        suggestion={selectedSuggestion}
        onBack={goList}
        onCreate={() => openCreateFromSuggestion(selectedSuggestion)}
        onEdit={() => openCreateFromSuggestion(selectedSuggestion)}
        onDismiss={() => dismissSuggestion(selectedSuggestion.id)}
      />
    );
  }

  if ((pageMode === 'indicator-view' || pageMode === 'indicator-edit') && selectedIndicator) {
    const indicator = indicators.find((i) => i.id === selectedIndicator.id) ?? selectedIndicator;
    const currentValue =
      indicator.id === 'treatment-rate'
        ? stats.treatmentRate
        : indicator.id === 'critical-open'
          ? stats.critical
          : 12;
    const relatedCount =
      indicator.id === 'treatment-rate'
        ? stats.closed
        : indicator.id === 'critical-open'
          ? stats.critical
          : scopedRisks.length;

    return (
      <IndicatorFormPage
        mode={pageMode === 'indicator-edit' ? 'edit' : 'view'}
        indicator={indicator}
        currentValue={currentValue}
        relatedCount={relatedCount}
        onChange={(next) => {
          setSelectedIndicator(next);
          setIndicators((prev) => prev.map((i) => (i.id === next.id ? next : i)));
        }}
        onBack={goList}
        onSave={() => setPageMode('indicator-view')}
        onEdit={() => setPageMode('indicator-edit')}
        onCreateRisk={openCreate}
      />
    );
  }

  return (
    <ViewShell>
      <ViewHeader
        title="Gestion des Risques & Opportunités"
        subtitle="ISO 9001 §6.1 — registre, analyse, traitement et traçabilité"
        badge="ISO §6.1 · Risques"
        theme="red"
        actions={
          <ActionButton icon={Plus} onClick={openCreate}>
            Nouveau risque
          </ActionButton>
        }
      />

      <ViewStatsGrid cols={6}>
        <ViewStatCard label="Total" value={String(stats.total)} gradient="from-stone-600 to-stone-800" icon={Shield} />
        <ViewStatCard label="Risques" value={String(stats.risks)} gradient="from-red-500 to-rose-500" icon={AlertTriangle} />
        <ViewStatCard label="Opportunités" value={String(stats.opportunities)} gradient="from-emerald-500 to-teal-500" icon={Target} />
        <ViewStatCard label="Ouverts" value={String(stats.open)} gradient="from-amber-500 to-orange-500" icon={AlertTriangle} />
        <ViewStatCard label="En traitement" value={String(stats.inTreatment)} gradient="from-blue-500 to-indigo-500" icon={Activity} />
        <ViewStatCard label="Critiques" value={String(stats.critical)} gradient="from-red-600 to-rose-600" icon={AlertTriangle} />
      </ViewStatsGrid>

      <ViewTabPills className="w-full sm:w-auto">
        <ViewTabBtn active={activeTab === 'registry'} onClick={() => setActiveTab('registry')} icon={Shield}>
          Registre
        </ViewTabBtn>
        <ViewTabBtn active={activeTab === 'matrix'} onClick={() => setActiveTab('matrix')} icon={Target}>
          Matrice
        </ViewTabBtn>
        <ViewTabBtn active={activeTab === 'suggestions'} onClick={() => setActiveTab('suggestions')} icon={Lightbulb}>
          Suggestions ({visibleSuggestions.length})
        </ViewTabBtn>
        <ViewTabBtn active={activeTab === 'indicators'} onClick={() => setActiveTab('indicators')} icon={Activity}>
          Indicateurs
        </ViewTabBtn>
      </ViewTabPills>

      <div className="rounded-2xl border border-stone-200/90 bg-white p-4 sm:p-6 shadow-sm">
        {activeTab === 'registry' && (
          <RisksRegistryTab
            risks={scopedRisks}
            stages={scopedStages}
            searchQuery={searchQuery}
            filterCategory={filterCategory}
            filterType={filterType}
            filterStatus={filterStatus}
            onSearchChange={setSearchQuery}
            onCategoryChange={setFilterCategory}
            onTypeChange={setFilterType}
            onStatusChange={setFilterStatus}
            onView={openView}
            onEdit={openEdit}
            onCreate={openCreate}
          />
        )}

        {activeTab === 'matrix' && (
          <RisksMatrixTab risks={scopedRisks} onView={openView} onEdit={openEdit} onCreate={openCreate} />
        )}

        {activeTab === 'suggestions' && (
          <RisksSuggestionsTab
            suggestions={autoSuggestions}
            dismissedIds={dismissedSuggestionIds}
            onView={(s) => {
              setSelectedSuggestion(s);
              setPageMode('suggestion-view');
            }}
            onCreateFrom={(s) => openCreateFromSuggestion(s)}
            onEditBeforeCreate={(s) => openCreateFromSuggestion(s)}
            onDismiss={dismissSuggestion}
          />
        )}

        {activeTab === 'indicators' && (
          <RisksIndicatorsTab
            risks={scopedRisks}
            indicators={indicators}
            stats={{ treatmentRate: stats.treatmentRate, critical: stats.critical, total: stats.total, closed: stats.closed }}
            onViewIndicator={(ind) => {
              setSelectedIndicator(ind);
              setPageMode('indicator-view');
            }}
            onEditIndicator={(ind) => {
              setSelectedIndicator(ind);
              setPageMode('indicator-edit');
            }}
            onCreateRisk={openCreate}
          />
        )}
      </div>

      <section className="rounded-2xl border border-stone-200/90 bg-gradient-to-br from-stone-50 to-white p-5 sm:p-6">
        <h3 className="font-semibold text-stone-900 flex items-center gap-2 mb-2">
          <Shield className="w-5 h-5 text-stone-600" />
          Conformité ISO 9001 §6.1
        </h3>
        <p className="text-sm text-stone-600">
          Registre officiel des risques et opportunités — identification, évaluation, plans d&apos;action documentés et
          liens transversaux avec tâches, documents et pipeline.
        </p>
      </section>
    </ViewShell>
  );
}
