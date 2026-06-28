import { ExternalLink, Link2, Pencil, Trash2 } from 'lucide-react';
import { ViewShell, PageBackHeader, ActionButton } from '../shared';
import type { ClientSurvey } from '../../types/satisfaction';
import { getSurveyPublicUrl } from '../../utils/satisfactionStorage';
import { phaseLabel, statusLabel, statusTone } from './satisfactionPresentation';
import { SurveyPreviewCard } from './SurveyQuestionField';
import { surveyQuestionToFormQuestion } from './surveyQuestionUtils';

interface SurveyDetailPageProps {
  survey: ClientSurvey;
  responseCount: number;
  linkCopied: boolean;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCopyLink: () => void;
  onOpenPublic: () => void;
}

export function SurveyDetailPage({
  survey,
  responseCount,
  linkCopied,
  onBack,
  onEdit,
  onDelete,
  onCopyLink,
  onOpenPublic,
}: SurveyDetailPageProps) {
  const url = getSurveyPublicUrl(survey.shareToken);
  const formQuestions = survey.questions.map(surveyQuestionToFormQuestion);

  return (
    <ViewShell>
      <PageBackHeader
        title={survey.title}
        subtitle={survey.description ?? phaseLabel(survey.phase)}
        onBack={onBack}
        actions={
          <div className="flex flex-wrap gap-2">
            <ActionButton variant="secondary" icon={Pencil} onClick={onEdit}>
              Modifier
            </ActionButton>
            <ActionButton variant="danger" icon={Trash2} onClick={onDelete}>
              Supprimer
            </ActionButton>
          </div>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">
        <div className="space-y-5">
          <section className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/30 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusTone(survey.status)}`}>
                {statusLabel(survey.status)}
              </span>
              <span className="rounded-full border border-white/80 bg-white/80 px-3 py-1 text-xs font-semibold text-emerald-800">
                {responseCount} réponse{responseCount !== 1 ? 's' : ''}
              </span>
              <span className="rounded-full border border-white/80 bg-white/80 px-3 py-1 text-xs font-medium text-stone-700">
                {phaseLabel(survey.phase)}
              </span>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-wide font-bold text-emerald-700 mb-2">Lien public client</p>
              <div className="rounded-xl border border-emerald-200/60 bg-white p-3 space-y-3">
                <code className="block text-xs sm:text-sm text-stone-800 break-all font-mono">{url}</code>
                <div className="flex flex-col sm:flex-row gap-2">
                  <ActionButton variant="secondary" icon={Link2} onClick={onCopyLink} className="flex-1 justify-center">
                    {linkCopied ? 'Lien copié !' : 'Copier le lien'}
                  </ActionButton>
                  <ActionButton variant="secondary" icon={ExternalLink} onClick={onOpenPublic} className="flex-1 justify-center">
                    Ouvrir le sondage
                  </ActionButton>
                </div>
              </div>
              {survey.status !== 'active' ? (
                <p className="text-xs text-amber-700 mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  Passez le statut à <strong>Actif</strong> pour que les clients puissent répondre.
                </p>
              ) : null}
            </div>
          </section>

          <section className="rounded-2xl border border-stone-200/90 bg-white p-5 sm:p-6 shadow-sm">
            <h3 className="font-semibold text-stone-900 mb-3">Questionnaire ({survey.questions.length})</h3>
            <ol className="space-y-3">
              {survey.questions.map((q, i) => (
                <li key={q.id} className="flex gap-3 rounded-xl border border-stone-100 bg-stone-50/50 p-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-stone-900">{q.label}</p>
                    <p className="text-[10px] uppercase font-bold text-stone-400 mt-0.5">
                      {q.type}
                      {q.required ? ' · obligatoire' : ''}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className="xl:sticky xl:top-4">
          <p className="text-sm font-semibold text-stone-700 mb-2">Aperçu client</p>
          <SurveyPreviewCard title={survey.title} description={survey.description} questions={formQuestions} />
        </div>
      </div>
    </ViewShell>
  );
}
