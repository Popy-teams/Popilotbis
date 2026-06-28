import { AlertTriangle, Calendar, Eye, Pencil } from 'lucide-react';
import type { VeilleEntry } from '../../types/veille';
import { ActionButton, ViewSectionTitle } from '../shared';
import { priorityTone, priorityLabel, statusLabel, statusTone, typeLabel } from './veillePresentation';

interface VeilleReviewsTabProps {
  entries: VeilleEntry[];
  onView: (entry: VeilleEntry) => void;
  onEdit: (entry: VeilleEntry) => void;
}

export function VeilleReviewsTab({ entries, onView, onEdit }: VeilleReviewsTabProps) {
  const today = new Date().toISOString().split('T')[0];
  const withReview = entries
    .filter((e) => e.nextReviewDate)
    .sort((a, b) => (a.nextReviewDate! > b.nextReviewDate! ? 1 : -1));

  const overdue = withReview.filter((e) => e.nextReviewDate! < today);
  const upcoming = withReview.filter((e) => e.nextReviewDate! >= today);

  return (
    <div className="space-y-5">
      <ViewSectionTitle icon={Calendar} title="Calendrier de revues" count={withReview.length} />

      {overdue.length > 0 ? (
        <section className="rounded-2xl border border-red-200/80 bg-red-50/40 p-4 sm:p-5">
          <h3 className="font-semibold text-red-900 flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4" />
            Revues en retard ({overdue.length})
          </h3>
          <ReviewList items={overdue} onView={onView} onEdit={onEdit} overdue />
        </section>
      ) : null}

      <section className="rounded-2xl border border-stone-200/90 bg-white p-4 sm:p-5 shadow-sm">
        <h3 className="font-semibold text-stone-900 mb-3">Prochaines revues ({upcoming.length})</h3>
        {upcoming.length === 0 ? (
          <p className="text-sm text-stone-500">Aucune revue planifiée. Ajoutez une date lors de la création ou modification d&apos;une veille.</p>
        ) : (
          <ReviewList items={upcoming} onView={onView} onEdit={onEdit} />
        )}
      </section>
    </div>
  );
}

function ReviewList({
  items,
  onView,
  onEdit,
  overdue,
}: {
  items: VeilleEntry[];
  onView: (e: VeilleEntry) => void;
  onEdit: (e: VeilleEntry) => void;
  overdue?: boolean;
}) {
  return (
    <ul className="divide-y divide-stone-100">
      {items.map((entry) => (
        <li key={entry.id} className="flex flex-col sm:flex-row sm:items-center gap-3 py-3 first:pt-0 last:pb-0">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-stone-900 truncate">{entry.subject}</p>
            <p className="text-xs text-stone-500 mt-0.5">
              {typeLabel(entry.type)} · {entry.responsible}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusTone(entry.status)}`}>
                {statusLabel(entry.status)}
              </span>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${priorityTone(entry.priority)}`}>
                {priorityLabel(entry.priority)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className={`text-right ${overdue ? 'text-red-700' : 'text-cyan-700'}`}>
              <p className="text-xs uppercase tracking-wide font-medium">Revue</p>
              <p className="text-sm font-bold">{new Date(entry.nextReviewDate!).toLocaleDateString('fr-FR')}</p>
            </div>
            <ActionButton variant="secondary" icon={Eye} onClick={() => onView(entry)}>
              Consulter
            </ActionButton>
            <ActionButton variant="secondary" icon={Pencil} onClick={() => onEdit(entry)}>
              Modifier
            </ActionButton>
          </div>
        </li>
      ))}
    </ul>
  );
}
