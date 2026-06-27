import type { ScrumMeetingRecord } from '../types/scrumMeetings';
import { defaultAgendaForType } from '../types/scrumMeetings';
import { POPY_MEETING_DEMO } from './meetingDemoData';

export const MEETINGS_STORAGE_KEY = 'popilot:meetings-local';
export const GANTT_STORAGE_KEY = 'popilot:gantt-items';
export const CALENDAR_STORAGE_KEY = 'popilot:calendar-events';

/** Fixtures réunions POPY (fusionnées au chargement) */
export const INITIAL_SCRUM_MEETINGS: ScrumMeetingRecord[] = POPY_MEETING_DEMO;

export function normalizeMeeting(raw: Record<string, unknown>): ScrumMeetingRecord {
  const id =
    typeof raw.id === 'number'
      ? `meeting-${raw.id}`
      : String(raw.id ?? `meeting-${Date.now()}`);

  const meetingType =
    (raw.meetingType as ScrumMeetingRecord['meetingType']) ??
    inferMeetingType(String(raw.title ?? ''));

  const legacyDecisions = String(raw.reportDecisions ?? '')
    .split('\n')
    .filter(Boolean)
    .map((line, i) => ({
      id: `legacy-dec-${id}-${i}`,
      description: line,
      decidedBy: String(raw.writerName ?? 'Équipe'),
      date: String(raw.date ?? new Date().toISOString().slice(0, 10)),
      impact: 'planning' as const,
    }));

  const legacyActions = String(raw.reportActions ?? '')
    .split('\n')
    .filter(Boolean)
    .map((line, i) => ({
      id: `legacy-act-${id}-${i}`,
      description: line,
      assignedTo: String(raw.writerId ?? 'user-1'),
      assignedToName: String(raw.writerName ?? 'Non assigné'),
      dueDate: String(raw.date ?? new Date().toISOString().slice(0, 10)),
      createTask: false,
      status: 'pending' as const,
      source: `CR #${raw.number ?? '?'}`,
    }));

  return {
    id,
    number: Number(raw.number ?? 1),
    title: String(raw.title ?? 'Réunion'),
    meetingType,
    sprintNumber: raw.sprintNumber != null ? Number(raw.sprintNumber) : undefined,
    date: String(raw.date ?? new Date().toISOString().slice(0, 10)),
    time: String(raw.time ?? '10:00'),
    duration: Number(raw.duration ?? 60),
    participants: Array.isArray(raw.participantNames)
      ? (raw.participantNames as string[])
      : Array.isArray(raw.participants)
        ? (raw.participants as string[])
        : [],
    writerId: String(raw.writerId ?? 'user-1'),
    writerName: String(raw.writerName ?? 'Non assigné'),
    facilitator: raw.facilitator ? String(raw.facilitator) : undefined,
    status: (raw.status as ScrumMeetingRecord['status']) ?? 'planned',
    hasReport: Boolean(raw.hasReport),
    projectId: raw.projectId ? String(raw.projectId) : 'popy',
    projectName: String(raw.projectName ?? 'POPY'),
    agenda: Array.isArray(raw.agenda) ? (raw.agenda as ScrumMeetingRecord['agenda']) : defaultAgendaForType(meetingType),
    roundTable: Array.isArray(raw.roundTable) ? (raw.roundTable as ScrumMeetingRecord['roundTable']) : [],
    decisions:
      Array.isArray(raw.decisions) && raw.decisions.length > 0
        ? (raw.decisions as ScrumMeetingRecord['decisions'])
        : legacyDecisions,
    actions:
      Array.isArray(raw.actions) && raw.actions.length > 0
        ? (raw.actions as ScrumMeetingRecord['actions'])
        : legacyActions,
    notes: raw.notes ? String(raw.notes) : undefined,
    linkedDocumentId: raw.linkedDocumentId ? String(raw.linkedDocumentId) : undefined,
    linkedTaskIds: Array.isArray(raw.linkedTaskIds) ? (raw.linkedTaskIds as string[]) : [],
    annexes: Array.isArray(raw.annexes) ? (raw.annexes as ScrumMeetingRecord['annexes']) : [],
    reportDecisions: raw.reportDecisions ? String(raw.reportDecisions) : undefined,
    reportActions: raw.reportActions ? String(raw.reportActions) : undefined,
  };
}

function inferMeetingType(title: string): ScrumMeetingRecord['meetingType'] {
  const t = title.toLowerCase();
  if (t.includes('planning') || t.includes('planification')) return 'planning';
  if (t.includes('daily') || t.includes('stand-up') || t.includes('standup')) return 'daily';
  if (t.includes('review') || t.includes('revue')) return 'review';
  if (t.includes('retro')) return 'retro';
  return 'other';
}