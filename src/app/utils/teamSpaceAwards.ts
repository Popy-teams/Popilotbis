import type { TestTask } from '../data/testData';
import type { TeamMemberData } from '../data/testTeamData';
import type { ScrumMeetingRecord } from '../types/scrumMeetings';
import type { WeeklyAward, WeeklyAwardType } from '../types/teamSpace';
import { AWARD_META } from '../types/teamSpace';
import { getWeekKey, isInCurrentWeek } from './teamSpaceTime';
import {
  loadTeamMembers,
  resolveTeamMemberId,
  resolveTeamMemberName,
} from './teamMemberStore';

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

function resolveName(idOrName: string, roster: TeamMemberData[]): string {
  return resolveTeamMemberName(idOrName, roster);
}

function resolveId(idOrName: string, roster: TeamMemberData[]): string {
  return resolveTeamMemberId(idOrName, roster);
}

export function computeWeeklyAwards(
  tasks: TestTask[],
  meetings: ScrumMeetingRecord[],
  ref = new Date(),
  roster: TeamMemberData[] = loadTeamMembers()
): WeeklyAward[] {
  const weekKey = getWeekKey(ref);
  const awards: WeeklyAward[] = [];

  const doneWeek = tasks.filter((t) => t.status === 'done' && isInCurrentWeek(t.dueDate, ref));
  const rocketTop = topEntry(countBy(doneWeek, (t) => t.assignedTo));
  if (rocketTop) {
    const meta = AWARD_META.rocket;
    awards.push({
      type: 'rocket',
      memberId: resolveId(rocketTop[0], roster),
      memberName: resolveName(rocketTop[0], roster),
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
      memberId: resolveId(bugTop[0], roster),
      memberName: resolveName(bugTop[0], roster),
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
      memberId: resolveId(punctTop[0], roster),
      memberName: resolveName(punctTop[0], roster),
      value: punctTop[1],
      label: meta.title,
      weekKey,
    });
  }

  const weekMeetings = meetings.filter((m) => isInCurrentWeek(m.date, ref));
  const meetingCounts = new Map<string, number>();
  for (const m of weekMeetings) {
    for (const p of m.participants ?? []) {
      const id = resolveId(p, roster);
      meetingCounts.set(id, (meetingCounts.get(id) ?? 0) + 1);
    }
  }
  const meetTop = topEntry(meetingCounts);
  if (meetTop) {
    const meta = AWARD_META['meeting-king'];
    awards.push({
      type: 'meeting-king',
      memberId: resolveId(meetTop[0], roster),
      memberName: resolveName(meetTop[0], roster),
      value: meetTop[1],
      label: meta.title,
      weekKey,
    });
  }

  const nightScores = new Map<string, number>();
  for (const t of doneWeek) {
    const hour = 17 + (t.id.charCodeAt(t.id.length - 1) % 6);
    nightScores.set(resolveId(t.assignedTo, roster), Math.max(nightScores.get(resolveId(t.assignedTo, roster)) ?? 0, hour));
  }
  const nightTop = topEntry(nightScores);
  if (nightTop) {
    const meta = AWARD_META['night-owl'];
    awards.push({
      type: 'night-owl',
      memberId: resolveId(nightTop[0], roster),
      memberName: resolveName(nightTop[0], roster),
      value: nightTop[1],
      label: meta.title,
      weekKey,
    });
  }

  if (awards.length === 0 && roster.length > 0) {
    const fallback = roster[0];
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
