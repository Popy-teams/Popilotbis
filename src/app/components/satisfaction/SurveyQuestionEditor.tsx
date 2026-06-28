import {
  ArrowDown,
  ArrowUp,
  GripVertical,
  ListChecks,
  MessageSquareText,
  Plus,
  Smile,
  Star,
  Trash2,
  Zap,
} from 'lucide-react';
import type { SurveyQuestionFormValues, SurveyQuestionType } from '../../types/satisfaction';
import { QUESTION_TYPE_META } from '../../types/satisfaction';
import { ActionButton, FormSelect } from '../shared';
import { createQuestion, moveQuestion } from './surveyQuestionUtils';
import { inputClass, labelClass } from './satisfactionPresentation';

const TEMPLATE_BUTTONS: { type: SurveyQuestionType; icon: React.ComponentType<{ className?: string }> }[] = [
  { type: 'csat', icon: Smile },
  { type: 'nps', icon: Star },
  { type: 'ces', icon: Zap },
  { type: 'text', icon: MessageSquareText },
  { type: 'choice', icon: ListChecks },
];

interface SurveyQuestionEditorProps {
  questions: SurveyQuestionFormValues[];
  onChange: (questions: SurveyQuestionFormValues[]) => void;
}

export function SurveyQuestionEditor({ questions, onChange }: SurveyQuestionEditorProps) {
  const patch = (index: number, partial: Partial<SurveyQuestionFormValues>) => {
    onChange(questions.map((q, i) => (i === index ? { ...q, ...partial } : q)));
  };

  const remove = (index: number) => {
    onChange(questions.filter((_, i) => i !== index));
  };

  const add = (type: SurveyQuestionType) => {
    onChange([...questions, createQuestion(type)]);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {TEMPLATE_BUTTONS.map(({ type, icon: Icon }) => {
          const meta = QUESTION_TYPE_META[type];
          return (
            <button
              key={type}
              type="button"
              onClick={() => add(type)}
              className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700 hover:border-emerald-300 hover:bg-emerald-50/50 transition"
            >
              <Icon className="w-4 h-4 text-emerald-600" />
              + {meta.label}
            </button>
          );
        })}
      </div>

      {questions.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50/50 p-8 text-center">
          <p className="text-sm text-stone-600 mb-3">Aucune question pour l&apos;instant.</p>
          <ActionButton type="button" icon={Plus} onClick={() => add('csat')} className="!bg-emerald-600 hover:!bg-emerald-700 !text-white">
            Ajouter une question CSAT
          </ActionButton>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q, index) => {
            const meta = QUESTION_TYPE_META[q.type];
            return (
              <div
                key={q.id}
                className="group rounded-2xl border border-stone-200/90 bg-gradient-to-br from-white to-stone-50/40 p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center gap-1 pt-1 text-stone-300">
                    <GripVertical className="w-4 h-4" />
                    <span className="text-xs font-bold text-stone-400">{index + 1}</span>
                  </div>

                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-${meta.color}-100 text-${meta.color}-800 border border-${meta.color}-200`}
                        style={{
                          backgroundColor:
                            meta.color === 'emerald'
                              ? '#d1fae5'
                              : meta.color === 'blue'
                              ? '#dbeafe'
                              : meta.color === 'violet'
                              ? '#ede9fe'
                              : meta.color === 'amber'
                              ? '#fef3c7'
                              : '#ffe4e6',
                          color:
                            meta.color === 'emerald'
                              ? '#065f46'
                              : meta.color === 'blue'
                              ? '#1e40af'
                              : meta.color === 'violet'
                              ? '#5b21b6'
                              : meta.color === 'amber'
                              ? '#92400e'
                              : '#9f1239',
                          borderColor:
                            meta.color === 'emerald'
                              ? '#a7f3d0'
                              : meta.color === 'blue'
                              ? '#bfdbfe'
                              : meta.color === 'violet'
                              ? '#ddd6fe'
                              : meta.color === 'amber'
                              ? '#fde68a'
                              : '#fecdd3',
                        }}
                      >
                        {meta.label}
                      </span>
                      <FormSelect
                        value={q.type}
                        onChange={(e) => patch(index, { type: e.target.value as SurveyQuestionType })}
                        className="!py-1.5 !text-xs max-w-[9rem]"
                      >
                        {Object.entries(QUESTION_TYPE_META).map(([key, m]) => (
                          <option key={key} value={key}>
                            {m.label}
                          </option>
                        ))}
                      </FormSelect>
                      <label className="inline-flex items-center gap-2 ml-auto text-xs text-stone-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={q.required}
                          onChange={(e) => patch(index, { required: e.target.checked })}
                          className="rounded border-stone-300 text-emerald-600"
                        />
                        Obligatoire
                      </label>
                    </div>

                    <div>
                      <label className={labelClass}>Intitulé de la question *</label>
                      <input
                        required
                        value={q.label}
                        onChange={(e) => patch(index, { label: e.target.value })}
                        className={inputClass}
                        placeholder="Formulez votre question…"
                      />
                    </div>

                    {q.type === 'choice' ? (
                      <div>
                        <label className={labelClass}>Options (séparées par des virgules)</label>
                        <input
                          value={q.optionsText}
                          onChange={(e) => patch(index, { optionsText: e.target.value })}
                          className={inputClass}
                          placeholder="Parent, Enfant, Enseignant…"
                        />
                      </div>
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => onChange(moveQuestion(questions, index, -1))}
                      className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 disabled:opacity-30"
                      aria-label="Monter"
                    >
                      <ArrowUp className="w-4 h-4 text-stone-500" />
                    </button>
                    <button
                      type="button"
                      disabled={index === questions.length - 1}
                      onClick={() => onChange(moveQuestion(questions, index, 1))}
                      className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 disabled:opacity-30"
                      aria-label="Descendre"
                    >
                      <ArrowDown className="w-4 h-4 text-stone-500" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 mt-1"
                      aria-label="Supprimer"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
