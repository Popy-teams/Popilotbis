import { Activity, ArrowDown, ArrowUp, Eye, Pencil, Plus, Settings } from 'lucide-react';
import type { Risk } from '../../types/risks';
import { ActionButton, ViewSectionTitle, ViewStatCard, ViewStatsGrid } from '../shared';
import { categoryBreakdown, type RiskIndicatorConfig } from './riskPresentation';

interface RisksIndicatorsTabProps {
  risks: Risk[];
  indicators: RiskIndicatorConfig[];
  stats: {
    treatmentRate: number;
    critical: number;
    total: number;
    closed: number;
  };
  onViewIndicator: (indicator: RiskIndicatorConfig) => void;
  onEditIndicator: (indicator: RiskIndicatorConfig) => void;
  onCreateRisk: () => void;
}

export function RisksIndicatorsTab({
  risks,
  indicators,
  stats,
  onViewIndicator,
  onEditIndicator,
  onCreateRisk,
}: RisksIndicatorsTabProps) {
  const breakdown = categoryBreakdown(risks);
  const maxCount = Math.max(1, ...breakdown.map((b) => b.count));

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <ViewSectionTitle icon={Activity} title="Indicateurs de pilotage" />
        <ActionButton icon={Plus} onClick={onCreateRisk}>
          Nouveau risque
        </ActionButton>
      </div>

      <ViewStatsGrid cols={3}>
        <ViewStatCard
          label="Taux de traitement"
          value={`${stats.treatmentRate}%`}
          hint={`Objectif : ${indicators.find((i) => i.id === 'treatment-rate')?.target ?? 75}%`}
          gradient="from-blue-500 to-indigo-500"
          icon={Activity}
        />
        <ViewStatCard
          label="Critiques ouverts"
          value={String(stats.critical)}
          hint="Action immédiate si > 0"
          gradient="from-orange-500 to-red-500"
          icon={ArrowUp}
        />
        <ViewStatCard
          label="Risques clôturés"
          value={String(stats.closed)}
          hint={`Sur ${stats.total} au total`}
          gradient="from-emerald-500 to-teal-500"
          icon={ArrowDown}
        />
      </ViewStatsGrid>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {indicators.map((indicator) => {
          const current =
            indicator.id === 'treatment-rate'
              ? stats.treatmentRate
              : indicator.id === 'critical-open'
                ? stats.critical
                : 12;
          const onTarget =
            indicator.direction === 'higher-is-better' ? current >= indicator.target : current <= indicator.target;

          return (
            <article
              key={indicator.id}
              className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className="font-semibold text-stone-900">{indicator.label}</h3>
                  <p className="text-xs text-stone-500 mt-1 line-clamp-2">{indicator.description}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                    onTarget ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'
                  }`}
                >
                  {onTarget ? 'OK' : 'Alerte'}
                </span>
              </div>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-3xl font-bold text-stone-900">
                  {current}
                  {indicator.unit === '%' ? '%' : indicator.unit === 'days' ? 'j' : ''}
                </span>
                <span className="text-sm text-stone-500 pb-1">
                  / cible {indicator.target}
                  {indicator.unit === '%' ? '%' : indicator.unit === 'days' ? 'j' : ''}
                </span>
              </div>
              <div className="flex gap-2">
                <ActionButton variant="secondary" icon={Eye} onClick={() => onViewIndicator(indicator)} className="flex-1 justify-center">
                  Consulter
                </ActionButton>
                <ActionButton variant="secondary" icon={Settings} onClick={() => onEditIndicator(indicator)} className="flex-1 justify-center">
                  Modifier
                </ActionButton>
              </div>
            </article>
          );
        })}
      </div>

      <section className="rounded-2xl border border-stone-200/90 bg-white p-5 sm:p-6 shadow-sm">
        <h3 className="font-semibold text-stone-900 mb-4">Évolution (6 derniers mois)</h3>
        <div className="h-48 flex items-end justify-around gap-2">
          {['Sept', 'Oct', 'Nov', 'Déc', 'Jan', 'Fév'].map((month, idx) => {
            const heights = [40, 55, 45, 60, 50, 35];
            return (
              <div key={month} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-gradient-to-t from-red-500 to-orange-400 rounded-t-lg opacity-80" style={{ height: `${heights[idx]}%` }} />
                <div className="text-xs text-stone-500">{month}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200/90 bg-white p-5 sm:p-6 shadow-sm">
        <h3 className="font-semibold text-stone-900 mb-4">Répartition par catégorie</h3>
        <div className="space-y-3">
          {breakdown
            .filter((b) => b.count > 0)
            .map((item) => (
              <div key={item.category} className="flex items-center gap-3">
                <div className="w-36 text-sm font-medium text-stone-700 truncate">{item.label}</div>
                <div className="flex-1 h-2 rounded-full bg-stone-100 overflow-hidden">
                  <div
                    className="h-full bg-stone-700 rounded-full"
                    style={{ width: `${(item.count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="w-6 text-sm font-bold text-stone-800 text-right">{item.count}</span>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}
