import { Eye, Frown, Meh, MessageSquare, Smile } from 'lucide-react';
import type { SurveyPhase, SurveyResponse } from '../../types/satisfaction';
import { FormSelect, SearchField, ViewEmptyState, ViewFilterPanel } from '../shared';
import { SURVEY_PHASES } from '../../types/satisfaction';
import {
  phaseLabel,
  respondentLabel,
  sentimentTone,
  statusLabel,
  statusTone,
} from './satisfactionPresentation';

interface SatisfactionResponsesTabProps {
  responses: SurveyResponse[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filterPhase: SurveyPhase | 'all';
  onFilterPhaseChange: (p: SurveyPhase | 'all') => void;
  onView: (response: SurveyResponse) => void;
}

function SentimentIcon({ sentiment }: { sentiment: string }) {
  if (sentiment === 'positive') return <Smile className="w-4 h-4 text-green-600" />;
  if (sentiment === 'negative') return <Frown className="w-4 h-4 text-red-600" />;
  return <Meh className="w-4 h-4 text-amber-600" />;
}

export function SatisfactionResponsesTab({
  responses,
  searchQuery,
  onSearchChange,
  filterPhase,
  onFilterPhaseChange,
  onView,
}: SatisfactionResponsesTabProps) {
  return (
    <div className="space-y-4 min-w-0">
      <ViewFilterPanel>
        <div className="filter-toolbar">
          <SearchField
            wrapperClassName="filter-toolbar-grow"
            placeholder="Rechercher une réponse…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <FormSelect value={filterPhase} onChange={(e) => onFilterPhaseChange(e.target.value as SurveyPhase | 'all')}>
            <option value="all">Toutes phases</option>
            {SURVEY_PHASES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </FormSelect>
        </div>
      </ViewFilterPanel>

      {responses.length === 0 ? (
        <ViewEmptyState
          icon={MessageSquare}
          title="Aucune réponse"
          description="Les réponses arrivent ici lorsque les clients remplissent le sondage via le lien public."
        />
      ) : (
        <div className="space-y-3">
          {responses.map((response) => (
            <article
              key={response.id}
              className="relative overflow-hidden rounded-2xl border border-stone-200/90 bg-white hover:shadow-md transition-all min-w-0"
            >
              <div
                className={`absolute left-0 top-0 bottom-0 w-1 ${
                  response.sentiment === 'positive'
                    ? 'bg-emerald-500'
                    : response.sentiment === 'negative'
                    ? 'bg-red-500'
                    : 'bg-amber-400'
                }`}
              />
              <div className="p-4 sm:p-5 pl-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-stone-900">{response.surveyTitle}</h3>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusTone(response.status)}`}>
                        {statusLabel(response.status)}
                      </span>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium inline-flex items-center gap-1 ${sentimentTone(response.sentiment)}`}>
                        <SentimentIcon sentiment={response.sentiment} />
                        {response.sentiment === 'positive' ? 'Positif' : response.sentiment === 'negative' ? 'Négatif' : 'Neutre'}
                      </span>
                    </div>
                    <p className="text-sm text-stone-500">
                      {response.respondentName ?? 'Anonyme'}
                      {response.respondentType ? ` · ${respondentLabel(response.respondentType)}` : ''}
                      {' · '}
                      {new Date(response.submittedAt).toLocaleDateString('fr-FR')}
                      {' · '}
                      {phaseLabel(response.phase)}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {response.csat !== undefined ? (
                        <span className="text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100 px-2.5 py-1 rounded-lg">
                          CSAT {response.csat}/5
                        </span>
                      ) : null}
                      {response.nps !== undefined ? (
                        <span className="text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-100 px-2.5 py-1 rounded-lg">
                          NPS {response.nps}/10
                        </span>
                      ) : null}
                      {response.ces !== undefined ? (
                        <span className="text-xs font-semibold bg-violet-50 text-violet-800 border border-violet-100 px-2.5 py-1 rounded-lg">
                          CES {response.ces}/7
                        </span>
                      ) : null}
                    </div>

                    {response.verbatim ? (
                      <p className="text-sm text-stone-600 italic mt-3 line-clamp-2 bg-stone-50/80 rounded-lg px-3 py-2 border border-stone-100">
                        « {response.verbatim} »
                      </p>
                    ) : null}

                    {response.keyTopics.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {response.keyTopics.map((t) => (
                          <span key={t} className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                            {t}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={() => onView(response)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-stone-200 rounded-xl text-sm font-medium text-stone-700 hover:bg-stone-50 shrink-0"
                  >
                    <Eye className="w-4 h-4" />
                    Détail
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
