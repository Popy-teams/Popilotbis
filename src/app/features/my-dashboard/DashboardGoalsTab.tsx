import { Award, Calendar, Crown, PartyPopper, Target } from 'lucide-react';
import type { DashboardObjective, DashboardTrophy } from '../../types/dashboard';
import { ViewEmptyState } from '../../components/shared';
import { DashboardCardShell, DashboardSection } from './DashboardCardShell';
import { objectiveAccentBar, objectiveTone, TROPHY_ICONS } from './dashboardPresentation';

interface DashboardGoalsTabProps {
  objectives: DashboardObjective[];
  trophies: DashboardTrophy[];
}

export function DashboardGoalsTab({ objectives, trophies }: DashboardGoalsTabProps) {
  if (objectives.length === 0 && trophies.length === 0) {
    return (
      <ViewEmptyState
        title="Aucun objectif pour ce projet"
        description="Les objectifs et trophées s'affichent pour le projet POPY en démo."
      />
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 min-w-0">
      {objectives.length > 0 ? (
        <DashboardSection
          title="Mes objectifs"
          icon={<Target className="w-5 h-5 text-sky-600" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {objectives.map((objective) => (
              <ObjectiveCard key={objective.id} objective={objective} />
            ))}
          </div>
        </DashboardSection>
      ) : null}

      {trophies.length > 0 ? (
        <DashboardSection
          title="Mes trophées"
          icon={<Award className="w-5 h-5 text-amber-600" />}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {trophies.map((trophy, idx) => (
              <TrophyCard key={idx} trophy={trophy} />
            ))}
          </div>
          <p className="mt-4 text-center text-xs sm:text-sm text-amber-800 flex items-center justify-center gap-1.5">
            <PartyPopper className="w-4 h-4" />
            Continuez — votre travail est reconnu par l&apos;équipe.
          </p>
        </DashboardSection>
      ) : null}
    </div>
  );
}

function ObjectiveCard({ objective }: { objective: DashboardObjective }) {
  const tone = objectiveTone(objective.progress);

  return (
    <DashboardCardShell accent={objectiveAccentBar(objective.progress)}>
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2">
              {objective.name}
            </h3>
            <p className="text-xs text-slate-500 mt-2 inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(objective.deadline).toLocaleDateString('fr-FR')}
            </p>
          </div>
          <div
            className={`shrink-0 w-12 h-12 rounded-full border-4 border-slate-100 flex items-center justify-center font-bold text-sm ${tone.value}`}
          >
            {objective.progress}%
          </div>
        </div>
        <div className="mt-4 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${tone.bar}`}
            style={{ width: `${objective.progress}%` }}
          />
        </div>
      </div>
    </DashboardCardShell>
  );
}

function TrophyCard({ trophy }: { trophy: DashboardTrophy }) {
  const TrophyIcon = TROPHY_ICONS[trophy.name] ?? Crown;

  return (
    <DashboardCardShell accent="from-amber-400 to-orange-500">
      <div className="p-4 sm:p-5 flex items-center gap-4">
        <div className="shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-100 to-yellow-100 text-amber-700 flex items-center justify-center shadow-inner ring-4 ring-white">
          <TrophyIcon className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-slate-900">{trophy.name}</h3>
          <p className="text-xs text-slate-500 mt-1">
            Obtenu le {new Date(trophy.earnedAt).toLocaleDateString('fr-FR')}
          </p>
        </div>
      </div>
    </DashboardCardShell>
  );
}
