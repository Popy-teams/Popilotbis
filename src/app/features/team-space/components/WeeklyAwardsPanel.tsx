import type { WeeklyAward } from '../../../types/teamSpace';
import { getAwardDescription } from '../../../utils/teamSpaceAwards';
import { getWeekKey } from '../../../utils/teamSpaceTime';
import { TeamSpaceIconBadge, awardIconKey } from '../teamSpaceIcons';
import { MemberAvatar } from './MemberAvatar';

export function WeeklyAwardsPanel({ awards, horizontal = false }: { awards: WeeklyAward[]; horizontal?: boolean }) {
  const weekKey = getWeekKey();

  if (horizontal) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin">
        {awards.map((award) => (
          <AwardCard key={award.type} award={award} className="snap-start min-w-[220px] flex-1" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="font-bold text-slate-900 text-lg">Prix de la semaine</h2>
        <p className="text-sm text-slate-500">Semaine {weekKey} · calculés depuis l&apos;activité réelle</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {awards.map((award) => (
          <AwardCard key={award.type} award={award} />
        ))}
      </div>
    </div>
  );
}

function AwardCard({ award, className = '' }: { award: WeeklyAward; className?: string }) {
  const iconKey = awardIconKey(award.type);
  return (
    <div
      className={`group saas-surface p-5 hover:shadow-md transition-shadow ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <TeamSpaceIconBadge iconKey={iconKey} size="lg" />
        {award.value > 0 && (
          <span className="text-xs font-bold tabular-nums px-2 py-1 rounded-lg bg-slate-100 text-slate-600">
            {award.value} pts
          </span>
        )}
      </div>
      <h3 className="font-bold text-slate-900 mt-4">{award.label}</h3>
      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{getAwardDescription(award.type)}</p>
      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3">
        <MemberAvatar name={award.memberName} size="sm" ring />
        <div>
          <p className="font-semibold text-sm text-slate-900">{award.memberName}</p>
          <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">Lauréat</p>
        </div>
      </div>
    </div>
  );
}
