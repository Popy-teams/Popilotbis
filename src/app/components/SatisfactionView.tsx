import { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useProjectContext } from '../context/ProjectContext';
import { filterByActiveProject } from '../utils/projectMatch';
import { mergeDemoData } from '../utils/demoDataMerge';
import { INITIAL_SURVEYS, INITIAL_SURVEY_RESPONSES, SATISFACTION_FIXTURE_VERSION } from '../data/satisfactionDemoData';
import {
  loadAllSurveys,
  loadAllResponses,
  saveAllSurveys,
  saveAllResponses,
  getSurveyPublicUrl,
} from '../utils/satisfactionStorage';
import type {
  ClientSurvey,
  SatisfactionPageMode,
  SatisfactionTab,
  SurveyFormValues,
  SurveyPhase,
  SurveyResponse,
} from '../types/satisfaction';
import { ViewShell, ViewHeader, ActionButton } from './shared';
import { SatisfactionTabNav } from './satisfaction/SatisfactionTabNav';
import { SatisfactionOverviewTab } from './satisfaction/SatisfactionOverviewTab';
import { SatisfactionSurveysTab } from './satisfaction/SatisfactionSurveysTab';
import { SatisfactionResponsesTab } from './satisfaction/SatisfactionResponsesTab';
import { SurveyFormPage } from './satisfaction/SurveyFormPage';
import { SurveyDetailPage } from './satisfaction/SurveyDetailPage';
import { ResponseDetailPage } from './satisfaction/ResponseDetailPage';
import {
  buildSurveyFromForm,
  computeStats,
  copyToClipboard,
  emptySurveyForm,
  surveyToFormValues,
} from './satisfaction/satisfactionPresentation';

export function SatisfactionView() {
  const { matchesProject, activeProject, activeProjectSlug, ready } = useProjectContext();
  const [pageMode, setPageMode] = useState<SatisfactionPageMode>('list');
  const [activeTab, setActiveTab] = useState<SatisfactionTab>('overview');
  const [activePhase, setActivePhase] = useState<SurveyPhase | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [surveys, setSurveys] = useState<ClientSurvey[]>(INITIAL_SURVEYS);
  const [responses, setResponses] = useState<SurveyResponse[]>(INITIAL_SURVEY_RESPONSES);
  const [selectedSurvey, setSelectedSurvey] = useState<ClientSurvey | null>(null);
  const [selectedResponse, setSelectedResponse] = useState<SurveyResponse | null>(null);
  const [surveyForm, setSurveyForm] = useState<SurveyFormValues>(emptySurveyForm());
  const [copiedSurveyId, setCopiedSurveyId] = useState<string | null>(null);

  const projectId = activeProjectSlug ?? 'popy';

  useEffect(() => {
    const fixtureVersion = localStorage.getItem('popilot:satisfaction-fixture-version');
    const needsRefresh = fixtureVersion !== SATISFACTION_FIXTURE_VERSION;

    if (needsRefresh) {
      setSurveys(INITIAL_SURVEYS);
      setResponses(INITIAL_SURVEY_RESPONSES);
      saveAllSurveys(INITIAL_SURVEYS);
      saveAllResponses(INITIAL_SURVEY_RESPONSES);
      localStorage.setItem('popilot:satisfaction-fixture-version', SATISFACTION_FIXTURE_VERSION);
      return;
    }

    const savedSurveys = loadAllSurveys();
    const savedResponses = loadAllResponses();
    setSurveys(savedSurveys.length ? mergeDemoData(savedSurveys, INITIAL_SURVEYS) : INITIAL_SURVEYS);
    setResponses(
      savedResponses.length
        ? mergeDemoData(savedResponses, INITIAL_SURVEY_RESPONSES)
        : INITIAL_SURVEY_RESPONSES
    );
  }, []);

  useEffect(() => {
    saveAllSurveys(surveys);
  }, [surveys]);

  useEffect(() => {
    saveAllResponses(responses);
  }, [responses]);

  const scopedSurveys = useMemo(
    () => filterByActiveProject(surveys, matchesProject, activeProjectSlug ?? 'popy'),
    [surveys, matchesProject, activeProjectSlug]
  );

  const scopedResponses = useMemo(
    () => filterByActiveProject(responses, matchesProject, activeProjectSlug ?? 'popy'),
    [responses, matchesProject, activeProjectSlug]
  );

  const filteredResponses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return scopedResponses.filter((r) => {
      if (activePhase !== 'all' && r.phase !== activePhase) return false;
      if (!q) return true;
      return (
        r.surveyTitle.toLowerCase().includes(q) ||
        (r.verbatim?.toLowerCase().includes(q) ?? false) ||
        (r.respondentName?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [scopedResponses, searchQuery, activePhase]);

  const responseCountBySurvey = useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of scopedResponses) {
      map[r.surveyId] = (map[r.surveyId] ?? 0) + 1;
    }
    return map;
  }, [scopedResponses]);

  const stats = useMemo(() => computeStats(scopedResponses), [scopedResponses]);

  const goList = () => {
    setPageMode('list');
    setSelectedSurvey(null);
    setSelectedResponse(null);
  };

  const openCreateSurvey = () => {
    setSurveyForm(emptySurveyForm());
    setSelectedSurvey(null);
    setPageMode('survey-create');
  };

  const openEditSurvey = (survey: ClientSurvey) => {
    setSelectedSurvey(survey);
    setSurveyForm(surveyToFormValues(survey));
    setPageMode('survey-edit');
  };

  const openViewSurvey = (survey: ClientSurvey) => {
    setSelectedSurvey(survey);
    setPageMode('survey-view');
  };

  const openViewResponse = (response: SurveyResponse) => {
    setSelectedResponse(response);
    setPageMode('response-view');
  };

  const handleSurveySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!surveyForm.questions.length || !surveyForm.questions.every((q) => q.label.trim())) return;

    if (pageMode === 'survey-create') {
      const next = buildSurveyFromForm(surveyForm, undefined, projectId);
      setSurveys((prev) => [next, ...prev]);
      setSelectedSurvey(next);
      setPageMode('survey-view');
    } else if (pageMode === 'survey-edit' && selectedSurvey) {
      const next = buildSurveyFromForm(surveyForm, selectedSurvey, projectId);
      setSurveys((prev) => prev.map((s) => (s.id === next.id ? next : s)));
      setSelectedSurvey(next);
      setPageMode('survey-view');
    }
  };

  const removeSurvey = (id: string) => {
    setSurveys((prev) => prev.filter((s) => s.id !== id));
    goList();
  };

  const removeResponse = (id: string) => {
    setResponses((prev) => prev.filter((r) => r.id !== id));
    goList();
  };

  const updateResponseStatus = (id: string, status: SurveyResponse['status']) => {
    setResponses((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
    setSelectedResponse((prev) => (prev?.id === id ? { ...prev, status } : prev));
  };

  const handleCopyLink = async (survey: ClientSurvey) => {
    const ok = await copyToClipboard(getSurveyPublicUrl(survey.shareToken));
    if (ok) {
      setCopiedSurveyId(survey.id);
      setTimeout(() => setCopiedSurveyId(null), 2000);
    }
  };

  if (!ready) {
    return (
      <ViewShell>
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-emerald-200 border-t-emerald-600 animate-spin" />
          <p className="text-sm text-stone-500">Chargement satisfaction client…</p>
        </div>
      </ViewShell>
    );
  }

  if (pageMode === 'survey-create' || pageMode === 'survey-edit') {
    return (
      <SurveyFormPage
        mode={pageMode === 'survey-create' ? 'create' : 'edit'}
        values={surveyForm}
        onChange={setSurveyForm}
        onBack={() => {
          if (selectedSurvey && pageMode === 'survey-edit') setPageMode('survey-view');
          else goList();
        }}
        onSubmit={handleSurveySubmit}
      />
    );
  }

  if (pageMode === 'survey-view' && selectedSurvey) {
    const survey = scopedSurveys.find((s) => s.id === selectedSurvey.id) ?? selectedSurvey;
    return (
      <SurveyDetailPage
        survey={survey}
        responseCount={responseCountBySurvey[survey.id] ?? 0}
        linkCopied={copiedSurveyId === survey.id}
        onBack={goList}
        onEdit={() => openEditSurvey(survey)}
        onDelete={() => removeSurvey(survey.id)}
        onCopyLink={() => handleCopyLink(survey)}
        onOpenPublic={() => window.open(getSurveyPublicUrl(survey.shareToken), '_blank')}
      />
    );
  }

  if (pageMode === 'response-view' && selectedResponse) {
    const response = scopedResponses.find((r) => r.id === selectedResponse.id) ?? selectedResponse;
    return (
      <ResponseDetailPage
        response={response}
        onBack={goList}
        onDelete={() => removeResponse(response.id)}
        onStatusChange={(status) => updateResponseStatus(response.id, status)}
      />
    );
  }

  return (
    <ViewShell>
      <ViewHeader
        title="Satisfaction Client"
        subtitle={
          activeProject
            ? `${activeProject.name} — Sondages & retours clients`
            : 'Choisissez un projet dans le menu en haut'
        }
        badge="Feedback · ISO §9.1.2"
        theme="emerald"
        sidePanel={
          activeProject ? (
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-[11px] uppercase tracking-wide font-semibold text-emerald-700">Projet actif</p>
                <p className="font-semibold text-stone-900 mt-0.5">{activeProject.name}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide font-semibold text-stone-500">CSAT moyen</p>
                <p className="text-2xl font-bold text-emerald-700 mt-0.5">{stats.avgCsat}/5</p>
              </div>
              <div className="pt-2 border-t border-emerald-100">
                <p className="text-[11px] uppercase tracking-wide font-semibold text-stone-500">Sondages actifs</p>
                <p className="font-medium text-stone-800 mt-0.5">
                  {scopedSurveys.filter((s) => s.status === 'active').length} · {stats.totalResponses} réponses
                </p>
              </div>
            </div>
          ) : undefined
        }
        actions={
          <ActionButton icon={Plus} onClick={openCreateSurvey} className="w-full sm:w-auto justify-center !bg-emerald-600 hover:!bg-emerald-700 !text-white">
            Nouveau sondage
          </ActionButton>
        }
      />

      <SatisfactionTabNav
        activeTab={activeTab}
        onChange={setActiveTab}
        stats={{ surveys: scopedSurveys.length, responses: scopedResponses.length }}
      />

      <div className="rounded-xl sm:rounded-2xl border border-stone-200/90 bg-white p-3 sm:p-4 md:p-6 shadow-sm min-w-0 overflow-hidden">
        {activeTab === 'overview' && (
          <SatisfactionOverviewTab
            surveys={scopedSurveys}
            responses={scopedResponses}
            activePhase={activePhase}
            onPhaseChange={setActivePhase}
          />
        )}

        {activeTab === 'surveys' && (
          <SatisfactionSurveysTab
            surveys={scopedSurveys}
            responseCountBySurvey={responseCountBySurvey}
            onCreate={openCreateSurvey}
            onView={openViewSurvey}
            onEdit={openEditSurvey}
            onCopyLink={handleCopyLink}
            copiedSurveyId={copiedSurveyId}
          />
        )}

        {activeTab === 'responses' && (
          <SatisfactionResponsesTab
            responses={filteredResponses}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterPhase={activePhase}
            onFilterPhaseChange={setActivePhase}
            onView={openViewResponse}
          />
        )}
      </div>
    </ViewShell>
  );
}
