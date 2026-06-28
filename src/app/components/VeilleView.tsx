import { useEffect, useMemo, useState } from 'react';
import { useProjectContext } from '../context/ProjectContext';
import { filterByActiveProject } from '../utils/projectMatch';
import { DEMO_VEILLE_BY_PROJECT } from '../data/multiProjectDemoFixtures';
import { mergeDemoData } from '../utils/demoDataMerge';
import { INITIAL_VEILLE_ENTRIES } from '../data/initialVeilleData';
import {
  VEILLE_STORAGE_KEY,
  type VeilleEntry,
  type VeillePageMode,
  type VeilleTab,
  type VeilleType,
} from '../types/veille';
import {
  ViewShell,
  ViewHeader,
  ViewStatCard,
  ViewStatsGrid,
  ViewTabPills,
  ViewTabBtn,
  ActionButton,
} from './shared';
import { Download, Eye, Layers, BarChart3, Calendar, Plus, AlertCircle } from 'lucide-react';
import { VeilleFormPage } from './veille/VeilleFormPage';
import { VeilleDetailPage } from './veille/VeilleDetailPage';
import { VeilleRegistryTab } from './veille/VeilleRegistryTab';
import { VeilleTypesTab } from './veille/VeilleTypesTab';
import { VeilleReviewsTab } from './veille/VeilleReviewsTab';
import { VeilleCharts } from './veille/VeilleCharts';
import { VeilleTypeDetailPage } from './veille/VeilleTypeDetailPage';
import {
  buildEntryFromForm,
  computeVeilleStats,
  emptyVeilleForm,
  entryToFormValues,
  type VeilleFormValues,
} from './veille/veillePresentation';

export function VeilleView() {
  const { matchesProject, activeProject, activeProjectSlug } = useProjectContext();
  const [pageMode, setPageMode] = useState<VeillePageMode>('list');
  const [activeTab, setActiveTab] = useState<VeilleTab>('registry');
  const [filterType, setFilterType] = useState<VeilleType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<VeilleEntry['status'] | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [entries, setEntries] = useState<VeilleEntry[]>(INITIAL_VEILLE_ENTRIES);
  const [selectedEntry, setSelectedEntry] = useState<VeilleEntry | null>(null);
  const [selectedType, setSelectedType] = useState<VeilleType | null>(null);
  const [form, setForm] = useState<VeilleFormValues>(emptyVeilleForm());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(VEILLE_STORAGE_KEY);
      const saved = raw ? (JSON.parse(raw) as VeilleEntry[]) : [];
      setEntries(mergeDemoData(saved, DEMO_VEILLE_BY_PROJECT, INITIAL_VEILLE_ENTRIES));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(VEILLE_STORAGE_KEY, JSON.stringify(entries));
    } catch {
      /* ignore */
    }
  }, [entries]);

  const scopedEntries = useMemo(
    () => filterByActiveProject(entries, matchesProject),
    [entries, matchesProject]
  );

  const stats = useMemo(() => computeVeilleStats(scopedEntries), [scopedEntries]);
  const projectId = activeProjectSlug ?? 'popy';

  const goList = () => {
    setPageMode('list');
    setSelectedEntry(null);
    setSelectedType(null);
  };

  const openCreate = (type?: VeilleType) => {
    setForm({ ...emptyVeilleForm(), ...(type ? { type } : {}) });
    setSelectedEntry(null);
    setPageMode('create');
  };

  const openView = (entry: VeilleEntry) => {
    setSelectedEntry(entry);
    setPageMode('view');
  };

  const openEdit = (entry: VeilleEntry) => {
    setSelectedEntry(entry);
    setForm(entryToFormValues(entry));
    setPageMode('edit');
  };

  const openTypeView = (type: VeilleType) => {
    setSelectedType(type);
    setPageMode('type-view');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pageMode === 'create') {
      const next = buildEntryFromForm(form, undefined, projectId);
      setEntries((prev) => [next, ...prev]);
      setSelectedEntry(next);
      setPageMode('view');
    } else if (pageMode === 'edit' && selectedEntry) {
      const next = buildEntryFromForm(form, selectedEntry, projectId);
      setEntries((prev) => prev.map((item) => (item.id === next.id ? next : item)));
      setSelectedEntry(next);
      setPageMode('view');
    }
    setForm(emptyVeilleForm());
  };

  const removeEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    goList();
  };

  if (pageMode === 'create' || pageMode === 'edit') {
    return (
      <VeilleFormPage
        mode={pageMode === 'create' ? 'create' : 'edit'}
        values={form}
        onChange={setForm}
        onBack={() => {
          if (selectedEntry && pageMode === 'edit') setPageMode('view');
          else if (selectedType) setPageMode('type-view');
          else goList();
        }}
        onSubmit={handleSubmit}
      />
    );
  }

  if (pageMode === 'view' && selectedEntry) {
    const entry = scopedEntries.find((e) => e.id === selectedEntry.id) ?? selectedEntry;
    return (
      <VeilleDetailPage
        entry={entry}
        onBack={() => {
          if (selectedType) setPageMode('type-view');
          else goList();
        }}
        onEdit={() => openEdit(entry)}
        onDelete={() => removeEntry(entry.id)}
      />
    );
  }

  if (pageMode === 'type-view' && selectedType) {
    return (
      <VeilleTypeDetailPage
        type={selectedType}
        entries={scopedEntries}
        onBack={goList}
        onCreate={() => openCreate(selectedType)}
        onView={openView}
        onEdit={openEdit}
      />
    );
  }

  return (
    <ViewShell>
      <ViewHeader
        title="Veille ISO 9001"
        subtitle={
          activeProject
            ? `${activeProject.name} — Surveillance §4.1 · §4.2 et environnement`
            : 'Sélectionnez un projet pour le registre de veille'
        }
        badge="Veille · ISO"
        theme="cyan"
        actions={
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <ActionButton
              variant="secondary"
              icon={Download}
              onClick={() => alert('Export registre de veille pour audit ISO')}
            >
              Export audit
            </ActionButton>
            <ActionButton icon={Plus} onClick={() => openCreate()}>
              Nouvelle veille
            </ActionButton>
          </div>
        }
      />

      <ViewStatsGrid cols={5}>
        <ViewStatCard
          label="Actions requises"
          value={String(stats.actionRequired)}
          hint="À traiter en priorité"
          gradient="from-red-500 to-rose-600"
          icon={AlertCircle}
        />
        <ViewStatCard
          label="En analyse"
          value={String(stats.analyzing)}
          gradient="from-amber-500 to-orange-500"
          icon={Eye}
        />
        <ViewStatCard
          label="En suivi"
          value={String(stats.monitoring)}
          gradient="from-emerald-500 to-teal-500"
          icon={Eye}
        />
        <ViewStatCard
          label="Registre total"
          value={String(stats.total)}
          gradient="from-cyan-500 to-blue-600"
          icon={Layers}
        />
        <ViewStatCard
          label="Critiques"
          value={String(stats.critical)}
          gradient="from-violet-500 to-purple-600"
          icon={AlertCircle}
        />
      </ViewStatsGrid>

      <ViewTabPills className="flex-wrap">
        <ViewTabBtn active={activeTab === 'registry'} onClick={() => setActiveTab('registry')} icon={Eye}>
          Registre ({stats.total})
        </ViewTabBtn>
        <ViewTabBtn active={activeTab === 'types'} onClick={() => setActiveTab('types')} icon={Layers}>
          Types ISO (7)
        </ViewTabBtn>
        <ViewTabBtn active={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')} icon={Calendar}>
          Revues
        </ViewTabBtn>
        <ViewTabBtn active={activeTab === 'indicators'} onClick={() => setActiveTab('indicators')} icon={BarChart3}>
          Indicateurs
        </ViewTabBtn>
      </ViewTabPills>

      <div className="rounded-2xl border border-stone-200/90 bg-white p-4 sm:p-6 shadow-sm">
        {activeTab === 'registry' && (
          <VeilleRegistryTab
            entries={scopedEntries}
            filterType={filterType}
            filterStatus={filterStatus}
            searchQuery={searchQuery}
            onTypeChange={setFilterType}
            onStatusChange={setFilterStatus}
            onSearchChange={setSearchQuery}
            onView={openView}
            onEdit={openEdit}
            onCreate={() => openCreate()}
          />
        )}

        {activeTab === 'types' && (
          <VeilleTypesTab entries={scopedEntries} onSelectType={openTypeView} onCreateForType={(t) => openCreate(t)} />
        )}

        {activeTab === 'reviews' && (
          <VeilleReviewsTab entries={scopedEntries} onView={openView} onEdit={openEdit} />
        )}

        {activeTab === 'indicators' && <VeilleCharts entries={scopedEntries} />}
      </div>

      <section className="rounded-2xl border border-stone-200/90 bg-gradient-to-br from-cyan-50/40 to-white p-5 sm:p-6">
        <h3 className="font-semibold text-stone-900 flex items-center gap-2 mb-2">
          <Eye className="w-5 h-5 text-cyan-700" />
          Exigences ISO §4.1 et §4.2
        </h3>
        <p className="text-sm text-stone-600">
          Le registre de veille alimente l&apos;analyse du contexte, les parties intéressées et la planification des
          risques. Chaque signal doit être analysé, décisionné et relié aux modules Risques, Tâches et Documentation.
        </p>
      </section>
    </ViewShell>
  );
}
