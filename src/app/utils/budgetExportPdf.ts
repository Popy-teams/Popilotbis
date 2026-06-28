import type { JsPdfDoc } from '../../vendor/jspdfLoader';
import type { BOMComponent, BudgetTracking, FundingSource, Quote, Supplier } from '../types/budget';
import {
  getComponentStatusLabel,
  getFundingStatusLabel,
  getQuoteStatusLabel,
  getSupplierTypeLabel,
} from '../types/budget';
import type { BOMCategoryDefinition } from './budgetCategoryStore';
import { getCategoryLabel } from './budgetCategoryStore';

export interface BudgetPdfData {
  projectName: string;
  exportedAt: string;
  tracking: BudgetTracking;
  bom: BOMComponent[];
  quotes: Quote[];
  suppliers: Supplier[];
  funding: FundingSource[];
  categories: BOMCategoryDefinition[];
}

const PAGE_W = 210;
const MARGIN = 14;
const CONTENT_W = PAGE_W - MARGIN * 2;
const FOOTER_Y = 287;
const PRIMARY: [number, number, number] = [5, 150, 105];

function fmtEuro(n: number): string {
  return `${n.toFixed(2).replace('.', ',')} €`;
}

function fmtDateFr(iso: string): string {
  return new Date(iso.includes('T') ? iso : `${iso}T12:00:00`).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function ensureSpace(doc: JsPdfDoc, y: number, needed: number): number {
  const pageH = doc.internal.pageSize.getHeight();
  if (y + needed > pageH - 24) {
    doc.addPage();
    return 22;
  }
  return y;
}

function drawFooters(doc: JsPdfDoc, projectName: string): void {
  const total = doc.internal.getNumberOfPages();
  for (let p = 1; p <= total; p += 1) {
    doc.setPage(p);
    doc.setDrawColor(226, 232, 240);
    doc.line(MARGIN, FOOTER_Y - 4, PAGE_W - MARGIN, FOOTER_Y - 4);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('Popilot · Budget & BOM', MARGIN, FOOTER_Y);
    doc.text(projectName, PAGE_W / 2, FOOTER_Y, { align: 'center' });
    doc.text(`Page ${p} / ${total}`, PAGE_W - MARGIN, FOOTER_Y, { align: 'right' });
  }
}

function drawCover(doc: JsPdfDoc, data: BudgetPdfData): number {
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, PAGE_W, 48, 'F');
  doc.setFillColor(4, 120, 87);
  doc.rect(0, 48, PAGE_W, 4, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('RAPPORT BUDGÉTAIRE · BOM', MARGIN, 14);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(data.projectName, MARGIN, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Exporté le ${fmtDateFr(data.exportedAt)}`, MARGIN, 38);

  let y = 62;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Synthèse financière', MARGIN, y);
  y += 8;

  const kpis = [
    ['Budget estimé', fmtEuro(data.tracking.estimatedTotal)],
    ['Budget validé', fmtEuro(data.tracking.validatedTotal)],
    ['Budget engagé', fmtEuro(data.tracking.committedTotal)],
    [
      'Écart',
      `${data.tracking.deviationPercent > 0 ? '+' : ''}${data.tracking.deviationPercent.toFixed(1)} % (${fmtEuro(data.tracking.deviationAmount)})`,
    ],
  ];

  doc.autoTable({
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [['Indicateur', 'Montant']],
    body: kpis,
    theme: 'grid',
    headStyles: { fillColor: PRIMARY, textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: [51, 65, 85] },
    columnStyles: { 0: { cellWidth: 70 }, 1: { halign: 'right' } },
  });

  return (doc.lastAutoTable?.finalY ?? y) + 12;
}

function sectionTitle(doc: JsPdfDoc, y: number, title: string): number {
  y = ensureSpace(doc, y, 14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...PRIMARY);
  doc.text(title, MARGIN, y);
  doc.setDrawColor(...PRIMARY);
  doc.setLineWidth(0.4);
  doc.line(MARGIN, y + 2, MARGIN + 42, y + 2);
  return y + 10;
}

function tableSection(
  doc: JsPdfDoc,
  y: number,
  title: string,
  head: string[],
  body: string[][],
  columnStyles?: Record<number, { cellWidth?: number; halign?: string }>
): number {
  y = sectionTitle(doc, y, title);
  if (body.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('Aucune donnée', MARGIN, y);
    return y + 10;
  }
  doc.autoTable({
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [head],
    body,
    theme: 'striped',
    headStyles: { fillColor: [241, 245, 249], textColor: [51, 65, 85], fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 8, textColor: [51, 65, 85] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles,
  });
  return (doc.lastAutoTable?.finalY ?? y) + 10;
}

export async function renderBudgetPdfDoc(
  data: BudgetPdfData,
  jsPDF: new (opts?: Record<string, unknown>) => JsPdfDoc
): Promise<JsPdfDoc> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  let y = drawCover(doc, data);

  y = tableSection(
    doc,
    y,
    `Bill of Materials (${data.bom.length} composants)`,
    ['Composant', 'Catégorie', 'Qté', 'Estimé', 'Statut'],
    data.bom.map((c) => [
      c.functionalName || c.name,
      getCategoryLabel(c.category, data.categories),
      String(c.quantity),
      fmtEuro(c.totalEstimated),
      getComponentStatusLabel(c.status),
    ]),
    { 3: { halign: 'right' }, 4: { cellWidth: 28 } }
  );

  y = tableSection(
    doc,
    y,
    `Devis (${data.quotes.length})`,
    ['Référence', 'Fournisseur', 'Montant TTC', 'Statut', 'Reçu le'],
    data.quotes.map((q) => [
      q.reference,
      q.supplierName,
      fmtEuro(q.amountTTC),
      getQuoteStatusLabel(q.status),
      fmtDateFr(q.receivedAt),
    ]),
    { 2: { halign: 'right' } }
  );

  y = tableSection(
    doc,
    y,
    `Fournisseurs (${data.suppliers.length})`,
    ['Nom', 'Type', 'Pays', 'Fiabilité', 'Composants'],
    data.suppliers.map((s) => [
      s.name,
      getSupplierTypeLabel(s.type),
      s.country,
      `${s.reliability}/5`,
      String(s.componentIds.length),
    ])
  );

  y = tableSection(
    doc,
    y,
    `Financement (${data.funding.length})`,
    ['Source', 'Montant', 'Statut', 'Échéance'],
    data.funding.map((f) => [
      f.title,
      f.amountLabel || '—',
      getFundingStatusLabel(f.status),
      f.deadline ? fmtDateFr(f.deadline) : '—',
    ])
  );

  const catRows = data.categories
    .map((cat) => {
      const est = data.tracking.estimatedByCategory[cat.id] ?? 0;
      const val = data.tracking.validatedByCategory[cat.id] ?? 0;
      if (est <= 0 && val <= 0) return null;
      const pct = est > 0 ? ((val / est) * 100).toFixed(0) : '0';
      return [cat.label, fmtEuro(est), fmtEuro(val), `${pct} %`];
    })
    .filter(Boolean) as string[][];

  tableSection(
    doc,
    y,
    'Suivi par catégorie',
    ['Catégorie', 'Estimé', 'Validé', 'Taux'],
    catRows,
    { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' } }
  );

  drawFooters(doc, data.projectName);
  return doc;
}

export function budgetPdfFilename(projectName: string): string {
  const slug = projectName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  const date = new Date().toISOString().slice(0, 10);
  return `budget-bom-${slug || 'projet'}-${date}.pdf`;
}

export async function downloadBudgetPdf(data: BudgetPdfData): Promise<void> {
  const { loadJsPdf } = await import('../../vendor/jspdfLoader');
  const { jsPDF } = await loadJsPdf();
  const doc = await renderBudgetPdfDoc(data, jsPDF);
  doc.save(budgetPdfFilename(data.projectName));
}
