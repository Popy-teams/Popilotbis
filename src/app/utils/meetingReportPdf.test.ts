import { describe, expect, it } from 'vitest';
import type { ScrumMeetingRecord } from '../types/scrumMeetings';
import {
  buildMeetingReportPdfHtml,
  meetingReportPdfFilename,
  pdfDataFromMeeting,
} from './meetingReportPdf';

const sampleMeeting: ScrumMeetingRecord = {
  id: 'm-1',
  number: 44,
  title: 'Sprint Review — Sprint 6',
  meetingType: 'review',
  sprintNumber: 6,
  date: '2026-03-15',
  time: '14:00',
  duration: 90,
  participants: ['Alice Martin', 'Bob Dupont'],
  writerId: 'u1',
  writerName: 'Mériem Alami',
  status: 'completed',
  hasReport: true,
  projectId: 'popy',
  projectName: 'Projet POPY',
  agenda: [
    { id: 'a1', title: 'Démo incrément', objective: 'Présenter le livrable', duration: 40 },
  ],
  roundTable: [],
  decisions: [
    {
      id: 'd1',
      description: 'Valider la release V2 pour avril',
      decidedBy: 'Mériem Alami',
      date: '2026-03-15',
      impact: 'planning',
    },
  ],
  actions: [
    {
      id: 'act1',
      description: 'Finaliser les tests E2E',
      assignedTo: 'u2',
      assignedToName: 'Alice Martin',
      startDate: '2026-03-01',
      dueDate: '2026-03-20',
      createTask: true,
      status: 'in-progress',
      source: 'CR n° 43',
      carryOver: true,
      originMeetingNumber: 43,
    },
    {
      id: 'act2',
      description: 'Préparer la démo client',
      assignedTo: 'u1',
      assignedToName: 'Mériem Alami',
      startDate: '2026-03-15',
      dueDate: '2026-03-22',
      createTask: true,
      status: 'pending',
      source: 'CR n° 44',
      carryOver: false,
    },
  ],
  notes: 'Bonne vélocité sur le sprint.\nPoint d\'attention : certification CE.',
};

describe('meetingReportPdf', () => {
  it('génère un HTML structuré avec les sections clés', () => {
    const html = buildMeetingReportPdfHtml(pdfDataFromMeeting(sampleMeeting));
    expect(html).toContain('Compte rendu de réunion');
    expect(html).toContain('CR n° 44');
    expect(html).toContain('Suivi des actions précédentes');
    expect(html).toContain('Finaliser les tests E2E');
    expect(html).toContain('Préparer la démo client');
    expect(html).toContain('Valider la release V2 pour avril');
    expect(html).toContain('Popilot');
  });

  it('échappe le contenu HTML utilisateur', () => {
    const data = pdfDataFromMeeting({
      ...sampleMeeting,
      notes: '<script>alert("x")</script>',
    });
    const html = buildMeetingReportPdfHtml(data);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('produit un nom de fichier lisible', () => {
    expect(meetingReportPdfFilename(sampleMeeting)).toMatch(/^CR-44-/);
  });
});
