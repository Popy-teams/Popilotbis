import { Eye, Pencil, TrendingDown } from 'lucide-react';
import type { MarketingPhase, RoadmapPhase } from '../../types/marketing';
import { ActionButton } from '../shared';

interface MarketingRoadmapFiveYearOverviewProps {
  phases: RoadmapPhase[];
  activePhase: MarketingPhase;
  actionCountByPhase: Record<MarketingPhase, number>;
  onSelectPhase: (phase: MarketingPhase) => void;
  onViewPhase: (phase: MarketingPhase) => void;
  onEditPhase: (phase: MarketingPhase) => void;
}

const ROWS: { key: string; label: string; get: (p: RoadmapPhase) => string }[] = [
  { key: 'label', label: 'Étape', get: (p) => p.label },
  { key: 'volume', label: 'Volume', get: (p) => p.volume },
  { key: 'unitCost', label: 'Coût unitaire', get: (p) => p.unitCost },
  { key: 'sellingPrice', label: 'Prix de vente', get: (p) => p.sellingPrice ?? '—' },
  { key: 'margin', label: 'Marge brute', get: (p) => p.margin ?? '—' },
];

export function MarketingRoadmapFiveYearOverview({
  phases,
  activePhase,
  actionCountByPhase,
  onSelectPhase,
  onViewPhase,
  onEditPhase,
}: MarketingRoadmapFiveYearOverviewProps) {
  const maxCost = Math.max(
    ...phases.map((p) => parseCostMid(p.unitCost))
  );

  return (
    <section className="rounded-xl sm:rounded-2xl border border-violet-200/80 bg-gradient-to-br from-violet-50/60 via-white to-fuchsia-50/30 p-4 sm:p-5 space-y-4 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-violet-600 shrink-0" />
            Vue d&apos;ensemble · Roadmap 5 ans
          </h2>
          <p className="text-sm text-stone-600 mt-1">
            Comparaison des 4 phases — coûts, volumes et marges cibles
          </p>
        </div>
      </div>

      {/* Barre de coût comparative */}
      <div className="rounded-xl border border-stone-200/80 bg-white p-3 sm:p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-500 mb-3">
          Réduction du coût unitaire
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {phases.map((phase) => {
            const cost = parseCostMid(phase.unitCost);
            const pct = maxCost > 0 ? Math.round((cost / maxCost) * 100) : 0;
            const isActive = phase.id === activePhase;
            return (
              <button
                key={phase.id}
                type="button"
                onClick={() => onSelectPhase(phase.id)}
                className={`text-left rounded-lg p-2 transition ${isActive ? 'ring-2 ring-violet-400 bg-violet-50/50' : 'hover:bg-stone-50'}`}
              >
                <p className="text-[10px] font-bold uppercase text-stone-500">{phase.year}</p>
                <div className="mt-1.5 h-2 rounded-full bg-stone-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-orange-400 to-violet-500 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs font-semibold text-stone-800 mt-1">{phase.unitCost}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tableau desktop */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <table className="w-full text-sm border-collapse min-w-[640px]">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50/80">
              <th className="text-left p-3 font-semibold text-stone-600 w-36">Indicateur</th>
              {phases.map((phase) => (
                <th
                  key={phase.id}
                  className={`p-3 text-left font-semibold min-w-[9rem] ${
                    phase.id === activePhase ? 'bg-violet-50 text-violet-900' : 'text-stone-800'
                  }`}
                >
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold mb-1 ${phase.chipClass}`}>
                    {phase.year}
                  </span>
                  <span className="block text-xs font-medium text-stone-500 truncate">{phase.label}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.key} className="border-b border-stone-100 last:border-0">
                <td className="p-3 font-medium text-stone-600 bg-stone-50/50">{row.label}</td>
                {phases.map((phase) => (
                  <td
                    key={phase.id}
                    className={`p-3 text-stone-800 ${phase.id === activePhase ? 'bg-violet-50/30' : ''}`}
                  >
                    {row.get(phase)}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-t border-stone-200 bg-stone-50/40">
              <td className="p-3 font-medium text-stone-600">Actions liées</td>
              {phases.map((phase) => (
                <td key={phase.id} className="p-3">
                  <span className="font-semibold text-violet-700">{actionCountByPhase[phase.id] ?? 0}</span>
                  <span className="text-stone-500 text-xs ml-1">plan</span>
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-3" />
              {phases.map((phase) => (
                <td key={phase.id} className="p-3">
                  <div className="flex flex-wrap gap-1.5">
                    <ActionButton
                      variant="secondary"
                      icon={Eye}
                      onClick={() => onViewPhase(phase.id)}
                      className="!px-2.5 !py-1.5 !text-xs"
                    >
                      Voir
                    </ActionButton>
                    <ActionButton
                      variant="secondary"
                      icon={Pencil}
                      onClick={() => onEditPhase(phase.id)}
                      className="!px-2.5 !py-1.5 !text-xs !border-transparent !bg-stone-100 hover:!bg-stone-200"
                    >
                      Modifier
                    </ActionButton>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Cartes mobile — les 4 phases visibles */}
      <div className="md:hidden grid grid-cols-1 gap-3">
        {phases.map((phase) => {
          const isActive = phase.id === activePhase;
          return (
            <article
              key={phase.id}
              className={`rounded-xl border p-4 transition ${
                isActive ? `${phase.activeBorder} ring-1 ring-violet-300` : 'border-stone-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${phase.chipClass}`}>
                    {phase.year}
                  </span>
                  <h3 className="font-semibold text-stone-900 mt-1">{phase.label}</h3>
                </div>
                <span className="text-xs font-semibold text-violet-700 shrink-0">
                  {actionCountByPhase[phase.id] ?? 0} actions
                </span>
              </div>
              <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm mb-3">
                <div>
                  <dt className="text-stone-500 text-xs">Volume</dt>
                  <dd className="font-medium text-stone-900">{phase.volume}</dd>
                </div>
                <div>
                  <dt className="text-stone-500 text-xs">Coût unit.</dt>
                  <dd className="font-medium text-orange-700">{phase.unitCost}</dd>
                </div>
                <div>
                  <dt className="text-stone-500 text-xs">Prix vente</dt>
                  <dd className="font-medium text-stone-900">{phase.sellingPrice ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-stone-500 text-xs">Marge</dt>
                  <dd className="font-medium text-emerald-700">{phase.margin ?? '—'}</dd>
                </div>
              </dl>
              <div className="flex gap-2">
                <ActionButton
                  variant="secondary"
                  icon={Eye}
                  onClick={() => onViewPhase(phase.id)}
                  className="flex-1 justify-center"
                >
                  Consulter
                </ActionButton>
                <ActionButton
                  variant="secondary"
                  icon={Pencil}
                  onClick={() => onEditPhase(phase.id)}
                  className="flex-1 justify-center"
                >
                  Modifier
                </ActionButton>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function parseCostMid(cost: string): number {
  const nums = cost.match(/[\d.]+/g)?.map(Number) ?? [0];
  if (nums.length === 0) return 0;
  if (nums.length === 1) return nums[0];
  return (nums[0] + nums[1]) / 2;
}
