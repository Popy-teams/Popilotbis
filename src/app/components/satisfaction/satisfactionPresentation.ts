import type {
  ClientSurvey,
  RespondentType,
  SatisfactionStats,
  Sentiment,
  SurveyFormValues,
  SurveyResponse,
  TopicInsight,
  WeeklyCsatPoint,
} from '../../types/satisfaction';
import { generateShareToken } from '../../utils/satisfactionStorage';
import {
  defaultFormQuestions,
  formQuestionToSurveyQuestion,
  surveyQuestionToFormQuestion,
} from './surveyQuestionUtils';

export function emptySurveyForm(): SurveyFormValues {
  return {
    title: '',
    description: '',
    phase: 'study',
    status: 'draft',
    questions: defaultFormQuestions(),
  };
}

export function surveyToFormValues(survey: ClientSurvey): SurveyFormValues {
  return {
    title: survey.title,
    description: survey.description ?? '',
    phase: survey.phase,
    status: survey.status,
    questions: survey.questions.map(surveyQuestionToFormQuestion),
  };
}

export function buildSurveyFromForm(
  form: SurveyFormValues,
  base: ClientSurvey | undefined,
  projectId: string
): ClientSurvey {
  const now = new Date().toISOString().slice(0, 10);
  return {
    id: base?.id ?? `survey-${Date.now()}`,
    projectId: base?.projectId ?? projectId,
    title: form.title.trim(),
    description: form.description.trim() || undefined,
    phase: form.phase,
    questions: form.questions.map(formQuestionToSurveyQuestion),
    shareToken: base?.shareToken ?? generateShareToken(),
    status: form.status,
    createdAt: base?.createdAt ?? now,
    updatedAt: now,
  };
}

const RESPONDENT_MAP: Record<string, RespondentType> = {
  Parent: 'parent',
  Enfant: 'child',
  Enseignant: 'teacher',
  Expert: 'expert',
  Autre: 'other',
};

export function buildResponseFromSubmission(
  survey: ClientSurvey,
  answers: Record<string, string | number>,
  respondentName?: string
): SurveyResponse {
  let csat: number | undefined;
  let nps: number | undefined;
  let ces: number | undefined;
  let verbatim: string | undefined;
  let respondentType: RespondentType | undefined;

  for (const q of survey.questions) {
    const val = answers[q.id];
    if (val === undefined || val === '') continue;
    if (q.type === 'csat') csat = Number(val);
    if (q.type === 'nps') nps = Number(val);
    if (q.type === 'ces') ces = Number(val);
    if (q.type === 'text') verbatim = String(val);
    if (q.type === 'choice' && typeof val === 'string') {
      respondentType = RESPONDENT_MAP[val] ?? 'other';
    }
  }

  const sentiment = deriveSentiment(csat, nps);

  return {
    id: `resp-${Date.now()}`,
    surveyId: survey.id,
    surveyTitle: survey.title,
    projectId: survey.projectId,
    phase: survey.phase,
    submittedAt: new Date().toISOString(),
    respondentName: respondentName?.trim() || undefined,
    respondentType,
    answers,
    csat,
    nps,
    ces,
    verbatim,
    keyTopics: extractTopics(verbatim),
    sentiment,
    status: 'new',
  };
}

export function deriveSentiment(csat?: number, nps?: number): Sentiment {
  if (csat !== undefined) {
    if (csat >= 4) return 'positive';
    if (csat <= 2) return 'negative';
  }
  if (nps !== undefined) {
    if (nps >= 9) return 'positive';
    if (nps <= 6) return 'negative';
  }
  return 'neutral';
}

function extractTopics(verbatim?: string): string[] {
  if (!verbatim?.trim()) return [];
  const words = verbatim.split(/[,;.!?\n]+/).map((s) => s.trim()).filter((s) => s.length > 8);
  return words.slice(0, 3);
}

export function computeStats(responses: SurveyResponse[]): SatisfactionStats {
  const withCsat = responses.filter((r) => r.csat !== undefined);
  const withNps = responses.filter((r) => r.nps !== undefined);
  const withCes = responses.filter((r) => r.ces !== undefined);
  const promoters = withNps.filter((r) => r.nps! >= 9).length;
  const detractors = withNps.filter((r) => r.nps! <= 6).length;
  const positive = responses.filter((r) => r.sentiment === 'positive').length;

  return {
    totalResponses: responses.length,
    avgCsat: withCsat.length
      ? (withCsat.reduce((s, r) => s + r.csat!, 0) / withCsat.length).toFixed(1)
      : '—',
    npsScore: withNps.length ? Math.round(((promoters - detractors) / withNps.length) * 100) : 0,
    avgCes: withCes.length
      ? (withCes.reduce((s, r) => s + r.ces!, 0) / withCes.length).toFixed(1)
      : '—',
    satisfactionRate: responses.length ? Math.round((positive / responses.length) * 100) : 0,
    pendingCount: responses.filter((r) => r.status === 'new' || r.status === 'analyzing').length,
    promoters,
    detractors,
  };
}

export function computeTopicInsights(responses: SurveyResponse[]): TopicInsight[] {
  const map = new Map<string, { count: number; sentiments: Sentiment[]; examples: string[] }>();

  for (const r of responses) {
    for (const topic of r.keyTopics) {
      const entry = map.get(topic) ?? { count: 0, sentiments: [], examples: [] };
      entry.count += 1;
      entry.sentiments.push(r.sentiment);
      if (r.verbatim && entry.examples.length < 2) entry.examples.push(r.verbatim.slice(0, 80));
      map.set(topic, entry);
    }
  }

  return [...map.entries()]
    .map(([topic, data]) => {
      const pos = data.sentiments.filter((s) => s === 'positive').length;
      const neg = data.sentiments.filter((s) => s === 'negative').length;
      const sentiment: Sentiment = neg > pos ? 'negative' : pos > data.sentiments.length / 2 ? 'positive' : 'neutral';
      return { topic, count: data.count, sentiment, examples: data.examples };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

export function computeWeeklyCsat(responses: SurveyResponse[]): WeeklyCsatPoint[] {
  const withCsat = responses.filter((r) => r.csat !== undefined);
  if (withCsat.length === 0) return [];

  const buckets = new Map<string, { sum: number; count: number }>();
  for (const r of withCsat) {
    const d = new Date(r.submittedAt);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay() + 1);
    const key = weekStart.toISOString().slice(0, 10);
    const b = buckets.get(key) ?? { sum: 0, count: 0 };
    b.sum += r.csat!;
    b.count += 1;
    buckets.set(key, b);
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7)
    .map(([key, { sum, count }], i) => ({
      label: `S${i + 1}`,
      value: Math.round((sum / count) * 10) / 10,
      count,
    }));
}

export function phaseLabel(phase: string): string {
  const labels: Record<string, string> = {
    study: 'Étude',
    prototype: 'Prototype',
    launch: 'Lancement',
    'post-delivery': 'Post-livraison',
    continuous: 'Continu',
  };
  return labels[phase] ?? phase;
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    draft: 'Brouillon',
    active: 'Actif',
    closed: 'Clôturé',
    new: 'Nouveau',
    analyzing: 'En analyse',
    'action-planned': 'Action planifiée',
    resolved: 'Résolu',
  };
  return map[status] ?? status;
}

export function respondentLabel(type?: string): string {
  const map: Record<string, string> = {
    parent: 'Parent',
    child: 'Enfant',
    teacher: 'Enseignant',
    expert: 'Expert',
    other: 'Autre',
  };
  return type ? map[type] ?? type : '—';
}

export function statusTone(status: string): string {
  const map: Record<string, string> = {
    draft: 'bg-stone-100 text-stone-700 border-stone-200',
    active: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    closed: 'bg-stone-100 text-stone-600 border-stone-200',
    new: 'bg-blue-50 text-blue-800 border-blue-200',
    analyzing: 'bg-amber-50 text-amber-800 border-amber-200',
    'action-planned': 'bg-orange-50 text-orange-800 border-orange-200',
    resolved: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  };
  return map[status] ?? 'bg-stone-100 text-stone-700 border-stone-200';
}

export function sentimentTone(s: Sentiment): string {
  return s === 'positive'
    ? 'bg-green-100 text-green-700 border-green-200'
    : s === 'negative'
    ? 'bg-red-100 text-red-700 border-red-200'
    : 'bg-yellow-100 text-yellow-700 border-yellow-200';
}

export const inputClass =
  'w-full rounded-xl border border-stone-200 bg-stone-50/60 px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 transition focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10';

export const labelClass = 'block text-sm font-medium text-stone-700 mb-1.5';

export const sectionClass =
  'rounded-2xl border border-stone-200/90 bg-white p-4 sm:p-6 shadow-sm space-y-4 min-w-0';

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
