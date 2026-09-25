import { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useProjectContext } from '../context/ProjectContext';
import { filterByActiveProject } from '../utils/projectMatch';
import type { KpiCategoryId, KpiMetric, KpiPageMode, KpiTab } from '../types/kpi';
import {
  KPI_STORAGE_KEY,
  KPI_FIXTURE_VERSION_KEY,
  KPI_FIXTURE_VERSION,
  FULL_KPI_FIXTURES,
  mergeKpiMetrics,
  computeKpiStats,
} from '../data/kpiHelpers';
import { ViewShell, ViewHeader, ActionButton } from './shared';
import { KpiTabNav } from './kpi/KpiTabNav';
import { KpiOverviewTab } from './kpi/KpiOverviewTab';
import { KpiCategoriesTab } from './kpi/KpiCategoriesTab';
import { KpiReferentialTab } from './kpi/KpiReferentialTab';
import { KpiDetailPage } from './kpi/KpiDetailPage';
import { KpiFormPage } from './kpi/KpiFormPage';
import {
  buildMetricFromForm,
  emptyKpiForm,
  metricToFormValues,
} from './kpi/kpiPresentation';
import { useApi, apiPost, apiPut, apiDelete } from '../hooks/useApi';

export function KPIView() {
  const { activeProject, matchesProject, activeProjectSlug } = useProjectContext();
  const [activeTab, setActiveTab] = useState<KpiTab>('overview');
  const [activeCategoryId, setActiveCategoryId] = useState<KpiCategoryId | null>(null);
  const [pageMode, setPageMode] = useState<KpiPageMode>('list');
  const [selectedKpi, setSelectedKpi] = useState<KpiMetric | null>(null);
  const [form, setForm] = useState(emptyKpiForm());
  const { data: apiMetrics, refetch: refetchMetrics } = useApi<any[]>(activeProject ? `/kpi/${activeProject.id}` : null);

  const metrics = useMemo(() => {
    if (!apiMetrics) return [];
    return apiMetrics.map(m => ({
      ...m,
      projectId: m.project_id,
      categoryId: m.category_id,
      measurementMethod: m.measurement_method,
      targetThreshold: m.target_threshold,
      thresholdKind: m.threshold_kind,
      targetNumeric: m.target_numeric,
      currentValue: m.current_value,
      previousValue: m.previous_value
    }));
  }, [apiMetrics]);

  const scopedMetrics = useMemo(
    () => filterByActiveProject(metrics, matchesProject, activeProjectSlug ?? 'popy'),
    [metrics, matchesProject, activeProjectSlug]
  );

  const stats = useMemo(() => computeKpiStats(scopedMetrics), [scopedMetrics]);

  const goList = () => {
    setPageMode('list');
    setSelectedKpi(null);
  };

  const openCreate = () => {
    setForm(emptyKpiForm(activeCategoryId ?? 'robot'));
    setSelectedKpi(null);
    setPageMode('create');
  };

  const openView = (kpi: KpiMetric) => {
    setSelectedKpi(kpi);
    setPageMode('view');
  };

  const openEdit = (kpi: KpiMetric) => {
    setSelectedKpi(kpi);
    setForm(metricToFormValues(kpi));
    setPageMode('edit');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next = buildMetricFromForm(form, pageMode === 'edit' ? selectedKpi ?? undefined : undefined);
    
    if (pageMode === 'create') {
      await apiPost('/kpi', { ...next, projectId: activeProjectSlug ?? 'popy' });
    } else {
      await apiPut(`/kpi/${next.id}`, next);
      setSelectedKpi(next);
    }
    
    refetchMetrics();
    setPageMode(pageMode === 'edit' ? 'view' : 'list');
    setForm(emptyKpiForm());
  };

  const removeKpi = async (id: string) => {
    await apiDelete(`/kpi/${id}`);
    refetchMetrics();
    goList();
  };

  const handleSelectCategory = (categoryId: string) => {
    setActiveCategoryId(categoryId as KpiCategoryId);
    setActiveTab('categories');
  };

  if (pageMode === 'create' || pageMode === 'edit') {
    return (
      <KpiFormPage
        mode={pageMode}
        form={form}
        onChange={setForm}
        onSubmit={handleSubmit}
        onBack={() => (pageMode === 'edit' && selectedKpi ? setPageMode('view') : goList())}
      />
    );
  }

  if (pageMode === 'view' && selectedKpi) {
    const kpi = metrics.find((m) => m.id === selectedKpi.id) ?? selectedKpi;
    return (
      <KpiDetailPage
        kpi={kpi}
        onBack={goList}
        onEdit={() => openEdit(kpi)}
        onDelete={() => removeKpi(kpi.id)}
      />
    );
  }

  return (
    <div className="h-full overflow-auto">
      <ViewShell>
        <ViewHeader
          title="Tableau de bord KPI"
          subtitle={
            activeProject
              ? `${activeProject.name} — ${stats.total} indicateur${stats.total > 1 ? 's' : ''}`
              : 'Sélectionnez un projet'
          }
          badge="Indicateurs · KPI"
          theme="amber"
          actions={
            <ActionButton icon={Plus} onClick={openCreate}>
              Nouveau KPI
            </ActionButton>
          }
        />

        {scopedMetrics.length === 0 ? (
          <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-8 text-center text-stone-600">
            Aucun indicateur KPI pour ce projet. Créez un premier KPI ou sélectionnez un autre projet.
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-5 min-w-0 overflow-x-hidden">
            <KpiTabNav activeTab={activeTab} onChange={setActiveTab} kpiCount={scopedMetrics.length} />

            {activeTab === 'overview' && (
              <KpiOverviewTab
                stats={stats}
                metrics={scopedMetrics}
                onGoCategories={() => setActiveTab('categories')}
                onSelectCategory={handleSelectCategory}
              />
            )}

            {activeTab === 'categories' && (
              <KpiCategoriesTab
                metrics={scopedMetrics}
                activeCategoryId={activeCategoryId}
                onSelectCategory={setActiveCategoryId}
                onViewKpi={openView}
              />
            )}

            {activeTab === 'referential' && <KpiReferentialTab />}
          </div>
        )}
      </ViewShell>
    </div>
  );
}
