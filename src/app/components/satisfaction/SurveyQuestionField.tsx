import { Frown, Star, ThumbsUp } from 'lucide-react';
import type { SurveyQuestion } from '../../types/satisfaction';
import { QUESTION_TYPE_META } from '../../types/satisfaction';
import { formQuestionToSurveyQuestion } from './surveyQuestionUtils';
import type { SurveyQuestionFormValues } from '../../types/satisfaction';

const CSAT_EMOJIS = ['😞', '😕', '😐', '🙂', '😍'];
const CSAT_LABELS = ['Pas du tout', 'Peu', 'Moyen', 'Bien', 'Excellent'];

interface SurveyQuestionFieldProps {
  question: SurveyQuestion | SurveyQuestionFormValues;
  value?: string | number;
  onChange?: (value: string | number) => void;
  index?: number;
  preview?: boolean;
}

function toSurveyQuestion(q: SurveyQuestion | SurveyQuestionFormValues): SurveyQuestion {
  if ('optionsText' in q) return formQuestionToSurveyQuestion(q);
  return q;
}

export function SurveyQuestionField({ question, value, onChange, index, preview = false }: SurveyQuestionFieldProps) {
  const q = toSurveyQuestion(question);
  const meta = QUESTION_TYPE_META[q.type];
  const interactive = !preview && onChange;

  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white p-4 sm:p-5 shadow-sm">
      <div className="flex items-start gap-3 mb-4">
        {index !== undefined ? (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white shadow-sm">
            {index + 1}
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">{meta.label}</span>
          <p className="font-semibold text-stone-900 text-base sm:text-lg leading-snug mt-0.5">
            {q.label}
            {q.required ? <span className="text-red-400 ml-1">*</span> : null}
          </p>
        </div>
      </div>

      {q.type === 'csat' ? (
        <CsatInput value={value as number | undefined} onChange={onChange} preview={preview} />
      ) : null}
      {q.type === 'nps' ? (
        <NpsInput value={value as number | undefined} onChange={onChange} preview={preview} />
      ) : null}
      {q.type === 'ces' ? (
        <CesInput value={value as number | undefined} onChange={onChange} preview={preview} />
      ) : null}
      {q.type === 'choice' && q.options ? (
        <ChoiceInput options={q.options} value={value as string | undefined} onChange={onChange} preview={preview} />
      ) : null}
      {q.type === 'text' ? (
        <TextInput value={value as string | undefined} onChange={onChange} required={q.required} preview={preview} />
      ) : null}

      {preview && !interactive ? (
        <p className="text-xs text-stone-400 mt-3 italic">Aperçu — le client pourra répondre ici</p>
      ) : null}
    </div>
  );
}

function CsatInput({
  value,
  onChange,
  preview,
}: {
  value?: number;
  onChange?: (v: number) => void;
  preview?: boolean;
}) {
  return (
    <div>
      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {[1, 2, 3, 4, 5].map((n) => {
          const selected = value === n;
          return (
            <button
              key={n}
              type="button"
              disabled={preview}
              onClick={() => onChange?.(n)}
              className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 p-3 sm:p-4 transition-all ${
                selected
                  ? 'border-emerald-500 bg-emerald-50 shadow-md scale-[1.02] ring-2 ring-emerald-200'
                  : 'border-stone-200 bg-stone-50/50 hover:border-emerald-300 hover:bg-white'
              } ${preview ? 'cursor-default opacity-80' : ''}`}
            >
              <span className="text-2xl sm:text-3xl leading-none">{CSAT_EMOJIS[n - 1]}</span>
              <span className={`text-lg font-bold ${selected ? 'text-emerald-700' : 'text-stone-700'}`}>{n}</span>
              <span className="text-[9px] sm:text-[10px] text-stone-500 text-center leading-tight hidden sm:block">
                {CSAT_LABELS[n - 1]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NpsInput({
  value,
  onChange,
  preview,
}: {
  value?: number;
  onChange?: (v: number) => void;
  preview?: boolean;
}) {
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 justify-center">
        {Array.from({ length: 11 }, (_, i) => i).map((n) => {
          const selected = value === n;
          const tone = n <= 6 ? 'red' : n <= 8 ? 'amber' : 'emerald';
          return (
            <button
              key={n}
              type="button"
              disabled={preview}
              onClick={() => onChange?.(n)}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border-2 font-bold text-sm transition-all ${
                selected
                  ? tone === 'red'
                    ? 'border-red-500 bg-red-50 text-red-800 shadow-md'
                    : tone === 'amber'
                    ? 'border-amber-500 bg-amber-50 text-amber-800 shadow-md'
                    : 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-md'
                  : 'border-stone-200 hover:border-stone-300 bg-white'
              } ${preview ? 'cursor-default opacity-80' : ''}`}
            >
              {n}
            </button>
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-stone-500 mt-2 px-1">
        <span className="flex items-center gap-1"><Frown className="w-3 h-3" /> Peu probable</span>
        <span className="flex items-center gap-1">Très probable <ThumbsUp className="w-3 h-3" /></span>
      </div>
    </div>
  );
}

function CesInput({
  value,
  onChange,
  preview,
}: {
  value?: number;
  onChange?: (v: number) => void;
  preview?: boolean;
}) {
  return (
    <div>
      <div className="flex flex-wrap gap-2 justify-center">
        {[1, 2, 3, 4, 5, 6, 7].map((n) => {
          const selected = value === n;
          return (
            <button
              key={n}
              type="button"
              disabled={preview}
              onClick={() => onChange?.(n)}
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl border-2 font-bold text-sm transition-all ${
                selected
                  ? 'border-violet-500 bg-violet-50 text-violet-800 shadow-md'
                  : 'border-stone-200 hover:border-violet-300 bg-white'
              } ${preview ? 'cursor-default opacity-80' : ''}`}
            >
              {n}
            </button>
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-stone-500 mt-2">
        <span>1 = Très facile</span>
        <span>7 = Très difficile</span>
      </div>
    </div>
  );
}

function ChoiceInput({
  options,
  value,
  onChange,
  preview,
}: {
  options: string[];
  value?: string;
  onChange?: (v: string) => void;
  preview?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const selected = value === opt;
        return (
          <button
            key={opt}
            type="button"
            disabled={preview}
            onClick={() => onChange?.(opt)}
            className={`px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
              selected
                ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm'
                : 'border-stone-200 hover:border-emerald-300 bg-white'
            } ${preview ? 'cursor-default opacity-80' : ''}`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  required,
  preview,
}: {
  value?: string;
  onChange?: (v: string) => void;
  required?: boolean;
  preview?: boolean;
}) {
  if (preview) {
    return (
      <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50/80 px-4 py-8 text-center text-sm text-stone-400">
        Zone de texte libre…
      </div>
    );
  }
  return (
    <textarea
      required={required}
      rows={4}
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value)}
      className="w-full rounded-xl border border-stone-200 bg-stone-50/40 px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 resize-y min-h-[6rem]"
      placeholder="Partagez votre expérience, vos suggestions…"
    />
  );
}

export function SurveyPreviewCard({
  title,
  description,
  questions,
}: {
  title: string;
  description?: string;
  questions: SurveyQuestionFormValues[];
}) {
  return (
    <div className="rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50/40 via-white to-teal-50/30 overflow-hidden shadow-lg">
      <div className="h-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />
      <div className="p-5 sm:p-6 space-y-4">
        <header className="text-center pb-2 border-b border-emerald-100/80">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white shadow-sm border border-emerald-100 mb-3">
            <Star className="w-6 h-6 text-emerald-600" />
          </div>
          <h3 className="font-bold text-stone-900 text-lg">{title || 'Titre du sondage'}</h3>
          {description ? <p className="text-sm text-stone-600 mt-1">{description}</p> : null}
        </header>
        <div className="space-y-3 max-h-[32rem] overflow-y-auto pr-1">
          {questions.length === 0 ? (
            <p className="text-sm text-stone-500 text-center py-8">Ajoutez des questions à gauche</p>
          ) : (
            questions.map((q, i) => (
              <SurveyQuestionField key={q.id} question={q} index={i} preview />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
