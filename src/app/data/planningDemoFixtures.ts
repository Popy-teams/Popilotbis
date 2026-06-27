/**
 * Fixtures calendrier / planning POPY 2026 — cérémonies Scrum, jalons, échéances.
 */

import { SCRUM_MEETING_LABELS } from '../types/scrumMeetings';
import type { ScrumMeetingType } from '../types/scrumMeetings';
import type { CalendarEventStored } from '../types/calendarEvent';
import { POPY_MEETING_DEMO } from './meetingDemoData';

export type PlanningCalendarEventStored = CalendarEventStored;

const PID = 'popy';
const TEAM = ['Alice Martin', 'Bob Dupont', 'Claire Rousseau', 'David Leroy', 'Emma Bernard'];

function iso(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}T12:00:00.000Z`;
}

function sprintCeremonies(sprint: number, mondayMonth: number, mondayDay: number): PlanningCalendarEventStored[] {
  const y = 2026;
  const base = new Date(y, mondayMonth - 1, mondayDay);
  const addDays = (n: number) => {
    const d = new Date(base);
    d.setDate(d.getDate() + n);
    return iso(d.getFullYear(), d.getMonth() + 1, d.getDate());
  };

  return [
    {
      id: `plan-s${sprint}-planning`,
      projectId: PID,
      title: `${SCRUM_MEETING_LABELS.planning} — Sprint ${sprint}`,
      date: addDays(0),
      time: '10:00',
      type: 'meeting',
      ceremonyType: 'planning',
      participants: TEAM,
      description: `Sprint goal, backlog priorisé et capacité équipe pour le sprint ${sprint}.`,
      source: 'planning-demo',
    },
    ...Array.from({ length: 10 }, (_, i) => ({
      id: `plan-s${sprint}-daily-${i + 1}`,
      projectId: PID,
      title: `Daily Stand-up — S${sprint} J${i + 1}`,
      date: addDays(i),
      time: '09:30',
      type: 'meeting' as const,
      ceremonyType: 'daily' as const,
      participants: TEAM.slice(0, 4),
      description: 'Fait · En cours · Bloqué',
      source: 'planning-demo' as const,
    })),
    {
      id: `plan-s${sprint}-review`,
      projectId: PID,
      title: `Sprint Review — Sprint ${sprint}`,
      date: addDays(9),
      time: '14:00',
      type: 'meeting',
      ceremonyType: 'review',
      participants: TEAM,
      description: 'Démo incrément et feedback parties prenantes.',
      source: 'planning-demo',
    },
    {
      id: `plan-s${sprint}-retro`,
      projectId: PID,
      title: `Rétrospective — Sprint ${sprint}`,
      date: addDays(9),
      time: '16:00',
      type: 'meeting',
      ceremonyType: 'retro',
      participants: TEAM,
      description: 'Amélioration continue — actions d\'équipe.',
      source: 'planning-demo',
    },
  ];
}

const MILESTONES: PlanningCalendarEventStored[] = [
  { id: 'plan-ms-kickoff', projectId: PID, title: 'Kick-off annuel POPY', date: iso(2026, 1, 8), type: 'event', ceremonyType: 'milestone', priority: 'high', description: 'Lancement officiel programme 2026.', source: 'planning-demo' },
  { id: 'plan-ms-comite-fev', projectId: PID, title: 'Comité de pilotage — Février', date: iso(2026, 2, 26), time: '15:00', type: 'meeting', ceremonyType: 'comite', participants: TEAM.slice(0, 3), source: 'planning-demo' },
  { id: 'plan-ms-budget', projectId: PID, title: 'Revue budget & planning Q1', date: iso(2026, 3, 26), time: '10:00', type: 'meeting', ceremonyType: 'comite', participants: TEAM, source: 'planning-demo' },
  { id: 'plan-ms-certif', projectId: PID, title: 'Revue certification CE', date: iso(2026, 9, 26), type: 'deadline', ceremonyType: 'milestone', priority: 'high', description: 'Jalon certification produit.', source: 'planning-demo' },
  { id: 'plan-ms-pre-serie', projectId: PID, title: 'Revue pré-série industrielle', date: iso(2026, 10, 26), type: 'deadline', ceremonyType: 'milestone', priority: 'high', source: 'planning-demo' },
  { id: 'plan-ms-cloture', projectId: PID, title: 'Clôture annuelle programme', date: iso(2026, 12, 26), type: 'event', ceremonyType: 'milestone', source: 'planning-demo' },
];

const DEADLINES: PlanningCalendarEventStored[] = [
  { id: 'plan-dl-proto-v1', projectId: PID, title: 'Livraison prototype V1', date: iso(2026, 1, 25), type: 'deadline', priority: 'high', description: 'Premier prototype fonctionnel démontrable.', source: 'planning-demo' },
  { id: 'plan-dl-firmware', projectId: PID, title: 'Release firmware 2.4', date: iso(2026, 2, 14), type: 'deadline', priority: 'high', description: 'Version firmware stabilisée pour tests terrain.', source: 'planning-demo' },
  { id: 'plan-dl-ux-test', projectId: PID, title: 'Tests UX enfants — vague 1', date: iso(2026, 3, 10), type: 'deadline', priority: 'medium', source: 'planning-demo' },
  { id: 'plan-dl-dossier-ce', projectId: PID, title: 'Dossier technique CE complet', date: iso(2026, 8, 15), type: 'deadline', priority: 'high', source: 'planning-demo' },
  { id: 'plan-dl-demo-script', projectId: PID, title: 'Script démo sprint 12', date: iso(2026, 1, 15), type: 'deadline', priority: 'high', linkedTaskId: 'task-meeting-11-act-11-a', source: 'planning-demo' },
  { id: 'plan-dl-slides', projectId: PID, title: 'Slides stakeholders', date: iso(2026, 1, 10), type: 'deadline', priority: 'high', linkedTaskId: 'task-meeting-11-act-11-b', source: 'planning-demo' },
];

const EVENTS: PlanningCalendarEventStored[] = [
  { id: 'plan-ev-formation-scrum', projectId: PID, title: 'Formation Scrum équipe', date: iso(2026, 1, 22), time: '09:00', type: 'event', ceremonyType: 'training', participants: TEAM, description: 'Refresh cérémonies et Definition of Done.', source: 'planning-demo' },
  { id: 'plan-ev-atelier-ux', projectId: PID, title: 'Atelier co-design parents', date: iso(2026, 2, 5), time: '14:00', type: 'event', participants: ['David Leroy', 'Emma Bernard'], source: 'planning-demo' },
  { id: 'plan-ev-demo-stake', projectId: PID, title: 'Démo stakeholders internes', date: iso(2026, 2, 20), time: '11:00', type: 'event', participants: TEAM, source: 'planning-demo' },
  { id: 'plan-ev-hackathon', projectId: PID, title: 'Hackathon capteurs IA', date: iso(2026, 4, 8), time: '09:00', type: 'event', ceremonyType: 'training', participants: TEAM, source: 'planning-demo' },
];

/** Événements dérivés des réunions démo (sync visuelle) */
function eventsFromMeetings(): PlanningCalendarEventStored[] {
  return POPY_MEETING_DEMO.map((m) => ({
    id: `plan-sync-${m.id}`,
    projectId: m.projectId,
    title: m.title,
    date: iso(
      parseInt(m.date.slice(0, 4), 10),
      parseInt(m.date.slice(5, 7), 10),
      parseInt(m.date.slice(8, 10), 10)
    ),
    time: m.time,
    type: 'meeting' as const,
    ceremonyType: m.meetingType,
    participants: m.participants,
    description: m.hasReport ? 'CR publié — voir Réunions & CR' : 'Cérémonie planifiée — CR à rédiger',
    linkedMeetingId: m.id,
    source: 'meeting-sync' as const,
  }));
}

export function buildPlanningCalendarDemo(): PlanningCalendarEventStored[] {
  const base = [
    ...MILESTONES,
    ...DEADLINES,
    ...EVENTS,
    ...sprintCeremonies(11, 1, 6),
    ...sprintCeremonies(12, 1, 20),
    ...sprintCeremonies(13, 2, 3),
    ...sprintCeremonies(14, 2, 17),
    ...eventsFromMeetings(),
  ];
  return applyRichDemoMetadata(base);
}

/** Métadonnées type Google Calendar sur les événements clés */
function applyRichDemoMetadata(events: PlanningCalendarEventStored[]): PlanningCalendarEventStored[] {
  const rich: Record<string, Partial<PlanningCalendarEventStored>> = {
    'plan-s12-review': {
      location: 'Salle Innovation — Bâtiment A, 2e étage, Paris 15e',
      endTime: '16:00',
      videoConferenceUrl: 'https://meet.google.com/popy-sprint-review-12',
      organizer: 'Alice Martin',
      notes: 'Prévoir démo capteurs + scénarios émotionnels. Inviter stakeholders produit.',
      links: [
        { id: 'lnk-miro', label: 'Board Miro — Sprint 12', url: 'https://miro.com/app/board/popy-s12' },
        { id: 'lnk-figma', label: 'Maquettes UX enfant', url: 'https://figma.com/file/popy-ux-demo' },
      ],
      attachments: [
        { id: 'att-slides', name: 'Slides Review S12.pdf', url: 'https://drive.google.com/popy-review-12', kind: 'file' },
      ],
      linkedDocumentIds: ['doc-2'],
      reminders: [
        { id: 'rem-1d', minutesBefore: 1440, label: '1 jour avant' },
        { id: 'rem-1h', minutesBefore: 60, label: '1 h avant' },
      ],
    },
    'plan-s12-planning': {
      location: 'Salle Scrum — Open space POPY',
      endTime: '12:30',
      videoConferenceUrl: 'https://meet.google.com/popy-planning-s12',
      organizer: 'Alice Martin',
      notes: 'Backlog sprint 12 déjà groomé. Vérifier capacité Bob (congés J3).',
      links: [{ id: 'lnk-jira', label: 'Backlog Jira Sprint 12', url: 'https://jira.example.com/popy/s12' }],
      linkedDocumentIds: ['doc-2'],
      reminders: [{ id: 'rem-30', minutesBefore: 30, label: '30 min avant' }],
    },
    'plan-ev-formation-scrum': {
      location: 'Centre de formation — 8 av. de la République, Lyon',
      endTime: '17:00',
      allDay: false,
      organizer: 'Emma Bernard',
      notes: 'Apporter Definition of Done à jour. Session interactive.',
      links: [{ id: 'lnk-dod', label: 'Definition of Done POPY', url: 'https://wiki.popilot.local/dod' }],
    },
    'plan-ms-comite-fev': {
      location: 'Visioconférence + salle direction',
      endTime: '16:30',
      videoConferenceUrl: 'https://meet.google.com/popy-comite-fev-2026',
      organizer: 'Alice Martin',
      notes: 'Ordre du jour : budget Q1, risques certification, démo prototype.',
      linkedDocumentIds: ['doc-1', 'doc-3'],
      attachments: [
        { id: 'att-budget', name: 'Budget Q1.xlsx', url: 'https://drive.google.com/popy-budget-q1', kind: 'file' },
      ],
    },
    'plan-sync-meeting-12': {
      location: 'Salle Innovation — Bâtiment A',
      endTime: '16:00',
      videoConferenceUrl: 'https://meet.google.com/popy-sprint-review-12',
      linkedMeetingId: 'meeting-12',
      notes: 'CR à rédiger après la session. Lier les actions au backlog.',
      reminders: [{ id: 'rem-15', minutesBefore: 15, label: '15 min avant' }],
    },
    'plan-dl-proto-v1': {
      location: 'Livraison atelier prototype — Site R&D Nanterre',
      notes: 'Checklist : firmware 2.3, batterie, notice sécurité enfant.',
      links: [{ id: 'lnk-checklist', label: 'Checklist livraison V1', url: 'https://wiki.popilot.local/proto-v1' }],
      priority: 'high',
    },
  };

  return events.map((e) => (rich[e.id] ? { ...e, ...rich[e.id] } : e));
}

export const DEMO_PLANNING_CALENDAR_IDS = buildPlanningCalendarDemo().map((e) => e.id);
