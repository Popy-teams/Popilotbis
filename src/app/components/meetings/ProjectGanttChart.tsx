import { useMemo, useState } from 'react';
import {
  Download,
  BarChart3,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Flag,
  ZoomIn,
} from 'lucide-react';
import type { GanttItem } from '../../types/scrumMeetings';
import { downloadGanttExcel } from '../../utils/ganttExcelExport';
import {
  inferGanttYear,
  getMonthColumns,
  getWeekTicks,
  rangeToPercent,
  todayPercent,
  formatGanttRange,
  dateToPercent,
  parseGanttDate,
  type GanttScale,
  getVisibleMonths,
  monthSpanPercent,
} from '../../utils/ganttTimeline';

interface ProjectGanttChartProps {
  items: GanttItem[];
  projectName: string;
  title?: string;
}

const SCALE_LABELS: Record<GanttScale, string> = {
  year: 'Année entière',
  semester: 'Semestre',
  quarter: 'Trimestre',
};

function groupByCategory(items: GanttItem[]): Map<string, GanttItem[]> {
  const map = new Map<string, GanttItem[]>();
  for (const item of items) {
    const cat = item.category ?? (item.kind === 'milestone' ? 'Jalons mensuels' : 'Tâches & actions');
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat)!.push(item);
  }
  for (const [, list] of map) {
    list.sort((a, b) => a.startDate.localeCompare(b.startDate));
  }
  return map;
}

export function ProjectGanttChart({
  items,
  projectName,
  title = 'Planning projet — vue annuelle',
}: ProjectGanttChartProps) {
  const defaultYear = inferGanttYear(items);
  const [year, setYear] = useState(defaultYear);
  const [scale, setScale] = useState<GanttScale>('year');
  const [focusMonth, setFocusMonth] = useState(new Date().getMonth());

  const milestones = useMemo(
    () => items.filter((i) => i.kind === 'milestone' || i.startDate === i.endDate),
    [items]
  );
  const bars = useMemo(
    () => items.filter((i) => i.kind !== 'milestone' && i.startDate !== i.endDate),
    [items]
  );
  const grouped = useMemo(() => groupByCategory(bars), [bars]);

  const visibleMonths = useMemo(
    () => getVisibleMonths(scale, year, focusMonth),
    [scale, year, focusMonth]
  );
  const weekTicks = useMemo(() => getWeekTicks(year), [year]);
  const todayPct = todayPercent(year);
  const viewSpan = monthSpanPercent(visibleMonths, year);

  const toViewPercent = (pct: number) =>
    scale === 'year' ? pct : ((pct - viewSpan.start) / (viewSpan.end - viewSpan.start)) * 100;

  const inView = (left: number, width: number) =>
    scale === 'year' || (left + width >= viewSpan.start && left <= viewSpan.end);

  const shiftFocus = (delta: number) => {
    if (scale === 'year') {
      setYear((y) => y + delta);
      return;
    }
    const step = scale === 'semester' ? 6 : 3;
    let next = focusMonth + delta * step;
    if (next < 0) {
      setYear((y) => y - 1);
      next = 12 + next;
    } else if (next > 11) {
      setYear((y) => y + 1);
      next = next - 12;
    }
    setFocusMonth(next);
  };

  if (items.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-dashed border-slate-200 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-12 text-center">
        <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-base font-semibold text-slate-700">Planning vide</p>
        <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
          Publiez des comptes rendus avec des tâches pour alimenter le Gantt annuel.
        </p>
      </div>
    );
  }

  const timelineMinWidth = scale === 'year' ? 1280 : scale === 'semester' ? 900 : 640;

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xl shadow-slate-200/40">
      {/* En-tête */}
      <div className="relative px-5 sm:px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-indigo-950 to-violet-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_0%,rgba(99,102,241,0.35),transparent_50%)]" />
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <CalendarRange className="w-4 h-4" />
              {projectName} · {year}
            </div>
            <h3 className="font-bold text-xl tracking-tight">{title}</h3>
            <p className="text-slate-300 text-sm mt-1">
              {items.length} éléments · {milestones.length} jalons · vue {SCALE_LABELS[scale].toLowerCase()}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-xl overflow-hidden border border-white/20 bg-white/10 backdrop-blur-sm">
              {(['year', 'semester', 'quarter'] as GanttScale[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setScale(s)}
                  className={`px-3 py-2 text-xs font-semibold transition-colors ${
                    scale === s ? 'bg-white text-indigo-900' : 'text-white/90 hover:bg-white/10'
                  }`}
                >
                  {SCALE_LABELS[s]}
                </button>
              ))}
            </div>
            <div className="flex items-center rounded-xl border border-white/20 bg-white/10">
              <button type="button" onClick={() => shiftFocus(-1)} className="p-2 hover:bg-white/10" aria-label="Période précédente">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 text-sm font-medium min-w-[4.5rem] text-center">{year}</span>
              <button type="button" onClick={() => shiftFocus(1)} className="p-2 hover:bg-white/10" aria-label="Période suivante">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                void downloadGanttExcel({
                  items,
                  projectName,
                  title,
                  year,
                });
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-white text-indigo-900 rounded-xl hover:bg-indigo-50"
            >
              <Download className="w-4 h-4" />
              Export Excel (.xlsx)
            </button>
          </div>
        </div>
      </div>

      {/* Légende */}
      <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/80 flex flex-wrap gap-4 text-xs text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-indigo-500" /> Exécution
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-emerald-500" /> Réunions / CR
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-violet-500" /> Jalons
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-amber-500" /> Certification
        </span>
        {todayPct != null && (
          <span className="inline-flex items-center gap-1.5 ml-auto font-medium text-red-600">
            <span className="w-0.5 h-4 bg-red-500" /> Aujourd&apos;hui
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <div style={{ minWidth: timelineMinWidth + 240 }}>
          {/* Grille en-tête mois + semaines */}
          <div className="flex border-b border-slate-200">
            <div className="w-56 shrink-0 px-4 py-3 bg-slate-50 border-r border-slate-200 font-semibold text-xs text-slate-500 uppercase tracking-wide sticky left-0 z-20">
              Activité
            </div>
            <div className="flex-1 relative" style={{ minWidth: timelineMinWidth }}>
              {/* Bandes mois */}
              <div className="flex h-10 border-b border-slate-100">
                {visibleMonths.map((m, i) => (
                  <div
                    key={m.index}
                    className={`flex-1 flex items-center justify-center text-xs font-bold border-r border-slate-200/80 last:border-r-0 ${
                      i % 2 === 0 ? 'bg-white text-slate-700' : 'bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span className="hidden sm:inline">{m.label}</span>
                    <span className="sm:hidden">{m.shortLabel}</span>
                  </div>
                ))}
              </div>
              {/* Semaines */}
              <div className="relative h-7 bg-slate-50/50">
                {weekTicks.map((w) => {
                  const d = new Date(year, 0, w.dayOfYear);
                  const raw = dateToPercent(d, year);
                  if (scale !== 'year' && (raw < viewSpan.start || raw > viewSpan.end)) return null;
                  const pct = toViewPercent(raw);
                  return (
                    <div
                      key={w.week}
                      className="absolute top-0 bottom-0 border-l border-slate-200/60"
                      style={{ left: `${pct}%` }}
                    >
                      <span className="absolute -translate-x-1/2 top-1 text-[9px] text-slate-400 font-medium whitespace-nowrap">
                        {w.label}
                      </span>
                    </div>
                  );
                })}
                {todayPct != null && inView(todayPct, 0) && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                    style={{ left: `${toViewPercent(todayPct)}%` }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Piste jalons */}
          {milestones.length > 0 && (
            <div className="flex border-b border-slate-100 bg-violet-50/30">
              <div className="w-56 shrink-0 px-4 py-2 border-r border-slate-200 sticky left-0 z-20 bg-violet-50/80">
                <span className="text-xs font-bold text-violet-800 flex items-center gap-1">
                  <Flag className="w-3.5 h-3.5" /> Jalons
                </span>
              </div>
              <div className="flex-1 relative h-12" style={{ minWidth: timelineMinWidth }}>
                {milestones.map((m) => {
                  const pos = rangeToPercent(m.startDate, m.endDate, year);
                  if (!inView(pos.left, pos.width)) return null;
                  const center = toViewPercent(pos.left + pos.width / 2);
                  return (
                    <div
                      key={m.id}
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center group"
                      style={{ left: `${center}%` }}
                      title={`${m.label} · ${formatGanttRange(m.startDate, m.endDate)}`}
                    >
                      <div
                        className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent drop-shadow-sm"
                        style={{ borderBottomColor: m.color }}
                      />
                      <span className="text-[9px] font-semibold text-violet-900 mt-0.5 max-w-[72px] text-center leading-tight opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 px-1 rounded shadow-sm">
                        {m.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Barres par catégorie */}
          {[...grouped.entries()].map(([category, catItems]) => (
            <div key={category}>
              <div className="flex bg-slate-100/60 border-b border-slate-100">
                <div className="w-56 shrink-0 px-4 py-1.5 border-r border-slate-200 sticky left-0 z-20 bg-slate-100/90">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{category}</span>
                </div>
                <div className="flex-1" style={{ minWidth: timelineMinWidth }} />
              </div>
              {catItems.map((item) => {
                const pos = rangeToPercent(item.startDate, item.endDate, year);
                if (!inView(pos.left, pos.width)) return null;
                const left = toViewPercent(pos.left);
                const width = scale === 'year' ? pos.width : (pos.width / (viewSpan.end - viewSpan.start)) * 100;
                return (
                  <div key={item.id} className="flex border-b border-slate-50 hover:bg-indigo-50/20 transition-colors group/row">
                    <div className="w-56 shrink-0 px-4 py-2.5 border-r border-slate-100 sticky left-0 z-10 bg-white group-hover/row:bg-indigo-50/30">
                      <p className="text-sm font-medium text-slate-800 leading-snug line-clamp-2">{item.label}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 truncate">{item.assignee ?? '—'}</p>
                    </div>
                    <div className="flex-1 relative py-2 pr-2" style={{ minWidth: timelineMinWidth }}>
                      <div className="relative h-8 mx-1">
                        {/* Grille semaine légère */}
                        {weekTicks.map((w) => {
                          const d = new Date(year, 0, w.dayOfYear);
                          const raw = dateToPercent(d, year);
                          if (scale !== 'year' && (raw < viewSpan.start || raw > viewSpan.end)) return null;
                          const pct = toViewPercent(raw);
                          return (
                            <div
                              key={`${item.id}-w${w.week}`}
                              className="absolute top-0 bottom-0 border-l border-slate-100"
                              style={{ left: `${pct}%` }}
                            />
                          );
                        })}
                        <div
                          className="absolute top-1 bottom-1 rounded-md shadow-sm flex items-center px-2 overflow-hidden transition-all group-hover/row:shadow-md group-hover/row:brightness-105"
                          style={{
                            left: `${left}%`,
                            width: `${Math.max(width, 0.5)}%`,
                            background: `linear-gradient(135deg, ${item.color}, ${item.color}dd)`,
                            minWidth: '6px',
                          }}
                          title={`${item.label}\n${formatGanttRange(item.startDate, item.endDate)}\n${item.assignee ?? ''}`}
                        >
                          <span className="text-[10px] font-semibold text-white truncate drop-shadow">
                            {formatGanttRange(item.startDate, item.endDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center gap-2 text-xs text-slate-500">
        <ZoomIn className="w-3.5 h-3.5" />
        Faites défiler horizontalement · Passez en trimestre ou semestre pour zoomer · Les jalons marquent les revues mensuelles
      </div>
    </div>
  );
}
