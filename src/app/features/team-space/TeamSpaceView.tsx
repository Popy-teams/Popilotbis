import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard,
  Target,
  MessageSquareQuote,
  Award,
  Medal,
  Zap,
  PartyPopper,
  Bot,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { useProjectContext } from '../../context/ProjectContext';
import { TEST_TEAM_MEMBERS, TEST_TASKS } from '../../data/testData';
import {
  ViewShell,
  ViewHero,
  ViewStatCard,
  ViewStatsGrid,
  ViewTabPills,
  ViewTabBtn,
  ViewSectionTitle,
} from '../../components/shared';
import { loadMeetings } from '../../utils/meetingSync';
import { TASKS_STORAGE_KEY } from '../../utils/pipelineSync';
import type { TestTask } from '../../data/testData';
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
import { getWeekKey } from '../../utils/teamSpaceTime';
import { TaquinCarousel } from './components/TaquinBotPanel';
import { WeeklyChallengePanel } from './components/WeeklyChallengePanel';
import { QuotesWallPanel } from './components/QuotesWallPanel';
import { WeeklyAwardsPanel } from './components/WeeklyAwardsPanel';
import { LeaderboardPanel } from './components/LeaderboardPanel';

type SectionId = 'overview' | 'challenge' | 'quotes' | 'awards' | 'ranking';

function loadTasks(): TestTask[] {
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : TEST_TASKS;
  } catch {
    return TEST_TASKS;
  }
}

function resolveCurrentMember(userName: string, userEmail: string) {
  const byName = TEST_TEAM_MEMBERS.find(
    (m) => m.name.toLowerCase() === userName.toLowerCase() || m.email === userEmail
  );
  return byName ?? TEST_TEAM_MEMBERS[0];
}

export function TeamSpaceView() {
  const { user } = useAuth();
  const { activeProject } = useProjectContext();
  const member = resolveCurrentMember(user?.name ?? 'Alice Martin', user?.email ?? '');

  const [section, setSection] = useState<SectionId>('overview');
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
  }, []);

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener('popilot:team-space-updated', handler);
    window.addEventListener('popilot:pipeline-updated', handler);
    return () => {
      window.removeEventListener('popilot:team-space-updated', handler);
      window.removeEventListener('popilot:pipeline-updated', handler);
    };
  }, [refresh]);

  const taquinMessages = useMemo(() => generateTaquinMessages(tasks, meetings), [tasks, meetings]);
  const weeklyAwards = useMemo(() => computeWeeklyAwards(tasks, meetings), [tasks, meetings]);
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
    const ids = new Set([...TEST_TEAM_MEMBERS.map((m) => m.id), ...Object.keys(pointsMap)]);
    return [...ids].map((id) => {
      const m = TEST_TEAM_MEMBERS.find((x) => x.id === id);
      return getMemberPoints(id, m?.name ?? pointsMap[id]?.memberName ?? id);
    });
  }, [pointsMap, awardsGranted]);

  const myPoints = getMemberPoints(member.id, member.name);
  const sortedLeaderboard = [...leaderboard].sort((a, b) => b.monthly - a.monthly || b.total - a.total);
  const myRank = sortedLeaderboard.findIndex((e) => e.memberId === member.id) + 1;
  const weekResponses = responses.filter((r) => r.weekKey === weekKey);

  const handlePublishQuote = (text: string, context?: string) => {
    if (!text) return;
    const q = {
      id: `quote-${Date.now()}`,
      text,
      authorId: member.id,
      authorName: member.name,
      context,
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

  const handleChallengeSubmit = (content: string) => {
    const r = {
      id: `cr-${Date.now()}`,
      challengeId: challenge.id,
      weekKey,
      authorId: member.id,
      authorName: member.name,
      content,
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
    const next = responses.map((r) => {
      if (r.id !== responseId) return r;
      const liked = r.likes.includes(member.id);
      return { ...r, likes: liked ? r.likes.filter((l) => l !== member.id) : [...r.likes, member.id] };
    });
    saveChallengeResponses(next);
    setResponses(next);
  };

  return (
    <ViewShell>
      <ViewHero
        title="Espace Équipe"
        subtitle="Cohésion, humour et reconnaissance — bot taquin, défi hebdomadaire, mur de citations et classement."
        badge={`${activeProject?.name ?? 'Projet'} · Semaine ${weekKey}`}
        badgeIcon={PartyPopper}
        theme="amber"
        stats={
          <ViewStatsGrid cols={4}>
            <ViewStatCard
              label="Vos points"
              value={String(myPoints.monthly)}
              gradient="from-amber-500 to-orange-500"
              icon={Zap}
              onDark
            />
            <ViewStatCard
              label="Classement"
              value={myRank > 0 ? `#${myRank}` : '—'}
              gradient="from-violet-500 to-purple-500"
              icon={Medal}
              onDark
            />
            <ViewStatCard
              label="Réponses défi"
              value={String(weekResponses.length)}
              gradient="from-cyan-500 to-blue-500"
              icon={Target}
              onDark
            />
            <ViewStatCard
              label="Citations"
              value={String(quotes.length)}
              gradient="from-rose-500 to-pink-500"
              icon={MessageSquareQuote}
              onDark
            />
          </ViewStatsGrid>
        }
      />

      <ViewTabPills>
        <ViewTabBtn active={section === 'overview'} onClick={() => setSection('overview')} icon={LayoutDashboard}>
          Vue d&apos;ensemble
        </ViewTabBtn>
        <ViewTabBtn active={section === 'challenge'} onClick={() => setSection('challenge')} icon={Target}>
          Défi
        </ViewTabBtn>
        <ViewTabBtn active={section === 'quotes'} onClick={() => setSection('quotes')} icon={MessageSquareQuote}>
          Citations
        </ViewTabBtn>
        <ViewTabBtn active={section === 'awards'} onClick={() => setSection('awards')} icon={Award}>
          Prix
        </ViewTabBtn>
        <ViewTabBtn active={section === 'ranking'} onClick={() => setSection('ranking')} icon={Medal}>
          Classement
        </ViewTabBtn>
      </ViewTabPills>

      {section === 'overview' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <section>
              <ViewSectionTitle icon={Bot} title="Popi-Bot" />
              <div className="mt-4">
                <TaquinCarousel messages={taquinMessages} />
              </div>
            </section>
            <section>
              <ViewSectionTitle icon={Target} title="Défi de la semaine" count={weekResponses.length} />
              <div className="mt-4">
                <WeeklyChallengePanel
                  challenge={challenge}
                  responses={responses}
                  currentUserId={member.id}
                  currentUserName={member.name}
                  onSubmit={handleChallengeSubmit}
                  onLike={handleChallengeLike}
                  compact
                />
              </div>
            </section>
            <section>
              <ViewSectionTitle icon={Award} title="Prix de la semaine" count={weeklyAwards.length} />
              <div className="mt-4">
                <WeeklyAwardsPanel awards={weeklyAwards} horizontal />
              </div>
            </section>
          </div>
          <aside>
            <ViewSectionTitle icon={Medal} title="Classement" count={sortedLeaderboard.length} />
            <div className="mt-4">
              <LeaderboardPanel leaderboard={leaderboard} currentUserId={member.id} compact />
            </div>
          </aside>
        </div>
      )}

      {section === 'challenge' && (
        <WeeklyChallengePanel
          challenge={challenge}
          responses={responses}
          currentUserId={member.id}
          currentUserName={member.name}
          onSubmit={handleChallengeSubmit}
          onLike={handleChallengeLike}
        />
      )}

      {section === 'quotes' && (
        <QuotesWallPanel
          quotes={quotes}
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
  );
}
