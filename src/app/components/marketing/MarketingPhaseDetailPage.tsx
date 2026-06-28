import { AlertTriangle, CheckCircle, Link2, Pencil, Target } from 'lucide-react';
import { ViewShell, PageBackHeader, ActionButton } from '../shared';
import type { RoadmapPhase } from '../../types/marketing';

interface MarketingPhaseDetailPageProps {
  phase: RoadmapPhase;
  onBack: () => void;
  onEdit: () => void;
}

export function MarketingPhaseDetailPage({ phase, onBack, onEdit }: MarketingPhaseDetailPageProps) {
  return (
    <ViewShell>
      <PageBackHeader
        title={`${phase.year} — ${phase.label}`}
        subtitle={`Volume ${phase.volume} · Coût ${phase.unitCost}`}
        onBack={onBack}
        actions={
          <ActionButton variant="secondary" icon={Pencil} onClick={onEdit} className="justify-center">
            Modifier
          </ActionButton>
        }
      />

      <div className="space-y-5">
        <section className="rounded-2xl border border-stone-200/90 bg-white p-5 sm:p-6 shadow-sm">
          <div className="flex flex-wrap gap-3 mb-4">
            <span className={`rounded-full border px-3 py-1 text-sm font-medium ${phase.chipClass}`}>{phase.year}</span>
            {phase.sellingPrice ? (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800">
                Prix : {phase.sellingPrice}
              </span>
            ) : null}
            {phase.margin ? (
              <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-sm font-medium text-violet-800">
                Marge : {phase.margin}
              </span>
            ) : null}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <DetailBlock icon={Target} title="Objectifs stratégiques" items={phase.objectives} />
            <DetailBlock icon={CheckCircle} title="Actions marketing" items={phase.marketing} />
            <DetailBlock icon={AlertTriangle} title="Risques identifiés" items={phase.risks} />
          </div>

          {phase.linkedTasks?.length ? (
            <div className="mt-5 pt-5 border-t border-stone-100">
              <p className="text-sm font-semibold text-stone-700 flex items-center gap-2 mb-2">
                <Link2 className="w-4 h-4" />
                Tâches liées
              </p>
              <div className="flex flex-wrap gap-2">
                {phase.linkedTasks.map((task) => (
                  <span key={task} className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-mono text-stone-600">
                    {task}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </ViewShell>
  );
}

function DetailBlock({
  icon: Icon,
  title,
  items,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-xl border border-stone-200 bg-stone-50/40 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-stone-500" />
        <h3 className="font-semibold text-stone-900 text-sm">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="text-sm text-stone-600 flex items-start gap-2">
            <span className="text-violet-500 mt-1">•</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
