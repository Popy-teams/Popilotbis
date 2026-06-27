import { useEffect, useMemo, useState } from 'react';
import {
  Filter,
  BarChart3,
  List,
  FileText,
  Calendar,
  CheckCircle2,
  Link2,
  Sparkles,
} from 'lucide-react';
import { useProjectContext } from '../context/ProjectContext';
import { usePipeline } from '../context/PipelineContext';
import { calculateCurrentWriter, calculateNextWriter } from '../types/meetings';
import type { ScrumMeetingRecord, ScrumMeetingType, GanttItem } from '../types/scrumMeetings';
import {
  SCRUM_MEETING_LABELS,
  defaultAgendaForType,
} from '../types/scrumMeetings';
import {
  loadMeetings,
  saveMeetings,
  loadGanttItems,
  publishMeetingReport,
  upsertPlannedMeetingCalendar,
  getPipelineStagesForProject,
} from '../utils/meetingSync';
import { ViewShell, SearchField, ViewStatCard, ViewStatsGrid, ViewSectionTitle, ViewTabPills, ViewTabBtn, ViewEmptyState, ViewFilterPanel } from './shared';
import { FormSelect } from './shared/FormSelect';
import {
  MeetingFormPage,
  emptyMeetingForm,
  type MeetingFormValues,
} from './meetings/MeetingFormPage';
import {
  MeetingReportPage,
} from './meetings/MeetingReportPage';
import { buildReportForm, mergeReportActions, type ReportFormState, getPendingActionsForMeeting, buildDraftMeetingFromForm } from '../utils/meetingFollowUp';
import { loadAllTasks } from '../utils/pipelineSync';
import { MeetingDetailPage } from './meetings/MeetingDetailPage';
import { MeetingGanttPanel } from './meetings/MeetingGanttPanel';
import { MeetingCard } from './meetings/MeetingCard';
import { MeetingsHero } from './meetings/MeetingsHero';
import {
  getNextMeetingNumber,
  getSuggestedSprintNumber,
  buildDefaultMeetingTitle,
} from './meetings/scrumPresentation';
import { TEST_TEAM_MEMBERS } from '../data/testData';

type PageMode = 'list' | 'create' | 'view' | 'edit' | 'report';
type ListTab = 'overview' | 'reports' | 'gantt';

const ROTATION = {
  id: 'rotation-1',
  projectId: 'popy',
  membersOrder: TEST_TEAM_MEMBERS.slice(0, 4).map((m) => m.id),
  memberNames: TEST_TEAM_MEMBERS.slice(0, 4).map((m) => m.name),
  periodDays: 15,
  startDate: '2026-01-01',
};

function meetingToForm(m: ScrumMeetingRecord): MeetingFormValues {
  return {
    title: m.title,
    meetingType: m.meetingType,
    sprintNumber: m.sprintNumber ? String(m.sprintNumber) : '',
    date: m.date,
    time: m.time,
    duration: m.duration,
    participants: m.participants,
    facilitator: m.facilitator ?? '',
  };
}

function buildMeetingFromForm(
  values: MeetingFormValues,
  base: Partial<ScrumMeetingRecord>,
  writer: { writerId: string; writerName: string }
): ScrumMeetingRecord {
  return {
    id: base.id ?? `meeting-${Date.now()}`,
    number: base.number ?? 1,
    title: values.title.trim(),
    meetingType: values.meetingType,
    sprintNumber: values.sprintNumber ? parseInt(values.sprintNumber, 10) : undefined,
    date: values.date,
    time: values.time,
    duration: values.duration,
    participants: values.participants,
    writerId: writer.writerId,
    writerName: writer.writerName,
    facilitator: values.facilitator || undefined,
    status: base.status ?? 'planned',
    hasReport: base.hasReport ?? false,
    projectId: base.projectId,
    projectName: base.projectName ?? 'POPY',
    agenda: base.agenda?.length ? base.agenda : defaultAgendaForType(values.meetingType),
    roundTable: base.roundTable ?? [],
    decisions: base.decisions ?? [],
    actions: base.actions ?? [],
    notes: base.notes,
    linkedDocumentId: base.linkedDocumentId,
    linkedTaskIds: base.linkedTaskIds,
    annexes: base.annexes,
  };
}

export function MeetingsView() {
  const { matchesProject, activeProjectSlug, activeProject } = useProjectContext();
  const { stages } = usePipeline();
  const [pageMode, setPageMode] = useState<PageMode>('list');
  const [listTab, setListTab] = useState<ListTab>('overview');
  const [meetings, setMeetings] = useState<ScrumMeetingRecord[]>(() => loadMeetings());
  const [ganttItems, setGanttItems] = useState<GanttItem[]>(() => loadGanttItems());
  const [selectedMeeting, setSelectedMeeting] = useState<ScrumMeetingRecord | null>(null);
  const [form, setForm] = useState<MeetingFormValues>(emptyMeetingForm());
  const [reportForm, setReportForm] = useState<ReportFormState>(() => ({
    decisions: [],
    followUpActions: [],
    newActions: [],
    notes: '',
    roundTableNotes: '',
  }));
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [typeFilter, setTypeFilter] = useState<ScrumMeetingType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [publishMessage, setPublishMessage] = useState<string | null>(null);

  const refreshGantt = () => setGanttItems(loadGanttItems());

  useEffect(() => {
    saveMeetings(meetings);
  }, [meetings]);

  useEffect(() => {
    const onGantt = () => refreshGantt();
    window.addEventListener('popilot:gantt-updated', onGantt);
    return () => window.removeEventListener('popilot:gantt-updated', onGantt);
  }, []);

  const scopedMeetings = useMemo(
    () => meetings.filter((m) => matchesProject(m.projectId ?? 'popy')),
    [meetings, matchesProject]
  );

  const scopedGantt = useMemo(
    () => ganttItems.filter((g) => matchesProject(g.projectId ?? 'popy')),
    [ganttItems, matchesProject]
  );

  const pipelineStages = useMemo(
    () => getPipelineStagesForProject(activeProjectSlug ?? 'popy', stages),
    [activeProjectSlug, stages]
  );

  const currentWriterId = calculateCurrentWriter(ROTATION, new Date().toISOString());
  const currentWriterIndex = ROTATION.membersOrder.indexOf(currentWriterId);
  const currentWriterName = ROTATION.memberNames[currentWriterIndex] ?? '—';
  const nextWriter = calculateNextWriter(ROTATION, currentWriterId);
  const nextWriterIndex = ROTATION.membersOrder.indexOf(nextWriter.nextWriterId);
  const nextWriterName = ROTATION.memberNames[nextWriterIndex] ?? '—';

  const getWriterForDate = (date: string) => {
    const writerId = calculateCurrentWriter(ROTATION, date);
    const idx = ROTATION.membersOrder.indexOf(writerId);
    return { writerId, writerName: ROTATION.memberNames[idx] ?? 'Non assigné' };
  };

  const filteredMeetings = useMemo(() => {
    return scopedMeetings
      .filter((m) => {
        if (typeFilter !== 'all' && m.meetingType !== typeFilter) return false;
        if (dateFrom && m.date < dateFrom) return false;
        if (dateTo && m.date > dateTo) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          return (
            m.title.toLowerCase().includes(q) ||
            m.writerName.toLowerCase().includes(q) ||
            String(m.number).includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [scopedMeetings, typeFilter, dateFrom, dateTo, searchQuery]);

  const upcomingMeetings = scopedMeetings.filter((m) => m.status === 'planned');
  const publishedReports = filteredMeetings.filter((m) => m.hasReport);

  const stats = {
    planned: upcomingMeetings.length,
    published: scopedMeetings.filter((m) => m.hasReport).length,
    decisions: scopedMeetings.reduce((a, m) => a + (m.decisions ?? []).length, 0),
    tasksLinked: scopedMeetings.reduce((a, m) => a + (m.linkedTaskIds?.length ?? 0), 0),
  };

  const openCreate = (type: ScrumMeetingType = 'review') => {
    const projectId = activeProjectSlug ?? 'popy';
    const sprint = getSuggestedSprintNumber(meetings, projectId, type);
    const ceremonyNum = getNextMeetingNumber(meetings, type, projectId);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setForm({
      ...emptyMeetingForm(type),
      sprintNumber: String(sprint),
      title: buildDefaultMeetingTitle(type, sprint, ceremonyNum),
      date: tomorrow.toISOString().slice(0, 10),
      participants: TEST_TEAM_MEMBERS.slice(0, 4).map((m) => m.name),
    });
    setSelectedMeeting(null);
    setPageMode('create');
  };

  const applyCreateDefaultsForType = (type: ScrumMeetingType) => {
    const projectId = activeProjectSlug ?? 'popy';
    const sprint = getSuggestedSprintNumber(meetings, projectId, type);
    const ceremonyNum = getNextMeetingNumber(meetings, type, projectId);
    setForm((prev) => ({
      ...prev,
      meetingType: type,
      sprintNumber: String(sprint),
      title: buildDefaultMeetingTitle(type, sprint, ceremonyNum),
      duration: type === 'daily' ? 15 : type === 'planning' ? 120 : 60,
    }));
  };

  const projectId = activeProjectSlug ?? 'popy';

  const formPendingTasks = useMemo(() => {
    if (pageMode !== 'create' && pageMode !== 'edit') return [];
    const ceremonyNum = getNextMeetingNumber(meetings, form.meetingType, projectId);
    const draft = buildDraftMeetingFromForm(
      form,
      pageMode === 'edit' && selectedMeeting ? selectedMeeting.number : ceremonyNum,
      projectId,
      activeProject?.name ?? 'POPY'
    );
    if (pageMode === 'edit' && selectedMeeting) {
      Object.assign(draft, { id: selectedMeeting.id, number: selectedMeeting.number });
    }
    return getPendingActionsForMeeting(draft, meetings, loadAllTasks());
  }, [pageMode, form, meetings, projectId, activeProject?.name, selectedMeeting]);

  const formPreviousSprint = form.sprintNumber
    ? Math.max(1, parseInt(form.sprintNumber, 10) - 1)
    : undefined;

  const openEdit = (meeting: ScrumMeetingRecord) => {
    setSelectedMeeting(meeting);
    setForm(meetingToForm(meeting));
    setPageMode('edit');
  };

  const openView = (meeting: ScrumMeetingRecord) => {
    setSelectedMeeting(meeting);
    setPageMode('view');
  };

  const openReport = (meeting: ScrumMeetingRecord) => {
    setSelectedMeeting(meeting);
    setReportForm(buildReportForm(meeting, meetings));
    setPageMode('report');
  };

  const deleteMeeting = (id: string) => {
    if (!confirm('Supprimer cette réunion ?')) return;
    setMeetings((prev) => prev.filter((m) => m.id !== id));
    setSelectedMeeting(null);
    setPageMode('list');
  };

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const writer = getWriterForDate(form.date);

    if (pageMode === 'create') {
      const projectId = activeProjectSlug ?? 'popy';
      const nextNumber = getNextMeetingNumber(meetings, form.meetingType, projectId);
      const created = buildMeetingFromForm(form, {
        number: nextNumber,
        projectId,
        projectName: activeProject?.name ?? 'POPY',
        status: 'planned',
      }, writer);
      setMeetings((prev) => [created, ...prev]);
      upsertPlannedMeetingCalendar(created);
      setPageMode('list');
    } else if (pageMode === 'edit' && selectedMeeting) {
      const updated = buildMeetingFromForm(form, selectedMeeting, writer);
      setMeetings((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      upsertPlannedMeetingCalendar(updated);
      setSelectedMeeting(updated);
      setPageMode('view');
    }
    setForm(emptyMeetingForm());
  };

  const handlePublishReport = () => {
    if (!selectedMeeting) return;
    const allActions = mergeReportActions(reportForm);
    const draft: ScrumMeetingRecord = {
      ...selectedMeeting,
      decisions: reportForm.decisions.filter((d) => d.description.trim()),
      actions: allActions,
      notes: reportForm.notes,
    };
    const result = publishMeetingReport(draft, pipelineStages);
    setMeetings((prev) => prev.map((m) => (m.id === result.meeting.id ? result.meeting : m)));
    refreshGantt();
    const followUp = reportForm.followUpActions.length;
    const newCount = reportForm.newActions.filter((a) => a.description.trim()).length;
    setPublishMessage(
      `CR publié : ${result.createdTasks.length} nouvelle(s) tâche(s), ${followUp} suivi(s), ${newCount} action(s) créée(s) — Tâches, Gantt & Planning mis à jour.`
    );
    setSelectedMeeting(null);
    setPageMode('list');
    setListTab('gantt');
    setTimeout(() => setPublishMessage(null), 8000);
  };

  if (pageMode === 'create' || pageMode === 'edit') {
    return (
      <MeetingFormPage
        mode={pageMode}
        values={form}
        writerName={form.date ? getWriterForDate(form.date).writerName : currentWriterName}
        periodDays={ROTATION.periodDays}
        pendingTasks={formPendingTasks}
        previousSprint={formPreviousSprint}
        onBack={() => setPageMode(pageMode === 'edit' && selectedMeeting ? 'view' : 'list')}
        onSubmit={submitForm}
        onChange={setForm}
        onTypeChange={pageMode === 'create' ? applyCreateDefaultsForType : undefined}
      />
    );
  }

  if (pageMode === 'view' && selectedMeeting) {
    return (
      <MeetingDetailPage
        meeting={selectedMeeting}
        allMeetings={meetings}
        onBack={() => { setPageMode('list'); setSelectedMeeting(null); }}
        onEdit={() => openEdit(selectedMeeting)}
        onReport={() => openReport(selectedMeeting)}
        onDelete={() => deleteMeeting(selectedMeeting.id)}
      />
    );
  }

  if (pageMode === 'report' && selectedMeeting) {
    return (
      <MeetingReportPage
        meeting={selectedMeeting}
        form={reportForm}
        stages={pipelineStages}
        onBack={() => { setPageMode('view'); }}
        onChange={setReportForm}
        onPublish={handlePublishReport}
      />
    );
  }

  return (
    <ViewShell>
      <MeetingsHero
        projectName={activeProject?.name ?? 'Projet'}
        onCreate={openCreate}
        onCreateDefault={() => openCreate('review')}
        currentWriter={currentWriterName}
        nextWriter={nextWriterName}
        nextWriterDate={nextWriter.startDate}
        rotationNames={ROTATION.memberNames}
        periodDays={ROTATION.periodDays}
      />

      {publishMessage ? (
        <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 px-5 py-4 text-sm text-emerald-900 flex items-center gap-3 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          {publishMessage}
        </div>
      ) : null}

      <ViewStatsGrid cols={4}>
        <ViewStatCard label="Planifiées" value={String(stats.planned)} gradient="from-blue-500 to-cyan-500" icon={Calendar} />
        <ViewStatCard label="CR publiés" value={String(stats.published)} gradient="from-emerald-500 to-teal-500" icon={CheckCircle2} />
        <ViewStatCard label="Décisions" value={String(stats.decisions)} gradient="from-violet-500 to-purple-500" icon={FileText} />
        <ViewStatCard label="Tâches liées" value={String(stats.tasksLinked)} gradient="from-orange-500 to-amber-500" icon={Link2} />
      </ViewStatsGrid>

      <ViewTabPills>
        <ViewTabBtn active={listTab === 'overview'} onClick={() => setListTab('overview')} icon={List}>
          Vue d&apos;ensemble
        </ViewTabBtn>
        <ViewTabBtn active={listTab === 'reports'} onClick={() => setListTab('reports')} icon={FileText}>
          Comptes rendus
        </ViewTabBtn>
        <ViewTabBtn active={listTab === 'gantt'} onClick={() => setListTab('gantt')} icon={BarChart3}>
          Gantt
        </ViewTabBtn>
      </ViewTabPills>

      {listTab === 'gantt' ? (
        <MeetingGanttPanel
          items={scopedGantt}
          projectName={activeProject?.name ?? 'Projet'}
          title={`Planning annuel — ${activeProject?.name ?? 'Projet'}`}
        />
      ) : (
        <>
          <ViewFilterPanel>
            <div className="flex flex-col lg:flex-row gap-3 lg:items-end">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Recherche</label>
                <SearchField
                  placeholder="Réunion, rédacteur, numéro..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Type</label>
                <FormSelect
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as ScrumMeetingType | 'all')}
                  wrapperClassName="min-w-[160px]"
                  size="sm"
                >
                  <option value="all">Tous les types</option>
                  {(Object.keys(SCRUM_MEETING_LABELS) as ScrumMeetingType[]).map((t) => (
                    <option key={t} value={t}>
                      {SCRUM_MEETING_LABELS[t]}
                    </option>
                  ))}
                </FormSelect>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Du</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50/50 w-full min-w-[140px]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Au</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50/50 w-full min-w-[140px]"
                />
              </div>
              {(dateFrom || dateTo || typeFilter !== 'all' || searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setDateFrom('');
                    setDateTo('');
                    setTypeFilter('all');
                    setSearchQuery('');
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium px-2 py-2"
                >
                  Effacer
                </button>
              )}
            </div>
          </ViewFilterPanel>

          {listTab === 'overview' && upcomingMeetings.length > 0 && (
            <section className="space-y-4">
              <ViewSectionTitle icon={Sparkles} title="Cérémonies à venir" count={upcomingMeetings.length} />
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {upcomingMeetings.map((meeting) => (
                  <MeetingCard
                    key={meeting.id}
                    meeting={meeting}
                    highlight={meeting.writerName === currentWriterName}
                    onView={() => openView(meeting)}
                    onReport={() => openReport(meeting)}
                  />
                ))}
              </div>
            </section>
          )}

          <section className="space-y-4">
            <ViewSectionTitle
              icon={Filter}
              title={listTab === 'reports' ? 'Historique des comptes rendus' : 'Toutes les réunions'}
              count={listTab === 'reports' ? publishedReports.length : filteredMeetings.length}
            />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {(listTab === 'reports' ? publishedReports : filteredMeetings).map((meeting) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  highlight={meeting.writerName === currentWriterName && meeting.status === 'planned'}
                  onView={() => openView(meeting)}
                  onReport={() => openReport(meeting)}
                  onDelete={listTab === 'reports' ? () => deleteMeeting(meeting.id) : undefined}
                />
              ))}
              {(listTab === 'reports' ? publishedReports : filteredMeetings).length === 0 && (
                <div className="col-span-full">
                  <ViewEmptyState
                    icon={Calendar}
                    title="Aucune réunion ne correspond aux filtres"
                    description="Planifiez une cérémonie depuis l'en-tête"
                  />
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </ViewShell>
  );
}
