import type { ISODocument } from '../types/documents';
import type { PipelineStage } from '../types/planning';
import { TEST_TEAM_MEMBERS, type TestTask } from '../data/testData';
import { INITIAL_PIPELINE } from '../data/initialPipeline';
import {
  GANTT_STORAGE_KEY,
  CALENDAR_STORAGE_KEY,
  MEETINGS_STORAGE_KEY,
  INITIAL_SCRUM_MEETINGS,
  normalizeMeeting,
} from '../data/initialMeetings';
import { INITIAL_GANTT_ITEMS } from '../data/meetingDemoData';
import { DEMO_MEETINGS_BY_PROJECT } from '../data/multiProjectDemoFixtures';
import { mergeDemoData } from './demoDataMerge';
import type { GanttItem, MeetingActionItem, ScrumMeetingRecord } from '../types/scrumMeetings';
import { SCRUM_MEETING_COLORS } from '../types/scrumMeetings';
import {
  applyPipelineSync,
  DOCS_STORAGE_KEY,
  linkTaskToPipelineStage,
  loadAllDocuments,
  loadAllTasks,
  TASKS_STORAGE_KEY,
} from './pipelineSync';

export { MEETINGS_STORAGE_KEY, GANTT_STORAGE_KEY, CALENDAR_STORAGE_KEY };

export interface PublishMeetingResult {
  meeting: ScrumMeetingRecord;
  createdTasks: TestTask[];
  documentId?: string;
  ganttItems: GanttItem[];
}

interface CalendarEventStored {
  id: string;
  projectId?: string;
  title: string;
  date: string;
  type: 'meeting' | 'deadline' | 'event' | 'gantt-bar';
  time?: string;
  participants?: string[];
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  endDate?: string;
  linkedMeetingId?: string;
  linkedTaskId?: string;
  source?: 'manual' | 'meeting-sync';
}

export function loadMeetings(): ScrumMeetingRecord[] {
  try {
    const raw = localStorage.getItem(MEETINGS_STORAGE_KEY);
    const saved = raw ? (JSON.parse(raw) as Record<string, unknown>[]).map(normalizeMeeting) : [];
    const demo = DEMO_MEETINGS_BY_PROJECT.map((m) =>
      normalizeMeeting(m as unknown as Record<string, unknown>)
    );
    return mergeDemoData(saved, demo, INITIAL_SCRUM_MEETINGS).map((m) => ({
      ...m,
      agenda: m.agenda ?? [],
      participants: m.participants ?? [],
      decisions: m.decisions ?? [],
      actions: m.actions ?? [],
      roundTable: m.roundTable ?? [],
    }));
  } catch {
    return [...INITIAL_SCRUM_MEETINGS];
  }
}

export function saveMeetings(meetings: ScrumMeetingRecord[]): void {
  try {
    localStorage.setItem(MEETINGS_STORAGE_KEY, JSON.stringify(meetings));
    window.dispatchEvent(new CustomEvent('popilot:meetings-updated'));
  } catch {
    // ignore
  }
}

export function loadGanttItems(): GanttItem[] {
  try {
    const raw = localStorage.getItem(GANTT_STORAGE_KEY);
    const saved = raw ? (JSON.parse(raw) as GanttItem[]) : [];
    return mergeDemoData(saved, INITIAL_GANTT_ITEMS);
  } catch {
    return [...INITIAL_GANTT_ITEMS];
  }
}

export function saveGanttItems(items: GanttItem[]): void {
  try {
    localStorage.setItem(GANTT_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('popilot:gantt-updated'));
  } catch {
    // ignore
  }
}

function loadCalendarEvents(): CalendarEventStored[] {
  try {
    const raw = localStorage.getItem(CALENDAR_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CalendarEventStored[]) : [];
  } catch {
    return [];
  }
}

function saveCalendarEvents(events: CalendarEventStored[]): void {
  try {
    localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(events));
    window.dispatchEvent(new CustomEvent('popilot:calendar-updated'));
  } catch {
    // ignore
  }
}

export function resolveAssigneeId(nameOrId: string): { id: string; name: string } {
  const byId = TEST_TEAM_MEMBERS.find((m) => m.id === nameOrId);
  if (byId) return { id: byId.id, name: byId.name };
  const byName = TEST_TEAM_MEMBERS.find(
    (m) => m.name.toLowerCase() === nameOrId.toLowerCase()
  );
  if (byName) return { id: byName.id, name: byName.name };
  return { id: nameOrId, name: nameOrId };
}

function buildTaskFromAction(
  action: MeetingActionItem,
  meeting: ScrumMeetingRecord,
  existingId?: string
): TestTask {
  const assignee = resolveAssigneeId(action.assignedTo);
  const sourceMeetingId = action.sourceMeetingId ?? meeting.id;
  return {
    id: existingId ?? action.linkedTaskId ?? `task-${meeting.id}-${action.id}`,
    title: action.description.slice(0, 120),
    description: `Action issue du ${action.source} — ${meeting.title}`,
    status: action.status === 'completed' ? 'done' : action.status === 'in-progress' ? 'in-progress' : 'todo',
    priority: 'medium',
    assignedTo: assignee.id,
    assignedToName: assignee.name,
    projectId: meeting.projectId ?? 'popy',
    projectName: meeting.projectName,
    dueDate: action.dueDate,
    startDate: action.startDate ?? meeting.date,
    progress: action.status === 'completed' ? 100 : action.status === 'in-progress' ? 50 : 0,
    subtasks: [],
    stageId: action.stageId,
    sourceMeetingId,
    sourceActionId: action.id,
  };
}

function buildCompteRenduDocument(meeting: ScrumMeetingRecord, taskIds: string[]): ISODocument {
  const now = new Date().toISOString();
  const content = [
    `# Compte rendu — ${meeting.title}`,
    '',
    `**Date :** ${meeting.date} ${meeting.time}`,
    `**Type :** ${meeting.meetingType}`,
    meeting.sprintNumber ? `**Sprint :** ${meeting.sprintNumber}` : '',
    `**Rédacteur :** ${meeting.writerName}`,
    '',
    '## Décisions',
    ...meeting.decisions.map((d) => `- ${d.description} (${d.impact})`),
    '',
    '## Actions',
    ...meeting.actions.map(
      (a) => `- ${a.description} → ${a.assignedToName} (échéance ${a.dueDate})`
    ),
    meeting.notes ? `\n## Notes\n${meeting.notes}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return {
    id: meeting.linkedDocumentId ?? `doc-cr-${meeting.id}`,
    title: `CR n° ${meeting.number} — ${meeting.title}`,
    type: 'compte-rendu',
    category: 'pilotage',
    status: 'validated',
    responsible: meeting.writerId,
    responsibleName: meeting.writerName,
    version: '1.0',
    description: `Compte rendu Scrum publié le ${meeting.date}`,
    content,
    createdAt: now,
    updatedAt: now,
    validatedAt: now,
    validatedBy: meeting.writerName,
    history: [],
    linkedTo: {
      projectId: meeting.projectId,
      meetingId: meeting.id,
      taskIds,
      decisionIds: meeting.decisions.map((d) => d.id),
      stageId: meeting.actions.find((a) => a.stageId)?.stageId,
    },
    tags: ['scrum', meeting.meetingType],
  };
}

function ganttColorForMeeting(meeting: ScrumMeetingRecord): string {
  const map: Record<string, string> = {
    planning: '#7c3aed',
    daily: '#0284c7',
    review: '#059669',
    retro: '#d97706',
    other: '#64748b',
  };
  return map[meeting.meetingType] ?? '#6366f1';
}

function buildGanttItem(
  meeting: ScrumMeetingRecord,
  action: MeetingActionItem,
  taskId: string
): GanttItem {
  const start = action.startDate ?? meeting.date;
  const end = action.dueDate >= start ? action.dueDate : start;
  return {
    id: `gantt-${meeting.id}-${action.id}`,
    projectId: meeting.projectId,
    label: action.description.slice(0, 80),
    startDate: start,
    endDate: end,
    assignee: action.assignedToName,
    meetingId: action.sourceMeetingId ?? meeting.id,
    taskId,
    color: ganttColorForMeeting(meeting),
    source: 'meeting',
  };
}

export function syncMeetingToCalendar(meeting: ScrumMeetingRecord): void {
  const events = loadCalendarEvents().filter(
    (e) => e.linkedMeetingId !== meeting.id || e.type !== 'meeting'
  );
  events.push({
    id: `cal-meeting-${meeting.id}`,
    projectId: meeting.projectId,
    title: meeting.title,
    date: `${meeting.date}T12:00:00.000Z`,
    type: 'meeting',
    time: meeting.time,
    participants: meeting.participants,
    description: `CR n° ${meeting.number} — ${meeting.meetingType}`,
    linkedMeetingId: meeting.id,
    source: 'meeting-sync',
  });
  saveCalendarEvents(events);
}

export function syncGanttToCalendar(items: GanttItem[]): void {
  const manual = loadCalendarEvents().filter((e) => e.source !== 'meeting-sync' || e.type !== 'gantt-bar');
  const ganttEvents: CalendarEventStored[] = items.map((item) => ({
    id: `cal-gantt-${item.id}`,
    projectId: item.projectId,
    title: item.label,
    date: `${item.startDate}T12:00:00.000Z`,
    endDate: item.endDate,
    type: 'gantt-bar',
    description: item.assignee ? `Assigné : ${item.assignee}` : undefined,
    linkedMeetingId: item.meetingId,
    linkedTaskId: item.taskId,
    source: 'meeting-sync',
  }));
  saveCalendarEvents([...manual, ...ganttEvents]);
}

export function publishMeetingReport(
  meeting: ScrumMeetingRecord,
  pipelineStages: PipelineStage[] = INITIAL_PIPELINE
): PublishMeetingResult {
  let tasks = loadAllTasks();
  const createdTasks: TestTask[] = [];
  const linkedTaskIds: string[] = [...(meeting.linkedTaskIds ?? [])];
  const updatedActions: MeetingActionItem[] = [];

  for (const action of meeting.actions) {
    if (!action.description.trim()) continue;

    const taskId = action.linkedTaskId ?? `task-${meeting.id}-${action.id}`;

    const existingIdx = tasks.findIndex((t) => t.id === taskId);
    const task = buildTaskFromAction({ ...action, linkedTaskId: taskId }, meeting, taskId);

    if (existingIdx >= 0) {
      tasks = tasks.map((t) => (t.id === taskId ? { ...t, ...task } : t));
    } else {
      tasks = [...tasks, task];
      createdTasks.push(task);
    }

    if (action.stageId) {
      tasks = linkTaskToPipelineStage(taskId, action.stageId, tasks);
    }

    linkedTaskIds.push(taskId);
    updatedActions.push({ ...action, linkedTaskId: taskId, createTask: true });
  }

  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    applyPipelineSync(tasks);
    window.dispatchEvent(new CustomEvent('popilot:pipeline-updated'));
  } catch {
    // ignore
  }

  const doc = buildCompteRenduDocument(meeting, [...new Set(linkedTaskIds)]);
  const docs = loadAllDocuments().filter((d) => d.id !== doc.id);
  docs.push(doc);
  try {
    localStorage.setItem(DOCS_STORAGE_KEY, JSON.stringify(docs));
    applyPipelineSync(tasks, docs);
  } catch {
    // ignore
  }

  const syncedTaskIds = new Set(updatedActions.map((a) => a.linkedTaskId).filter(Boolean) as string[]);
  const ganttItems = loadGanttItems().filter((g) => !g.taskId || !syncedTaskIds.has(g.taskId));
  const newGantt = updatedActions
    .filter((a) => a.linkedTaskId && a.status !== 'completed')
    .map((a) => buildGanttItem(meeting, a, a.linkedTaskId!));
  const allGantt = [...ganttItems, ...newGantt];
  saveGanttItems(allGantt);

  syncMeetingToCalendar(meeting);
  syncGanttToCalendar(allGantt);

  const published: ScrumMeetingRecord = {
    ...meeting,
    status: 'completed',
    hasReport: true,
    actions: updatedActions,
    linkedTaskIds: [...new Set(linkedTaskIds)],
    linkedDocumentId: doc.id,
    decisions: meeting.decisions,
  };

  return { meeting: published, createdTasks, documentId: doc.id, ganttItems: newGantt };
}

export function upsertPlannedMeetingCalendar(meeting: ScrumMeetingRecord): void {
  if (meeting.status === 'completed') return;
  syncMeetingToCalendar(meeting);
}

export function getPipelineStagesForProject(
  projectId: string | undefined,
  stages: PipelineStage[]
): PipelineStage[] {
  const slug = projectId ?? 'popy';
  return stages.filter((s) => (s.projectId ?? 'popy') === slug || slug.includes('popy'));
}

export function buildGanttSvg(items: GanttItem[], title: string): string {
  if (items.length === 0) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="120"><text x="20" y="60" font-family="sans-serif" font-size="14">${title} — aucune barre</text></svg>`;
  }

  const dates = items.flatMap((i) => [i.startDate, i.endDate]);
  const minDate = new Date(Math.min(...dates.map((d) => new Date(d).getTime())));
  const maxDate = new Date(Math.max(...dates.map((d) => new Date(d).getTime())));
  const totalMs = Math.max(maxDate.getTime() - minDate.getTime(), 86400000);
  const rowH = 36;
  const padL = 220;
  const padT = 48;
  const chartW = 560;
  const height = padT + items.length * rowH + 24;
  const width = padL + chartW + 40;

  const toX = (date: string) => {
    const ms = new Date(date).getTime() - minDate.getTime();
    return padL + (ms / totalMs) * chartW;
  };

  const bars = items
    .map((item, idx) => {
      const y = padT + idx * rowH + 8;
      const x1 = toX(item.startDate);
      const x2 = toX(item.endDate);
      const w = Math.max(x2 - x1, 6);
      return `
        <text x="12" y="${y + 14}" font-family="sans-serif" font-size="12" fill="#334155">${escapeXml(item.label.slice(0, 28))}</text>
        <rect x="${x1}" y="${y}" width="${w}" height="20" rx="4" fill="${item.color}" opacity="0.85"/>
        <text x="${x1 + 4}" y="${y + 14}" font-family="sans-serif" font-size="10" fill="#fff">${escapeXml(item.assignee ?? '')}</text>
      `;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="100%" height="100%" fill="#f8fafc"/>
    <text x="12" y="28" font-family="sans-serif" font-size="16" font-weight="bold" fill="#0f172a">${escapeXml(title)}</text>
    <line x1="${padL}" y1="${padT - 8}" x2="${padL + chartW}" y2="${padT - 8}" stroke="#cbd5e1"/>
    ${bars}
  </svg>`;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function downloadGanttSvg(items: GanttItem[], filename: string, title: string): void {
  const svg = buildGanttSvg(items, title);
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.svg') ? filename : `${filename}.svg`;
  a.click();
  URL.revokeObjectURL(url);
}

export function ganttTypeColor(type: keyof typeof SCRUM_MEETING_COLORS): string {
  const colors: Record<string, string> = {
    planning: '#7c3aed',
    daily: '#0284c7',
    review: '#059669',
    retro: '#d97706',
    other: '#64748b',
  };
  return colors[type] ?? '#6366f1';
}
