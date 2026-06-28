import { Star, TrendingUp } from 'lucide-react';
import type { MemberPoints } from '../../../types/teamSpace';
import { POINTS_RULES } from '../../../types/teamSpace';
import { MemberAvatar } from './MemberAvatar';
import { PodiumTop3 } from './PodiumTop3';

interface Props {
  leaderboard: MemberPoints[];
  currentUserId: string;
  compact?: boolean;
}

export function LeaderboardPanel({ leaderboard, currentUserId, compact = false }: Props) {
  const sorted = [...leaderboard].sort((a, b) => b.monthly - a.monthly || b.total - a.total);
  const list = compact ? sorted : sorted;

  return (
    <div className="space-y-6">
      <PodiumTop3 leaderboard={leaderboard} currentUserId={currentUserId} compact={compact} />

      <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-sm ts-animate-in">
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-50 to-violet-50/50">
          <h3 className="font-semibold text-slate-900 text-sm">Classement complet</h3>
          {!compact && (
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Points du mois
            </span>
          )}
        </div>
        <ul className="divide-y divide-slate-100">
          {list.map((entry, idx) => {
            const isMe = entry.memberId === currentUserId;
            const rank = idx + 1;
            return (
              <li
                key={entry.memberId}
                className={`flex items-center gap-4 px-5 py-3.5 transition-all hover:bg-violet-50/40 ${
                  isMe ? 'bg-violet-50/70' : ''
                }`}
                style={{ animationDelay: `${idx * 0.03}s` }}
              >
                <span
                  className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-black tabular-nums ${
                    rank <= 3
                      ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {rank}
                </span>
                <MemberAvatar memberId={entry.memberId} name={entry.memberName} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-slate-900 truncate">
                    {entry.memberName}
                    {isMe && <span className="text-violet-600 text-xs ml-1.5">vous</span>}
                  </p>
                  {!compact && <p className="text-xs text-slate-400">{entry.total} pts total</p>}
                </div>
                <span className="text-xl font-black text-slate-900 tabular-nums">{entry.monthly}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {!compact && (
        <div className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/30 p-5 ts-animate-in">
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
              <div
                key={label}
                className="flex justify-between px-3 py-2 rounded-xl bg-white/80 border border-white shadow-sm"
              >
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
