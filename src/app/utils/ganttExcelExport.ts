import type { GanttItem } from '../types/scrumMeetings';
import {
  inferGanttYear,
  parseGanttDate,
  getMonthColumns,
  getWeekTicks,
  formatGanttRange,
  type WeekTick,
} from './ganttTimeline';
import type { StyledSheet, XlsxStyleLib } from '../../vendor/xlsxStyleLoader';

const MS_DAY = 86_400_000;

export interface GanttExcelExportOptions {
  items: GanttItem[];
  projectName: string;
  title?: string;
  year?: number;
}

function durationDays(startIso: string, endIso: string): number {
  const s = parseGanttDate(startIso);
  const e = parseGanttDate(endIso);
  return Math.max(1, Math.round((e.getTime() - s.getTime()) / MS_DAY) + 1);
}

function formatDateFr(iso: string): string {
  return parseGanttDate(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function itemType(item: GanttItem): string {
  if (item.kind === 'milestone' || item.startDate === item.endDate) return 'Jalon';
  return 'Tâche';
}

function itemCategory(item: GanttItem): string {
  return item.category ?? (item.kind === 'milestone' ? 'Jalons mensuels' : 'Tâches & actions');
}

function sourceLabel(item: GanttItem): string {
  if (item.source === 'meeting') return 'Compte rendu';
  if (item.source === 'manual') return 'Manuel';
  return item.source ?? '—';
}

function weekBounds(year: number, tick: WeekTick): { start: Date; end: Date } {
  const start = new Date(year, 0, tick.dayOfYear);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return { start, end };
}

function overlapsRange(item: GanttItem, rangeStart: Date, rangeEnd: Date): boolean {
  const s = parseGanttDate(item.startDate);
  const e = parseGanttDate(item.endDate);
  return s.getTime() <= rangeEnd.getTime() && e.getTime() >= rangeStart.getTime();
}

function monthForWeek(year: number, tick: WeekTick): number {
  return weekBounds(year, tick).start.getMonth();
}

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 36);
}

function sortItems(items: GanttItem[]): GanttItem[] {
  return [...items].sort((a, b) => {
    const cat = itemCategory(a).localeCompare(itemCategory(b), 'fr');
    if (cat !== 0) return cat;
    return a.startDate.localeCompare(b.startDate);
  });
}

function hexRgb(hex: string): string {
  const c = hex.replace('#', '').trim();
  if (c.length === 3) return c.split('').map((ch) => ch + ch).join('').toUpperCase();
  return c.slice(0, 6).toUpperCase();
}

function borderAll(color = 'E2E8F0', style: 'thin' | 'medium' = 'thin') {
  const b = { style, color: { rgb: color } };
  return { top: b, bottom: b, left: b, right: b };
}

const ST = {
  brandTitle: {
    font: { bold: true, sz: 14, color: { rgb: 'FFFFFF' } },
    fill: { patternType: 'solid', fgColor: { rgb: '312E81' } },
    alignment: { vertical: 'center' },
  },
  brandSub: {
    font: { sz: 10, color: { rgb: 'C7D2FE' } },
    fill: { patternType: 'solid', fgColor: { rgb: '312E81' } },
  },
  cornerHeader: {
    font: { bold: true, sz: 9, color: { rgb: 'FFFFFF' } },
    fill: { patternType: 'solid', fgColor: { rgb: '4338CA' } },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border: borderAll('4338CA'),
  },
  monthHeader: {
    font: { bold: true, sz: 9, color: { rgb: '1E293B' } },
    fill: { patternType: 'solid', fgColor: { rgb: 'E2E8F0' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: borderAll('CBD5E1'),
  },
  weekHeader: (today = false) => ({
    font: { bold: today, sz: 8, color: { rgb: today ? 'B91C1C' : '64748B' } },
    fill: { patternType: 'solid', fgColor: { rgb: today ? 'FEE2E2' : 'F8FAFC' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: borderAll(today ? 'FCA5A5' : 'F1F5F9'),
  }),
  activityLabel: {
    font: { sz: 10, color: { rgb: '0F172A' } },
    alignment: { vertical: 'center', wrapText: true },
    fill: { patternType: 'solid', fgColor: { rgb: 'FFFFFF' } },
    border: {
      right: { style: 'medium', color: { rgb: 'CBD5E1' } },
      bottom: { style: 'thin', color: { rgb: 'F1F5F9' } },
      top: { style: 'thin', color: { rgb: 'F1F5F9' } },
      left: { style: 'thin', color: { rgb: 'F1F5F9' } },
    },
  },
  categoryBand: {
    font: { bold: true, sz: 9, color: { rgb: '475569' } },
    fill: { patternType: 'solid', fgColor: { rgb: 'F1F5F9' } },
    alignment: { vertical: 'center' },
    border: borderAll('E2E8F0'),
  },
  gridCell: (today = false) => ({
    fill: { patternType: 'solid', fgColor: { rgb: today ? 'FEF2F2' : 'FFFFFF' } },
    border: borderAll(today ? 'FECACA' : 'F1F5F9'),
  }),
  barCell: (color: string, withLabel = false) => ({
    fill: { patternType: 'solid', fgColor: { rgb: hexRgb(color) } },
    font: {
      bold: withLabel,
      sz: 8,
      color: { rgb: 'FFFFFF' },
    },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border: {
      top: { style: 'thin', color: { rgb: 'FFFFFF' } },
      bottom: { style: 'thin', color: { rgb: 'FFFFFF' } },
      left: { style: 'thin', color: { rgb: 'FFFFFF' } },
      right: { style: 'thin', color: { rgb: 'FFFFFF' } },
    },
  }),
  milestoneCell: {
    fill: { patternType: 'solid', fgColor: { rgb: '7C3AED' } },
    font: { bold: true, sz: 11, color: { rgb: 'FFFFFF' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: borderAll('FFFFFF'),
  },
  tableHead: {
    font: { bold: true, sz: 9, color: { rgb: 'FFFFFF' } },
    fill: { patternType: 'solid', fgColor: { rgb: '312E81' } },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border: borderAll('4338CA'),
  },
  tableRow: (alt: boolean) => ({
    font: { sz: 9, color: { rgb: '334155' } },
    fill: { patternType: 'solid', fgColor: { rgb: alt ? 'FAFAFA' : 'FFFFFF' } },
    alignment: { vertical: 'center', wrapText: true },
    border: borderAll('F1F5F9'),
  }),
};

function setCell(
  ws: StyledSheet,
  XLSX: XlsxStyleLib,
  r: number,
  c: number,
  value: string | number,
  style: Record<string, unknown>
): void {
  const addr = XLSX.utils.encode_cell({ r, c });
  ws[addr] = {
    v: value,
    t: typeof value === 'number' ? 'n' : 's',
    s: style,
  };
}

function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}

function todayWeekIndex(year: number, weeks: WeekTick[]): number | null {
  const now = new Date();
  if (now.getFullYear() !== year) return null;
  const idx = weeks.findIndex((w) => {
    const { start, end } = weekBounds(year, w);
    return now >= start && now <= end;
  });
  return idx >= 0 ? idx : null;
}

function buildVisualGanttSheet(
  items: GanttItem[],
  year: number,
  title: string,
  projectName: string,
  XLSX: XlsxStyleLib
): StyledSheet {
  const weeks = getWeekTicks(year);
  const months = getMonthColumns(year);
  const tasks = sortItems(items.filter((i) => itemType(i) === 'Tâche'));
  const milestones = sortItems(items.filter((i) => itemType(i) === 'Jalon'));
  const todayIdx = todayWeekIndex(year, weeks);
  const ws: StyledSheet = {};
  const merges: StyledSheet['!merges'] = [];
  let row = 0;
  const lastCol = weeks.length;

  setCell(ws, XLSX, row, 0, title, ST.brandTitle);
  merges.push({ s: { r: row, c: 0 }, e: { r: row, c: lastCol } });
  row += 1;
  setCell(ws, XLSX, row, 0, `${projectName} · ${year} · Diagramme de Gantt`, ST.brandSub);
  merges.push({ s: { r: row, c: 0 }, e: { r: row, c: lastCol } });
  row += 2;

  const timelineHeaderRow = row;
  setCell(ws, XLSX, row, 0, 'Activités / Timeline', ST.cornerHeader);

  let col = 1;
  let wi = 0;
  for (const m of months) {
    let count = 0;
    const startCol = col;
    while (wi < weeks.length && monthForWeek(year, weeks[wi]) === m.index) {
      count += 1;
      wi += 1;
    }
    if (count === 0) continue;
    setCell(ws, XLSX, row, startCol, m.label.toUpperCase(), ST.monthHeader);
    for (let j = 1; j < count; j += 1) {
      setCell(ws, XLSX, row, startCol + j, '', ST.monthHeader);
    }
    if (count > 1) {
      merges.push({ s: { r: row, c: startCol }, e: { r: row, c: startCol + count - 1 } });
    }
    col += count;
  }
  row += 1;

  setCell(ws, XLSX, row, 0, '', ST.weekHeader());
  weeks.forEach((w, i) => {
    setCell(ws, XLSX, row, i + 1, w.label, ST.weekHeader(i === todayIdx));
  });
  row += 1;

  setCell(ws, XLSX, row, 0, '◆  Jalons mensuels', ST.activityLabel);
  weeks.forEach((w, i) => {
    const { start, end } = weekBounds(year, w);
    const hit = milestones.some((m) => overlapsRange(m, start, end));
    if (hit) setCell(ws, XLSX, row, i + 1, '◆', ST.milestoneCell);
    else setCell(ws, XLSX, row, i + 1, '', ST.gridCell(i === todayIdx));
  });
  row += 1;

  let currentCat = '';
  for (const item of tasks) {
    const cat = itemCategory(item);
    if (cat !== currentCat) {
      currentCat = cat;
      setCell(ws, XLSX, row, 0, cat.toUpperCase(), ST.categoryBand);
      weeks.forEach((_, i) => setCell(ws, XLSX, row, i + 1, '', ST.categoryBand));
      row += 1;
    }

    const meta = item.assignee ? `${item.label}  (${item.assignee})` : item.label;
    setCell(ws, XLSX, row, 0, meta, ST.activityLabel);

    let firstBarCol = true;
    weeks.forEach((w, i) => {
      const { start, end } = weekBounds(year, w);
      const active = overlapsRange(item, start, end);
      if (!active) {
        setCell(ws, XLSX, row, i + 1, '', ST.gridCell(i === todayIdx));
        return;
      }
      const label = firstBarCol ? truncate(item.label, 10) : '';
      firstBarCol = false;
      setCell(ws, XLSX, row, i + 1, label, ST.barCell(item.color, label.length > 0));
    });
    row += 1;
  }

  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: row - 1, c: lastCol } });
  ws['!merges'] = merges;
  ws['!cols'] = [{ wch: 42 }, ...weeks.map(() => ({ wch: 3.8 }))];
  ws['!rows'] = Array.from({ length: row }, (_, i) => ({
    hpt: i <= 1 ? 22 : i === timelineHeaderRow || i === timelineHeaderRow + 1 ? 20 : 18,
  }));
  ws['!pane'] = {
    xSplit: 1,
    ySplit: timelineHeaderRow + 2,
    topLeftCell: XLSX.utils.encode_cell({ r: timelineHeaderRow + 2, c: 1 }),
    activePane: 'bottomRight',
    state: 'frozen',
  };

  return ws;
}

function buildStyledTableSheet(
  rows: (string | number)[][],
  XLSX: XlsxStyleLib,
  headStyle = ST.tableHead
): StyledSheet {
  const ws: StyledSheet = {};
  rows.forEach((row, r) => {
    row.forEach((val, c) => {
      const style = r === 0 ? headStyle : ST.tableRow(r % 2 === 0);
      setCell(ws, XLSX, r, c, val, style);
    });
  });
  ws['!ref'] = XLSX.utils.encode_range({
    s: { r: 0, c: 0 },
    e: { r: rows.length - 1, c: rows[0].length - 1 },
  });
  return ws;
}

function buildDetailRows(items: GanttItem[]): (string | number)[][] {
  const sorted = sortItems(items);
  return [
    ['Catégorie', 'Libellé', 'Type', 'Début', 'Fin', 'Durée (j)', 'Assigné', 'Source', 'Période'],
    ...sorted.map((item) => [
      itemCategory(item),
      item.label,
      itemType(item),
      formatDateFr(item.startDate),
      formatDateFr(item.endDate),
      durationDays(item.startDate, item.endDate),
      item.assignee ?? '—',
      sourceLabel(item),
      formatGanttRange(item.startDate, item.endDate),
    ]),
  ];
}

function buildGanttGridRows(items: GanttItem[], year: number): unknown[][] {
  const weeks = getWeekTicks(year);
  const sorted = sortItems(items.filter((i) => itemType(i) === 'Tâche'));
  return [
    ['Activité', ...weeks.map((w) => w.label)],
    ...sorted.map((item) => [
      item.label,
      ...weeks.map((w) => {
        const { start, end } = weekBounds(year, w);
        return overlapsRange(item, start, end) ? 1 : '';
      }),
    ]),
  ];
}

export { buildDetailRows, buildGanttGridRows };

export function buildGanttWorkbook(options: GanttExcelExportOptions, xlsx: XlsxStyleLib): unknown {
  const { items, projectName, title = 'Planning projet — vue annuelle' } = options;
  const year = options.year ?? inferGanttYear(items);
  const generatedAt = new Date().toLocaleString('fr-FR');

  const wb = xlsx.utils.book_new();

  const wsGantt = buildVisualGanttSheet(items, year, title, projectName, xlsx);
  xlsx.utils.book_append_sheet(wb, wsGantt, 'Diagramme Gantt');

  const summaryRows: (string | number)[][] = [
    ['Popilot — Planning annuel', ''],
    [`${projectName} · ${year}`, ''],
    [`Exporté le ${generatedAt}`, ''],
    [],
    ['Indicateur', 'Valeur'],
    ['Éléments', items.length],
    ['Jalons', items.filter((i) => itemType(i) === 'Jalon').length],
    ['Tâches', items.filter((i) => itemType(i) === 'Tâche').length],
  ];
  const wsSummary = buildStyledTableSheet(summaryRows, xlsx, {
    ...ST.tableHead,
    font: { bold: true, sz: 11, color: { rgb: 'FFFFFF' } },
  });
  wsSummary['!cols'] = [{ wch: 36 }, { wch: 14 }];
  xlsx.utils.book_append_sheet(wb, wsSummary, 'Synthèse');

  const wsDetail = buildStyledTableSheet(buildDetailRows(items), xlsx);
  wsDetail['!cols'] = [{ wch: 18 }, { wch: 36 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 16 }, { wch: 12 }, { wch: 22 }];
  wsDetail['!pane'] = { ySplit: 1, topLeftCell: 'A2', activePane: 'bottomLeft', state: 'frozen' };
  xlsx.utils.book_append_sheet(wb, wsDetail, 'Planning détaillé');

  const milestones = sortItems(items.filter((i) => itemType(i) === 'Jalon'));
  const wsMilestones = buildStyledTableSheet(
    [
      ['Date', 'Jalon', 'Catégorie', 'Mois'],
      ...milestones.map((m) => [
        formatDateFr(m.startDate),
        m.label,
        itemCategory(m),
        parseGanttDate(m.startDate).toLocaleDateString('fr-FR', { month: 'long' }),
      ]),
    ],
    xlsx
  );
  wsMilestones['!cols'] = [{ wch: 12 }, { wch: 36 }, { wch: 18 }, { wch: 14 }];
  xlsx.utils.book_append_sheet(wb, wsMilestones, 'Jalons');

  return wb;
}

export function ganttExcelFilename(projectName: string, year: number): string {
  return `Gantt-${slugify(projectName) || 'projet'}-${year}.xlsx`;
}

export async function downloadGanttExcel(options: GanttExcelExportOptions): Promise<void> {
  const { loadXlsxStyle } = await import('../../vendor/xlsxStyleLoader');
  const XLSX = await loadXlsxStyle();
  const year = options.year ?? inferGanttYear(options.items);
  const wb = buildGanttWorkbook({ ...options, year }, XLSX);
  XLSX.writeFile(wb, ganttExcelFilename(options.projectName, year));
}

/** @deprecated */
export function buildGanttExcelXml(options: GanttExcelExportOptions): string {
  return `[xlsx: ${options.projectName}]`;
}
