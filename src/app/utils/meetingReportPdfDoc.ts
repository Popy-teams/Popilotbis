import type { MeetingActionItem, MeetingDecisionItem, ScrumMeetingRecord } from '../types/scrumMeetings';
import { SCRUM_MEETING_LABELS } from '../types/scrumMeetings';
import type { MeetingReportPdfData } from './meetingReportPdf';
import { countLateActions, isActionLate } from './meetingFollowUp';
import type { JsPdfDoc } from '../../vendor/jspdfLoader';

const IMPACT_LABELS: Record<MeetingDecisionItem['impact'], string> = {
  planning: 'Planning',
  budget: 'Budget',
  quality: 'Qualité',
  scope: 'Périmètre',
};

const TYPE_ACCENT: Record<
  ScrumMeetingRecord['meetingType'],
  { primary: [number, number, number]; light: [number, number, number] }
> = {
  planning: { primary: [124, 58, 237], light: [237, 233, 254] },
  daily: { primary: [2, 132, 199], light: [224, 242, 254] },
  review: { primary: [5, 150, 105], light: [209, 250, 229] },
  retro: { primary: [217, 119, 6], light: [254, 243, 199] },
  other: { primary: [71, 85, 105], light: [241, 245, 249] },
};

const PAGE_W = 210;
const MARGIN = 15;
const CONTENT_W = PAGE_W - MARGIN * 2;
const FOOTER_Y = 287;

function formatDateFr(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatShortDate(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatCrLabel(n: number): string {
  return `CR n° ${n}`;
}

function statusLabel(action: MeetingActionItem, refDate: string): string {
  if (action.status === 'completed') return 'Terminé';
  if (isActionLate(action, refDate)) return 'En retard';
  if (action.status === 'in-progress') return 'En cours';
  return 'À faire';
}

function ensureSpace(doc: JsPdfDoc, y: number, needed: number): number {
  const pageH = doc.internal.pageSize.getHeight();
  if (y + needed > pageH - 22) {
    doc.addPage();
    return 20;
  }
  return y;
}

function drawPageFooter(doc: JsPdfDoc, data: MeetingReportPdfData, pageNum: number, total: number): void {
  doc.setDrawColor(226, 232, 240);
  doc.line(MARGIN, FOOTER_Y - 5, PAGE_W - MARGIN, FOOTER_Y - 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Popilot', MARGIN, FOOTER_Y);
  doc.text(
    `${data.meeting.projectName} · ${formatCrLabel(data.meeting.number)}`,
    PAGE_W / 2,
    FOOTER_Y,
    { align: 'center' }
  );
  doc.text(`Page ${pageNum} / ${total}`, PAGE_W - MARGIN, FOOTER_Y, { align: 'right' });
}

function drawCoverHeader(doc: JsPdfDoc, data: MeetingReportPdfData, accent: typeof TYPE_ACCENT.review): number {
  const { meeting } = data;
  const typeLabel = SCRUM_MEETING_LABELS[meeting.meetingType];

  doc.setFillColor(...accent.primary);
  doc.rect(0, 0, PAGE_W, 52, 'F');
  doc.setFillColor(49, 46, 129);
  doc.rect(0, 52, PAGE_W, 6, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('COMPTE RENDU DE RÉUNION', MARGIN, 14);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(19);
  const titleLines = doc.splitTextToSize(meeting.title, CONTENT_W);
  doc.text(titleLines, MARGIN, 26);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const subtitle = [
    formatCrLabel(meeting.number),
    typeLabel,
    meeting.sprintNumber ? `Sprint ${meeting.sprintNumber}` : null,
  ]
    .filter(Boolean)
    .join('  ·  ');
  doc.text(subtitle, MARGIN, 38 + (titleLines.length > 1 ? 6 : 0));

  if (data.draft) {
    doc.setFillColor(254, 243, 199);
    doc.roundedRect(PAGE_W - MARGIN - 42, 10, 42, 8, 2, 2, 'F');
    doc.setTextColor(146, 64, 14);
    doc.setFontSize(7);
    doc.text('BROUILLON', PAGE_W - MARGIN - 21, 15.5, { align: 'center' });
  }

  let y = 66;

  const meta = [
    { label: 'PROJET', value: meeting.projectName },
    { label: 'DATE', value: formatDateFr(meeting.date) },
    { label: 'HORAIRE', value: `${meeting.time} · ${meeting.duration} min` },
    { label: 'RÉDACTEUR', value: meeting.writerName },
  ];

  const boxW = (CONTENT_W - 9) / 4;
  meta.forEach((m, i) => {
    const x = MARGIN + i * (boxW + 3);
    doc.setFillColor(...accent.light);
    doc.roundedRect(x, y, boxW, 18, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(m.label, x + 4, y + 6);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    const lines = doc.splitTextToSize(m.value, boxW - 8);
    doc.text(lines.slice(0, 2), x + 4, y + 12);
  });

  y += 24;

  const followUpDone = data.followUpActions.filter((a) => a.status === 'completed').length;
  const lateCount = countLateActions(
    {
      followUpActions: data.followUpActions,
      newActions: data.newActions,
      decisions: data.decisions,
      notes: data.notes,
      roundTableNotes: data.notes,
    },
    meeting.date
  );
  const totalActions = data.followUpActions.length + data.newActions.length;

  const kpis = [
    { label: 'Suivi CR', value: String(data.followUpActions.length), sub: followUpDone ? `${followUpDone} terminées` : '' },
    { label: 'En retard', value: String(lateCount), warn: lateCount > 0 },
    { label: 'Nouvelles tâches', value: String(data.newActions.length) },
    { label: 'Total actions', value: String(totalActions) },
  ];

  kpis.forEach((k, i) => {
    const x = MARGIN + i * (boxW + 3);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, y, boxW, 16, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    if (k.warn) doc.setTextColor(220, 38, 38);
    else if (i === 2) doc.setTextColor(...accent.primary);
    else doc.setTextColor(15, 23, 42);
    doc.text(k.value, x + boxW / 2, y + 9, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(k.label, x + boxW / 2, y + 14, { align: 'center' });
    if (k.sub) {
      doc.setFontSize(6);
      doc.setTextColor(5, 150, 105);
      doc.text(k.sub, x + boxW / 2, y + 17.5, { align: 'center' });
    }
  });

  return y + 24;
}

function drawSectionTitle(
  doc: JsPdfDoc,
  y: number,
  num: number,
  title: string,
  accent: [number, number, number]
): number {
  y = ensureSpace(doc, y, 16);
  doc.setFillColor(...accent);
  doc.circle(MARGIN + 4, y + 3.5, 3.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(String(num), MARGIN + 4, y + 4.2, { align: 'center' });
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.text(title, MARGIN + 12, y + 4.5);
  doc.setDrawColor(...accent);
  doc.setLineWidth(0.4);
  doc.line(MARGIN, y + 7, PAGE_W - MARGIN, y + 7);
  return y + 12;
}

function drawActionsTable(
  doc: JsPdfDoc,
  y: number,
  actions: MeetingActionItem[],
  refDate: string,
  showOrigin: boolean,
  accent: [number, number, number]
): number {
  const filtered = actions.filter((a) => a.description.trim());
  if (filtered.length === 0) {
    y = ensureSpace(doc, y, 10);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text('Aucune action dans cette section.', MARGIN, y);
    return y + 8;
  }

  const head = showOrigin
    ? [['#', 'Description', 'Origine', 'Assigné', 'Échéance', 'Statut']]
    : [['#', 'Description', 'Assigné', 'Début', 'Échéance', 'Statut']];

  const body = filtered.map((a, i) =>
    showOrigin
      ? [
          String(i + 1),
          a.description,
          a.originMeetingNumber != null ? formatCrLabel(a.originMeetingNumber) : a.source,
          a.assignedToName || '—',
          formatShortDate(a.dueDate),
          statusLabel(a, refDate),
        ]
      : [
          String(i + 1),
          a.description,
          a.assignedToName || '—',
          formatShortDate(a.startDate ?? refDate),
          formatShortDate(a.dueDate),
          statusLabel(a, refDate),
        ]
  );

  doc.autoTable({
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head,
    body,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 8.5,
      cellPadding: 3,
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
      textColor: [30, 41, 59],
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: accent,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: showOrigin
      ? { 0: { cellWidth: 8 }, 1: { cellWidth: 58 }, 2: { cellWidth: 22 }, 5: { cellWidth: 22 } }
      : { 0: { cellWidth: 8 }, 1: { cellWidth: 68 }, 5: { cellWidth: 22 } },
    didParseCell: (hook: { section: string; column: { index: number }; cell: { raw: unknown; styles: Record<string, unknown> } }) => {
      if (hook.section !== 'body') return;
      const statusCol = showOrigin ? 5 : 5;
      if (hook.column.index !== statusCol) return;
      const s = String(hook.cell.raw);
      if (s === 'Terminé') {
        hook.cell.styles.fillColor = [209, 250, 229];
        hook.cell.styles.textColor = [4, 120, 87];
        hook.cell.styles.fontStyle = 'bold';
      } else if (s === 'En retard') {
        hook.cell.styles.fillColor = [254, 226, 226];
        hook.cell.styles.textColor = [185, 28, 28];
        hook.cell.styles.fontStyle = 'bold';
      } else if (s === 'En cours') {
        hook.cell.styles.fillColor = [219, 234, 254];
        hook.cell.styles.textColor = [29, 78, 216];
      }
    },
  });

  return (doc.lastAutoTable?.finalY ?? y) + 8;
}

export async function renderMeetingReportPdfDoc(
  data: MeetingReportPdfData,
  jsPDF: new (opts?: Record<string, unknown>) => JsPdfDoc
): Promise<JsPdfDoc> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  const accent = TYPE_ACCENT[data.meeting.meetingType];
  let y = drawCoverHeader(doc, data, accent);

  y = drawSectionTitle(doc, y, 1, 'Ordre du jour', accent.primary);
  const agenda = data.meeting.agenda ?? [];
  if (agenda.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text('Ordre du jour non renseigné.', MARGIN, y);
    y += 8;
  } else {
    agenda.forEach((item, idx) => {
      y = ensureSpace(doc, y, 12);
      doc.setFillColor(...accent.light);
      doc.circle(MARGIN + 3, y + 2, 2.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...accent.primary);
      doc.text(String(idx + 1), MARGIN + 3, y + 2.8, { align: 'center' });
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(9.5);
      doc.text(item.title, MARGIN + 9, y + 2.5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`${item.objective}  ·  ${item.duration} min`, MARGIN + 9, y + 7);
      y += 11;
    });
  }

  y = drawSectionTitle(doc, y + 2, 2, 'Suivi des actions précédentes', accent.primary);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Statut mis à jour lors de cette réunion.', MARGIN, y);
  y = drawActionsTable(doc, y + 4, data.followUpActions, data.meeting.date, true, accent.primary);

  y = drawSectionTitle(doc, y, 3, 'Nouvelles tâches', accent.primary);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Actions décidées — synchronisées vers Tâches & Gantt.', MARGIN, y);
  y = drawActionsTable(doc, y + 4, data.newActions, data.meeting.date, false, accent.primary);

  y = drawSectionTitle(doc, y, 4, 'Décisions', accent.primary);
  const decisions = data.decisions.filter((d) => d.description.trim());
  if (decisions.length === 0) {
    y = ensureSpace(doc, y, 8);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text('Aucune décision enregistrée.', MARGIN, y);
    y += 8;
  } else {
    decisions.forEach((d, i) => {
      y = ensureSpace(doc, y, 16);
      doc.setFillColor(250, 245, 255);
      doc.roundedRect(MARGIN, y, CONTENT_W, 14, 2, 2, 'F');
      doc.setFillColor(...accent.primary);
      doc.circle(MARGIN + 5, y + 7, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.text(String(i + 1), MARGIN + 5, y + 7.6, { align: 'center' });
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(d.description, CONTENT_W - 20);
      doc.text(lines.slice(0, 2), MARGIN + 11, y + 6);
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `${IMPACT_LABELS[d.impact]}  ·  ${d.decidedBy}  ·  ${formatShortDate(d.date)}`,
        MARGIN + 11,
        y + 12
      );
      y += 17;
    });
  }

  if (data.notes.trim()) {
    y = drawSectionTitle(doc, y + 2, 5, 'Notes & tour de table', accent.primary);
    y = ensureSpace(doc, y, 20);
    doc.setFillColor(248, 250, 252);
    const noteLines = doc.splitTextToSize(data.notes.trim(), CONTENT_W - 8);
    const boxH = Math.min(noteLines.length * 4.5 + 8, 80);
    doc.roundedRect(MARGIN, y, CONTENT_W, boxH, 2, 2, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text(noteLines.slice(0, 18), MARGIN + 4, y + 6);
    y += boxH + 6;
  }

  y = drawSectionTitle(doc, y, data.notes.trim() ? 6 : 5, `Participants (${data.meeting.participants.length})`, accent.primary);
  y = ensureSpace(doc, y, 10);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  const participantText = data.meeting.participants.join('   ·   ');
  doc.text(doc.splitTextToSize(participantText, CONTENT_W), MARGIN, y);

  const total = doc.internal.getNumberOfPages();
  for (let p = 1; p <= total; p += 1) {
    doc.setPage(p);
    drawPageFooter(doc, data, p, total);
  }

  return doc;
}

export async function downloadMeetingReportPdfVector(data: MeetingReportPdfData): Promise<void> {
  const { loadJsPdf } = await import('../../vendor/jspdfLoader');
  const { jsPDF } = await loadJsPdf();
  const doc = await renderMeetingReportPdfDoc(data, jsPDF);
  const { meetingReportPdfFilename } = await import('./meetingReportPdf');
  doc.save(meetingReportPdfFilename(data.meeting));
}
