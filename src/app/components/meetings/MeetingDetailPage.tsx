import { useMemo } from 'react';
import {
  Calendar,
  Clock,
  Users,
  FileText,
  Pencil,
  Trash2,
  Edit,
  Link2,
  CheckSquare,
  BookOpen,
  ListChecks,
  ArrowRight,
} from 'lucide-react';
import type { ScrumMeetingRecord } from '../../types/scrumMeetings';
import { loadAllTasks } from '../../utils/pipelineSync';
import { getPendingActionsForMeeting } from '../../utils/meetingFollowUp';
import { PendingTasksPreview } from './PendingTasksPreview';
import { ExportMeetingReportPdfButton } from './ExportMeetingReportPdfButton';
import { PageBackHeader } from '../shared/PageBackHeader';
import { ViewShell } from '../shared';
import {
  formatMeetingDate,
  formatMeetingNumber,
  getMeetingStatusBadge,
  getMeetingStatusLabel,
  getMeetingTypeBadge,
  getMeetingTypeLabel,
} from './scrumPresentation';

interface MeetingDetailPageProps {
  meeting: ScrumMeetingRecord;
  allMeetings: ScrumMeetingRecord[];
  onBack: () => void;
  onEdit: () => void;
  onReport: () => void;
  onDelete: () => void;
}

export function MeetingDetailPage({
  meeting,
  allMeetings,
  onBack,
  onEdit,
  onReport,
  onDelete,
}: MeetingDetailPageProps) {
  const pendingFollowUp = useMemo(() => {
    if (meeting.hasReport) return [];
    return getPendingActionsForMeeting(meeting, allMeetings, loadAllTasks());
  }, [meeting, allMeetings]);

  const previousSprint =
    meeting.sprintNumber != null && meeting.sprintNumber > 1
      ? meeting.sprintNumber - 1
      : undefined;

  return (
    <ViewShell>
      <PageBackHeader
        title={meeting.title}
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-slate-600">{formatMeetingNumber(meeting.number)}</span>
            <span className={`saas-badge border text-xs ${getMeetingTypeBadge(meeting.meetingType)}`}>
              {getMeetingTypeLabel(meeting.meetingType)}
            </span>
            <span className={`text-xs ${getMeetingStatusBadge(meeting.status)}`}>
              {getMeetingStatusLabel(meeting.status)}
            </span>
          </span>
        }
        onBack={onBack}
        actions={
          <div className="flex flex-wrap gap-2">
            {meeting.hasReport && (
              <ExportMeetingReportPdfButton meeting={meeting} variant="primary" />
            )}
            {meeting.status !== 'completed' && (
              <button
                type="button"
                onClick={onReport}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-sm"
              >
                <Edit className="w-4 h-4" />
                Rédiger CR
              </button>
            )}
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-xl hover:bg-slate-50 text-sm"
            >
              <Pencil className="w-4 h-4" />
              Modifier
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 text-red-700 rounded-xl hover:bg-red-50 text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Suivi tâches réunion précédente — visible avant rédaction du CR */}
          {!meeting.hasReport && (
            <section className="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50/90 to-white p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <ListChecks className="w-5 h-5 text-amber-600" />
                    Suivi des tâches des réunions précédentes
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Tâches ouvertes des CR publiés du sprint précédent
                    {previousSprint != null ? ` (sprint ${previousSprint})` : ''}{' '}
                    et des cérémonies antérieures du même sprint.
                    Ouvrez le compte rendu pour mettre à jour leur statut.
                  </p>
                </div>
                {pendingFollowUp.length > 0 && (
                  <button
                    type="button"
                    onClick={onReport}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 text-white rounded-xl hover:bg-amber-700 text-sm font-semibold shrink-0"
                  >
                    Rédiger le CR
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              <PendingTasksPreview
                tasks={pendingFollowUp}
                referenceDate={meeting.date}
                previousSprint={previousSprint}
              />
            </section>
          )}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-slate-700">
                <Calendar className="w-4 h-4 text-indigo-500" />
                {formatMeetingDate(meeting.date)}
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Clock className="w-4 h-4 text-indigo-500" />
                {meeting.time} · {meeting.duration} min
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Users className="w-4 h-4 text-indigo-500" />
                {meeting.participants.length} participant(s)
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <FileText className="w-4 h-4 text-indigo-500" />
                Rédacteur : {meeting.writerName}
              </div>
            </div>
            {meeting.sprintNumber ? (
              <p className="mt-3 text-sm text-violet-700 font-medium">Sprint {meeting.sprintNumber}</p>
            ) : null}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-3">Ordre du jour</h3>
            <ol className="space-y-2">
              {(meeting.agenda ?? []).map((item, idx) => (
                <li key={item.id} className="flex gap-3 text-sm">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-medium text-slate-800">{item.title}</p>
                    <p className="text-slate-500 text-xs">{item.objective}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {meeting.hasReport && (
            <>
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-3">
                  Décisions ({(meeting.decisions ?? []).length})
                </h3>
                <ul className="space-y-2">
                  {(meeting.decisions ?? []).map((d) => (
                    <li key={d.id} className="text-sm p-3 rounded-xl bg-purple-50 border border-purple-100">
                      {d.description}
                      <span className="ml-2 text-xs text-purple-600 uppercase">{d.impact}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-3">
                  Actions ({(meeting.actions ?? []).length})
                </h3>
                <ul className="space-y-2">
                  {(meeting.actions ?? []).map((a) => (
                    <li key={a.id} className="text-sm p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex justify-between gap-2">
                      <span>{a.description}</span>
                      <span className="text-xs text-emerald-700 shrink-0">
                        {a.assignedToName} · {a.dueDate}
                        {a.linkedTaskId ? ' · ✓ tâche' : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              {meeting.notes ? (
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="font-semibold text-slate-900 mb-2">Notes</h3>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{meeting.notes}</p>
                </section>
              ) : null}
            </>
          )}
        </div>

        <aside className="space-y-4">
          {!meeting.hasReport && pendingFollowUp.length > 0 && (
            <section className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-2 text-sm">Comment faire le point ?</h3>
              <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside">
                <li>Cliquez sur <strong>Rédiger CR</strong></li>
                <li>Section « Suivi des actions précédentes »</li>
                <li>Mettez à jour le statut de chaque tâche</li>
                <li>Ajoutez les nouvelles tâches du jour</li>
                <li>Publiez pour synchroniser Tâches & Gantt</li>
              </ol>
            </section>
          )}

          <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              Liens
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-slate-600">
                <CheckSquare className="w-4 h-4 text-indigo-500" />
                {meeting.linkedTaskIds?.length ?? 0} tâche(s) liée(s)
              </li>
              <li className="flex items-center gap-2 text-slate-600">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                {meeting.linkedDocumentId ? 'CR documenté (Documentation)' : 'Pas encore de document'}
              </li>
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-2">Participants</h3>
            <div className="flex flex-wrap gap-1.5">
              {meeting.participants.map((p) => (
                <span key={p} className="px-2 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs">
                  {p}
                </span>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </ViewShell>
  );
}
