export type SurveyPhase = 'study' | 'prototype' | 'launch' | 'post-delivery' | 'continuous';

export type RespondentType = 'parent' | 'child' | 'teacher' | 'expert' | 'other';

export type SurveyQuestionType = 'csat' | 'nps' | 'ces' | 'text' | 'choice';

export type SurveyStatus = 'draft' | 'active' | 'closed';

export type ResponseStatus = 'new' | 'analyzing' | 'action-planned' | 'resolved';

export type Sentiment = 'positive' | 'neutral' | 'negative';

export type SatisfactionTab = 'overview' | 'surveys' | 'responses';

export type SatisfactionPageMode =
  | 'list'
  | 'survey-create'
  | 'survey-edit'
  | 'survey-view'
  | 'response-view';

export interface SurveyQuestion {
  id: string;
  type: SurveyQuestionType;
  label: string;
  required: boolean;
  options?: string[];
}

export interface ClientSurvey {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  phase: SurveyPhase;
  questions: SurveyQuestion[];
  shareToken: string;
  status: SurveyStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  surveyTitle: string;
  projectId?: string;
  phase: SurveyPhase;
  submittedAt: string;
  respondentName?: string;
  respondentType?: RespondentType;
  answers: Record<string, string | number>;
  csat?: number;
  ces?: number;
  nps?: number;
  verbatim?: string;
  keyTopics: string[];
  sentiment: Sentiment;
  linkedTasks?: string[];
  linkedRisks?: string[];
  status: ResponseStatus;
}

export interface SurveyFormValues {
  title: string;
  description: string;
  phase: SurveyPhase;
  status: SurveyStatus;
  questions: SurveyQuestionFormValues[];
}

export interface SurveyQuestionFormValues {
  id: string;
  type: SurveyQuestionType;
  label: string;
  required: boolean;
  /** Options séparées par des virgules (type choice) */
  optionsText: string;
}

export const QUESTION_TYPE_META: Record<
  SurveyQuestionType,
  { label: string; description: string; color: string }
> = {
  csat: { label: 'CSAT', description: 'Satisfaction 1–5', color: 'emerald' },
  nps: { label: 'NPS', description: 'Recommandation 0–10', color: 'blue' },
  ces: { label: 'CES', description: 'Effort 1–7', color: 'violet' },
  text: { label: 'Texte libre', description: 'Commentaire ouvert', color: 'amber' },
  choice: { label: 'Choix', description: 'Une option parmi plusieurs', color: 'rose' },
};

export interface SatisfactionStats {
  totalResponses: number;
  avgCsat: string;
  npsScore: number;
  avgCes: string;
  satisfactionRate: number;
  pendingCount: number;
  promoters: number;
  detractors: number;
}

export interface TopicInsight {
  topic: string;
  count: number;
  sentiment: Sentiment;
  examples: string[];
}

export interface WeeklyCsatPoint {
  label: string;
  value: number;
  count: number;
}

export const SATISFACTION_SURVEYS_KEY = 'popilot:satisfaction-surveys-local';
export const SATISFACTION_RESPONSES_KEY = 'popilot:satisfaction-local';

export const SURVEY_PHASES: {
  id: SurveyPhase;
  label: string;
  description: string;
}[] = [
  { id: 'study', label: 'Étude & Conception', description: 'Validation concept, besoins' },
  { id: 'prototype', label: 'Prototype & Tests', description: 'Tests terrain, retours enfants' },
  { id: 'launch', label: 'Lancement Produit', description: 'Onboarding, premières impressions' },
  { id: 'post-delivery', label: 'Post-Livraison', description: 'Satisfaction long terme' },
  { id: 'continuous', label: 'Feedback Continu', description: 'Améliorations, idées' },
];
