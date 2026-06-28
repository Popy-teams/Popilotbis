import { Brain, Smile, Star, Target, ThumbsUp, TrendingUp, Zap } from 'lucide-react';
import type { ClientSurvey, SurveyPhase, SurveyResponse } from '../../types/satisfaction';
import { SURVEY_PHASES } from '../../types/satisfaction';
import { ViewHighlightBanner, ViewStatCard, ViewStatsGrid } from '../shared';
import {
  computeStats,
  computeTopicInsights,
  computeWeeklyCsat,
  sentimentTone,
} from './satisfactionPresentation';

interface SatisfactionOverviewTabProps {
  surveys: ClientSurvey[];
  responses: SurveyResponse[];
  activePhase: SurveyPhase | 'all';
  onPhaseChange: (phase: SurveyPhase | 'all') => void;
}

export function SatisfactionOverviewTab({
  surveys,
  responses,
  activePhase,
  onPhaseChange,
}: SatisfactionOverviewTabProps) {
  const stats = computeStats(responses);
  const insights = computeTopicInsights(responses);
  const weekly = computeWeeklyCsat(responses);
  const maxWeekly = Math.max(...weekly.map((w) => w.value), 5);

  return (
    <div className="space-y-5 min-w-0">
      <ViewHighlightBanner
        title="Écoute client continue"
        subtitle={`${stats.totalResponses} retours collectés · ${stats.pendingCount} en attente de traitement`}
        value={`${stats.avgCsat}/5`}
        progress={stats.satisfactionRate}
        theme="emerald"
      />
      <ViewStatsGrid cols={2} className="sm:hidden">
        <ViewStatCard label="CSAT" value={`${stats.avgCsat}/5`} gradient="from-emerald-500 to-green-600" icon={Smile} />
        <ViewStatCard label="Réponses" value={String(stats.totalResponses)} gradient="from-blue-500 to-indigo-600" icon={TrendingUp} />
      </ViewStatsGrid>

      <ViewStatsGrid cols={4} className="hidden sm:grid">
        <ViewStatCard label="CSAT global" value={`${stats.avgCsat}/5`} hint={`${stats.satisfactionRate}% positifs`} gradient="from-emerald-500 to-green-600" icon={Smile} />
        <ViewStatCard label="NPS" value={String(stats.npsScore)} hint={`${stats.promoters} promoteurs`} gradient="from-blue-500 to-indigo-600" icon={ThumbsUp} />
        <ViewStatCard label="CES (effort)" value={`${stats.avgCes}/7`} gradient="from-violet-500 to-purple-600" icon={Zap} />
        <ViewStatCard label="Sondages actifs" value={String(surveys.filter((s) => s.status === 'active').length)} hint={`${stats.pendingCount} à traiter`} gradient="from-orange-500 to-amber-600" icon={Target} />
      </ViewStatsGrid>

      <section className="rounded-xl sm:rounded-2xl border border-stone-200/90 bg-white p-4 sm:p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-stone-800 mb-3">Satisfaction par phase</h3>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
          {SURVEY_PHASES.map((phase) => {
            const phaseResponses = responses.filter((r) => r.phase === phase.id);
            const csat =
              phaseResponses.filter((r) => r.csat !== undefined).length > 0
                ? (
                    phaseResponses.reduce((s, r) => s + (r.csat ?? 0), 0) /
                    phaseResponses.filter((r) => r.csat !== undefined).length
                  ).toFixed(1)
                : '—';
            const isActive = activePhase === phase.id;
            return (
              <button
                key={phase.id}
                type="button"
                onClick={() => onPhaseChange(isActive ? 'all' : phase.id)}
                className={`text-left rounded-xl border p-3 transition ${
                  isActive ? 'border-emerald-400 bg-emerald-50/60 ring-1 ring-emerald-200' : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <p className="text-[10px] font-bold uppercase text-stone-500">{phase.label.split(' ')[0]}</p>
                <p className="text-xs font-medium text-stone-800 mt-0.5 line-clamp-2">{phase.label}</p>
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className="font-bold text-stone-900">{phaseResponses.length}</span>
                  <span className="inline-flex items-center gap-0.5 text-amber-700">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {csat}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {weekly.length > 0 ? (
        <section className="rounded-xl sm:rounded-2xl border border-stone-200/90 bg-white p-4 sm:p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-stone-800 mb-4">Évolution CSAT (semaines récentes)</h3>
          <div className="h-48 flex items-end gap-2 sm:gap-3">
            {weekly.map((point) => (
              <div key={point.label} className="flex-1 flex flex-col items-center min-w-0">
                <div
                  className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg relative min-h-[4px]"
                  style={{ height: `${(point.value / maxWeekly) * 100}%` }}
                >
                  <span className="absolute -top-5 left-0 right-0 text-center text-xs font-bold text-stone-800">
                    {point.value}
                  </span>
                </div>
                <span className="text-[10px] text-stone-500 mt-2">{point.label}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {insights.length > 0 ? (
        <section className="rounded-xl sm:rounded-2xl border border-stone-200/90 bg-white p-4 sm:p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-stone-800 mb-3 flex items-center gap-2">
            <Brain className="w-4 h-4 text-indigo-600" />
            Thèmes récurrents (calculés depuis les réponses)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {insights.map((insight) => (
              <div key={insight.topic} className="rounded-xl border border-stone-200 bg-stone-50/50 p-3">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-semibold text-stone-900 text-sm">{insight.topic}</h4>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${sentimentTone(insight.sentiment)}`}>
                    {insight.count}×
                  </span>
                </div>
                {insight.examples[0] ? (
                  <p className="text-xs text-stone-500 italic line-clamp-2">« {insight.examples[0]}… »</p>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
