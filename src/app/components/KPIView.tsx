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

export function KPIView() {
  const { activeProject, matchesProject, activeProjectSlug } = useProjectContext();
  const [activeTab, setActiveTab] = useState<KpiTab>('overview');
  const [activeCategoryId, setActiveCategoryId] = useState<KpiCategoryId | null>(null);
  const [pageMode, setPageMode] = useState<KpiPageMode>('list');
  const [metrics, setMetrics] = useState<KpiMetric[]>([]);
  const [selectedKpi, setSelectedKpi] = useState<KpiMetric | null>(null);
  const [form, setForm] = useState(emptyKpiForm());

  useEffect(() => {
    try {
      localStorage.removeItem('popilot:kpi-local');
      const fixtureVersion = localStorage.getItem(KPI_FIXTURE_VERSION_KEY);

      if (fixtureVersion !== KPI_FIXTURE_VERSION) {
        setMetrics(FULL_KPI_FIXTURES);
        localStorage.setItem(KPI_STORAGE_KEY, JSON.stringify(FULL_KPI_FIXTURES));
        localStorage.setItem(KPI_FIXTURE_VERSION_KEY, KPI_FIXTURE_VERSION);
        return;
      }

      const raw = localStorage.getItem(KPI_STORAGE_KEY);
      const saved: KpiMetric[] = raw ? JSON.parse(raw) : [];
      const merged = mergeKpiMetrics(saved, FULL_KPI_FIXTURES);
      setMetrics(merged.length ? merged : FULL_KPI_FIXTURES);
    } catch {
      setMetrics(FULL_KPI_FIXTURES);
    }
  }, []);

  useEffect(() => {
    if (metrics.length === 0) return;
    try {
      localStorage.setItem(KPI_STORAGE_KEY, JSON.stringify(metrics));
    } catch {
      /* ignore */
    }
  }, [metrics]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = buildMetricFromForm(form, pageMode === 'edit' ? selectedKpi ?? undefined : undefined);
    if (pageMode === 'create') {
      setMetrics((prev) => [...prev, next]);
    } else {
      setMetrics((prev) => prev.map((m) => (m.id === next.id ? next : m)));
      setSelectedKpi(next);
    }
    setPageMode(pageMode === 'edit' ? 'view' : 'list');
    setForm(emptyKpiForm());
  };

  const removeKpi = (id: string) => {
    setMetrics((prev) => prev.filter((m) => m.id !== id));
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
