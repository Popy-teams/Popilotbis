import { Eye } from 'lucide-react';
import { STRATEGY_PILLARS } from '../../data/marketingDemoData';
import type { StrategyPillar } from '../../types/marketing';
import { ActionButton } from '../shared';

interface MarketingStrategiesTabProps {
  onViewStrategy: (pillar: StrategyPillar) => void;
}

export function MarketingStrategiesTab({ onViewStrategy }: MarketingStrategiesTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {STRATEGY_PILLARS.map((pillar) => {
        const Icon = pillar.icon;
        return (
          <article
            key={pillar.id}
            className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${pillar.iconWrapClass}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ${pillar.chipClass}`}>
                  {pillar.subtitle}
                </span>
                <h3 className="font-semibold text-stone-900 mt-1 break-words">{pillar.title}</h3>
              </div>
            </div>

            <p className="text-sm font-medium text-violet-800 mb-2">{pillar.principle}</p>
            <p className="text-sm text-stone-600 line-clamp-3 flex-1">{pillar.description}</p>

            <div className="mt-4 pt-4 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <span className="text-xs text-stone-500 break-words">{pillar.isoLink}</span>
              <ActionButton
                variant="secondary"
                icon={Eye}
                onClick={() => onViewStrategy(pillar)}
                className="w-full sm:w-auto justify-center shrink-0"
              >
                Consulter
              </ActionButton>
            </div>
          </article>
        );
      })}
    </div>
  );
}
