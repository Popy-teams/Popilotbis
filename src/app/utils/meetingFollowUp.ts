import type { MeetingActionItem, MeetingDecisionItem, ScrumMeetingRecord } from '../types/scrumMeetings';
import { SCRUM_MEETING_LABELS } from '../types/scrumMeetings';
import type { TestTask } from '../data/testData';
import { TEST_TEAM_MEMBERS } from '../data/testData';
import { loadAllTasks } from './pipelineSync';

function formatMeetingNumber(n: number): string {
  return `n° ${n}`;
}

function formatActionSource(meeting: ScrumMeetingRecord): string {
  const parts = [
    SCRUM_MEETING_LABELS[meeting.meetingType],
    formatMeetingNumber(meeting.number),
  ];
  if (meeting.sprintNumber) parts.push(`Sprint ${meeting.sprintNumber}`);
  return parts.join(' · ');
}

export interface ReportFormState {
  decisions: MeetingDecisionItem[];
  followUpActions: MeetingActionItem[];
  newActions: MeetingActionItem[];
  notes: string;
  roundTableNotes: string;
}

export function emptyDecision(meeting: ScrumMeetingRecord): MeetingDecisionItem {
  return {
    id: `dec-${Date.now()}`,
    description: '',
    decidedBy: meeting.writerName,
    date: meeting.date,
    impact: 'planning',
  };
}

export function emptyAction(meeting: ScrumMeetingRecord): MeetingActionItem {
  const member = TEST_TEAM_MEMBERS[0];
  return {
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    description: '',
    assignedTo: member?.id ?? 'user-1',
    assignedToName: member?.name ?? '',
    startDate: meeting.date,
    dueDate: meeting.date,
    stageId: undefined,
    createTask: true,
    status: 'pending',
    source: `CR n° ${meeting.number}`,
    carryOver: false,
  };
}

export function mapTaskStatusToAction(
  status: TestTask['status']
): MeetingActionItem['status'] {
  if (status === 'done') return 'completed';
  if (status === 'in-progress') return 'in-progress';
  return 'pending';
}

export function syncActionFromTask(
  action: MeetingActionItem,
  task?: TestTask
): MeetingActionItem {
  if (!task) return action;
  return {
    ...action,
    status: mapTaskStatusToAction(task.status),
    assignedTo: task.assignedTo,
    assignedToName: task.assignedToName,
    dueDate: task.dueDate,
    linkedTaskId: task.id,
    createTask: true,
  };
}

export function isActionLate(
  action: MeetingActionItem,
  referenceDate: string
): boolean {
  if (action.status === 'completed') return false;
  return action.dueDate < referenceDate;
}

function pushActionFromMeeting(
  result: MeetingActionItem[],
  seen: Set<string>,
  prev: ScrumMeetingRecord,
  action: MeetingActionItem,
  taskMap: Map<string, TestTask>
) {
  if (!action.createTask && !action.linkedTaskId) return;

  const taskId = action.linkedTaskId ?? `task-${prev.id}-${action.id}`;
  if (seen.has(taskId)) return;

  const task = taskMap.get(taskId);
  const synced = syncActionFromTask({ ...action, linkedTaskId: taskId }, task);
  if (synced.status === 'completed') return;

  seen.add(taskId);
  result.push({
    ...synced,
    id: `follow-${taskId}`,
    carryOver: true,
    sourceMeetingId: prev.id,
    originMeetingNumber: prev.number,
    originSprintNumber: prev.sprintNumber,
    source: formatActionSource(prev),
    startDate: action.startDate ?? prev.date,
    createTask: true,
  });
}

function pushActionFromTask(
  result: MeetingActionItem[],
  seen: Set<string>,
  task: TestTask,
  sourceMeeting?: ScrumMeetingRecord
) {
  if (seen.has(task.id)) return;
  if (task.status === 'done') return;

  seen.add(task.id);
  result.push({
    id: `follow-${task.id}`,
    description: task.title,
    assignedTo: task.assignedTo,
    assignedToName: task.assignedToName,
    startDate: task.startDate ?? sourceMeeting?.date ?? task.dueDate,
    dueDate: task.dueDate,
    stageId: task.stageId,
    createTask: true,
    linkedTaskId: task.id,
    status: mapTaskStatusToAction(task.status),
    carryOver: true,
    sourceMeetingId: task.sourceMeetingId ?? sourceMeeting?.id,
    originSprintNumber: sourceMeeting?.sprintNumber,
    originMeetingNumber: sourceMeeting?.number,
    source: sourceMeeting
      ? formatActionSource(sourceMeeting)
      : `Tâche · Sprint ${sourceMeeting?.sprintNumber ?? '?'}`,
  });
}

/**
 * Tâches ouvertes à reprendre :
 * 1) Toutes les cérémonies publiées du sprint précédent (même projet)
 * 2) Cérémonies du même sprint + même type avec numéro inférieur (ex. daily 44 → 45)
 */
export function getPendingActionsForMeeting(
  current: Pick<
    ScrumMeetingRecord,
    'id' | 'meetingType' | 'projectId' | 'sprintNumber' | 'number' | 'date'
  >,
  allMeetings: ScrumMeetingRecord[],
  tasks: TestTask[]
): MeetingActionItem[] {
  const projectId = current.projectId ?? 'popy';
  const taskMap = new Map(tasks.map((t) => [t.id, t]));
  const seen = new Set<string>();
  const result: MeetingActionItem[] = [];
  const sprint = current.sprintNumber;

  if (sprint != null && sprint > 1) {
    const prevSprint = sprint - 1;
    const prevSprintMeetings = allMeetings.filter(
      (m) =>
        m.id !== current.id &&
        m.hasReport &&
        (m.projectId ?? 'popy') === projectId &&
        m.sprintNumber === prevSprint
    );

    for (const prev of prevSprintMeetings) {
      for (const action of prev.actions ?? []) {
        pushActionFromMeeting(result, seen, prev, action, taskMap);
      }
    }

    const prevSprintMeetingIds = new Set(prevSprintMeetings.map((m) => m.id));
    for (const task of tasks) {
      if ((task.projectId ?? 'popy') !== projectId) continue;
      if (!task.sourceMeetingId || !prevSprintMeetingIds.has(task.sourceMeetingId)) continue;
      const src = prevSprintMeetings.find((m) => m.id === task.sourceMeetingId);
      pushActionFromTask(result, seen, task, src);
    }
  }

  if (sprint != null) {
    const sameSprintSameType = allMeetings.filter(
      (m) =>
        m.id !== current.id &&
        m.hasReport &&
        (m.projectId ?? 'popy') === projectId &&
        m.meetingType === current.meetingType &&
        m.sprintNumber === sprint &&
        m.number < current.number
    );

    for (const prev of sameSprintSameType) {
      for (const action of prev.actions ?? []) {
        pushActionFromMeeting(result, seen, prev, action, taskMap);
      }
    }
  }

  if (result.length === 0 && sprint == null) {
    const fallback = allMeetings.filter(
      (m) =>
        m.id !== current.id &&
        m.hasReport &&
        (m.projectId ?? 'popy') === projectId &&
        m.meetingType === current.meetingType &&
        m.number < current.number
    );
    for (const prev of fallback) {
      for (const action of prev.actions ?? []) {
        pushActionFromMeeting(result, seen, prev, action, taskMap);
      }
    }
  }

  return result;
}

/** @deprecated alias */
export const getPendingActionsFromPreviousMeetings = getPendingActionsForMeeting;

export function buildDraftMeetingFromForm(
  form: {
    meetingType: ScrumMeetingRecord['meetingType'];
    sprintNumber: string;
    date: string;
    title: string;
  },
  ceremonyNumber: number,
  projectId: string,
  projectName: string
): ScrumMeetingRecord {
  return {
    id: 'draft-new',
    number: ceremonyNumber,
    title: form.title || 'Nouvelle cérémonie',
    meetingType: form.meetingType,
    sprintNumber: form.sprintNumber ? parseInt(form.sprintNumber, 10) : undefined,
    date: form.date || new Date().toISOString().slice(0, 10),
    time: '10:00',
    duration: 60,
    participants: [],
    writerId: 'user-1',
    writerName: '—',
    status: 'planned',
    hasReport: false,
    projectId,
    projectName,
    agenda: [],
    roundTable: [],
    decisions: [],
    actions: [],
  };
}

export function buildReportForm(
  meeting: ScrumMeetingRecord,
  allMeetings: ScrumMeetingRecord[],
  tasks?: TestTask[]
): ReportFormState {
  const allTasks = tasks ?? loadAllTasks();

  if (meeting.hasReport && meeting.actions?.length) {
    const synced = meeting.actions.map((a) => {
      const task = a.linkedTaskId
        ? allTasks.find((t) => t.id === a.linkedTaskId)
        : undefined;
      return syncActionFromTask(a, task);
    });
    return {
      decisions: meeting.decisions?.length ? meeting.decisions : [],
      followUpActions: synced.filter((a) => a.carryOver),
      newActions: synced.filter((a) => !a.carryOver),
      notes: meeting.notes ?? '',
      roundTableNotes: meeting.notes ?? '',
    };
  }

  const followUp = getPendingActionsForMeeting(meeting, allMeetings, allTasks);
  const existingNew = (meeting.actions ?? []).filter((a) => !a.carryOver);

  return {
    decisions: meeting.decisions?.length ? meeting.decisions : [],
    followUpActions: followUp,
    newActions:
      existingNew.length > 0 ? existingNew : followUp.length > 0 ? [] : [emptyAction(meeting)],
    notes: meeting.notes ?? '',
    roundTableNotes: '',
  };
}

export function mergeReportActions(form: ReportFormState): MeetingActionItem[] {
  return [...form.followUpActions, ...form.newActions].filter((a) =>
    a.description.trim()
  );
}

export function countLateActions(
  form: ReportFormState,
  referenceDate: string
): number {
  return form.followUpActions.filter((a) => isActionLate(a, referenceDate)).length;
}
