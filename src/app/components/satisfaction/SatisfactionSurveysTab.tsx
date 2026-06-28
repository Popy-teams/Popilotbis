import { BarChart3, Copy, ExternalLink, Eye, Link2, Pencil, Plus, Users } from 'lucide-react';
import type { ClientSurvey } from '../../types/satisfaction';
import { ActionButton, ViewEmptyState } from '../shared';
import { getSurveyPublicUrl } from '../../utils/satisfactionStorage';
import { phaseLabel, statusLabel, statusTone } from './satisfactionPresentation';

interface SatisfactionSurveysTabProps {
  surveys: ClientSurvey[];
  responseCountBySurvey: Record<string, number>;
  onCreate: () => void;
  onView: (survey: ClientSurvey) => void;
  onEdit: (survey: ClientSurvey) => void;
  onCopyLink: (survey: ClientSurvey) => void;
  copiedSurveyId: string | null;
}

const PHASE_GRADIENT: Record<string, string> = {
  study: 'from-violet-500 to-purple-600',
  prototype: 'from-orange-500 to-amber-600',
  launch: 'from-blue-500 to-indigo-600',
  'post-delivery': 'from-emerald-500 to-teal-600',
  continuous: 'from-cyan-500 to-sky-600',
};

export function SatisfactionSurveysTab({
  surveys,
  responseCountBySurvey,
  onCreate,
  onView,
  onEdit,
  onCopyLink,
  copiedSurveyId,
}: SatisfactionSurveysTabProps) {
  if (surveys.length === 0) {
    return (
      <ViewEmptyState
        icon={Plus}
        title="Aucun sondage"
        description="Créez un sondage, partagez le lien à vos clients et collectez les réponses automatiquement."
        action={
          <ActionButton icon={Plus} onClick={onCreate} className="!bg-emerald-600 hover:!bg-emerald-700 !text-white">
            Créer un sondage
          </ActionButton>
        }
      />
    );
  }

  return (
    <div className="space-y-5 min-w-0">
      <div className="rounded-2xl border border-emerald-200/60 bg-gradient-to-r from-emerald-50/80 via-white to-teal-50/50 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="font-semibold text-stone-900">Partagez un lien, collectez des réponses</p>
          <p className="text-sm text-stone-600 mt-0.5">
            Chaque sondage actif génère une URL unique à envoyer par email, SMS ou QR code.
          </p>
        </div>
        <ActionButton icon={Plus} onClick={onCreate} className="w-full sm:w-auto justify-center shrink-0 !bg-emerald-600 hover:!bg-emerald-700 !text-white">
          Nouveau sondage
        </ActionButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {surveys.map((survey) => {
          const url = getSurveyPublicUrl(survey.shareToken);
          const count = responseCountBySurvey[survey.id] ?? 0;
          const copied = copiedSurveyId === survey.id;
          const gradient = PHASE_GRADIENT[survey.phase] ?? 'from-emerald-500 to-teal-600';

          return (
            <article
              key={survey.id}
              className="group relative overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-sm hover:shadow-lg transition-all min-w-0"
            >
              <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />

              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${statusTone(survey.status)}`}>
                        {statusLabel(survey.status)}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">
                        {phaseLabel(survey.phase)}
                      </span>
                    </div>
                    <h3 className="font-bold text-stone-900 text-lg leading-snug break-words group-hover:text-emerald-800 transition-colors">
                      {survey.title}
                    </h3>
                    {survey.description ? (
                      <p className="text-sm text-stone-500 mt-1.5 line-clamp-2">{survey.description}</p>
                    ) : null}
                  </div>
                  <div className={`flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white px-3 py-2 shrink-0 shadow-sm`}>
                    <Users className="w-4 h-4 mb-0.5 opacity-90" />
                    <span className="text-xl font-bold leading-none">{count}</span>
                    <span className="text-[9px] opacity-80">rép.</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-stone-500 mb-3">
                  <BarChart3 className="w-3.5 h-3.5" />
                  {survey.questions.length} question{survey.questions.length !== 1 ? 's' : ''}
                </div>

                <div className="rounded-xl border border-dashed border-emerald-200/80 bg-emerald-50/30 px-3 py-2.5 mb-4 flex items-center gap-2 min-w-0">
                  <Link2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs text-stone-600 truncate flex-1 font-mono">{url}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <ActionButton
                    variant="secondary"
                    icon={copied ? Copy : Link2}
                    onClick={() => onCopyLink(survey)}
                    className="col-span-2 sm:col-span-2 justify-center !text-xs"
                  >
                    {copied ? 'Copié !' : 'Copier le lien'}
                  </ActionButton>
                  <ActionButton variant="secondary" icon={Eye} onClick={() => onView(survey)} className="justify-center !text-xs">
                    Détail
                  </ActionButton>
                  <ActionButton variant="secondary" icon={Pencil} onClick={() => onEdit(survey)} className="justify-center !text-xs">
                    Modifier
                  </ActionButton>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
