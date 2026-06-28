import { TEST_TEAM_MEMBERS, type TeamMemberData } from '../data/testTeamData';
import type { ChallengeResponse, TeamQuote } from '../types/teamSpace';
import { INITIAL_TEAM_POSITIONS } from '../data/teamPositions';
import { filterByActiveProject } from './projectMatch';

export const TEAM_STORAGE_KEY = 'popilot:team-local';

/** Anciens IDs tâches (testData) → IDs onglet Équipe */
export const LEGACY_TASK_USER_TO_TEAM_ID: Record<string, string> = {
  'user-1': 'user-meriem',
  'user-2': 'user-claude',
  'user-3': 'user-yacine',
  'user-4': 'user-cloud',
  'user-5': 'user-data',
  'user-6': 'user-fabio',
  'user-7': 'user-sonia',
};

function normalizeStoredMember(raw: Partial<TeamMemberData>): TeamMemberData {
  const fallback =
    TEST_TEAM_MEMBERS.find((m) => m.id === raw.id) ??
    TEST_TEAM_MEMBERS.find((m) => m.email === raw.email);
  const positionId =
    raw.positionId && raw.positionId.length > 0
      ? raw.positionId
      : fallback?.positionId ?? INITIAL_TEAM_POSITIONS[0]?.id ?? 'pos-po';

  return {
    id: raw.id ?? fallback?.id ?? `user-${Date.now()}`,
    projectId: raw.projectId ?? fallback?.projectId ?? 'popy',
    positionId,
    tasksUserId: raw.tasksUserId ?? fallback?.tasksUserId,
    name: raw.name ?? fallback?.name ?? 'Membre',
    initials: raw.initials ?? fallback?.initials ?? '??',
    role: raw.role ?? fallback?.role ?? 'Membre',
    category: raw.category ?? fallback?.category ?? 'Direction & Coordination',
    email: raw.email ?? fallback?.email ?? '',
    phone: raw.phone ?? fallback?.phone,
    photoUrl: raw.photoUrl ?? fallback?.photoUrl,
    workload: raw.workload ?? 0,
    responsibilities: raw.responsibilities ?? fallback?.responsibilities ?? [],
    skills: raw.skills ?? fallback?.skills ?? [],
    availability: raw.availability ?? fallback?.availability ?? 'Disponible',
    trophies: raw.trophies ?? fallback?.trophies ?? [],
  };
}

export function loadTeamMembers(): TeamMemberData[] {
  try {
    const raw = localStorage.getItem(TEAM_STORAGE_KEY);
    if (raw) {
      const parsed = (JSON.parse(raw) as Partial<TeamMemberData>[])
        .filter((m) => m.id !== 'user-shirel')
        .map((m) => normalizeStoredMember(m));
      return parsed.length ? parsed : [...TEST_TEAM_MEMBERS];
    }
  } catch {
    /* ignore */
  }
  return [...TEST_TEAM_MEMBERS];
}

export function getScopedTeamMembers(
  matchesProject: (entityProjectRef?: string) => boolean
): TeamMemberData[] {
  return filterByActiveProject(loadTeamMembers(), matchesProject);
}

/** Résout un id tâche, id équipe, email ou nom vers un membre du roster */
export function findTeamMember(
  ref: string | undefined,
  roster: TeamMemberData[]
): TeamMemberData | undefined {
  if (!ref) return undefined;
  const legacy = LEGACY_TASK_USER_TO_TEAM_ID[ref];
  const normalized = legacy ?? ref;
  const lower = ref.toLowerCase();

  return roster.find(
    (m) =>
      m.id === normalized ||
      m.id === ref ||
      m.tasksUserId === ref ||
      m.email.toLowerCase() === lower ||
      m.name.toLowerCase() === lower ||
      m.name.toLowerCase().startsWith(lower)
  );
}

export function resolveTeamMemberId(ref: string, roster: TeamMemberData[]): string {
  const member = findTeamMember(ref, roster);
  if (member) return member.id;
  return LEGACY_TASK_USER_TO_TEAM_ID[ref] ?? ref;
}

export function resolveTeamMemberName(ref: string, roster: TeamMemberData[]): string {
  return findTeamMember(ref, roster)?.name ?? ref;
}

export function isKnownTeamMember(ref: string, roster: TeamMemberData[]): boolean {
  return findTeamMember(ref, roster) !== undefined;
}

export function scopeQuotesToRoster(quotes: TeamQuote[], roster: TeamMemberData[]): TeamQuote[] {
  return quotes
    .map((q) => {
      const author = findTeamMember(q.authorId, roster);
      if (!author) return null;
      const votes = [
        ...new Set(
          q.votes
            .map((v) => findTeamMember(v, roster)?.id)
            .filter((v): v is string => Boolean(v))
        ),
      ];
      return { ...q, authorId: author.id, authorName: author.name, votes };
    })
    .filter((q): q is TeamQuote => q !== null);
}

export function scopeResponsesToRoster(
  responses: ChallengeResponse[],
  roster: TeamMemberData[]
): ChallengeResponse[] {
  return responses
    .map((r) => {
      const author = findTeamMember(r.authorId, roster);
      if (!author) return null;
      const likes = [
        ...new Set(
          r.likes
            .map((l) => findTeamMember(l, roster)?.id)
            .filter((l): l is string => Boolean(l))
        ),
      ];
      return { ...r, authorId: author.id, authorName: author.name, likes };
    })
    .filter((r): r is ChallengeResponse => r !== null);
}
