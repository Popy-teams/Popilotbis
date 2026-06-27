import { DEMO_CHALLENGE_RESPONSES, DEMO_QUOTES } from '../data/teamSpaceDemo';
import type { ChallengeResponse, MemberPoints, TeamQuote } from '../types/teamSpace';
import { POINTS_RULES } from '../types/teamSpace';
import { getMonthKey, getWeekKey } from './teamSpaceTime';

export const QUOTES_STORAGE_KEY = 'popilot:team-space-quotes';
export const CHALLENGE_RESPONSES_KEY = 'popilot:team-space-challenge-responses';
export const POINTS_STORAGE_KEY = 'popilot:team-space-points';
export const TEAM_SPACE_SEED_KEY = 'popilot:team-space-seed';
const TEAM_SPACE_SEED_VERSION = '2';

function upsertDemoByIds<T extends { id: string }>(saved: T[], demo: T[], demoIds: readonly string[]): T[] {
  const replace = new Set(demoIds);
  const kept = saved.filter((item) => !replace.has(item.id));
  return [...demo, ...kept];
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, data: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('popilot:team-space-updated'));
  } catch {
    // ignore
  }
}

export function loadQuotes(): TeamQuote[] {
  const saved = readJson<TeamQuote[]>(QUOTES_STORAGE_KEY, []);
  const merged = upsertDemoByIds(saved, DEMO_QUOTES, DEMO_QUOTES.map((q) => q.id));
  try {
    if (localStorage.getItem(TEAM_SPACE_SEED_KEY) !== TEAM_SPACE_SEED_VERSION) {
      localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(merged));
      localStorage.setItem(TEAM_SPACE_SEED_KEY, TEAM_SPACE_SEED_VERSION);
    }
  } catch {
    /* ignore */
  }
  return merged;
}

export function saveQuotes(quotes: TeamQuote[]): void {
  writeJson(QUOTES_STORAGE_KEY, quotes);
}

export function loadChallengeResponses(): ChallengeResponse[] {
  const saved = readJson<ChallengeResponse[]>(CHALLENGE_RESPONSES_KEY, []);
  const weekKey = getWeekKey();
  const demo = DEMO_CHALLENGE_RESPONSES.map((r) => ({ ...r, weekKey }));
  const merged = upsertDemoByIds(saved, demo, DEMO_CHALLENGE_RESPONSES.map((r) => r.id));
  try {
    if (localStorage.getItem(TEAM_SPACE_SEED_KEY) !== TEAM_SPACE_SEED_VERSION) {
      localStorage.setItem(CHALLENGE_RESPONSES_KEY, JSON.stringify(merged));
    }
  } catch {
    /* ignore */
  }
  return merged;
}

export function saveChallengeResponses(responses: ChallengeResponse[]): void {
  writeJson(CHALLENGE_RESPONSES_KEY, responses);
}

export function loadAllPoints(): Record<string, MemberPoints> {
  return readJson<Record<string, MemberPoints>>(POINTS_STORAGE_KEY, {});
}

export function getMemberPoints(memberId: string, memberName: string): MemberPoints {
  const all = loadAllPoints();
  const monthKey = getMonthKey();
  if (all[memberId] && all[memberId].monthKey === monthKey) {
    return all[memberId];
  }
  return {
    memberId,
    memberName,
    total: all[memberId]?.total ?? 0,
    monthly: 0,
    monthKey,
    history: [],
  };
}

export function addPoints(
  memberId: string,
  memberName: string,
  points: number,
  reason: string
): MemberPoints {
  const all = loadAllPoints();
  const monthKey = getMonthKey();
  const current = all[memberId];
  const base: MemberPoints =
    current && current.monthKey === monthKey
      ? current
      : {
          memberId,
          memberName,
          total: current?.total ?? 0,
          monthly: 0,
          monthKey,
          history: [],
        };

  const updated: MemberPoints = {
    ...base,
    memberName,
    total: base.total + points,
    monthly: base.monthly + points,
    history: [{ reason, points, at: new Date().toISOString() }, ...base.history].slice(0, 30),
  };
  all[memberId] = updated;
  writeJson(POINTS_STORAGE_KEY, all);
  return updated;
}

export function awardPointsForQuote(authorId: string, authorName: string): void {
  addPoints(authorId, authorName, POINTS_RULES.quotePublished, 'Citation publiée');
}

export function awardPointsForChallenge(authorId: string, authorName: string): void {
  addPoints(authorId, authorName, POINTS_RULES.challengeParticipation, 'Participation au défi');
}

export function awardPointsForVoteReceived(
  voterId: string,
  voterName: string,
  authorId: string,
  authorName: string
): void {
  addPoints(authorId, authorName, POINTS_RULES.voteReceived, 'Vote reçu sur une citation');
  addPoints(voterId, voterName, POINTS_RULES.quoteVote, 'Vote pour une citation');
}

export function awardPointsForWeeklyAward(memberId: string, memberName: string, awardTitle: string): void {
  addPoints(memberId, memberName, POINTS_RULES.weeklyAward, `Prix : ${awardTitle}`);
}
