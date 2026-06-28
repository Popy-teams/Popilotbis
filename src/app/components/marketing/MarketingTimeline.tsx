import { CheckCircle2, ChevronRight, Circle } from 'lucide-react';
import type { MarketingPhase, RoadmapPhase } from '../../types/marketing';

interface MarketingTimelineProps {
  phases: RoadmapPhase[];
  activePhase: MarketingPhase;
  onPhaseChange: (phase: MarketingPhase) => void;
  onViewPhase?: (phase: MarketingPhase) => void;
  compact?: boolean;
}

export function MarketingTimeline({
  phases,
  activePhase,
  onPhaseChange,
  onViewPhase,
  compact = false,
}: MarketingTimelineProps) {
  const activeIndex = phases.findIndex((p) => p.id === activePhase);

  const handleSelect = (phaseId: MarketingPhase) => {
    onPhaseChange(phaseId);
    onViewPhase?.(phaseId);
  };

  return (
    <>
      <div className="lg:hidden space-y-2 min-w-0">
        {phases.map((phase, index) => {
          const isActive = phase.id === activePhase;
          const isPast = index < activeIndex;
          const isLast = index === phases.length - 1;

          return (
            <div key={phase.id} className="flex gap-3 min-w-0">
              <div className="flex flex-col items-center shrink-0 pt-1">
                {isPast ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Circle className={`w-5 h-5 ${isActive ? 'text-violet-600 fill-violet-100' : 'text-stone-300'}`} />
                )}
                {!isLast ? (
                  <div className={`w-0.5 flex-1 min-h-[1rem] mt-1 ${isPast ? 'bg-emerald-300' : 'bg-stone-200'}`} />
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => handleSelect(phase.id)}
                className={`flex-1 min-w-0 text-left rounded-xl border p-3 transition ${
                  isActive ? `${phase.activeBorder} shadow-sm ring-1 ring-violet-200` : 'border-stone-200 bg-white'
                }`}
              >
                <p className="text-[10px] font-bold uppercase text-stone-500">{phase.year}</p>
                <p className="font-semibold text-stone-900 text-sm mt-0.5 break-words">{phase.label}</p>
                {!compact ? (
                  <p className="text-xs text-stone-500 mt-1">{phase.volume} · {phase.unitCost}</p>
                ) : null}
              </button>
            </div>
          );
        })}
      </div>

      <div className="hidden lg:grid lg:grid-cols-4 gap-3 min-w-0">
        {phases.map((phase, index) => {
          const isActive = phase.id === activePhase;
          const isPast = index < activeIndex;

          return (
            <button
              key={phase.id}
              type="button"
              onClick={() => handleSelect(phase.id)}
              className={`text-left rounded-2xl border p-4 transition min-w-0 h-full ${
                isActive
                  ? `${phase.activeBorder} shadow-md ring-2 ring-violet-200/80`
                  : isPast
                  ? 'border-emerald-200 bg-emerald-50/40'
                  : 'border-stone-200 bg-white hover:border-stone-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {isPast ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Circle className={`w-4 h-4 shrink-0 ${isActive ? 'text-violet-600 fill-violet-100' : 'text-stone-300'}`} />
                )}
                <span className="text-xs font-bold uppercase tracking-wide text-stone-500">{phase.year}</span>
              </div>
              <p className="font-semibold text-stone-900 text-sm leading-snug break-words">{phase.label}</p>
              {!compact ? (
                <>
                  <p className="text-xs text-stone-500 mt-1.5">{phase.volume}</p>
                  <p className="text-xs font-medium text-orange-700 mt-0.5">{phase.unitCost}</p>
                </>
              ) : null}
            </button>
          );
        })}
      </div>
    </>
  );
}
