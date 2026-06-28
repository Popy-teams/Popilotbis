import { useMemo, useState } from 'react';
import { Activity, RefreshCw } from 'lucide-react';
import { useProjectContext } from '../../context/ProjectContext';
import {
  ViewShell,
  ViewHeader,
  ViewStatCard,
  ViewStatsGrid,
  ViewTabPills,
  ViewTabBtn,
} from '../shared';
import { aggregatePdca } from '../../utils/pdcaAggregation';
import { PDCA_PHASE_META } from '../../utils/pdcaCatalog';
import type { PdcaPhase } from '../../types/pdca';
import {
  PdcaChartsOverview,
  PdcaChartsTrend,
  PdcaChartsModules,
  PdcaChartsStatus,
  PdcaCycleDiagram,
} from './PdcaCharts';
import { PdcaPhasePanel } from './PdcaPhasePanel';

type PdcaTab = 'overview' | PdcaPhase;

export function PdcaView() {
  const { matchesProject, activeProject, activeProjectSlug } = useProjectContext();
  const [activeTab, setActiveTab] = useState<PdcaTab>('overview');

  const snapshot = useMemo(
    () => aggregatePdca(activeProjectSlug ?? 'popy', matchesProject),
    [activeProjectSlug, matchesProject]
  );

  const totalItems = snapshot.items.length;

  return (
    <ViewShell>
      <ViewHeader
        title="Boucle PDCA"
        subtitle={
          activeProject
            ? `${activeProject.name} — Plan · Do · Check · Act (ISO 9001)`
            : 'Sélectionnez un projet — cartographie PDCA transversale'
        }
        badge="Qualité · PDCA"
        theme="violet"
        actions={
          <div className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-800">
            <RefreshCw className="w-4 h-4" />
            Santé {snapshot.healthScore}%
          </div>
        }
      />

      <section className="rounded-2xl border border-stone-200/90 bg-white p-4 sm:p-6 shadow-sm">
        <PdcaCycleDiagram phaseStats={snapshot.phaseStats} />
      </section>

      <ViewStatsGrid cols={4}>
        {(['plan', 'do', 'check', 'act'] as PdcaPhase[]).map((phase) => {
          const stat = snapshot.phaseStats.find((s) => s.phase === phase)!;
          const meta = PDCA_PHASE_META[phase];
          return (
            <ViewStatCard
              key={phase}
              label={`${meta.letter} — ${meta.label}`}
              value={String(stat.total)}
              hint={`${stat.completionRate}% achevé · ${meta.isoRef}`}
              gradient={meta.gradient}
              icon={Activity}
            />
          );
        })}
      </ViewStatsGrid>

      <ViewTabPills className="flex-wrap">
        <ViewTabBtn active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={RefreshCw}>
          Vue d&apos;ensemble ({totalItems})
        </ViewTabBtn>
        {(['plan', 'do', 'check', 'act'] as PdcaPhase[]).map((phase) => (
          <ViewTabBtn
            key={phase}
            active={activeTab === phase}
            onClick={() => setActiveTab(phase)}
          >
            {PDCA_PHASE_META[phase].letter} — {PDCA_PHASE_META[phase].label} ({snapshot.byPhase[phase].length})
          </ViewTabBtn>
        ))}
      </ViewTabPills>

      {activeTab === 'overview' ? (
        <div className="space-y-5">
          <PdcaChartsOverview snapshot={snapshot} />
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <PdcaChartsStatus phaseStats={snapshot.phaseStats} />
            <PdcaChartsTrend snapshot={snapshot} />
          </div>
          <PdcaChartsModules snapshot={snapshot} />
        </div>
      ) : (
        <PdcaPhasePanel phase={activeTab} items={snapshot.byPhase[activeTab]} />
      )}

      <section className="rounded-2xl border border-stone-200/90 bg-gradient-to-br from-stone-50 to-white p-5 sm:p-6">
        <h3 className="font-semibold text-stone-900 mb-2">Méthode de classification</h3>
        <p className="text-sm text-stone-600 leading-relaxed">
          POPILOT agrège automatiquement tâches, processus, risques, réunions, KPI et critères d&apos;audit du projet actif.
          <strong className="text-stone-800"> Plan</strong> : éléments à planifier ·
          <strong className="text-stone-800"> Do</strong> : en exécution ·
          <strong className="text-stone-800"> Check</strong> : mesure et vérification ·
          <strong className="text-stone-800"> Act</strong> : actions correctives et amélioration.
        </p>
      </section>
    </ViewShell>
  );
}
