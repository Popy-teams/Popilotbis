import { useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { CheckCircle2, ClipboardList, Heart, Send, Sparkles } from 'lucide-react';
import { findSurveyByToken, appendResponse } from '../../utils/satisfactionStorage';
import { buildResponseFromSubmission } from './satisfactionPresentation';
import { SurveyQuestionField } from './SurveyQuestionField';

export function PublicSurveyPage() {
  const { token } = useParams<{ token: string }>();
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [respondentName, setRespondentName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(0);

  const survey = useMemo(() => (token ? findSurveyByToken(token) : undefined), [token]);

  const totalSteps = survey ? survey.questions.length + 1 : 0;
  const progress = totalSteps > 0 ? Math.round(((step + 1) / totalSteps) * 100) : 0;

  const patchAnswer = (questionId: string, value: string | number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!survey) return;

    for (const q of survey.questions) {
      if (q.required) {
        const val = answers[q.id];
        if (val === undefined || val === '') {
          setError(`Veuillez répondre à : ${q.label}`);
          return;
        }
      }
    }

    const response = buildResponseFromSubmission(survey, answers, respondentName);
    appendResponse(response);
    setSubmitted(true);
    setError(null);
  };

  if (!token || !survey) {
    return <PublicShell><NotFoundState /></PublicShell>;
  }

  if (survey.status !== 'active') {
    return (
      <PublicShell>
        <div className="max-w-lg w-full rounded-3xl border border-stone-200/80 bg-white/90 backdrop-blur p-8 sm:p-10 text-center shadow-xl">
          <h1 className="text-2xl font-bold text-stone-900 mb-2">{survey.title}</h1>
          <p className="text-stone-600">
            {survey.status === 'closed'
              ? 'Ce sondage est clôturé et n\'accepte plus de réponses.'
              : 'Ce sondage n\'est pas encore publié.'}
          </p>
        </div>
      </PublicShell>
    );
  }

  if (submitted) {
    return (
      <PublicShell>
        <div className="max-w-lg w-full rounded-3xl border border-emerald-200/80 bg-white/95 backdrop-blur p-8 sm:p-12 text-center shadow-2xl">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white mb-6 shadow-lg shadow-emerald-200">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-3">Merci !</h1>
          <p className="text-stone-600 leading-relaxed">
            Votre avis compte énormément pour nous. Il nous aide à améliorer continuellement nos produits.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 text-sm text-emerald-700 font-medium">
            <Heart className="w-4 h-4 fill-emerald-500 text-emerald-500" />
            Réponse enregistrée avec succès
          </div>
        </div>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <div className="max-w-2xl w-full">
        <div className="rounded-3xl border border-white/60 bg-white/90 backdrop-blur-xl shadow-2xl shadow-emerald-900/5 overflow-hidden">
          <div className="h-2 bg-stone-100">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <header className="px-6 sm:px-10 pt-8 sm:pt-10 pb-6 text-center border-b border-stone-100/80">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200/50 mb-5">
              <ClipboardList className="w-8 h-8" />
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-700 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Enquête satisfaction
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">{survey.title}</h1>
            {survey.description ? (
              <p className="text-stone-600 mt-3 text-base leading-relaxed max-w-md mx-auto">{survey.description}</p>
            ) : null}
          </header>

          <form onSubmit={handleSubmit} className="px-4 sm:px-8 py-6 sm:py-8 space-y-5">
            <div className="rounded-2xl border border-stone-200/60 bg-stone-50/50 p-4 sm:p-5">
              <label className="block text-sm font-semibold text-stone-800 mb-2" htmlFor="respondent-name">
                Comment souhaitez-vous vous identifier ? <span className="font-normal text-stone-500">(optionnel)</span>
              </label>
              <input
                id="respondent-name"
                value={respondentName}
                onChange={(e) => setRespondentName(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                placeholder="Prénom ou initiales…"
              />
            </div>

            <div className="space-y-4">
              {survey.questions.map((q, i) => (
                <div
                  key={q.id}
                  onFocus={() => setStep(i + 1)}
                >
                  <SurveyQuestionField
                    question={q}
                    index={i}
                    value={answers[q.id]}
                    onChange={(v) => patchAnswer(q.id, v)}
                  />
                </div>
              ))}
            </div>

            {error ? (
              <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
            ) : null}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-200/50 hover:from-emerald-700 hover:to-teal-700 transition-all hover:shadow-xl active:scale-[0.99]"
            >
              <Send className="w-5 h-5" />
              Envoyer mes réponses
            </button>

            <p className="text-xs text-center text-stone-400 pb-2">
              🔒 Vos réponses sont confidentielles et utilisées uniquement pour améliorer nos services.
            </p>
          </form>
        </div>
      </div>
    </PublicShell>
  );
}

function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-emerald-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-teal-200/30 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[32rem] w-[32rem] rounded-full bg-cyan-100/20 blur-3xl" />
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-8">{children}</div>
    </div>
  );
}

function NotFoundState() {
  return (
    <div className="max-w-md w-full rounded-3xl border border-stone-200 bg-white/90 backdrop-blur p-8 text-center shadow-xl">
      <ClipboardList className="w-14 h-14 text-stone-300 mx-auto mb-4" />
      <h1 className="text-xl font-bold text-stone-900 mb-2">Sondage introuvable</h1>
      <p className="text-sm text-stone-600">Ce lien n&apos;est pas valide ou a expiré.</p>
    </div>
  );
}
