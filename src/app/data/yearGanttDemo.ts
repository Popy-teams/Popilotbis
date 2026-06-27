import type { GanttItem } from '../types/scrumMeetings';

const PID = 'popy';
const C = {
  phase: '#6366f1',
  sprint: '#818cf8',
  meeting: '#059669',
  milestone: '#7c3aed',
  cert: '#d97706',
  infra: '#0284c7',
  prod: '#0891b2',
};

function iso(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Planning annuel POPY 2026 — phases, sprints, jalons mensuels, tâches CR */
export function buildYearGanttDemo(): GanttItem[] {
  const items: GanttItem[] = [];

  const monthlyLabels = [
    'Kick-off annuel',
    'Comité pilotage',
    'Revue budget & planning',
    'Comité pilotage',
    'Revue stakeholders',
    'Comité pilotage',
    'Revue mi-année',
    'Comité pilotage',
    'Revue certification',
    'Comité pilotage',
    'Revue pré-série',
    'Clôture annuelle',
  ];

  for (let m = 1; m <= 12; m++) {
    items.push({
      id: `milestone-2026-m${m}`,
      projectId: PID,
      label: monthlyLabels[m - 1],
      startDate: iso(2026, m, Math.min(28, 26 + (m % 3))),
      endDate: iso(2026, m, Math.min(28, 26 + (m % 3))),
      kind: 'milestone',
      category: 'Jalons mensuels',
      color: C.milestone,
      source: 'manual',
    });
  }

  const phases: { id: string; label: string; start: string; end: string; color: string }[] = [
    { id: 'phase-q1', label: 'Q1 — Cadrage & POC', start: '2026-01-06', end: '2026-03-31', color: C.phase },
    { id: 'phase-q2', label: 'Q2 — Développement & intégration', start: '2026-04-01', end: '2026-06-30', color: C.phase },
    { id: 'phase-q3', label: 'Q3 — Qualification & certification', start: '2026-07-01', end: '2026-09-30', color: C.cert },
    { id: 'phase-q4', label: 'Q4 — Industrialisation & lancement', start: '2026-10-01', end: '2026-12-18', color: C.prod },
  ];

  for (const p of phases) {
    items.push({
      id: p.id,
      projectId: PID,
      label: p.label,
      startDate: p.start,
      endDate: p.end,
      category: 'Phases projet',
      color: p.color,
      source: 'manual',
      assignee: 'Fabio Garcia',
    });
  }

  let sprintStart = '2026-01-06';
  for (let s = 1; s <= 26; s++) {
    const end = addDays(sprintStart, 13);
    items.push({
      id: `sprint-${s}`,
      projectId: PID,
      label: `Sprint ${s}`,
      startDate: sprintStart,
      endDate: end,
      category: 'Sprints (2 semaines)',
      color: C.sprint,
      source: 'manual',
      assignee: 'Équipe POPY',
    });
    sprintStart = addDays(end, 1);
    if (sprintStart > '2026-12-20') break;
  }

  const workPackages: Omit<GanttItem, 'id'>[] = [
    { label: 'Architecture système embarqué', startDate: '2026-01-06', endDate: '2026-02-28', category: 'Lots techniques', color: C.infra, assignee: 'Alice Martin', projectId: PID, source: 'manual' },
    { label: 'Firmware capteurs & bus I2C', startDate: '2026-02-15', endDate: '2026-05-30', category: 'Lots techniques', color: C.infra, assignee: 'Bob Dupont', projectId: PID, source: 'manual' },
    { label: 'Moteur IA émotionnelle', startDate: '2026-03-01', endDate: '2026-07-15', category: 'Lots techniques', color: C.phase, assignee: 'Claire Rousseau', projectId: PID, source: 'manual' },
    { label: 'UX enfant & tests utilisateurs', startDate: '2026-04-01', endDate: '2026-08-31', category: 'Lots techniques', color: C.phase, assignee: 'David Leroy', projectId: PID, source: 'manual' },
    { label: 'Campagne tests EN71 / CE', startDate: '2026-06-01', endDate: '2026-09-15', category: 'Certification', color: C.cert, assignee: 'Sonia Laurent', projectId: PID, source: 'manual' },
    { label: 'Pré-série & supply chain', startDate: '2026-09-01', endDate: '2026-11-30', category: 'Industrialisation', color: C.prod, assignee: 'Emma Bernard', projectId: PID, source: 'manual' },
    { label: 'Documentation & formation', startDate: '2026-08-01', endDate: '2026-12-15', category: 'Industrialisation', color: C.prod, assignee: 'Alice Martin', projectId: PID, source: 'manual' },
  ];

  workPackages.forEach((wp, i) => {
    items.push({ id: `lot-${i + 1}`, ...wp });
  });

  const meetingTasks: GanttItem[] = [
    {
      id: 'gantt-meeting-11-act-11-a',
      projectId: PID,
      label: 'Préparer script de démo sprint 12',
      startDate: '2026-01-03',
      endDate: '2026-01-15',
      assignee: 'Emma Bernard',
      meetingId: 'meeting-11',
      taskId: 'task-meeting-11-act-11-a',
      color: C.meeting,
      source: 'meeting',
      category: 'Actions CR (réunions)',
    },
    {
      id: 'gantt-meeting-11-act-11-b',
      projectId: PID,
      label: 'Finaliser slides stakeholders',
      startDate: '2026-01-03',
      endDate: '2026-01-10',
      assignee: 'Bob Dupont',
      meetingId: 'meeting-11',
      taskId: 'task-meeting-11-act-11-b',
      color: C.meeting,
      source: 'meeting',
      category: 'Actions CR (réunions)',
    },
    {
      id: 'gantt-meeting-11-act-11-c',
      projectId: PID,
      label: 'Corriger bugs démo capteurs',
      startDate: '2026-01-03',
      endDate: '2026-01-16',
      assignee: 'Claire Rousseau',
      meetingId: 'meeting-11',
      taskId: 'task-meeting-11-act-11-c',
      color: C.meeting,
      source: 'meeting',
      category: 'Actions CR (réunions)',
    },
    {
      id: 'gantt-meeting-daily-44-act-d44-a',
      projectId: PID,
      label: 'Débloquer accès CI firmware',
      startDate: '2026-01-15',
      endDate: '2026-01-22',
      assignee: 'Bob Dupont',
      meetingId: 'meeting-daily-44',
      taskId: 'task-meeting-daily-44-act-d44-a',
      color: C.meeting,
      source: 'meeting',
      category: 'Actions CR (réunions)',
    },
    {
      id: 'gantt-meeting-daily-44-act-d44-b',
      projectId: PID,
      label: 'Valider scénario test UX enfant',
      startDate: '2026-01-15',
      endDate: '2026-01-21',
      assignee: 'David Leroy',
      meetingId: 'meeting-daily-44',
      taskId: 'task-meeting-daily-44-act-d44-b',
      color: C.meeting,
      source: 'meeting',
      category: 'Actions CR (réunions)',
    },
  ];

  return [...items, ...meetingTasks];
}

export const YEAR_GANTT_DEMO_IDS = buildYearGanttDemo().map((g) => g.id);
