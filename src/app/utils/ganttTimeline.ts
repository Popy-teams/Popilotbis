const MS_DAY = 86_400_000;

export function parseGanttDate(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function startOfYear(year: number): Date {
  return new Date(year, 0, 1);
}

export function endOfYear(year: number): Date {
  return new Date(year, 11, 31);
}

export function daysInYear(year: number): number {
  return (endOfYear(year).getTime() - startOfYear(year).getTime()) / MS_DAY + 1;
}

export function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / MS_DAY);
}

export function inferGanttYear(items: { startDate: string; endDate: string }[]): number {
  if (items.length === 0) return new Date().getFullYear();
  const years = items.flatMap((i) => [i.startDate, i.endDate].map((d) => parseGanttDate(d).getFullYear()));
  return Math.min(...years);
}

export interface MonthColumn {
  index: number;
  label: string;
  shortLabel: string;
  year: number;
  startDay: number;
  endDay: number;
}

export interface WeekTick {
  week: number;
  dayOfYear: number;
  label: string;
}

const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

const MONTH_SHORT = [
  'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
  'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.',
];

export function getMonthColumns(year: number): MonthColumn[] {
  return MONTH_NAMES.map((label, index) => {
    const start = new Date(year, index, 1);
    const end = new Date(year, index + 1, 0);
    return {
      index,
      label,
      shortLabel: MONTH_SHORT[index],
      year,
      startDay: dayOfYear(start),
      endDay: dayOfYear(end),
    };
  });
}

/** Lundi de chaque semaine ISO-like pour la grille */
export function getWeekTicks(year: number): WeekTick[] {
  const ticks: WeekTick[] = [];
  const d = new Date(year, 0, 1);
  while (d.getDay() !== 1) d.setDate(d.getDate() + 1);
  let week = 1;
  while (d.getFullYear() === year) {
    ticks.push({
      week,
      dayOfYear: dayOfYear(d),
      label: `S${week}`,
    });
    d.setDate(d.getDate() + 7);
    week += 1;
  }
  return ticks;
}

export function dateToPercent(date: Date, year: number): number {
  const total = daysInYear(year);
  const doy = dayOfYear(date);
  return Math.max(0, Math.min(100, ((doy - 1) / total) * 100));
}

export function rangeToPercent(
  startIso: string,
  endIso: string,
  year: number
): { left: number; width: number } {
  const start = parseGanttDate(startIso);
  const end = parseGanttDate(endIso);
  const left = dateToPercent(start, year);
  const right = dateToPercent(end, year);
  return {
    left,
    width: Math.max(right - left, 0.35),
  };
}

export function todayPercent(year: number): number | null {
  const now = new Date();
  if (now.getFullYear() !== year) return null;
  return dateToPercent(now, year);
}

export function formatGanttRange(start: string, end: string): string {
  const s = parseGanttDate(start);
  const e = parseGanttDate(end);
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  if (start === end) return s.toLocaleDateString('fr-FR', opts);
  return `${s.toLocaleDateString('fr-FR', opts)} → ${e.toLocaleDateString('fr-FR', opts)}`;
}

export type GanttScale = 'year' | 'semester' | 'quarter';

export function getVisibleMonths(scale: GanttScale, year: number, focusMonth = new Date().getMonth()): MonthColumn[] {
  const all = getMonthColumns(year);
  if (scale === 'year') return all;
  if (scale === 'semester') {
    const half = focusMonth < 6 ? 0 : 6;
    return all.slice(half, half + 6);
  }
  const q = Math.floor(focusMonth / 3) * 3;
  return all.slice(q, q + 3);
}

export function monthSpanPercent(months: MonthColumn[], year: number): { start: number; end: number } {
  if (months.length === 0) return { start: 0, end: 100 };
  const total = daysInYear(year);
  const start = ((months[0].startDay - 1) / total) * 100;
  const end = (months[months.length - 1].endDay / total) * 100;
  return { start, end };
}
