import { Star, TrendingUp } from 'lucide-react';
import type { MemberPoints } from '../../../types/teamSpace';
import { POINTS_RULES } from '../../../types/teamSpace';
import { MemberAvatar } from './MemberAvatar';

interface Props {
  leaderboard: MemberPoints[];
  currentUserId: string;
  compact?: boolean;
}

export function LeaderboardPanel({ leaderboard, currentUserId, compact = false }: Props) {
  const sorted = [...leaderboard].sort((a, b) => b.monthly - a.monthly || b.total - a.total);
  const top3 = sorted.slice(0, 3);
  const list = compact ? sorted.slice(0, 8) : sorted;

  return (
    <div className="space-y-4">
      {!compact && top3.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {top3.map((entry, idx) => {
            const isMe = entry.memberId === currentUserId;
            const rank = idx + 1;
            return (
              <div
                key={entry.memberId}
                className={`saas-surface p-4 text-center ${isMe ? 'ring-2 ring-amber-400/60' : ''}`}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                  {rank === 1 ? '1er' : rank === 2 ? '2e' : '3e'}
                </p>
                <div className="flex justify-center mb-2">
                  <MemberAvatar name={entry.memberName} size="lg" ring={isMe} />
                </div>
                <p className="font-semibold text-slate-900 truncate">{entry.memberName}</p>
                <p className="text-2xl font-bold text-amber-600 mt-1 tabular-nums">{entry.monthly}</p>
                <p className="text-xs text-slate-500 mt-0.5">{entry.total} pts total</p>
              </div>
            );
          })}
        </div>
      )}

      <div className="saas-surface overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <h3 className="font-semibold text-slate-900 text-sm">Classement mensuel</h3>
          {!compact && (
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Points d&apos;engagement
            </span>
          )}
        </div>
        <ul className="divide-y divide-slate-100">
          {list.map((entry) => {
            const isMe = entry.memberId === currentUserId;
            const rank = sorted.findIndex((e) => e.memberId === entry.memberId) + 1;
            return (
              <li
                key={entry.memberId}
                className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${
                  isMe ? 'bg-amber-50/70' : 'hover:bg-slate-50'
                }`}
              >
                <span className="w-6 text-center text-sm font-bold text-slate-400 tabular-nums">{rank}</span>
                <MemberAvatar name={entry.memberName} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-slate-900 truncate">
                    {entry.memberName}
                    {isMe && <span className="text-amber-700 text-xs ml-1.5">vous</span>}
                  </p>
                  {!compact && <p className="text-xs text-slate-400">{entry.total} pts total</p>}
                </div>
                <span className="text-lg font-bold text-slate-900 tabular-nums">{entry.monthly}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {!compact && (
        <div className="saas-surface border-dashed p-5">
          <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-amber-500" />
            Gagner des points
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            {[
              ['Défi', POINTS_RULES.challengeParticipation],
              ['Citation', POINTS_RULES.quotePublished],
              ['Vote reçu', POINTS_RULES.voteReceived],
              ['Prix semaine', POINTS_RULES.weeklyAward],
              ['Voter', POINTS_RULES.quoteVote],
            ].map(([label, pts]) => (
              <div key={label} className="flex justify-between px-3 py-2 rounded-lg bg-slate-50">
                <span className="text-slate-600">{label}</span>
                <span className="font-bold text-emerald-600">+{pts}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
