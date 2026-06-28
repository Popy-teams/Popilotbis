import { Award, CheckCircle, RefreshCw, Shield } from 'lucide-react';
import type { AuditBlockData } from '../../data/auditHelpers';
import { ViewHighlightBanner, ViewStatCard, ViewStatsGrid } from '../shared';
import type { AuditStats } from '../../types/audit';
import { BLOCK_THEMES, scoreBarColor, scoreTone } from './auditPresentation';

interface AuditOverviewTabProps {
  blocks: AuditBlockData[];
  stats: AuditStats;
  activeBlockId: string | null;
  onSelectBlock: (id: string) => void;
  onGoBlocks: () => void;
}

export function AuditOverviewTab({ blocks, stats, activeBlockId, onSelectBlock, onGoBlocks }: AuditOverviewTabProps) {
  const circumference = 553;
  const dash = (stats.globalScore / 100) * circumference;

  return (
    <div className="space-y-5 min-w-0">
      <ViewHighlightBanner
        title="Maturité ISO 9001"
        subtitle={`${stats.compliant}/${stats.totalCriteria} critères conformes · ${stats.totalActions} actions ouvertes`}
        value={`${stats.globalScore}%`}
        progress={stats.globalScore}
        theme="indigo"
      />

      <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-5 sm:p-8 text-white shadow-lg overflow-hidden relative">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col lg:flex-row items-center gap-8">
          <div className="flex-1 w-full space-y-4">
            <div className="flex items-center gap-3">
              <Award className="w-10 h-10 shrink-0" />
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Score de conformité global</h2>
                <p className="text-indigo-200 text-sm">8 blocs ISO 9001 · mise à jour temps réel</p>
              </div>
            </div>
            <ViewStatsGrid cols={2} className="sm:grid-cols-4 !gap-3">
              <MiniStat label="Conformes" value={String(stats.compliant)} />
              <MiniStat label="Partiels" value={String(stats.partial)} />
              <MiniStat label="Non conformes" value={String(stats.nonCompliant)} />
              <MiniStat label="Actions" value={String(stats.totalActions)} />
            </ViewStatsGrid>
          </div>
          <div className="relative w-40 h-40 sm:w-48 sm:h-48 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 192 192">
              <circle cx="96" cy="96" r="88" stroke="rgba(255,255,255,0.2)" strokeWidth="14" fill="none" />
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="white"
                strokeWidth="14"
                fill="none"
                strokeDasharray={`${dash} ${circumference}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl sm:text-5xl font-bold">{stats.globalScore}%</span>
              <span className="text-xs text-indigo-200">Conformité</span>
            </div>
          </div>
        </div>
      </div>

      <ViewStatsGrid cols={2} className="sm:hidden">
        <ViewStatCard label="Critères" value={String(stats.totalCriteria)} gradient="from-indigo-500 to-violet-600" icon={Shield} />
        <ViewStatCard label="Conformes" value={String(stats.compliant)} gradient="from-emerald-500 to-teal-600" icon={CheckCircle} />
      </ViewStatsGrid>

      <section className="rounded-xl sm:rounded-2xl border border-stone-200/90 bg-white p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <h3 className="font-semibold text-stone-900">Scores par bloc ISO</h3>
          <button type="button" onClick={onGoBlocks} className="text-sm font-medium text-indigo-700 hover:text-indigo-900">
            Explorer les blocs →
          </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {blocks.map((block) => {
            const theme = BLOCK_THEMES[block.id];
            const Icon = block.icon;
            const isActive = activeBlockId === block.id;
            return (
              <button
                key={block.id}
                type="button"
                onClick={() => onSelectBlock(block.id)}
                className={`text-left rounded-xl border p-3 sm:p-4 transition-all ${
                  isActive ? `${theme.border} ${theme.bg} ring-2 ${theme.ring}` : 'border-stone-200 hover:border-stone-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${theme.icon}`}>
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className={`text-lg font-bold ${scoreTone(block.score)}`}>{block.score}%</span>
                </div>
                <p className="text-xs font-semibold text-stone-900 line-clamp-2">{block.title}</p>
                <p className="text-[10px] text-stone-500 mt-1">{block.isoRef}</p>
                <div className="mt-2 h-1.5 rounded-full bg-stone-100 overflow-hidden">
                  <div className={`h-full ${scoreBarColor(block.score)}`} style={{ width: `${block.score}%` }} />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-cyan-200/80 bg-gradient-to-r from-cyan-50/80 to-blue-50/50 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <RefreshCw className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-stone-900">Audit continu</h3>
            <p className="text-sm text-stone-600 mt-1">
              Chaque action dans Popilot alimente automatiquement les preuves ISO : réunions, risques, satisfaction, documentation.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/10 backdrop-blur-sm px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-wide text-indigo-200">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
