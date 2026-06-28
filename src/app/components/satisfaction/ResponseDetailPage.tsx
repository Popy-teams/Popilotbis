import { Trash2 } from 'lucide-react';
import { ViewShell, PageBackHeader, ActionButton, FormSelect } from '../shared';
import type { SurveyResponse } from '../../types/satisfaction';
import {
  phaseLabel,
  respondentLabel,
  sentimentTone,
  statusLabel,
  statusTone,
} from './satisfactionPresentation';

interface ResponseDetailPageProps {
  response: SurveyResponse;
  onBack: () => void;
  onDelete: () => void;
  onStatusChange: (status: SurveyResponse['status']) => void;
}

export function ResponseDetailPage({ response, onBack, onDelete, onStatusChange }: ResponseDetailPageProps) {
  return (
    <ViewShell>
      <PageBackHeader
        title={response.surveyTitle}
        subtitle={response.respondentName ?? 'Réponse anonyme'}
        onBack={onBack}
        actions={
          <ActionButton variant="danger" icon={Trash2} onClick={onDelete}>
            Supprimer
          </ActionButton>
        }
      />

      <div className="space-y-5">
        <section className="rounded-2xl border border-stone-200/90 bg-white p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusTone(response.status)}`}>
              {statusLabel(response.status)}
            </span>
            <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${sentimentTone(response.sentiment)}`}>
              {response.sentiment === 'positive' ? 'Positif' : response.sentiment === 'negative' ? 'Négatif' : 'Neutre'}
            </span>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-stone-500">Date</dt>
              <dd className="font-medium text-stone-900">{new Date(response.submittedAt).toLocaleString('fr-FR')}</dd>
            </div>
            <div>
              <dt className="text-stone-500">Phase</dt>
              <dd className="font-medium text-stone-900">{phaseLabel(response.phase)}</dd>
            </div>
            {response.respondentType ? (
              <div>
                <dt className="text-stone-500">Profil</dt>
                <dd className="font-medium text-stone-900">{respondentLabel(response.respondentType)}</dd>
              </div>
            ) : null}
          </dl>

          <div className="flex flex-wrap gap-3">
            {response.csat !== undefined ? (
              <ScoreBadge label="CSAT" value={`${response.csat}/5`} tone="emerald" />
            ) : null}
            {response.nps !== undefined ? (
              <ScoreBadge label="NPS" value={`${response.nps}/10`} tone="blue" />
            ) : null}
            {response.ces !== undefined ? (
              <ScoreBadge label="CES" value={`${response.ces}/7`} tone="violet" />
            ) : null}
          </div>

          {response.verbatim ? (
            <blockquote className="rounded-xl border border-stone-200 bg-stone-50/80 p-4 text-stone-700 italic">
              « {response.verbatim} »
            </blockquote>
          ) : null}

          {response.keyTopics.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {response.keyTopics.map((t) => (
                <span key={t} className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-medium">
                  {t}
                </span>
              ))}
            </div>
          ) : null}

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Statut de traitement</label>
            <FormSelect value={response.status} onChange={(e) => onStatusChange(e.target.value as SurveyResponse['status'])}>
              <option value="new">Nouveau</option>
              <option value="analyzing">En analyse</option>
              <option value="action-planned">Action planifiée</option>
              <option value="resolved">Résolu</option>
            </FormSelect>
          </div>
        </section>
      </div>
    </ViewShell>
  );
}

function ScoreBadge({ label, value, tone }: { label: string; value: string; tone: 'emerald' | 'blue' | 'violet' }) {
  const tones = {
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    blue: 'bg-blue-50 text-blue-800 border-blue-200',
    violet: 'bg-violet-50 text-violet-800 border-violet-200',
  };
  return (
    <span className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold ${tones[tone]}`}>
      {label}: {value}
    </span>
  );
}
