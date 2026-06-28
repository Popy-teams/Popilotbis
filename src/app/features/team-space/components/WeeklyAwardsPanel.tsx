import type { WeeklyAward } from '../../../types/teamSpace';
import { getAwardDescription } from '../../../utils/teamSpaceAwards';
import { getWeekKey } from '../../../utils/teamSpaceTime';
import { TeamSpaceIconBadge, awardIconKey } from '../teamSpaceIcons';
import { MemberAvatar } from './MemberAvatar';

export function WeeklyAwardsPanel({ awards, horizontal = false }: { awards: WeeklyAward[]; horizontal?: boolean }) {
  const weekKey = getWeekKey();

  if (horizontal) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
        {awards.map((award, i) => (
          <AwardCard
            key={award.type}
            award={award}
            className="snap-start min-w-[240px] flex-1"
            delay={i * 0.06}
          />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5">
        <h2 className="font-black text-slate-900 text-2xl">Prix de la semaine</h2>
        <p className="text-sm text-slate-500">Semaine {weekKey} · attribués depuis l&apos;activité réelle</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {awards.map((award, i) => (
          <AwardCard key={award.type} award={award} delay={i * 0.08} />
        ))}
      </div>
    </div>
  );
}

function AwardCard({
  award,
  className = '',
  delay = 0,
}: {
  award: WeeklyAward;
  className?: string;
  delay?: number;
}) {
  const iconKey = awardIconKey(award.type);
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-violet-200/50 bg-white p-5 shadow-lg ts-card-glow ts-animate-in ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-violet-200/40 to-transparent rounded-bl-full pointer-events-none" />
      <div className="flex items-start justify-between gap-3 relative">
        <TeamSpaceIconBadge iconKey={iconKey} size="lg" />
        {award.value > 0 && (
          <span className="text-xs font-black tabular-nums px-2.5 py-1 rounded-lg bg-gradient-to-r from-violet-100 to-fuchsia-100 text-violet-800">
            {award.value} pts
          </span>
        )}
      </div>
      <h3 className="font-black text-slate-900 mt-4 text-lg">{award.label}</h3>
      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{getAwardDescription(award.type)}</p>
      <div className="mt-4 pt-4 border-t border-violet-100 flex items-center gap-3">
        <MemberAvatar memberId={award.memberId} name={award.memberName} size="sm" ring />
        <div>
          <p className="font-bold text-sm text-violet-700">{award.memberName}</p>
          <p className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">Lauréat</p>
        </div>
      </div>
    </div>
  );
}
