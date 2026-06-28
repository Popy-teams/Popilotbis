import { Award, AlertCircle, CheckCircle } from 'lucide-react';
import type { KpiMetric, KpiStats } from '../../types/kpi';
import { KPI_CATEGORIES } from '../../data/kpiReferential';
import { ViewHighlightBanner, ViewStatsGrid } from '../shared';
import { CATEGORY_GRADIENTS, CATEGORY_ICONS } from './kpiPresentation';
import { KpiStatCard } from './KpiStatCard';

interface KpiOverviewTabProps {
  stats: KpiStats;
  metrics: KpiMetric[];
  onGoCategories: () => void;
  onSelectCategory: (categoryId: string) => void;
}

export function KpiOverviewTab({ stats, metrics, onGoCategories, onSelectCategory }: KpiOverviewTabProps) {
  return (
    <div className="space-y-4 sm:space-y-5 min-w-0">
      <ViewHighlightBanner
        title="Référentiel KPI POPY"
        subtitle={`${stats.total} indicateurs · ${KPI_CATEGORIES.length} familles`}
        value={`${stats.healthScore}%`}
        progress={stats.healthScore}
        theme="amber"
      />

      <ViewStatsGrid cols={2} className="sm:hidden">
        <KpiStatCard label="Conformes" value={String(stats.good)} tone="good" icon={CheckCircle} />
        <KpiStatCard label="Surveillance" value={String(stats.warning)} tone="warning" icon={AlertCircle} />
        <KpiStatCard label="Critiques" value={String(stats.critical)} tone="critical" icon={AlertCircle} />
        <KpiStatCard label="Familles" value={String(KPI_CATEGORIES.length)} tone="neutral" icon={Award} />
      </ViewStatsGrid>

      <ViewStatsGrid cols={4} className="hidden sm:grid">
        <KpiStatCard
          label="KPI conformes"
          value={String(stats.good)}
          hint={`${stats.total ? Math.round((stats.good / stats.total) * 100) : 0}% du total`}
          tone="good"
          icon={CheckCircle}
        />
        <KpiStatCard
          label="À surveiller"
          value={String(stats.warning)}
          hint="Écart modéré à la cible"
          tone="warning"
          icon={AlertCircle}
        />
        <KpiStatCard
          label="Action requise"
          value={String(stats.critical)}
          hint="Dérive importante"
          tone="critical"
          icon={AlertCircle}
        />
        <KpiStatCard
          label="Familles KPI"
          value={String(KPI_CATEGORIES.length)}
          hint={`${stats.total} indicateurs`}
          tone="neutral"
          icon={Award}
        />
      </ViewStatsGrid>

      <section className="rounded-xl sm:rounded-2xl border border-stone-200 bg-white p-3 sm:p-5 shadow-sm min-w-0">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
          <h3 className="font-semibold text-stone-900 text-sm sm:text-base">Répartition par famille</h3>
          <button
            type="button"
            onClick={onGoCategories}
            className="text-sm font-medium text-amber-800 hover:text-amber-950 text-left sm:text-right"
          >
            Explorer les familles →
          </button>
        </div>
        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
          {KPI_CATEGORIES.map((cat) => {
            const catStats = stats.byCategory[cat.id];
            const Icon = CATEGORY_ICONS[cat.id];
            const catMetrics = metrics.filter((m) => m.categoryId === cat.id);
            const avgGood = catStats.total ? Math.round((catStats.good / catStats.total) * 100) : 0;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className="text-left rounded-xl border border-stone-200 bg-stone-50/40 p-3 sm:p-4 hover:border-amber-300 hover:bg-amber-50/50 hover:shadow-sm transition-all min-w-0"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 mb-2 min-w-0">
                  <div
                    className={`p-2 rounded-lg bg-gradient-to-br shrink-0 ${CATEGORY_GRADIENTS[cat.id]}`}
                  >
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-stone-900 text-sm leading-snug line-clamp-2">
                      {cat.shortName}
                    </p>
                    <p className="text-xs text-stone-600 mt-0.5">{catMetrics.length} indicateurs</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-600">Conformité</span>
                  <span className="font-bold text-emerald-800">{avgGood}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-stone-200 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${avgGood}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
