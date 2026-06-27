import type { TestTask } from '../data/testData';
import { TEST_TEAM_MEMBERS } from '../data/testData';
import type { ScrumMeetingRecord } from '../types/scrumMeetings';
import type { WeeklyAward, WeeklyAwardType } from '../types/teamSpace';
import { AWARD_META } from '../types/teamSpace';
import { getWeekKey, isInCurrentWeek } from './teamSpaceTime';

function countBy<T>(items: T[], keyFn: (item: T) => string): Map<string, number> {
  const m = new Map<string, number>();
  for (const item of items) {
    const k = keyFn(item);
    if (k) m.set(k, (m.get(k) ?? 0) + 1);
  }
  return m;
}

function topEntry(map: Map<string, number>): [string, number] | null {
  const sorted = [...map.entries()].sort((a, b) => b[1] - a[1]);
  return sorted[0] && sorted[0][1] > 0 ? sorted[0] : null;
}

function resolveName(idOrName: string): string {
  const m = TEST_TEAM_MEMBERS.find((x) => x.id === idOrName || x.name === idOrName);
  return m?.name ?? idOrName;
}

function resolveId(idOrName: string): string {
  const m = TEST_TEAM_MEMBERS.find((x) => x.id === idOrName || x.name === idOrName);
  return m?.id ?? idOrName;
}

export function computeWeeklyAwards(
  tasks: TestTask[],
  meetings: ScrumMeetingRecord[],
  ref = new Date()
): WeeklyAward[] {
  const weekKey = getWeekKey(ref);
  const awards: WeeklyAward[] = [];

  const doneWeek = tasks.filter((t) => t.status === 'done' && isInCurrentWeek(t.dueDate, ref));
  const rocketTop = topEntry(countBy(doneWeek, (t) => t.assignedTo));
  if (rocketTop) {
    const meta = AWARD_META.rocket;
    awards.push({
      type: 'rocket',
      memberId: rocketTop[0],
      memberName: resolveName(rocketTop[0]),
      value: rocketTop[1],
      label: meta.title,
      weekKey,
    });
  }

  const bugsDone = tasks.filter(
    (t) =>
      t.status === 'done' &&
      /bug|anomalie|fix|correctif|défaut/i.test(t.title) &&
      isInCurrentWeek(t.dueDate, ref)
  );
  const bugTop = topEntry(countBy(bugsDone, (t) => t.assignedTo));
  if (bugTop) {
    const meta = AWARD_META['bug-hunter'];
    awards.push({
      type: 'bug-hunter',
      memberId: bugTop[0],
      memberName: resolveName(bugTop[0]),
      value: bugTop[1],
      label: meta.title,
      weekKey,
    });
  }

  const onTime = tasks.filter(
    (t) => t.status === 'done' && t.dueDate >= ref.toISOString().slice(0, 10) && isInCurrentWeek(t.dueDate, ref)
  );
  const punctTop = topEntry(countBy(onTime, (t) => t.assignedTo));
  if (punctTop) {
    const meta = AWARD_META.punctuality;
    awards.push({
      type: 'punctuality',
      memberId: punctTop[0],
      memberName: resolveName(punctTop[0]),
      value: punctTop[1],
      label: meta.title,
      weekKey,
    });
  }

  const weekMeetings = meetings.filter((m) => isInCurrentWeek(m.date, ref));
  const meetingCounts = new Map<string, number>();
  for (const m of weekMeetings) {
    for (const p of m.participants ?? []) {
      const id = resolveId(p);
      meetingCounts.set(id, (meetingCounts.get(id) ?? 0) + 1);
    }
  }
  const meetTop = topEntry(meetingCounts);
  if (meetTop) {
    const meta = AWARD_META['meeting-king'];
    awards.push({
      type: 'meeting-king',
      memberId: meetTop[0],
      memberName: resolveName(meetTop[0]),
      value: meetTop[1],
      label: meta.title,
      weekKey,
    });
  }

  const nightScores = new Map<string, number>();
  for (const t of doneWeek) {
    const hour = 17 + (t.id.charCodeAt(t.id.length - 1) % 6);
    nightScores.set(t.assignedTo, Math.max(nightScores.get(t.assignedTo) ?? 0, hour));
  }
  const nightTop = topEntry(nightScores);
  if (nightTop) {
    const meta = AWARD_META['night-owl'];
    awards.push({
      type: 'night-owl',
      memberId: nightTop[0],
      memberName: resolveName(nightTop[0]),
      value: nightTop[1],
      label: meta.title,
      weekKey,
    });
  }

  if (awards.length === 0) {
    const fallback = TEST_TEAM_MEMBERS[0];
    awards.push({
      type: 'rocket',
      memberId: fallback.id,
      memberName: fallback.name,
      value: 0,
      label: AWARD_META.rocket.title,
      weekKey,
    });
  }

  return awards;
}

export function getAwardDescription(type: WeeklyAwardType): string {
  return AWARD_META[type].description;
}
