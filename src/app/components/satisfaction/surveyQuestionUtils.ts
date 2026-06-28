import type { SurveyQuestion, SurveyQuestionFormValues, SurveyQuestionType } from '../types/satisfaction';

export function newQuestionId(): string {
  return `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function createQuestion(type: SurveyQuestionType): SurveyQuestionFormValues {
  const templates: Record<SurveyQuestionType, Omit<SurveyQuestionFormValues, 'id'>> = {
    csat: {
      type: 'csat',
      label: 'Dans l\'ensemble, êtes-vous satisfait(e) de votre expérience ?',
      required: true,
      optionsText: '',
    },
    nps: {
      type: 'nps',
      label: 'Quelle est la probabilité que vous recommandiez ce produit ?',
      required: false,
      optionsText: '',
    },
    ces: {
      type: 'ces',
      label: 'À quel point la démarche a-t-elle été simple pour vous ?',
      required: false,
      optionsText: '',
    },
    text: {
      type: 'text',
      label: 'Qu\'aimeriez-vous nous dire en plus ?',
      required: true,
      optionsText: '',
    },
    choice: {
      type: 'choice',
      label: 'Vous êtes',
      required: false,
      optionsText: 'Parent, Enfant, Enseignant, Expert, Autre',
    },
  };
  return { id: newQuestionId(), ...templates[type] };
}

export function defaultFormQuestions(): SurveyQuestionFormValues[] {
  return [createQuestion('csat'), createQuestion('nps'), createQuestion('text')];
}

export function formQuestionToSurveyQuestion(q: SurveyQuestionFormValues): SurveyQuestion {
  const options =
    q.type === 'choice'
      ? q.optionsText
          .split(',')
          .map((o) => o.trim())
          .filter(Boolean)
      : undefined;
  return {
    id: q.id,
    type: q.type,
    label: q.label.trim(),
    required: q.required,
    options: options?.length ? options : q.type === 'choice' ? ['Option 1', 'Option 2'] : undefined,
  };
}

export function surveyQuestionToFormQuestion(q: SurveyQuestion): SurveyQuestionFormValues {
  return {
    id: q.id,
    type: q.type,
    label: q.label,
    required: q.required,
    optionsText: q.options?.join(', ') ?? '',
  };
}

export function moveQuestion(questions: SurveyQuestionFormValues[], index: number, dir: -1 | 1) {
  const next = [...questions];
  const target = index + dir;
  if (target < 0 || target >= next.length) return questions;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
