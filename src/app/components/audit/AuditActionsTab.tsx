import { ArrowRight, ClipboardList } from 'lucide-react';
import type { AuditBlockData } from '../../data/auditHelpers';
import { ViewEmptyState } from '../shared';
import { statusLabel, statusTone } from './auditPresentation';

interface AuditActionsTabProps {
  blocks: AuditBlockData[];
}

export function AuditActionsTab({ blocks }: AuditActionsTabProps) {
  const items = blocks.flatMap((block) =>
    block.criteria
      .filter((c) => c.actions.length > 0)
      .map((criterion) => ({ block, criterion }))
  );

  if (items.length === 0) {
    return (
      <ViewEmptyState
        icon={ClipboardList}
        title="Aucune action planifiée"
        description="Les actions issues des écarts d'audit apparaîtront ici lorsque vous les renseignez sur les critères."
      />
    );
  }

  return (
    <div className="space-y-4 min-w-0">
      <p className="text-sm text-stone-600">
        Plan d&apos;actions consolidé issu des écarts et non-conformités identifiés dans l&apos;audit.
      </p>
      <div className="space-y-3">
        {items.map(({ block, criterion }) => (
          <article
            key={`${block.id}-${criterion.id}`}
            className="rounded-xl border border-stone-200/90 bg-white p-4 sm:p-5 hover:shadow-sm transition-shadow"
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-semibold text-stone-900">{criterion.title}</h3>
                  <span className={`text-[10px] font-semibold rounded-full border px-2 py-0.5 ${statusTone(criterion.status)}`}>
                    {statusLabel(criterion.status)}
                  </span>
                </div>
                <p className="text-sm text-stone-500">
                  {block.title} · {criterion.isoRef}
                </p>
                {criterion.gaps.length > 0 ? (
                  <p className="text-xs text-amber-700 mt-2 line-clamp-2">Écart : {criterion.gaps[0]}</p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                {criterion.actions.map((action) => (
                  <span
                    key={action}
                    className="inline-flex items-center gap-1 text-xs font-medium bg-indigo-50 text-indigo-800 border border-indigo-100 px-2.5 py-1 rounded-lg"
                  >
                    <ArrowRight className="w-3 h-3" />
                    {action}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
