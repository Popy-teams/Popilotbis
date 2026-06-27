import type { ScrumMeetingRecord } from '../types/scrumMeetings';
import type { TestTask } from '../data/testData';
import { SCRUM_MEETING_LABELS } from '../types/scrumMeetings';

export interface PlanningCalendarEventLike {
  id: string;
  title: string;
  date: Date;
  type: string;
  time?: string;
  priority?: string;
  linkedMeetingId?: string;
  ceremonyType?: string;
}

export interface PlanningInsight {
  id: string;
  tone: 'info' | 'warning' | 'success' | 'action';
  title: string;
  detail: string;
  /** Action suggérée */
  cta?: string;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / 86_400_000);
}

function sameDay(a: Date, b: Date): boolean {
  return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
}

export function eventsThisWeek(events: PlanningCalendarEventLike[], ref = new Date()): PlanningCalendarEventLike[] {
  const start = startOfDay(ref);
  const day = start.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const weekStart = new Date(start);
  weekStart.setDate(weekStart.getDate() + mondayOffset);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  return events.filter((e) => {
    const d = startOfDay(e.date);
    return d >= weekStart && d <= weekEnd;
  });
}

export function countByType(events: PlanningCalendarEventLike[]): Record<string, number> {
  return events.reduce<Record<string, number>>((acc, e) => {
    acc[e.type] = (acc[e.type] ?? 0) + 1;
    return acc;
  }, {});
}

export function busyDaysInMonth(
  events: PlanningCalendarEventLike[],
  month: Date
): { date: Date; count: number }[] {
  const map = new Map<string, number>();
  for (const e of events) {
    if (e.date.getMonth() !== month.getMonth() || e.date.getFullYear() !== month.getFullYear()) continue;
    const key = e.date.toISOString().slice(0, 10);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([k, count]) => ({ date: new Date(`${k}T12:00:00`), count }))
    .sort((a, b) => b.count - a.count);
}

export function buildPlanningInsights(
  events: PlanningCalendarEventLike[],
  meetings: ScrumMeetingRecord[],
  tasks: TestTask[],
  ref = new Date()
): PlanningInsight[] {
  const insights: PlanningInsight[] = [];
  const upcoming = events
    .filter((e) => startOfDay(e.date) >= startOfDay(ref))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const week = eventsThisWeek(events, ref);
  if (week.length >= 8) {
    insights.push({
      id: 'busy-week',
      tone: 'warning',
      title: 'Semaine dense',
      detail: `${week.length} événements planifiés cette semaine — anticipez la préparation des CR et des démos.`,
    });
  }

  const criticalDeadlines = upcoming.filter(
    (e) => e.type === 'deadline' && e.priority === 'high' && daysBetween(ref, e.date) <= 14
  );
  if (criticalDeadlines.length > 0) {
    insights.push({
      id: 'critical-deadlines',
      tone: 'warning',
      title: `${criticalDeadlines.length} échéance(s) critique(s) sous 14 jours`,
      detail: criticalDeadlines.map((e) => e.title).slice(0, 3).join(' · '),
      cta: 'Prioriser dans Tâches',
    });
  }

  const nextReview = meetings.find(
    (m) => m.meetingType === 'review' && m.status !== 'completed' && m.date >= ref.toISOString().slice(0, 10)
  );
  if (nextReview) {
    const days = daysBetween(ref, new Date(`${nextReview.date}T12:00:00`));
    insights.push({
      id: 'next-review',
      tone: days <= 3 ? 'action' : 'info',
      title: `${SCRUM_MEETING_LABELS.review} dans ${days} jour${days > 1 ? 's' : ''}`,
      detail: `${nextReview.title} — ${nextReview.date} à ${nextReview.time}. ${nextReview.hasReport ? 'CR publié.' : 'Préparez la démo et le CR.'}`,
      cta: nextReview.hasReport ? undefined : 'Rédiger le CR',
    });
  }

  const overdueTasks = tasks.filter(
    (t) => t.status !== 'done' && t.dueDate < ref.toISOString().slice(0, 10)
  );
  if (overdueTasks.length > 0) {
    insights.push({
      id: 'overdue-tasks',
      tone: 'warning',
      title: `${overdueTasks.length} tâche(s) en retard`,
      detail: overdueTasks.slice(0, 2).map((t) => t.title).join(' · '),
      cta: 'Voir les tâches',
    });
  }

  const nextDaily = meetings.find(
    (m) => m.meetingType === 'daily' && m.status === 'planned' && m.date >= ref.toISOString().slice(0, 10)
  );
  if (nextDaily && !nextDaily.hasReport) {
    const pendingFromPrev = meetings.filter((m) => m.hasReport && m.actions?.some((a) => a.status !== 'completed'));
    if (pendingFromPrev.length > 0) {
      insights.push({
        id: 'daily-followup',
        tone: 'action',
        title: 'Suivi CR avant le prochain Daily',
        detail: `Daily n° ${nextDaily.number} le ${nextDaily.date} — mettez à jour les actions ouvertes des CR précédents.`,
        cta: 'Ouvrir le CR',
      });
    }
  }

  const todayEvents = upcoming.filter((e) => sameDay(e.date, ref));
  if (todayEvents.length > 0) {
    insights.push({
      id: 'today',
      tone: 'info',
      title: `Aujourd'hui : ${todayEvents.length} événement(s)`,
      detail: todayEvents.map((e) => (e.time ? `${e.time} ${e.title}` : e.title)).join(' · '),
    });
  }

  const nextMilestone = upcoming.find((e) => e.ceremonyType === 'milestone' || e.type === 'deadline');
  if (nextMilestone && daysBetween(ref, nextMilestone.date) > 14) {
    insights.push({
      id: 'horizon',
      tone: 'success',
      title: 'Prochain jalon majeur',
      detail: `${nextMilestone.title} — dans ${daysBetween(ref, nextMilestone.date)} jours.`,
    });
  }

  return insights.slice(0, 6);
}

export function groupEventsByWeek(
  events: PlanningCalendarEventLike[],
  ref = new Date()
): { label: string; events: PlanningCalendarEventLike[] }[] {
  const future = events
    .filter((e) => startOfDay(e.date) >= startOfDay(ref))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 40);

  const groups = new Map<string, PlanningCalendarEventLike[]>();
  for (const e of future) {
    const d = startOfDay(e.date);
    const day = d.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const weekStart = new Date(d);
    weekStart.setDate(weekStart.getDate() + mondayOffset);
    const label = `Semaine du ${weekStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`;
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(e);
  }
  return [...groups.entries()].map(([label, evs]) => ({ label, events: evs }));
}
