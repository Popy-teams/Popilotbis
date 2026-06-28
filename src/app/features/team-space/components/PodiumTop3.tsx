import { Crown, Medal, Sparkles } from 'lucide-react';
import type { MemberPoints } from '../../../types/teamSpace';
import { MemberAvatar } from './MemberAvatar';

interface PodiumTop3Props {
  leaderboard: MemberPoints[];
  currentUserId: string;
  compact?: boolean;
}

export function PodiumTop3({ leaderboard, currentUserId, compact = false }: PodiumTop3Props) {
  const sorted = [...leaderboard].sort((a, b) => b.monthly - a.monthly || b.total - a.total);
  const top3 = sorted.slice(0, 3);
  if (top3.length === 0) return null;

  const order =
    top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3.length === 2 ? [top3[1], top3[0]] : top3;

  const rankMeta = (entry: MemberPoints) => {
    const rank = sorted.findIndex((e) => e.memberId === entry.memberId) + 1;
    if (rank === 1)
      return {
        rank,
        label: '1er',
        podium: 'ts-podium-gold',
        height: compact ? 'h-24' : 'h-32',
        avatar: 'xl' as const,
        glow: 'shadow-[0_0_30px_rgba(251,191,36,0.45)]',
      };
    if (rank === 2)
      return {
        rank,
        label: '2e',
        podium: 'ts-podium-silver',
        height: compact ? 'h-16' : 'h-20',
        avatar: 'lg' as const,
        glow: '',
      };
    return {
      rank,
      label: '3e',
      podium: 'ts-podium-bronze',
      height: compact ? 'h-12' : 'h-16',
      avatar: 'lg' as const,
      glow: '',
    };
  };

  return (
    <div
      className={`team-space-bg relative ${compact ? 'p-4 sm:p-5' : 'p-6 sm:p-8'}`}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
          <Sparkles className="w-4 h-4 text-violet-500 ts-sparkle" />
          <h3 className={`font-bold text-slate-800 ${compact ? 'text-sm' : 'text-lg'}`}>
            Podium du mois
          </h3>
          <Sparkles className="w-4 h-4 text-fuchsia-500 ts-sparkle" style={{ animationDelay: '0.5s' }} />
        </div>

        <div className="flex items-end justify-center gap-3 sm:gap-6 max-w-2xl mx-auto">
          {order.map((entry) => {
            const meta = rankMeta(entry);
            const isMe = entry.memberId === currentUserId;
            return (
              <div
                key={entry.memberId}
                className={`flex flex-col items-center flex-1 max-w-[140px] ts-animate-podium ${
                  meta.rank === 1 ? 'ts-animate-float' : ''
                }`}
              >
                {meta.rank === 1 && (
                  <Crown className="w-6 h-6 text-amber-500 mb-1 drop-shadow-md" />
                )}
                <div className={`mb-2 ${meta.glow} rounded-full`}>
                  <MemberAvatar
                    memberId={entry.memberId}
                    name={entry.memberName}
                    size={meta.avatar}
                    ring={isMe}
                  />
                </div>
                <p className="font-bold text-slate-900 text-sm text-center truncate w-full">
                  {entry.memberName.split(' ')[0]}
                  {isMe && <span className="text-violet-600 text-xs block">vous</span>}
                </p>
                <p className="text-2xl font-black tabular-nums ts-shimmer-text my-1">{entry.monthly}</p>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
                  {meta.label}
                </p>
                <div
                  className={`w-full ${meta.height} rounded-t-2xl ${meta.podium} flex items-start justify-center pt-2 text-white/90 shadow-inner`}
                >
                  <Medal className="w-5 h-5 opacity-90" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
