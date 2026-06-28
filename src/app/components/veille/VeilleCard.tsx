import { Calendar, Eye, Link2, Pencil, User } from 'lucide-react';
import type { VeilleEntry } from '../../types/veille';
import { ActionButton } from '../shared';
import {
  decisionLabel,
  decisionTone,
  priorityLabel,
  priorityTone,
  statusLabel,
  statusTone,
  typeConfig,
  typeLabel,
} from './veillePresentation';

interface VeilleCardProps {
  entry: VeilleEntry;
  onView: () => void;
  onEdit: () => void;
}

export function VeilleCard({ entry, onView, onEdit }: VeilleCardProps) {
  const config = typeConfig(entry.type);
  const TypeIcon = config.icon;
  const linkCount =
    (entry.linkedRisks?.length ?? 0) + (entry.linkedTasks?.length ?? 0) + (entry.linkedDocs?.length ?? 0);

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-sm transition hover:shadow-md">
      <div className={`h-1 w-full ${entry.priority === 'critical' ? 'bg-gradient-to-r from-red-500 to-rose-600' : 'bg-gradient-to-r from-cyan-400 to-teal-500'}`} />

      <div className="p-5 sm:p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${config.iconWrapClass}`}>
              <TypeIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-stone-900 text-lg leading-snug line-clamp-2">{entry.subject}</h3>
              <p className="text-sm text-stone-500 mt-1">
                {typeLabel(entry.type)} · {entry.source}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${config.chipClass}`}>{typeLabel(entry.type)}</span>
          <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusTone(entry.status)}`}>
            {statusLabel(entry.status)}
          </span>
          <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${priorityTone(entry.priority)}`}>
            {priorityLabel(entry.priority)}
          </span>
          {entry.decision !== 'pending' ? (
            <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${decisionTone(entry.decision)}`}>
              {decisionLabel(entry.decision)}
            </span>
          ) : null}
        </div>

        <p className="text-sm text-stone-600 line-clamp-2">{entry.description}</p>

        {entry.impactAnalysis ? (
          <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 p-3">
            <p className="text-[11px] uppercase tracking-wide font-semibold text-amber-800 mb-1">Impact projet</p>
            <p className="text-sm text-amber-900 line-clamp-2">{entry.impactAnalysis}</p>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500">
          <span className="inline-flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            {entry.responsible}
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(entry.date).toLocaleDateString('fr-FR')}
          </span>
          {entry.nextReviewDate ? (
            <span className="inline-flex items-center gap-1 text-cyan-700">
              <Calendar className="w-3.5 h-3.5" />
              Revue {new Date(entry.nextReviewDate).toLocaleDateString('fr-FR')}
            </span>
          ) : null}
          {linkCount > 0 ? (
            <span className="inline-flex items-center gap-1">
              <Link2 className="w-3.5 h-3.5" />
              {linkCount} lien(s)
            </span>
          ) : null}
        </div>

        <div className="flex gap-2 pt-1 border-t border-stone-100">
          <ActionButton variant="secondary" icon={Eye} onClick={onView} className="flex-1 justify-center">
            Consulter
          </ActionButton>
          <ActionButton variant="secondary" icon={Pencil} onClick={onEdit} className="flex-1 justify-center">
            Modifier
          </ActionButton>
        </div>
      </div>
    </article>
  );
}
