import type { ClientSurvey, SurveyResponse } from '../types/satisfaction';
import { SATISFACTION_RESPONSES_KEY, SATISFACTION_SURVEYS_KEY } from '../types/satisfaction';

export function generateShareToken(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function getSurveyPublicUrl(token: string): string {
  if (typeof window === 'undefined') return `/enquete/${token}`;
  return `${window.location.origin}/enquete/${token}`;
}

export function loadAllSurveys(): ClientSurvey[] {
  try {
    const raw = localStorage.getItem(SATISFACTION_SURVEYS_KEY);
    return raw ? (JSON.parse(raw) as ClientSurvey[]) : [];
  } catch {
    return [];
  }
}

export function saveAllSurveys(surveys: ClientSurvey[]) {
  try {
    localStorage.setItem(SATISFACTION_SURVEYS_KEY, JSON.stringify(surveys));
  } catch {
    /* ignore */
  }
}

export function loadAllResponses(): SurveyResponse[] {
  try {
    const raw = localStorage.getItem(SATISFACTION_RESPONSES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SurveyResponse[];
    return parsed.map(normalizeLegacyResponse);
  } catch {
    return [];
  }
}

export function saveAllResponses(responses: SurveyResponse[]) {
  try {
    localStorage.setItem(SATISFACTION_RESPONSES_KEY, JSON.stringify(responses));
  } catch {
    /* ignore */
  }
}

export function findSurveyByToken(token: string): ClientSurvey | undefined {
  return loadAllSurveys().find((s) => s.shareToken === token);
}

export function appendResponse(response: SurveyResponse) {
  const responses = loadAllResponses();
  saveAllResponses([response, ...responses]);
}

function normalizeLegacyResponse(r: SurveyResponse & { date?: string; respondent?: string }): SurveyResponse {
  if (r.answers && r.submittedAt) return r;
  return {
    ...r,
    submittedAt: r.submittedAt ?? r.date ?? new Date().toISOString().slice(0, 10),
    respondentName: r.respondentName ?? r.respondent,
    answers: r.answers ?? {},
    keyTopics: r.keyTopics ?? [],
    sentiment: r.sentiment ?? 'neutral',
    status: r.status ?? 'new',
  };
}
