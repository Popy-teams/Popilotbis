import { useEffect, useMemo, useState } from 'react';
import { Award, Download, Plus } from 'lucide-react';
import { useProjectContext } from '../context/ProjectContext';
import { filterByActiveProject } from '../utils/projectMatch';
import {
  type AuditBlockData,
  type AuditBlockId,
  type AuditCriterion,
  AUDIT_STORAGE_KEY,
  AUDIT_FIXTURE_VERSION_KEY,
  mergeAuditBlocks,
  rehydrateAuditBlocks,
  serializeAuditBlocks,
} from '../data/auditHelpers';
import { FULL_AUDIT_FIXTURES, AUDIT_FIXTURE_VERSION } from '../data/auditDemoFixtures';
import { INITIAL_AUDIT_BLOCKS } from '../data/initialAuditBlocks';
import type { AuditPageMode, AuditTab, CriterionFormValues } from '../types/audit';
import { ViewShell, ViewHeader, ActionButton } from './shared';
import { AuditTabNav } from './audit/AuditTabNav';
import { AuditOverviewTab } from './audit/AuditOverviewTab';
import { AuditBlocksTab } from './audit/AuditBlocksTab';
import { AuditActionsTab } from './audit/AuditActionsTab';
import { CriterionFormPage } from './audit/CriterionFormPage';
import { CriterionDetailPage } from './audit/CriterionDetailPage';
import { AuditExportPage } from './audit/AuditExportPage';
import {
  buildCriterionFromForm,
  computeAuditStats,
  computeBlockScore,
  criterionToFormValues,
  emptyCriterionForm,
} from './audit/auditPresentation';

export function AuditView() {
  const { matchesProject, activeProject, activeProjectSlug, ready } = useProjectContext();
  const [activeTab, setActiveTab] = useState<AuditTab>('overview');
  const [expandedBlockId, setExpandedBlockId] = useState<AuditBlockId | null>('context');
  const [pageMode, setPageMode] = useState<AuditPageMode>('list');
  const [selectedBlockId, setSelectedBlockId] = useState<AuditBlockId>('context');
  const [selectedCriterion, setSelectedCriterion] = useState<AuditCriterion | null>(null);
  const [criterionForm, setCriterionForm] = useState<CriterionFormValues>(emptyCriterionForm());
  const [auditBlocks, setAuditBlocks] = useState<AuditBlockData[]>([]);

  useEffect(() => {
    try {
      localStorage.removeItem('popilot:audit-local');
      const fixtureVersion = localStorage.getItem(AUDIT_FIXTURE_VERSION_KEY);

      if (fixtureVersion !== AUDIT_FIXTURE_VERSION) {
        const seed = rehydrateAuditBlocks(FULL_AUDIT_FIXTURES);
        setAuditBlocks(seed);
        localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(FULL_AUDIT_FIXTURES));
        localStorage.setItem(AUDIT_FIXTURE_VERSION_KEY, AUDIT_FIXTURE_VERSION);
        return;
      }

      const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
      const saved = raw ? rehydrateAuditBlocks(JSON.parse(raw)) : [];
      const merged = rehydrateAuditBlocks(mergeAuditBlocks(serializeAuditBlocks(saved), FULL_AUDIT_FIXTURES));
      setAuditBlocks(merged.length ? merged : rehydrateAuditBlocks(INITIAL_AUDIT_BLOCKS));
    } catch {
      setAuditBlocks(rehydrateAuditBlocks(FULL_AUDIT_FIXTURES));
    }
  }, []);

  useEffect(() => {
    if (auditBlocks.length === 0) return;
    try {
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(serializeAuditBlocks(auditBlocks)));
    } catch {
      /* ignore */
    }
  }, [auditBlocks]);

  useEffect(() => {
    if (activeProjectSlug && !auditBlocks.some((b) => matchesProject(b.projectId ?? 'popy'))) {
      setExpandedBlockId(null);
    }
  }, [activeProjectSlug, auditBlocks, matchesProject]);

  const scopedBlocks = useMemo(
    () => filterByActiveProject(auditBlocks, matchesProject),
    [auditBlocks, matchesProject]
  );

  const stats = useMemo(() => computeAuditStats(scopedBlocks), [scopedBlocks]);

  const goList = () => {
    setPageMode('list');
    setSelectedCriterion(null);
  };

  const openCreateCriterion = (blockId: AuditBlockId = expandedBlockId ?? 'context') => {
    setCriterionForm(emptyCriterionForm(blockId));
    setSelectedCriterion(null);
    setPageMode('create');
  };

  const openViewCriterion = (blockId: AuditBlockId, criterion: AuditCriterion) => {
    setSelectedBlockId(blockId);
    setSelectedCriterion(criterion);
    setPageMode('view');
  };

  const openEditCriterion = (blockId: AuditBlockId, criterion: AuditCriterion) => {
    setSelectedBlockId(blockId);
    setSelectedCriterion(criterion);
    setCriterionForm(criterionToFormValues(blockId, criterion));
    setPageMode('edit');
  };

  const handleCriterionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = buildCriterionFromForm(criterionForm, pageMode === 'edit' ? selectedCriterion ?? undefined : undefined);
    setAuditBlocks((prev) =>
      prev.map((block) => {
        if (block.id !== criterionForm.blockId) return block;
        const criteria =
          pageMode === 'create'
            ? [...block.criteria, next]
            : block.criteria.map((c) => (c.id === next.id ? next : c));
        return { ...block, score: computeBlockScore(criteria), criteria };
      })
    );
    setSelectedCriterion(next);
    setPageMode('view');
    setCriterionForm(emptyCriterionForm());
  };

  const removeCriterion = (blockId: AuditBlockId, criterionId: string) => {
    setAuditBlocks((prev) =>
      prev.map((block) => {
        if (block.id !== blockId) return block;
        const criteria = block.criteria.filter((c) => c.id !== criterionId);
        return { ...block, criteria, score: computeBlockScore(criteria) };
      })
    );
    goList();
  };

  if (!ready) {
    return (
      <ViewShell>
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin" />
          <p className="text-sm text-stone-500">Chargement de l&apos;audit ISO…</p>
        </div>
      </ViewShell>
    );
  }

  if (pageMode === 'export') {
    return (
      <AuditExportPage stats={stats} projectName={activeProject?.name} onBack={() => { setPageMode('list'); setActiveTab('export'); }} />
    );
  }

  if (pageMode === 'create' || pageMode === 'edit') {
    return (
      <CriterionFormPage
        mode={pageMode === 'create' ? 'create' : 'edit'}
        values={criterionForm}
        blocks={scopedBlocks}
        onChange={setCriterionForm}
        onBack={() => {
          if (selectedCriterion && pageMode === 'edit') setPageMode('view');
          else goList();
        }}
        onSubmit={handleCriterionSubmit}
      />
    );
  }

  if (pageMode === 'view' && selectedCriterion) {
    const block = scopedBlocks.find((b) => b.id === selectedBlockId);
    return (
      <CriterionDetailPage
        blockTitle={block?.title ?? selectedBlockId}
        criterion={selectedCriterion}
        onBack={goList}
        onEdit={() => openEditCriterion(selectedBlockId, selectedCriterion)}
        onDelete={() => removeCriterion(selectedBlockId, selectedCriterion.id)}
      />
    );
  }

  if (scopedBlocks.length === 0) {
    return (
      <ViewShell>
        <ViewHeader
          title="Audit Global ISO 9001"
          subtitle={activeProject ? `Aucune donnée pour ${activeProject.name}` : 'Sélectionnez un projet'}
          badge="Audit · ISO 9001"
          theme="indigo"
        />
        <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center">
          <Award className="w-12 h-12 mx-auto mb-4 text-indigo-400" />
          <p className="font-medium text-stone-900">Pas encore de grille d&apos;audit pour ce projet</p>
        </div>
      </ViewShell>
    );
  }

  return (
    <ViewShell>
      <ViewHeader
        title="Audit Global ISO 9001"
        subtitle={
          activeProject
            ? `Conformité en temps réel — ${activeProject.name}`
            : 'Conformité en temps réel — Amélioration continue'
        }
        badge="Audit · ISO 9001"
        theme="indigo"
        sidePanel={
          activeProject ? (
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-[11px] uppercase tracking-wide font-semibold text-indigo-700">Projet actif</p>
                <p className="font-semibold text-stone-900 mt-0.5">{activeProject.name}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide font-semibold text-stone-500">Score global</p>
                <p className="text-2xl font-bold text-indigo-700 mt-0.5">{stats.globalScore}%</p>
              </div>
              <div className="pt-2 border-t border-indigo-100">
                <p className="text-[11px] uppercase tracking-wide font-semibold text-stone-500">Critères conformes</p>
                <p className="font-medium text-stone-800 mt-0.5">
                  {stats.compliant}/{stats.totalCriteria}
                </p>
              </div>
            </div>
          ) : undefined
        }
        actions={
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <ActionButton variant="secondary" icon={Download} onClick={() => setPageMode('export')} className="w-full sm:w-auto justify-center">
              Export rapport
            </ActionButton>
            <ActionButton icon={Plus} onClick={() => openCreateCriterion(expandedBlockId ?? 'context')} className="w-full sm:w-auto justify-center">
              Nouveau critère
            </ActionButton>
          </div>
        }
      />

      <AuditTabNav activeTab={activeTab} onChange={setActiveTab} actionCount={stats.totalActions} />

      <div className="rounded-xl sm:rounded-2xl border border-stone-200/90 bg-white p-3 sm:p-4 md:p-6 shadow-sm min-w-0 overflow-hidden">
        {activeTab === 'overview' && (
          <AuditOverviewTab
            blocks={scopedBlocks}
            stats={stats}
            activeBlockId={expandedBlockId}
            onSelectBlock={(id) => {
              setExpandedBlockId(id as AuditBlockId);
              setActiveTab('blocks');
            }}
            onGoBlocks={() => setActiveTab('blocks')}
          />
        )}

        {activeTab === 'blocks' && (
          <AuditBlocksTab
            blocks={scopedBlocks}
            expandedBlockId={expandedBlockId}
            onExpandBlock={setExpandedBlockId}
            onViewCriterion={openViewCriterion}
            onEditCriterion={openEditCriterion}
            onCreateCriterion={openCreateCriterion}
          />
        )}

        {activeTab === 'actions' && <AuditActionsTab blocks={scopedBlocks} />}

        {activeTab === 'export' && (
          <div className="space-y-4">
            <p className="text-sm text-stone-600">
              Générez un rapport d&apos;audit ISO 9001 complet pour votre projet.
            </p>
            <ActionButton icon={Download} onClick={() => setPageMode('export')} className="!bg-indigo-600 hover:!bg-indigo-700 !text-white">
              Configurer l&apos;export
            </ActionButton>
          </div>
        )}
      </div>
    </ViewShell>
  );
}
