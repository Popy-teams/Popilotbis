import { Calendar, Eye, Megaphone } from 'lucide-react';
import type { MarketingAction, RoadmapPhase } from '../../types/marketing';
import { ActionButton } from '../shared';
import { phaseLabel, statusLabel, statusTone } from './marketingPresentation';

interface MarketingActionCardProps {
  action: MarketingAction;
  phases: RoadmapPhase[];
  onView: () => void;
  onEdit: () => void;
}

export function MarketingActionCard({ action, phases, onView, onEdit }: MarketingActionCardProps) {
  const phase = phases.find((p) => p.id === action.phase);

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-sm transition hover:shadow-md">
      <div className="h-1 w-full bg-gradient-to-r from-violet-400 to-fuchsia-500" />

      <div className="p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4 min-w-0">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
            <Megaphone className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-stone-900 text-base sm:text-lg leading-snug break-words">{action.title}</h3>
            <p className="text-sm text-stone-500 mt-1">{action.channel}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${phase?.chipClass ?? 'bg-stone-50 text-stone-700 border-stone-200'}`}>
            {phaseLabel(action.phase, phases)}
          </span>
          <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusTone(action.status)}`}>
            {statusLabel(action.status)}
          </span>
        </div>

        <p className="text-sm text-stone-600 line-clamp-2">{action.description}</p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500">
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {phase?.label ?? action.phase}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-2 pt-1">
          <ActionButton
            variant="secondary"
            icon={Eye}
            onClick={onView}
            className="w-full sm:w-auto justify-center"
          >
            Consulter
          </ActionButton>
          <ActionButton
            variant="secondary"
            onClick={onEdit}
            className="w-full sm:w-auto justify-center !border-transparent !bg-transparent hover:!bg-stone-100"
          >
            Modifier
          </ActionButton>
        </div>
      </div>
    </article>
  );
}
