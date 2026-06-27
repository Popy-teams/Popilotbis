import type { MeetingActionItem, MeetingDecisionItem, ScrumMeetingRecord } from '../types/scrumMeetings';
import { SCRUM_MEETING_LABELS } from '../types/scrumMeetings';
import type { ReportFormState } from './meetingFollowUp';
import { countLateActions, isActionLate } from './meetingFollowUp';

export interface MeetingReportPdfData {
  meeting: ScrumMeetingRecord;
  followUpActions: MeetingActionItem[];
  newActions: MeetingActionItem[];
  decisions: MeetingDecisionItem[];
  notes: string;
  /** Brouillon non publié — affiché sur le bandeau */
  draft?: boolean;
}

const IMPACT_LABELS: Record<MeetingDecisionItem['impact'], string> = {
  planning: 'Planning',
  budget: 'Budget',
  quality: 'Qualité',
  scope: 'Périmètre',
};

const TYPE_ACCENT: Record<ScrumMeetingRecord['meetingType'], { primary: string; secondary: string }> = {
  planning: { primary: '#7c3aed', secondary: '#ede9fe' },
  daily: { primary: '#0284c7', secondary: '#e0f2fe' },
  review: { primary: '#059669', secondary: '#d1fae5' },
  retro: { primary: '#d97706', secondary: '#fef3c7' },
  other: { primary: '#475569', secondary: '#f1f5f9' },
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDateFr(date: string): string {
  try {
    return new Date(`${date}T12:00:00`).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return date;
  }
}

function formatShortDate(date: string): string {
  try {
    return new Date(`${date}T12:00:00`).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return date;
  }
}

function formatMeetingNumber(n: number): string {
  return `n° ${n}`;
}

function formatCrLabel(n: number): string {
  return `CR ${formatMeetingNumber(n)}`;
}

function statusBadge(status: MeetingActionItem['status'], late: boolean): string {
  if (status === 'completed') {
    return '<span class="badge badge-done">Terminé</span>';
  }
  if (late) {
    return '<span class="badge badge-late">En retard</span>';
  }
  if (status === 'in-progress') {
    return '<span class="badge badge-progress">En cours</span>';
  }
  return '<span class="badge badge-pending">À faire</span>';
}

function renderActionsTable(
  actions: MeetingActionItem[],
  referenceDate: string,
  showOrigin: boolean
): string {
  if (actions.length === 0) {
    return '<p class="empty">Aucune action dans cette section.</p>';
  }

  const rows = actions
    .filter((a) => a.description.trim())
    .map(
      (a, i) => `
    <tr class="${i % 2 === 0 ? 'row-even' : 'row-odd'}">
      <td class="col-num">${i + 1}</td>
      <td class="col-desc">${escapeHtml(a.description)}</td>
      ${
        showOrigin
          ? `<td class="col-origin">${
              a.originMeetingNumber != null
                ? escapeHtml(formatCrLabel(a.originMeetingNumber))
                : escapeHtml(a.source)
            }</td>`
          : ''
      }
      <td class="col-assignee">${escapeHtml(a.assignedToName || '—')}</td>
      <td class="col-date">${escapeHtml(formatShortDate(a.startDate ?? referenceDate))}</td>
      <td class="col-date">${escapeHtml(formatShortDate(a.dueDate))}</td>
      <td class="col-status">${statusBadge(a.status, isActionLate(a, referenceDate))}</td>
    </tr>`
    )
    .join('');

  return `
    <table class="data-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Description</th>
          ${showOrigin ? '<th>Origine</th>' : ''}
          <th>Assigné à</th>
          <th>Début</th>
          <th>Échéance</th>
          <th>Statut</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function renderDecisions(decisions: MeetingDecisionItem[]): string {
  if (decisions.length === 0) {
    return '<p class="empty">Aucune décision enregistrée.</p>';
  }
  return decisions
    .filter((d) => d.description.trim())
    .map(
      (d, i) => `
    <div class="decision-card">
      <div class="decision-num">${i + 1}</div>
      <div class="decision-body">
        <p class="decision-text">${escapeHtml(d.description)}</p>
        <div class="decision-meta">
          <span class="badge badge-impact">${escapeHtml(IMPACT_LABELS[d.impact] ?? d.impact)}</span>
          <span>Décideur : ${escapeHtml(d.decidedBy)}</span>
          <span>${escapeHtml(formatShortDate(d.date))}</span>
        </div>
      </div>
    </div>`
    )
    .join('');
}

function renderAgenda(meeting: ScrumMeetingRecord): string {
  const items = meeting.agenda ?? [];
  if (items.length === 0) {
    return '<p class="empty">Ordre du jour non renseigné.</p>';
  }
  return `<ol class="agenda-list">${items
    .map(
      (item) => `
      <li>
        <strong>${escapeHtml(item.title)}</strong>
        <span class="agenda-objective">${escapeHtml(item.objective)}</span>
        <span class="agenda-duration">${item.duration} min</span>
      </li>`
    )
    .join('')}</ol>`;
}

function buildStyles(accent: { primary: string; secondary: string }): string {
  return `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    @page {
      size: A4;
      margin: 14mm 16mm 18mm 16mm;
    }

    html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

    body {
      font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
      font-size: 10pt;
      line-height: 1.55;
      color: #1e293b;
      background: #fff;
    }

    .doc {
      max-width: 210mm;
      margin: 0 auto;
    }

    /* ── En-tête ── */
    .hero {
      position: relative;
      padding: 0 0 20px 0;
      margin-bottom: 24px;
      border-bottom: 1px solid #e2e8f0;
    }

    .hero-accent {
      height: 4px;
      background: linear-gradient(90deg, ${accent.primary}, ${accent.primary}88, #6366f1);
      border-radius: 2px;
      margin-bottom: 20px;
    }

    .hero-kicker {
      font-size: 9pt;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: ${accent.primary};
      margin-bottom: 8px;
    }

    .hero-title {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 22pt;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.25;
      margin-bottom: 10px;
    }

    .hero-subtitle {
      font-size: 11pt;
      color: #64748b;
      font-weight: 500;
    }

    .draft-banner {
      display: inline-block;
      margin-top: 12px;
      padding: 6px 14px;
      background: #fef3c7;
      border: 1px solid #fcd34d;
      border-radius: 999px;
      font-size: 8.5pt;
      font-weight: 600;
      color: #92400e;
    }

    .meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-top: 20px;
    }

    .meta-card {
      background: ${accent.secondary};
      border: 1px solid ${accent.primary}22;
      border-radius: 10px;
      padding: 12px 14px;
    }

    .meta-label {
      font-size: 7.5pt;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #64748b;
      margin-bottom: 4px;
    }

    .meta-value {
      font-size: 10pt;
      font-weight: 600;
      color: #0f172a;
    }

    /* ── Synthèse ── */
    .summary-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 28px;
    }

    .summary-card {
      text-align: center;
      padding: 14px 10px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      background: #fafafa;
    }

    .summary-card.highlight { background: ${accent.secondary}; border-color: ${accent.primary}33; }
    .summary-card.warn { background: #fef2f2; border-color: #fecaca; }
    .summary-card.ok { background: #ecfdf5; border-color: #a7f3d0; }

    .summary-value {
      font-size: 20pt;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.1;
    }

    .summary-value.danger { color: #dc2626; }
    .summary-value.brand { color: ${accent.primary}; }

    .summary-label {
      font-size: 8pt;
      font-weight: 500;
      color: #64748b;
      margin-top: 4px;
    }

    .summary-sub {
      font-size: 7.5pt;
      color: #059669;
      margin-top: 2px;
      font-weight: 600;
    }

    /* ── Sections ── */
    .section {
      margin-bottom: 26px;
      page-break-inside: avoid;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid ${accent.primary};
    }

    .section-num {
      width: 26px;
      height: 26px;
      border-radius: 8px;
      background: ${accent.primary};
      color: #fff;
      font-size: 11pt;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .section-title {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 13pt;
      font-weight: 700;
      color: #0f172a;
    }

    .section-desc {
      font-size: 8.5pt;
      color: #64748b;
      margin-bottom: 12px;
    }

    /* ── Tableaux ── */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8.5pt;
    }

    .data-table thead th {
      background: #f8fafc;
      border-bottom: 2px solid #e2e8f0;
      padding: 8px 10px;
      text-align: left;
      font-weight: 600;
      color: #475569;
      font-size: 7.5pt;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .data-table td {
      padding: 9px 10px;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: top;
    }

    .row-even { background: #fff; }
    .row-odd { background: #fafafa; }

    .col-num { width: 28px; color: #94a3b8; font-weight: 600; }
    .col-desc { font-weight: 500; color: #1e293b; }
    .col-origin { white-space: nowrap; color: #64748b; font-size: 8pt; }
    .col-assignee { white-space: nowrap; }
    .col-date { white-space: nowrap; color: #64748b; }
    .col-status { white-space: nowrap; }

    /* ── Badges ── */
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 999px;
      font-size: 7pt;
      font-weight: 600;
      letter-spacing: 0.02em;
    }

    .badge-done { background: #d1fae5; color: #047857; }
    .badge-late { background: #fee2e2; color: #b91c1c; }
    .badge-progress { background: #dbeafe; color: #1d4ed8; }
    .badge-pending { background: #f1f5f9; color: #475569; }
    .badge-impact { background: #ede9fe; color: #6d28d9; }

    /* ── Décisions ── */
    .decision-card {
      display: flex;
      gap: 12px;
      padding: 12px 14px;
      margin-bottom: 8px;
      background: #faf5ff;
      border: 1px solid #e9d5ff;
      border-radius: 10px;
      page-break-inside: avoid;
    }

    .decision-num {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #7c3aed;
      color: #fff;
      font-size: 9pt;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .decision-text {
      font-weight: 500;
      color: #1e293b;
      margin-bottom: 6px;
    }

    .decision-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      font-size: 7.5pt;
      color: #64748b;
    }

    /* ── Agenda ── */
    .agenda-list {
      list-style: none;
      counter-reset: agenda;
    }

    .agenda-list li {
      counter-increment: agenda;
      display: grid;
      grid-template-columns: 28px 1fr auto;
      gap: 8px 12px;
      padding: 10px 0;
      border-bottom: 1px solid #f1f5f9;
      align-items: start;
    }

    .agenda-list li::before {
      content: counter(agenda);
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: ${accent.secondary};
      color: ${accent.primary};
      font-weight: 700;
      font-size: 9pt;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .agenda-objective {
      display: block;
      font-size: 8.5pt;
      color: #64748b;
      margin-top: 2px;
    }

    .agenda-duration {
      font-size: 8pt;
      color: #94a3b8;
      white-space: nowrap;
      padding-top: 2px;
    }

    /* ── Notes ── */
    .notes-block {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px 18px;
      white-space: pre-wrap;
      font-size: 9.5pt;
      color: #334155;
      line-height: 1.65;
    }

    /* ── Participants ── */
    .participants {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .participant-chip {
      padding: 5px 12px;
      background: #f1f5f9;
      border-radius: 999px;
      font-size: 8.5pt;
      color: #475569;
      font-weight: 500;
    }

    .empty {
      color: #94a3b8;
      font-style: italic;
      font-size: 9pt;
      padding: 8px 0;
    }

    /* ── Pied de page ── */
    .footer {
      margin-top: 32px;
      padding-top: 14px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 7.5pt;
      color: #94a3b8;
    }

    .footer-brand {
      font-weight: 600;
      color: ${accent.primary};
    }

    @media print {
      body { background: #fff; }
      .section { page-break-inside: auto; }
      .data-table tr { page-break-inside: avoid; }
    }
  `;
}

export function buildMeetingReportPdfHtml(data: MeetingReportPdfData): string {
  const { meeting, followUpActions, newActions, decisions, notes, draft } = data;
  const accent = TYPE_ACCENT[meeting.meetingType];
  const typeLabel = SCRUM_MEETING_LABELS[meeting.meetingType];
  const referenceDate = meeting.date;

  const followUpDone = followUpActions.filter((a) => a.status === 'completed').length;
  const lateCount = countLateActions(
    { followUpActions, newActions, decisions, notes, roundTableNotes: notes },
    referenceDate
  );
  const totalActions = followUpActions.length + newActions.length;
  const generatedAt = new Date().toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const sprintLine = meeting.sprintNumber ? ` · Sprint ${meeting.sprintNumber}` : '';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(formatCrLabel(meeting.number))} — ${escapeHtml(meeting.title)}</title>
  <style>${buildStyles(accent)}</style>
</head>
<body>
  <div class="doc">
    <header class="hero">
      <div class="hero-accent"></div>
      <p class="hero-kicker">Compte rendu de réunion</p>
      <h1 class="hero-title">${escapeHtml(meeting.title)}</h1>
      <p class="hero-subtitle">
        ${escapeHtml(formatCrLabel(meeting.number))} · ${escapeHtml(typeLabel)}${escapeHtml(sprintLine)}
      </p>
      ${draft ? '<p class="draft-banner">Brouillon — non publié</p>' : ''}

      <div class="meta-grid">
        <div class="meta-card">
          <p class="meta-label">Projet</p>
          <p class="meta-value">${escapeHtml(meeting.projectName)}</p>
        </div>
        <div class="meta-card">
          <p class="meta-label">Date</p>
          <p class="meta-value">${escapeHtml(formatDateFr(meeting.date))}</p>
        </div>
        <div class="meta-card">
          <p class="meta-label">Horaire</p>
          <p class="meta-value">${escapeHtml(meeting.time)} · ${meeting.duration} min</p>
        </div>
        <div class="meta-card">
          <p class="meta-label">Rédacteur</p>
          <p class="meta-value">${escapeHtml(meeting.writerName)}</p>
        </div>
      </div>
    </header>

    <div class="summary-row">
      <div class="summary-card highlight">
        <p class="summary-value">${followUpActions.length}</p>
        <p class="summary-label">Suivi CR précédent</p>
        ${
          followUpActions.length > 0
            ? `<p class="summary-sub">${followUpDone}/${followUpActions.length} terminées</p>`
            : ''
        }
      </div>
      <div class="summary-card ${lateCount > 0 ? 'warn' : 'ok'}">
        <p class="summary-value ${lateCount > 0 ? 'danger' : ''}">${lateCount}</p>
        <p class="summary-label">Actions en retard</p>
      </div>
      <div class="summary-card">
        <p class="summary-value brand">${newActions.length}</p>
        <p class="summary-label">Nouvelles tâches</p>
      </div>
      <div class="summary-card">
        <p class="summary-value">${totalActions}</p>
        <p class="summary-label">Total actions</p>
      </div>
    </div>

    <section class="section">
      <div class="section-header">
        <span class="section-num">1</span>
        <h2 class="section-title">Ordre du jour</h2>
      </div>
      ${renderAgenda(meeting)}
    </section>

    <section class="section">
      <div class="section-header">
        <span class="section-num">2</span>
        <h2 class="section-title">Suivi des actions précédentes</h2>
      </div>
      <p class="section-desc">Tâches issues des comptes rendus antérieurs — statut mis à jour lors de cette réunion.</p>
      ${renderActionsTable(followUpActions, referenceDate, true)}
    </section>

    <section class="section">
      <div class="section-header">
        <span class="section-num">3</span>
        <h2 class="section-title">Nouvelles tâches</h2>
      </div>
      <p class="section-desc">Actions décidées lors de cette réunion — synchronisées vers Tâches et Gantt.</p>
      ${renderActionsTable(newActions, referenceDate, false)}
    </section>

    <section class="section">
      <div class="section-header">
        <span class="section-num">4</span>
        <h2 class="section-title">Décisions</h2>
      </div>
      ${renderDecisions(decisions)}
    </section>

    ${
      notes.trim()
        ? `
    <section class="section">
      <div class="section-header">
        <span class="section-num">5</span>
        <h2 class="section-title">Notes & tour de table</h2>
      </div>
      <div class="notes-block">${escapeHtml(notes)}</div>
    </section>`
        : ''
    }

    <section class="section">
      <div class="section-header">
        <span class="section-num">${notes.trim() ? '6' : '5'}</span>
        <h2 class="section-title">Participants (${meeting.participants.length})</h2>
      </div>
      <div class="participants">
        ${meeting.participants.map((p) => `<span class="participant-chip">${escapeHtml(p)}</span>`).join('')}
      </div>
    </section>

    <footer class="footer">
      <span class="footer-brand">Popilot</span>
      <span>Document généré le ${escapeHtml(generatedAt)}</span>
      <span>${escapeHtml(meeting.projectName)} · ${escapeHtml(formatCrLabel(meeting.number))}</span>
    </footer>
  </div>
</body>
</html>`;
}

export function pdfDataFromMeeting(meeting: ScrumMeetingRecord): MeetingReportPdfData {
  const actions = meeting.actions ?? [];
  return {
    meeting,
    followUpActions: actions.filter((a) => a.carryOver),
    newActions: actions.filter((a) => !a.carryOver),
    decisions: meeting.decisions ?? [],
    notes: meeting.notes ?? '',
    draft: false,
  };
}

export function pdfDataFromForm(
  meeting: ScrumMeetingRecord,
  form: ReportFormState,
  draft = true
): MeetingReportPdfData {
  return {
    meeting,
    followUpActions: form.followUpActions,
    newActions: form.newActions,
    decisions: form.decisions,
    notes: form.notes,
    draft,
  };
}

function mountReportIframe(html: string): HTMLIFrameElement {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.setAttribute('title', 'Export PDF');
  Object.assign(iframe.style, {
    position: 'fixed',
    left: '-10000px',
    top: '0',
    width: '794px',
    border: 'none',
    visibility: 'hidden',
  });
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(iframe);
    throw new Error('Impossible de préparer le document PDF.');
  }

  doc.open();
  doc.write(html);
  doc.close();

  return iframe;
}

function waitForIframe(iframe: HTMLIFrameElement): Promise<void> {
  return new Promise((resolve) => {
    const done = () => resolve();
    iframe.addEventListener('load', done, { once: true });
    setTimeout(done, 600);
  });
}

/** Télécharge le CR en PDF vectoriel haute qualité (jsPDF + autotable). */
export async function downloadMeetingReportPdf(data: MeetingReportPdfData): Promise<void> {
  const { downloadMeetingReportPdfVector } = await import('./meetingReportPdfDoc');
  await downloadMeetingReportPdfVector(data);
}

/** Fallback : impression via iframe cachée (Enregistrer en PDF dans la boîte de dialogue). */
export function printMeetingReportPdf(data: MeetingReportPdfData): void {
  const html = buildMeetingReportPdfHtml(data);
  const iframe = mountReportIframe(html);

  void waitForIframe(iframe).then(() => {
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } finally {
        setTimeout(() => {
          if (iframe.parentNode) document.body.removeChild(iframe);
        }, 1500);
      }
    }, 400);
  });
}

/** Nom de fichier suggéré pour l'enregistrement PDF. */
export function meetingReportPdfFilename(meeting: ScrumMeetingRecord): string {
  const slug = meeting.title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  return `CR-${meeting.number}-${slug || 'reunion'}.pdf`;
}
