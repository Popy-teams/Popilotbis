import { CheckCircle } from 'lucide-react';
import { ViewShell, PageBackHeader } from '../shared';
import type { StrategyPillar } from '../../types/marketing';

interface MarketingStrategyDetailPageProps {
  pillar: StrategyPillar;
  onBack: () => void;
}

export function MarketingStrategyDetailPage({ pillar, onBack }: MarketingStrategyDetailPageProps) {
  const Icon = pillar.icon;

  return (
    <ViewShell>
      <PageBackHeader title={pillar.title} subtitle={pillar.subtitle} onBack={onBack} />

      <section className="rounded-2xl border border-stone-200/90 bg-white p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className={`flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl ${pillar.iconWrapClass}`}>
            <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div className="min-w-0">
            <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${pillar.chipClass}`}>
              {pillar.isoLink}
            </span>
            <p className="text-lg font-semibold text-violet-800 mt-3">{pillar.principle}</p>
            <p className="text-sm text-stone-600 mt-2 leading-relaxed">{pillar.description}</p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-stone-900 mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            Avantages clés
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {pillar.advantages.map((adv) => (
              <li key={adv} className="flex items-start gap-2 text-sm text-stone-600 rounded-xl border border-stone-100 bg-stone-50/50 p-3">
                <span className="text-emerald-500 mt-0.5">✓</span>
                {adv}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </ViewShell>
  );
}
