import { ClipboardList, Eye, ListOrdered } from 'lucide-react';
import { ViewShell, PageBackHeader, ActionButton, FormSelect } from '../shared';
import type { SurveyFormValues } from '../../types/satisfaction';
import { SURVEY_PHASES } from '../../types/satisfaction';
import { SurveyQuestionEditor } from './SurveyQuestionEditor';
import { SurveyPreviewCard } from './SurveyQuestionField';
import { inputClass, labelClass, sectionClass } from './satisfactionPresentation';

interface SurveyFormPageProps {
  mode: 'create' | 'edit';
  values: SurveyFormValues;
  onChange: (values: SurveyFormValues) => void;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function SurveyFormPage({ mode, values, onChange, onBack, onSubmit }: SurveyFormPageProps) {
  const patch = (partial: Partial<SurveyFormValues>) => onChange({ ...values, ...partial });
  const hasValidQuestions = values.questions.length > 0 && values.questions.every((q) => q.label.trim());

  return (
    <ViewShell>
      <PageBackHeader
        title={mode === 'create' ? 'Nouveau sondage client' : 'Modifier le sondage'}
        subtitle="Composez vos questions et prévisualisez l'expérience client en direct"
        onBack={onBack}
      />

      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 xl:gap-6 items-start">
          <div className="space-y-5 min-w-0">
            <section className={sectionClass}>
              <SectionHead icon={ClipboardList} title="Informations générales" subtitle="Titre, description et paramètres" />
              <div className="space-y-4">
                <div>
                  <label className={labelClass} htmlFor="survey-title">
                    Titre du sondage *
                  </label>
                  <input
                    id="survey-title"
                    required
                    value={values.title}
                    onChange={(e) => patch({ title: e.target.value })}
                    className={inputClass}
                    placeholder="Ex. Satisfaction post-livraison M+1"
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="survey-desc">
                    Message d&apos;introduction (visible par le client)
                  </label>
                  <textarea
                    id="survey-desc"
                    rows={3}
                    value={values.description}
                    onChange={(e) => patch({ description: e.target.value })}
                    className={inputClass}
                    placeholder="Expliquez en une phrase l'objectif du sondage…"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Phase projet</label>
                    <FormSelect value={values.phase} onChange={(e) => patch({ phase: e.target.value as SurveyFormValues['phase'] })}>
                      {SURVEY_PHASES.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.label}
                        </option>
                      ))}
                    </FormSelect>
                  </div>
                  <div>
                    <label className={labelClass}>Statut</label>
                    <FormSelect value={values.status} onChange={(e) => patch({ status: e.target.value as SurveyFormValues['status'] })}>
                      <option value="draft">Brouillon — lien inactif</option>
                      <option value="active">Actif — collecte ouverte</option>
                      <option value="closed">Clôturé</option>
                    </FormSelect>
                  </div>
                </div>
              </div>
            </section>

            <section className={sectionClass}>
              <SectionHead
                icon={ListOrdered}
                title="Questions"
                subtitle={`${values.questions.length} question${values.questions.length !== 1 ? 's' : ''} — saisissez les intitulés et réorganisez`}
              />
              <SurveyQuestionEditor
                questions={values.questions}
                onChange={(questions) => patch({ questions })}
              />
            </section>

            <div className="flex flex-col-reverse sm:flex-row flex-wrap gap-3 sm:justify-end pb-4">
              <ActionButton type="button" variant="secondary" onClick={onBack} className="w-full sm:w-auto justify-center">
                Annuler
              </ActionButton>
              <ActionButton
                type="submit"
                disabled={!hasValidQuestions}
                className="w-full sm:w-auto justify-center !bg-emerald-600 hover:!bg-emerald-700 !text-white disabled:opacity-50"
              >
                {mode === 'create' ? 'Créer et obtenir le lien' : 'Enregistrer'}
              </ActionButton>
            </div>
          </div>

          <div className="xl:sticky xl:top-4 space-y-3 min-w-0">
            <div className="flex items-center gap-2 text-sm font-semibold text-stone-700">
              <Eye className="w-4 h-4 text-emerald-600" />
              Aperçu client en direct
            </div>
            <SurveyPreviewCard title={values.title} description={values.description} questions={values.questions} />
          </div>
        </div>
      </form>
    </ViewShell>
  );
}

function SectionHead({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-3 pb-1">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h2 className="font-semibold text-stone-900">{title}</h2>
        <p className="text-sm text-stone-500">{subtitle}</p>
      </div>
    </div>
  );
}
