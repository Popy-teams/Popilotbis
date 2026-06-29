import { Calendar, CheckCircle2, FileText, Users } from 'lucide-react';
import type { DashboardAction, DashboardMeeting } from '../../types/dashboard';
import { ViewEmptyState } from '../../components/shared';
import { DashboardCardShell, DashboardSection } from './DashboardCardShell';
import { formatShortDate } from './dashboardPresentation';

interface DashboardAgendaTabProps {
  meetings: DashboardMeeting[];
  actions: DashboardAction[];
  onMarkDone?: (id: number) => void;
}

export function DashboardAgendaTab({ meetings, actions, onMarkDone }: DashboardAgendaTabProps) {
  if (meetings.length === 0 && actions.length === 0) {
    return (
      <ViewEmptyState
        title="Agenda vide"
        description="Réunions et actions assignées apparaissent ici pour le projet actif."
      />
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 min-w-0">
      {meetings.length > 0 ? (
        <DashboardSection
          title="Prochaines réunions"
          icon={<Calendar className="w-5 h-5 text-sky-600" />}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {meetings.map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} />
            ))}
          </div>
        </DashboardSection>
      ) : null}

      {actions.length > 0 ? (
        <DashboardSection
          title="Actions assignées"
          icon={<FileText className="w-5 h-5 text-sky-600" />}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {actions.map((action) => (
              <ActionCard key={action.id} action={action} onMarkDone={onMarkDone} />
            ))}
          </div>
        </DashboardSection>
      ) : null}
    </div>
  );
}

function MeetingCard({ meeting }: { meeting: DashboardMeeting }) {
  const { day, month } = formatShortDate(meeting.date);

  return (
    <DashboardCardShell accent="from-sky-400 to-indigo-500">
      <div className="p-4 sm:p-5 flex items-center gap-4">
        <div className="shrink-0 w-16 rounded-2xl overflow-hidden border border-sky-100 shadow-sm text-center bg-gradient-to-b from-sky-50 to-white">
          <div className="bg-sky-600 text-white text-[10px] font-bold uppercase py-1">{month}</div>
          <div className="py-2">
            <div className="text-xl font-bold text-sky-900 leading-none">{day}</div>
            <div className="text-[10px] text-sky-700 mt-0.5 font-medium">{meeting.time}</div>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-900 text-sm sm:text-base leading-snug">
            {meeting.title}
          </h3>
          <p className="text-xs text-slate-500 mt-2 inline-flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            {meeting.participants} participant{meeting.participants > 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </DashboardCardShell>
  );
}

function ActionCard({
  action,
  onMarkDone,
}: {
  action: DashboardAction;
  onMarkDone?: (id: number) => void;
}) {
  const done = action.status === 'done';

  return (
    <DashboardCardShell accent={done ? 'from-emerald-400 to-teal-500' : 'from-violet-400 to-purple-600'}>
      <div className="p-4 sm:p-5">
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide bg-slate-100 text-slate-600 border border-slate-200">
          {action.from}
        </span>
        <h3 className="font-medium text-slate-900 text-sm sm:text-base mt-3 leading-snug">
          {action.description}
        </h3>
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Échéance {new Date(action.dueDate).toLocaleDateString('fr-FR')}
          </p>
          {!done && onMarkDone ? (
            <button
              type="button"
              onClick={() => onMarkDone(action.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Marquer fait
            </button>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Terminé
            </span>
          )}
        </div>
      </div>
    </DashboardCardShell>
  );
}
