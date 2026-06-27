import type { TestTask } from '../data/testData';
import type { ScrumMeetingRecord } from '../types/scrumMeetings';
import type { TaquinMessage } from '../types/teamSpace';
import { DEMO_TAQUIN_MESSAGES } from '../data/teamSpaceDemo';
import { isInCurrentWeek } from './teamSpaceTime';

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

const DYNAMIC_WIT: Record<string, (ctx: Record<string, string | number>) => string> = {
  oldTask: (c) =>
    `« ${c.title} » fête ses ${c.age} jours en backlog. À ce stade, ce n’est plus une tâche : c’est un long-métrage d’auteur sur l’attente.`,
  meetingsHeavy: (c) =>
    `${c.count} réunions cette semaine. Le café est passé du statut de boisson à celui de figurant récurrent. Prochaine étape : générique de fin.`,
  noMeetings: () =>
    'Zéro réunion. Silence de plateau. Soit vous codez enfin, soit le calendrier a démissionné sans préavis.',
  topPerformer: (c) =>
    `${c.name} termine ${c.count} tâches cette semaine. Standing ovation du Jira. Le reste de l’équipe prépare le discours de remerciement.`,
  blocked: (c) =>
    `${c.count} tâche(s) bloquée(s). Recommandation Popilot : café, respiration, puis Daily avec regard caméra type documentaire.`,
  bugsCrushed: (c) =>
    `${c.count} bugs éliminés. Le ticket Jira le plus ancien a demandé une pension retraite et un spin-off.`,
  dailies: (c) =>
    `${c.count} Daily cette semaine. « Fait · En cours · Bloqué » — votre nouveau dialogue de film français réaliste.`,
  overdue: (c) =>
    `${c.count} échéances en retard. Le temps est une construction narrative ; le PO, lui, lit un calendrier.`,
};

function generateDynamicMessages(
  tasks: TestTask[],
  meetings: ScrumMeetingRecord[],
  ref: Date
): TaquinMessage[] {
  const messages: TaquinMessage[] = [];
  const today = ref.toISOString().slice(0, 10);

  const stale = tasks.filter((t) => {
    if (t.status === 'done') return false;
    const created = t.startDate || t.dueDate;
    const age = daysBetween(new Date(created), ref);
    return age >= 21 || (t.dueDate < today && t.status !== 'done');
  });

  for (const task of stale.slice(0, 1)) {
    const age = Math.max(daysBetween(new Date(task.startDate || task.dueDate), ref), 21);
    messages.push({
      id: `taquin-old-${task.id}`,
      text: DYNAMIC_WIT.oldTask({ title: task.title.slice(0, 40), age }),
      category: 'task',
      iconKey: 'cake',
    });
  }

  const weekMeetings = meetings.filter((m) => isInCurrentWeek(m.date, ref));
  if (weekMeetings.length >= 5) {
    messages.push({
      id: 'taquin-meetings',
      text: DYNAMIC_WIT.meetingsHeavy({ count: weekMeetings.length }),
      category: 'meeting',
      iconKey: 'coffee',
    });
  } else if (weekMeetings.length === 0) {
    messages.push({
      id: 'taquin-no-meetings',
      text: DYNAMIC_WIT.noMeetings({}),
      category: 'meeting',
      iconKey: 'sparkles',
    });
  }

  const doneThisWeek = tasks.filter(
    (t) => t.status === 'done' && t.dueDate && isInCurrentWeek(t.dueDate, ref)
  );
  const byPerson = new Map<string, number>();
  for (const t of doneThisWeek) {
    byPerson.set(t.assignedToName, (byPerson.get(t.assignedToName) ?? 0) + 1);
  }
  const top = [...byPerson.entries()].sort((a, b) => b[1] - a[1])[0];
  if (top && top[1] >= 2) {
    messages.push({
      id: 'taquin-top-performer',
      text: DYNAMIC_WIT.topPerformer({ name: top[0].split(' ')[0], count: top[1] }),
      category: 'stats',
      iconKey: 'trophy',
    });
  }

  const blocked = tasks.filter((t) => t.status === 'blocked');
  if (blocked.length > 0) {
    messages.push({
      id: 'taquin-blocked',
      text: DYNAMIC_WIT.blocked({ count: blocked.length }),
      category: 'task',
      iconKey: 'construction',
    });
  }

  const bugTasks = tasks.filter(
    (t) => t.status === 'done' && /bug|anomalie|fix|correctif/i.test(t.title)
  );
  if (bugTasks.length >= 2) {
    messages.push({
      id: 'taquin-bugs',
      text: DYNAMIC_WIT.bugsCrushed({ count: bugTasks.length }),
      category: 'fun',
      iconKey: 'bug',
    });
  }

  const dailies = weekMeetings.filter((m) => m.meetingType === 'daily');
  if (dailies.length >= 3) {
    messages.push({
      id: 'taquin-daily',
      text: DYNAMIC_WIT.dailies({ count: dailies.length }),
      category: 'meeting',
      iconKey: 'refresh',
    });
  }

  const overdue = tasks.filter((t) => t.status !== 'done' && t.dueDate < today);
  if (overdue.length >= 2) {
    messages.push({
      id: 'taquin-overdue',
      text: DYNAMIC_WIT.overdue({ count: overdue.length }),
      category: 'task',
      iconKey: 'clock',
    });
  }

  return messages;
}

/** Fusionne messages démo (humour garanti) + messages calculés depuis les données live. */
export function generateTaquinMessages(
  tasks: TestTask[],
  meetings: ScrumMeetingRecord[],
  ref = new Date()
): TaquinMessage[] {
  const dynamic = generateDynamicMessages(tasks, meetings, ref);
  const seen = new Set<string>();
  const merged: TaquinMessage[] = [];

  for (const msg of [...DEMO_TAQUIN_MESSAGES, ...dynamic]) {
    if (seen.has(msg.id)) continue;
    seen.add(msg.id);
    merged.push(msg);
  }

  if (merged.length === 0) {
    merged.push({
      id: 'taquin-default',
      text: 'L’équipe tourne à plein régime. Popilot observe en voix off, comme un narrateur de documentaire tech.',
      category: 'fun',
      iconKey: 'bot',
    });
  }

  return merged.slice(0, 8);
}
