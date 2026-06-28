import { DEMO_CHALLENGE_RESPONSES, DEMO_QUOTES } from '../data/teamSpaceDemo';
import type { ChallengeResponse, MemberPoints, TeamQuote } from '../types/teamSpace';
import { POINTS_RULES } from '../types/teamSpace';
import { getMonthKey, getWeekKey } from './teamSpaceTime';
import { seedMemberPhotoFixtures, migrateLegacyMemberPhotos } from './teamSpacePhotos';
import {
  LEGACY_TASK_USER_TO_TEAM_ID,
  findTeamMember,
  loadTeamMembers,
} from './teamMemberStore';

export const QUOTES_STORAGE_KEY = 'popilot:team-space-quotes';
export const CHALLENGE_RESPONSES_KEY = 'popilot:team-space-challenge-responses';
export const POINTS_STORAGE_KEY = 'popilot:team-space-points';
export const TEAM_SPACE_SEED_KEY = 'popilot:team-space-seed';
const TEAM_SPACE_SEED_VERSION = '5';

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

function remapLegacyId(id: string): string {
  return LEGACY_TASK_USER_TO_TEAM_ID[id] ?? id;
}

function migrateLegacyPoints(): void {
  const all = readJson<Record<string, MemberPoints>>(POINTS_STORAGE_KEY, {});
  let changed = false;

  for (const [legacyId, teamId] of Object.entries(LEGACY_TASK_USER_TO_TEAM_ID)) {
    if (!all[legacyId]) continue;
    const legacy = all[legacyId];
    const existing = all[teamId];
    if (existing) {
      all[teamId] = {
        ...existing,
        memberId: teamId,
        memberName: existing.memberName || legacy.memberName,
        total: existing.total + legacy.total,
        monthly: existing.monthly + legacy.monthly,
        history: [...legacy.history, ...existing.history].slice(0, 30),
      };
    } else {
      all[teamId] = { ...legacy, memberId: teamId };
    }
    delete all[legacyId];
    changed = true;
  }

  if (changed) {
    localStorage.setItem(POINTS_STORAGE_KEY, JSON.stringify(all));
  }
}

function migrateStoredQuotes(quotes: TeamQuote[]): TeamQuote[] {
  const roster = loadTeamMembers();
  return quotes
    .map((q) => {
      const author = findTeamMember(remapLegacyId(q.authorId), roster);
      if (!author) return null;
      const votes = [
        ...new Set(
          q.votes
            .map((v) => findTeamMember(remapLegacyId(v), roster)?.id)
            .filter((v): v is string => Boolean(v))
        ),
      ];
      return { ...q, authorId: author.id, authorName: author.name, votes };
    })
    .filter((q): q is TeamQuote => q !== null);
}

function migrateStoredResponses(responses: ChallengeResponse[]): ChallengeResponse[] {
  const roster = loadTeamMembers();
  return responses
    .map((r) => {
      const author = findTeamMember(remapLegacyId(r.authorId), roster);
      if (!author) return null;
      const likes = [
        ...new Set(
          r.likes
            .map((l) => findTeamMember(remapLegacyId(l), roster)?.id)
            .filter((l): l is string => Boolean(l))
        ),
      ];
      return { ...r, authorId: author.id, authorName: author.name, likes };
    })
    .filter((r): r is ChallengeResponse => r !== null);
}

function ensureTeamSpaceSeed(): void {
  try {
    if (localStorage.getItem(TEAM_SPACE_SEED_KEY) === TEAM_SPACE_SEED_VERSION) return;

    migrateLegacyPoints();
    migrateLegacyMemberPhotos();

    const savedQuotes = migrateStoredQuotes(readJson<TeamQuote[]>(QUOTES_STORAGE_KEY, []));
    const mergedQuotes = upsertDemoByIds(savedQuotes, DEMO_QUOTES, DEMO_QUOTES.map((q) => q.id));
    localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(mergedQuotes));

    const savedResponses = migrateStoredResponses(
      readJson<ChallengeResponse[]>(CHALLENGE_RESPONSES_KEY, [])
    );
    const weekKey = getWeekKey();
    const demoResponses = DEMO_CHALLENGE_RESPONSES.map((r) => ({ ...r, weekKey }));
    const mergedResponses = upsertDemoByIds(
      savedResponses,
      demoResponses,
      DEMO_CHALLENGE_RESPONSES.map((r) => r.id)
    );
    localStorage.setItem(CHALLENGE_RESPONSES_KEY, JSON.stringify(mergedResponses));

    seedMemberPhotoFixtures(true);
    localStorage.setItem(TEAM_SPACE_SEED_KEY, TEAM_SPACE_SEED_VERSION);
  } catch {
    /* ignore */
  }
}

export function loadQuotes(): TeamQuote[] {
  ensureTeamSpaceSeed();
  const saved = readJson<TeamQuote[]>(QUOTES_STORAGE_KEY, []);
  return upsertDemoByIds(saved, DEMO_QUOTES, DEMO_QUOTES.map((q) => q.id));
}

export function saveQuotes(quotes: TeamQuote[]): void {
  writeJson(QUOTES_STORAGE_KEY, quotes);
}

export function loadChallengeResponses(): ChallengeResponse[] {
  ensureTeamSpaceSeed();
  const saved = readJson<ChallengeResponse[]>(CHALLENGE_RESPONSES_KEY, []);
  const weekKey = getWeekKey();
  const demo = DEMO_CHALLENGE_RESPONSES.map((r) => ({ ...r, weekKey }));
  return upsertDemoByIds(saved, demo, DEMO_CHALLENGE_RESPONSES.map((r) => r.id));
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
