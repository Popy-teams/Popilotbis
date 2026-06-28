import { AlertTriangle, ArrowRight, CheckCircle, Eye, Pencil, Target } from 'lucide-react';
import type { MarketingAction, MarketingPhase, RoadmapPhase } from '../../types/marketing';
import { ActionButton } from '../shared';
import { MarketingTimeline } from './MarketingTimeline';
import { MarketingRoadmapFiveYearOverview } from './MarketingRoadmapFiveYearOverview';

interface MarketingRoadmapTabProps {
  phases: RoadmapPhase[];
  actions: MarketingAction[];
  activePhase: MarketingPhase;
  onPhaseChange: (phase: MarketingPhase) => void;
  onViewPhase: (phase: MarketingPhase) => void;
  onEditPhase: (phase: MarketingPhase) => void;
}

export function MarketingRoadmapTab({
  phases,
  actions,
  activePhase,
  onPhaseChange,
  onViewPhase,
  onEditPhase,
}: MarketingRoadmapTabProps) {
  const current = phases.find((p) => p.id === activePhase)!;

  const actionCountByPhase = phases.reduce(
    (acc, phase) => {
      acc[phase.id] = actions.filter((a) => a.phase === phase.id).length;
      return acc;
    },
    {} as Record<MarketingPhase, number>
  );

  return (
    <div className="space-y-5 min-w-0">
      <MarketingRoadmapFiveYearOverview
        phases={phases}
        activePhase={activePhase}
        actionCountByPhase={actionCountByPhase}
        onSelectPhase={onPhaseChange}
        onViewPhase={onViewPhase}
        onEditPhase={onEditPhase}
      />

      <div>
        <h3 className="text-sm font-semibold text-stone-700 mb-2">Navigation rapide</h3>
        <MarketingTimeline
          phases={phases}
          activePhase={activePhase}
          onPhaseChange={onPhaseChange}
          compact
        />
      </div>

      <section className="rounded-2xl border border-stone-200/90 bg-white p-4 sm:p-6 shadow-sm space-y-5 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="min-w-0">
            <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${current.chipClass}`}>
              {current.year}
            </span>
            <h3 className="text-lg sm:text-xl font-semibold text-stone-900 mt-2 break-words">{current.label}</h3>
            <p className="text-sm text-stone-500 mt-1 break-words">
              Volume : {current.volume} · Coût unitaire : {current.unitCost}
            </p>
            {current.sellingPrice ? (
              <p className="text-sm text-emerald-700 mt-1 break-words">
                Prix vente : {current.sellingPrice} · Marge : {current.margin}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0">
            <ActionButton
              variant="secondary"
              icon={Pencil}
              onClick={() => onEditPhase(current.id)}
              className="w-full sm:w-auto justify-center"
            >
              Modifier
            </ActionButton>
            <ActionButton
              variant="secondary"
              icon={Eye}
              onClick={() => onViewPhase(current.id)}
              className="w-full sm:w-auto justify-center"
            >
              Fiche complète
            </ActionButton>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Panel icon={Target} title="Objectifs" items={current.objectives} tone="violet" />
          <Panel icon={CheckCircle} title="Marketing" items={current.marketing} tone="emerald" />
          <Panel icon={AlertTriangle} title="Risques" items={current.risks} tone="amber" />
        </div>

        <div className="flex flex-wrap items-start gap-2 text-sm text-stone-500 pt-2">
          <ArrowRight className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Roadmap alignée sur la stratégie High-End Entry → Economies of Scale</span>
        </div>
      </section>
    </div>
  );
}

function Panel({
  icon: Icon,
  title,
  items,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: string[];
  tone: 'violet' | 'emerald' | 'amber';
}) {
  const tones = {
    violet: 'border-violet-200/80 bg-violet-50/40',
    emerald: 'border-emerald-200/80 bg-emerald-50/40',
    amber: 'border-amber-200/80 bg-amber-50/40',
  };
  const iconTones = {
    violet: 'text-violet-600',
    emerald: 'text-emerald-600',
    amber: 'text-amber-600',
  };

  return (
    <div className={`rounded-xl border p-4 ${tones[tone]}`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-4 h-4 ${iconTones[tone]}`} />
        <h4 className="font-semibold text-stone-900 text-sm">{title}</h4>
      </div>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="text-sm text-stone-600 flex items-start gap-2">
            <span
              className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${
                tone === 'amber' ? 'bg-amber-500' : tone === 'emerald' ? 'bg-emerald-500' : 'bg-violet-500'
              }`}
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
