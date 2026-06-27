import { AlertTriangle, ListChecks } from 'lucide-react';
import type { MeetingActionItem } from '../../types/scrumMeetings';
import { isActionLate } from '../../utils/meetingFollowUp';

const STATUS_UI: Record<string, { label: string; className: string }> = {
  pending: { label: 'À faire', className: 'bg-slate-100 text-slate-700' },
  'in-progress': { label: 'En cours', className: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Terminé', className: 'bg-emerald-100 text-emerald-700' },
};

interface PendingTasksPreviewProps {
  tasks: MeetingActionItem[];
  referenceDate: string;
  previousSprint?: number;
  compact?: boolean;
}

export function PendingTasksPreview({
  tasks,
  referenceDate,
  previousSprint,
  compact = false,
}: PendingTasksPreviewProps) {
  const lateCount = tasks.filter((a) => isActionLate(a, referenceDate)).length;

  if (tasks.length === 0) {
    return (
      <div className={`rounded-xl border border-dashed border-amber-200 bg-amber-50/40 ${compact ? 'p-3' : 'p-4'}`}>
        <p className="text-sm text-slate-600">
          Aucune tâche ouverte à reprendre
          {previousSprint != null ? ` du sprint ${previousSprint}` : ''}.
          {' '}Les tâches apparaissent ici une fois le CR d&apos;une cérémonie précédente{' '}
          <strong>publié</strong> avec des actions assignées.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-slate-700">
          {tasks.length} tâche{tasks.length > 1 ? 's' : ''} ouverte{tasks.length > 1 ? 's' : ''}
          {previousSprint != null ? ` (sprint ${previousSprint} et/ou cérémonies antérieures)` : ''}
        </span>
        {lateCount > 0 && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
            <AlertTriangle className="w-3 h-3" />
            {lateCount} en retard
          </span>
        )}
      </div>
      <ul className={`space-y-2 ${compact ? 'max-h-48 overflow-y-auto' : ''}`}>
        {tasks.map((a) => {
          const late = isActionLate(a, referenceDate);
          const st = STATUS_UI[a.status] ?? STATUS_UI.pending;
          return (
            <li
              key={a.id}
              className={`text-sm p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                late ? 'bg-red-50 border-red-200' : 'bg-white border-amber-100'
              }`}
            >
              <div className="min-w-0">
                <p className="font-medium text-slate-800">{a.description}</p>
                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  {a.source}
                  {' · '}
                  {a.assignedToName} · échéance {a.dueDate}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {late && (
                  <span className="text-xs font-semibold text-red-700 px-2 py-0.5 rounded-full bg-red-100">
                    En retard
                  </span>
                )}
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${st.className}`}>
                  {st.label}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
      {!compact && (
        <p className="text-xs text-slate-500 flex items-start gap-1.5">
          <ListChecks className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          Mettez à jour le statut de chaque tâche lors de la rédaction du compte rendu, puis publiez pour
          synchroniser l&apos;onglet Tâches et le Gantt.
        </p>
      )}
    </div>
  );
}
