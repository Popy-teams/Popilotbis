import { useCallback, useEffect, useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Target,
  MessageSquareQuote,
  Award,
  Medal,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { useProjectContext } from '../../context/ProjectContext';
import { TEST_TASKS } from '../../data/testData';
import type { TeamMemberData } from '../../data/testTeamData';
import { ViewShell } from '../../components/shared';
import { loadMeetings } from '../../utils/meetingSync';
import { TASKS_STORAGE_KEY } from '../../utils/pipelineSync';
import type { TestTask } from '../../data/testData';
import {
  findTeamMember,
  getScopedTeamMembers,
  loadTeamMembers,
  scopeQuotesToRoster,
  scopeResponsesToRoster,
} from '../../utils/teamMemberStore';
import { generateTaquinMessages } from '../../utils/teamSpaceBot';
import { computeWeeklyAwards } from '../../utils/teamSpaceAwards';
import { getWeeklyChallenge } from '../../utils/teamSpaceChallenge';
import {
  loadQuotes,
  saveQuotes,
  loadChallengeResponses,
  saveChallengeResponses,
  loadAllPoints,
  getMemberPoints,
  awardPointsForQuote,
  awardPointsForChallenge,
  awardPointsForVoteReceived,
  awardPointsForWeeklyAward,
} from '../../utils/teamSpaceStore';
import { loadMemberPhotos, saveMemberPhoto } from '../../utils/teamSpacePhotos';
import { getWeekKey } from '../../utils/teamSpaceTime';
import { TeamSpacePhotoProvider } from './TeamSpacePhotoContext';
import { TeamSpaceHeader } from './components/TeamSpaceHeader';
import { PodiumTop3 } from './components/PodiumTop3';
import { TaquinCarousel } from './components/TaquinBotPanel';
import { WeeklyChallengePanel } from './components/WeeklyChallengePanel';
import { QuotesWallPanel } from './components/QuotesWallPanel';
import { WeeklyAwardsPanel } from './components/WeeklyAwardsPanel';
import { LeaderboardPanel } from './components/LeaderboardPanel';
import { PhotoWall } from './components/PhotoWall';

type SectionId = 'overview' | 'challenge' | 'quotes' | 'awards' | 'ranking';

const TABS: { id: SectionId; label: string; icon: LucideIcon }[] = [
  { id: 'overview', label: "Vue d'ensemble", icon: LayoutDashboard },
  { id: 'challenge', label: 'Défi', icon: Target },
  { id: 'quotes', label: 'Citations', icon: MessageSquareQuote },
  { id: 'awards', label: 'Prix', icon: Award },
  { id: 'ranking', label: 'Classement', icon: Medal },
];

function loadTasks(): TestTask[] {
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : TEST_TASKS;
  } catch {
    return TEST_TASKS;
  }
}

function resolveCurrentMember(
  userName: string,
  userEmail: string,
  roster: TeamMemberData[]
): TeamMemberData | undefined {
  return (
    findTeamMember(userEmail, roster) ??
    findTeamMember(userName, roster) ??
    roster[0]
  );
}

export function TeamSpaceView() {
  const { user } = useAuth();
  const { activeProject, matchesProject, activeProjectSlug } = useProjectContext();
  const [teamMembers, setTeamMembers] = useState(loadTeamMembers);
  const scopedMembers = useMemo(
    () => getScopedTeamMembers(matchesProject, activeProjectSlug ?? 'popy'),
    [teamMembers, matchesProject, activeProjectSlug]
  );
  const member = useMemo(
    () => resolveCurrentMember(user?.name ?? '', user?.email ?? '', scopedMembers),
    [user, scopedMembers]
  );

  const [section, setSection] = useState<SectionId>('overview');
  const [memberPhotos, setMemberPhotos] = useState(loadMemberPhotos);
  const [tasks, setTasks] = useState<TestTask[]>(loadTasks);
  const [meetings, setMeetings] = useState(() => loadMeetings());
  const [quotes, setQuotes] = useState(() => loadQuotes());
  const [responses, setResponses] = useState(() => loadChallengeResponses());
  const [pointsMap, setPointsMap] = useState(() => loadAllPoints());
  const [awardsGranted, setAwardsGranted] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setTasks(loadTasks());
    setMeetings(loadMeetings());
    setQuotes(loadQuotes());
    setResponses(loadChallengeResponses());
    setPointsMap(loadAllPoints());
    setMemberPhotos(loadMemberPhotos());
  }, []);

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    const onTeamUpdated = () => setTeamMembers(loadTeamMembers());
    window.addEventListener('popilot:team-space-updated', handler);
    window.addEventListener('popilot:pipeline-updated', handler);
    window.addEventListener('popilot:team-updated', onTeamUpdated);
    return () => {
      window.removeEventListener('popilot:team-space-updated', handler);
      window.removeEventListener('popilot:pipeline-updated', handler);
      window.removeEventListener('popilot:team-updated', onTeamUpdated);
    };
  }, [refresh]);

  const combinedPhotos = useMemo(() => {
    const base = { ...memberPhotos };
    for (const m of scopedMembers) {
      if (m.photoUrl) base[m.id] = m.photoUrl;
    }
    return base;
  }, [memberPhotos, scopedMembers]);

  const scopedQuotes = useMemo(
    () => scopeQuotesToRoster(quotes, scopedMembers),
    [quotes, scopedMembers]
  );
  const scopedResponses = useMemo(
    () => scopeResponsesToRoster(responses, scopedMembers),
    [responses, scopedMembers]
  );

  const setMemberPhoto = useCallback((memberId: string, dataUrl: string) => {
    saveMemberPhoto(memberId, dataUrl);
    setMemberPhotos(loadMemberPhotos());
  }, []);

  const taquinMessages = useMemo(() => generateTaquinMessages(tasks, meetings), [tasks, meetings]);
  const weeklyAwards = useMemo(
    () => computeWeeklyAwards(tasks, meetings, new Date(), scopedMembers),
    [tasks, meetings, scopedMembers]
  );
  const challenge = useMemo(() => getWeeklyChallenge(), []);
  const weekKey = getWeekKey();

  useEffect(() => {
    const grantKey = `popilot:awards-granted-${weekKey}`;
    if (localStorage.getItem(grantKey)) return;
    for (const award of weeklyAwards) {
      if (award.value > 0) awardPointsForWeeklyAward(award.memberId, award.memberName, award.label);
    }
    localStorage.setItem(grantKey, '1');
    setAwardsGranted(weekKey);
    refresh();
  }, [weekKey, weeklyAwards, refresh]);

  const leaderboard = useMemo(() => {
    return scopedMembers.map((m) => getMemberPoints(m.id, m.name));
  }, [scopedMembers, pointsMap, awardsGranted]);

  const myPoints = member ? getMemberPoints(member.id, member.name) : { monthly: 0, total: 0, memberId: '', memberName: '', monthKey: '', history: [] };
  const sortedLeaderboard = [...leaderboard].sort((a, b) => b.monthly - a.monthly || b.total - a.total);
  const myRank = member ? sortedLeaderboard.findIndex((e) => e.memberId === member.id) + 1 : 0;
  const weekResponses = scopedResponses.filter((r) => r.weekKey === weekKey);

  const handlePublishQuote = (text: string, context?: string, imageUrl?: string) => {
    if (!text || !member) return;
    const q = {
      id: `quote-${Date.now()}`,
      text,
      authorId: member.id,
      authorName: member.name,
      context,
      imageUrl,
      createdAt: new Date().toISOString(),
      votes: [member.id],
    };
    const next = [q, ...quotes];
    saveQuotes(next);
    awardPointsForQuote(member.id, member.name);
    setQuotes(next);
    refresh();
  };

  const handleVoteQuote = (quoteId: string) => {
    if (!member) return;
    const next = quotes.map((q) => {
      if (q.id !== quoteId) return q;
      const voted = q.votes.includes(member.id);
      if (voted) return { ...q, votes: q.votes.filter((v) => v !== member.id) };
      awardPointsForVoteReceived(member.id, member.name, q.authorId, q.authorName);
      return { ...q, votes: [...q.votes, member.id] };
    });
    saveQuotes(next);
    setQuotes(next);
    refresh();
  };

  const handleChallengeSubmit = (content: string, imageUrl?: string) => {
    if (!member) return;
    const r = {
      id: `cr-${Date.now()}`,
      challengeId: challenge.id,
      weekKey,
      authorId: member.id,
      authorName: member.name,
      content,
      imageUrl,
      createdAt: new Date().toISOString(),
      likes: [],
    };
    const next = [r, ...responses];
    saveChallengeResponses(next);
    awardPointsForChallenge(member.id, member.name);
    setResponses(next);
    refresh();
  };

  const handleChallengeLike = (responseId: string) => {
    if (!member) return;
    const next = responses.map((r) => {
      if (r.id !== responseId) return r;
      const liked = r.likes.includes(member.id);
      return { ...r, likes: liked ? r.likes.filter((l) => l !== member.id) : [...r.likes, member.id] };
    });
    saveChallengeResponses(next);
    setResponses(next);
  };

  if (!member) {
    return (
      <ViewShell className="team-space-shell">
        <p className="text-slate-600 text-sm">
          Aucun membre d&apos;équipe pour ce projet. Ajoutez des membres dans l&apos;onglet Équipe.
        </p>
      </ViewShell>
    );
  }

  return (
    <TeamSpacePhotoProvider photos={combinedPhotos} setMemberPhoto={setMemberPhoto}>
      <ViewShell className="team-space-shell">
        <TeamSpaceHeader
          memberId={member.id}
          memberName={member.name}
          projectName={activeProject?.name ?? 'Projet'}
          weekKey={weekKey}
          myPoints={myPoints.monthly}
          myRank={myRank}
          challengeCount={weekResponses.length}
          quoteCount={scopedQuotes.length}
          onPhotoUpdated={refresh}
        />

        <nav className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = section === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSection(id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                  active
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg ts-tab-active scale-[1.02]'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-violet-300 hover:text-violet-700 hover:shadow-md'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            );
          })}
        </nav>

        {section === 'overview' && (
          <div className="space-y-6">
            <PodiumTop3 leaderboard={leaderboard} currentUserId={member.id} />

            <PhotoWall quotes={scopedQuotes} responses={scopedResponses} weekKey={weekKey} />

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              <div className="xl:col-span-7 space-y-6">
                <TaquinCarousel messages={taquinMessages} />
                <WeeklyChallengePanel
                  challenge={challenge}
                  responses={scopedResponses}
                  currentUserId={member.id}
                  currentUserName={member.name}
                  onSubmit={handleChallengeSubmit}
                  onLike={handleChallengeLike}
                  compact
                />
              </div>
              <div className="xl:col-span-5 space-y-6">
                <WeeklyAwardsPanel awards={weeklyAwards} horizontal />
                <QuotesWallPanel
                  quotes={scopedQuotes}
                  currentUserId={member.id}
                  currentUserName={member.name}
                  onPublish={handlePublishQuote}
                  onVote={handleVoteQuote}
                  compact
                />
              </div>
            </div>
          </div>
        )}

        {section === 'challenge' && (
          <WeeklyChallengePanel
            challenge={challenge}
            responses={scopedResponses}
            currentUserId={member.id}
            currentUserName={member.name}
            onSubmit={handleChallengeSubmit}
            onLike={handleChallengeLike}
          />
        )}

        {section === 'quotes' && (
          <QuotesWallPanel
            quotes={scopedQuotes}
            currentUserId={member.id}
            currentUserName={member.name}
            onPublish={handlePublishQuote}
            onVote={handleVoteQuote}
          />
        )}

        {section === 'awards' && <WeeklyAwardsPanel awards={weeklyAwards} />}

        {section === 'ranking' && (
          <LeaderboardPanel leaderboard={leaderboard} currentUserId={member.id} />
        )}
      </ViewShell>
    </TeamSpacePhotoProvider>
  );
}
