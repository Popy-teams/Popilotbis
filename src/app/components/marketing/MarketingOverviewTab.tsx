import { ArrowRight, Globe, Megaphone, Plus, Sparkles } from 'lucide-react';
import type { MarketingAction, MarketingPhase, RoadmapPhase } from '../../types/marketing';
import {
  COST_EVOLUTION,
  DIGITAL_CHANNELS,
  MARKETING_KPIS,
  STRATEGY_PILLARS,
} from '../../data/marketingDemoData';
import { ActionButton, ViewHighlightBanner } from '../shared';
import { MarketingTimeline } from './MarketingTimeline';
import { MarketingRoadmapFiveYearOverview } from './MarketingRoadmapFiveYearOverview';
import { MarketingActionCard } from './MarketingActionCard';
import { statusLabel, statusTone } from './marketingPresentation';

interface MarketingOverviewTabProps {
  phases: RoadmapPhase[];
  actions: MarketingAction[];
  activePhase: MarketingPhase;
  onPhaseChange: (phase: MarketingPhase) => void;
  onViewPhase: (phase: MarketingPhase) => void;
  onEditPhase: (phase: MarketingPhase) => void;
  onViewAction: (action: MarketingAction) => void;
  onCreateAction: () => void;
  onGoDigital: () => void;
  onGoPillars: () => void;
  onGoRoadmap: () => void;
}

export function MarketingOverviewTab({
  phases,
  actions,
  activePhase,
  onPhaseChange,
  onViewPhase,
  onEditPhase,
  onViewAction,
  onCreateAction,
  onGoDigital,
  onGoPillars,
  onGoRoadmap,
}: MarketingOverviewTabProps) {
  const currentPhase = phases.find((p) => p.id === activePhase)!;
  const recentActions = actions.slice(0, 3);
  const inProgress = actions.filter((a) => a.status === 'in-progress');
  const priorityChannels = DIGITAL_CHANNELS.filter((c) => c.priority === 'high').slice(0, 2);
  const heroPillar = STRATEGY_PILLARS[0];
  const HeroIcon = heroPillar.icon;
  const costTarget = MARKETING_KPIS.find((k) => k.id === 'unit-cost');
  const phaseProgress = phases.findIndex((p) => p.id === activePhase) + 1;
  const progressPct = Math.round((phaseProgress / phases.length) * 100);
  const costAn3 = COST_EVOLUTION.find((c) => c.label === 'year3');

  return (
    <div className="space-y-6 min-w-0">
      <ViewHighlightBanner
        title="Premium d'abord, accessible ensuite"
        subtitle="Entrée high-end → skimming pricing → lean manufacturing → economies of scale"
        value={costTarget?.value}
        progress={progressPct}
        theme="violet"
      />

      <MarketingRoadmapFiveYearOverview
        phases={phases}
        activePhase={activePhase}
        actionCountByPhase={phases.reduce(
          (acc, phase) => {
            acc[phase.id] = actions.filter((a) => a.phase === phase.id).length;
            return acc;
          },
          {} as Record<MarketingPhase, number>
        )}
        onSelectPhase={onPhaseChange}
        onViewPhase={onViewPhase}
        onEditPhase={onEditPhase}
      />

      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-stone-900">Navigation par phase</h2>
            <p className="text-sm text-stone-500">Cliquez sur une phase pour voir le détail</p>
          </div>
          <button
            type="button"
            onClick={onGoRoadmap}
            className="inline-flex items-center gap-1 text-sm font-medium text-violet-700 hover:text-violet-900"
          >
            Onglet Roadmap complet
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <MarketingTimeline
          phases={phases}
          activePhase={activePhase}
          onPhaseChange={onPhaseChange}
          onViewPhase={onViewPhase}
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <section className="lg:col-span-2 rounded-2xl border border-stone-200/90 bg-white p-4 sm:p-5 shadow-sm space-y-4 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-violet-600" />
              <h2 className="font-semibold text-stone-900">Actions en cours</h2>
              {inProgress.length > 0 ? (
                <span className="rounded-full bg-violet-100 text-violet-800 text-xs font-semibold px-2 py-0.5">
                  {inProgress.length}
                </span>
              ) : null}
            </div>
            <ActionButton icon={Plus} onClick={onCreateAction} className="w-full sm:w-auto justify-center">
              Nouvelle action
            </ActionButton>
          </div>

          {recentActions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50/60 p-8 text-center">
              <p className="text-sm text-stone-600 mb-3">Aucune action marketing pour ce projet.</p>
              <ActionButton icon={Plus} onClick={onCreateAction}>
                Planifier la première action
              </ActionButton>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {recentActions.map((action) => (
                <MarketingActionCard
                  key={action.id}
                  action={action}
                  phases={phases}
                  onView={() => onViewAction(action)}
                  onEdit={() => onViewAction(action)}
                />
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-4 min-w-0">
          <div className="rounded-2xl border border-stone-200/90 bg-gradient-to-br from-violet-50/80 to-white p-4 sm:p-5 shadow-sm">
            <p className="text-[11px] uppercase tracking-wide font-semibold text-violet-700 mb-2">Phase actuelle</p>
            <p className="font-bold text-stone-900">{currentPhase.year}</p>
            <p className="text-sm text-stone-600 mt-1">{currentPhase.label}</p>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-stone-500">Volume</dt>
                <dd className="font-medium text-stone-900 text-right">{currentPhase.volume}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-stone-500">Coût unitaire</dt>
                <dd className="font-medium text-orange-700 text-right">{currentPhase.unitCost}</dd>
              </div>
              {costAn3 ? (
                <div className="flex justify-between gap-2 pt-2 border-t border-violet-100">
                  <dt className="text-stone-500">Cible An 3</dt>
                  <dd className="font-medium text-emerald-700 text-right">{costAn3.unitCost} €</dd>
                </div>
              ) : null}
            </dl>
            <button
              type="button"
              onClick={() => onViewPhase(activePhase)}
              className="mt-4 w-full text-sm font-medium text-violet-700 hover:text-violet-900 py-2 rounded-lg hover:bg-violet-50 transition-colors"
            >
              Ouvrir la fiche phase →
            </button>
          </div>

          <div className="rounded-2xl border border-stone-200/90 bg-white p-4 sm:p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-pink-600" />
              <h3 className="font-semibold text-stone-900 text-sm">Canaux prioritaires</h3>
            </div>
            <ul className="space-y-2">
              {priorityChannels.map((ch) => {
                const ChIcon = ch.icon;
                return (
                  <li key={ch.id} className="flex items-center gap-2 text-sm text-stone-700">
                    <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${ch.iconWrapClass}`}>
                      <ChIcon className="w-4 h-4" />
                    </span>
                    <span className="min-w-0 flex-1 truncate">{ch.name}</span>
                    <span className="text-xs text-stone-400 shrink-0">{ch.frequency.split('/')[0]}/sem</span>
                  </li>
                );
              })}
            </ul>
            <button
              type="button"
              onClick={onGoDigital}
              className="mt-3 text-xs font-medium text-violet-700 hover:underline"
            >
              Stratégie digital complète
            </button>
          </div>
        </aside>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <article className="rounded-2xl border border-stone-200/90 bg-white p-4 sm:p-5 shadow-sm flex gap-4 min-w-0">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${heroPillar.iconWrapClass}`}>
            <HeroIcon className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-violet-700 uppercase tracking-wide">Pilier clé</p>
            <h3 className="font-semibold text-stone-900 mt-1">{heroPillar.title}</h3>
            <p className="text-sm text-stone-600 mt-1 line-clamp-2">{heroPillar.principle}</p>
            <button type="button" onClick={onGoPillars} className="mt-2 text-sm font-medium text-violet-700 hover:underline">
              Voir les 5 piliers
            </button>
          </div>
        </article>

        <article className="rounded-2xl border border-stone-200/90 bg-white p-4 sm:p-5 shadow-sm min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <h3 className="font-semibold text-stone-900 text-sm">Pipeline rapide</h3>
          </div>
          {actions.length === 0 ? (
            <p className="text-sm text-stone-500">Aucune action planifiée.</p>
          ) : (
            <ul className="space-y-2">
              {actions.slice(0, 4).map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => onViewAction(a)}
                    className="w-full flex items-center justify-between gap-2 text-left rounded-lg px-2 py-1.5 hover:bg-stone-50 transition-colors"
                  >
                    <span className="text-sm text-stone-800 truncate">{a.title}</span>
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusTone(a.status)}`}>
                      {statusLabel(a.status)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>
    </div>
  );
}
