import { Calendar, Megaphone, Pencil, Trash2 } from 'lucide-react';
import { ViewShell, PageBackHeader, ActionButton } from '../shared';
import type { MarketingAction, RoadmapPhase } from '../../types/marketing';
import { phaseFullLabel, statusLabel, statusTone } from './marketingPresentation';

interface MarketingActionDetailPageProps {
  action: MarketingAction;
  phases: RoadmapPhase[];
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function MarketingActionDetailPage({ action, phases, onBack, onEdit, onDelete }: MarketingActionDetailPageProps) {
  const phase = phases.find((p) => p.id === action.phase);

  return (
    <ViewShell>
      <PageBackHeader title={action.title} subtitle={`${action.channel} · ${phaseFullLabel(action.phase, phases)}`} onBack={onBack} />

      <div className="space-y-5">
        <section className="rounded-2xl border border-stone-200/90 bg-white p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                <Megaphone className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${phase?.chipClass ?? ''}`}>
                    {phase?.year}
                  </span>
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusTone(action.status)}`}>
                    {statusLabel(action.status)}
                  </span>
                </div>
                <p className="text-sm text-stone-500">{action.channel}</p>
              </div>
            </div>
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 w-full sm:w-auto">
            <ActionButton
              variant="secondary"
              icon={Pencil}
              onClick={onEdit}
              className="w-full sm:w-auto justify-center"
            >
              Modifier
            </ActionButton>
            <ActionButton
              variant="danger"
              icon={Trash2}
              onClick={onDelete}
              className="w-full sm:w-auto justify-center"
            >
              Supprimer
            </ActionButton>
          </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-stone-700 mb-1">Description</h3>
            <p className="text-sm text-stone-600 leading-relaxed">{action.description}</p>
          </div>

          {phase ? (
            <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-4 space-y-3">
              <p className="text-[11px] uppercase tracking-wide font-semibold text-stone-500">Phase roadmap</p>
              <p className="font-medium text-stone-900">{phase.label}</p>
              <div className="flex flex-wrap gap-4 text-sm text-stone-600">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-stone-400" />
                  Volume : {phase.volume}
                </span>
                <span>Coût unitaire : {phase.unitCost}</span>
              </div>
              {phase.marketing.length > 0 ? (
                <div>
                  <p className="text-xs font-medium text-stone-500 mb-1">Actions marketing de la phase</p>
                  <ul className="text-sm text-stone-600 space-y-1">
                    {phase.marketing.map((m) => (
                      <li key={m} className="flex items-start gap-2">
                        <span className="text-violet-500 mt-0.5">•</span>
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
        </section>
      </div>
    </ViewShell>
  );
}
