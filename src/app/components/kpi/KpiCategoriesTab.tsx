import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import type { KpiCategoryId, KpiMetric } from '../../types/kpi';
import { KPI_CATEGORIES } from '../../data/kpiReferential';
import { progressPercent } from '../../data/kpiHelpers';
import { Progress } from '../ui/progress';
import {
  CATEGORY_GRADIENTS,
  CATEGORY_ICONS,
  formatKpiValue,
  statusBadgeClass,
  statusLabel,
  trendChangePercent,
} from './kpiPresentation';

interface KpiCategoriesTabProps {
  metrics: KpiMetric[];
  activeCategoryId: KpiCategoryId | null;
  onSelectCategory: (id: KpiCategoryId | null) => void;
  onViewKpi: (kpi: KpiMetric) => void;
}

export function KpiCategoriesTab({
  metrics,
  activeCategoryId,
  onSelectCategory,
  onViewKpi,
}: KpiCategoriesTabProps) {
  const categories = activeCategoryId
    ? KPI_CATEGORIES.filter((c) => c.id === activeCategoryId)
    : KPI_CATEGORIES;

  return (
    <div className="space-y-5 sm:space-y-6 min-w-0">
      <div className="min-w-0 -mx-0.5">
        <p className="text-xs font-medium text-stone-600 mb-2 px-0.5">Filtrer par famille</p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin snap-x snap-mandatory">
          <FilterPill
            active={activeCategoryId === null}
            onClick={() => onSelectCategory(null)}
            label="Toutes"
          />
          {KPI_CATEGORIES.map((cat) => (
            <FilterPill
              key={cat.id}
              active={activeCategoryId === cat.id}
              onClick={() => onSelectCategory(cat.id)}
              label={cat.shortName}
            />
          ))}
        </div>
      </div>

      {categories.map((category) => {
        const categoryKpis = metrics.filter((m) => m.categoryId === category.id);
        const Icon = CATEGORY_ICONS[category.id];

        return (
          <section key={category.id} className="space-y-3 sm:space-y-4 min-w-0">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div
                  className={`p-2.5 rounded-xl bg-gradient-to-br shrink-0 ${CATEGORY_GRADIENTS[category.id]}`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-bold text-stone-900 leading-snug">
                    {category.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
                    {category.description}
                  </p>
                </div>
              </div>
              <span className="self-start shrink-0 inline-flex items-center rounded-full border border-stone-200 bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-800">
                {categoryKpis.length} indicateur{categoryKpis.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {categoryKpis.map((kpi) => (
                <button
                  key={kpi.id}
                  type="button"
                  onClick={() => onViewKpi(kpi)}
                  className={`text-left rounded-xl border bg-white p-3 sm:p-4 shadow-sm hover:shadow-md transition-all min-w-0 ${statusBadgeClass(kpi.status).border}`}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-stone-900 leading-snug line-clamp-2">
                      {kpi.name}
                    </h3>
                    <span
                      className={`self-start shrink-0 inline-flex px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-semibold ${statusBadgeClass(kpi.status).badge}`}
                    >
                      {statusLabel(kpi.status)}
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 line-clamp-2 mb-3">{kpi.objective}</p>

                  <div className="flex items-end justify-between gap-2 mb-3">
                    <div className="min-w-0">
                      <p className="text-xl sm:text-2xl font-bold text-stone-900 truncate">
                        {formatKpiValue(kpi.currentValue, kpi.unit)}
                      </p>
                      <p className="text-[11px] sm:text-xs text-stone-600 mt-0.5 line-clamp-2">
                        Cible : {kpi.targetThreshold}
                      </p>
                    </div>
                    <TrendBadge trend={kpi.trend} current={kpi.currentValue} previous={kpi.previousValue} />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] sm:text-xs text-stone-700">
                      <span>Progression</span>
                      <span className="font-semibold text-stone-900">{progressPercent(kpi)}%</span>
                    </div>
                    <Progress value={progressPercent(kpi)} className="h-2 bg-stone-200" />
                  </div>

                  <div className="pt-3 mt-3 border-t border-stone-100 flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between text-[11px] sm:text-xs">
                    <span className="text-stone-500 shrink-0">Responsable</span>
                    <span className="font-medium text-stone-800 sm:text-right line-clamp-2">
                      {kpi.responsible}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`snap-start shrink-0 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border transition-colors whitespace-nowrap ${
        active
          ? 'bg-amber-700 text-white border-amber-700 shadow-sm'
          : 'bg-white text-stone-800 border-stone-300 hover:border-amber-400 hover:bg-amber-50'
      }`}
    >
      {label}
    </button>
  );
}

function TrendBadge({
  trend,
  current,
  previous,
}: {
  trend: KpiMetric['trend'];
  current: number;
  previous: number;
}) {
  const pct = trendChangePercent(current, previous);
  if (trend === 'up') {
    return (
      <div className="flex items-center gap-0.5 text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-md text-xs font-semibold shrink-0">
        <ArrowUpRight className="w-3.5 h-3.5" />
        <span>+{pct}%</span>
      </div>
    );
  }
  if (trend === 'down') {
    return (
      <div className="flex items-center gap-0.5 text-red-800 bg-red-100 px-1.5 py-0.5 rounded-md text-xs font-semibold shrink-0">
        <ArrowDownRight className="w-3.5 h-3.5" />
        <span>-{pct}%</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-0.5 text-stone-700 bg-stone-100 px-1.5 py-0.5 rounded-md text-xs shrink-0">
      <Minus className="w-3.5 h-3.5" />
      <span>0%</span>
    </div>
  );
}
