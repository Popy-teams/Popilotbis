import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useProjectContext } from '../context/ProjectContext';
import { filterByActiveProject } from '../utils/projectMatch';
import { buildPlanningCalendarDemo } from '../data/planningDemoFixtures';
import { mergeDemoData } from '../utils/demoDataMerge';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Users,
  AlertCircle,
  Calendar as CalendarIcon,
  List,
  BarChart3,
  Sparkles,
  Filter,
} from 'lucide-react';
import {
  ViewShell,
  ActionButton,
  IconButton,
  ViewHero,
  ViewStatCard,
  ViewStatsGrid,
  ViewTabPills,
  ViewTabBtn,
  ViewSectionTitle,
} from './shared';
import { MeetingGanttPanel } from './meetings/MeetingGanttPanel';
import {
  loadGanttItems,
  loadMeetings,
  CALENDAR_STORAGE_KEY,
} from '../utils/meetingSync';
import { TASKS_STORAGE_KEY } from '../utils/pipelineSync';
import { getRoutePath } from '../routes/viewRoutes';
import type { GanttItem } from '../types/scrumMeetings';
import type { TestTask } from '../data/testData';
import {
  buildPlanningInsights,
  eventsThisWeek,
  groupEventsByWeek,
  type PlanningInsight,
} from '../utils/planningInsights';
import {
  PlanningAssistantHeader,
  PlanningIntelligencePanel,
} from './planning/PlanningIntelligencePanel';
import { CalendarEventDetailPage } from './planning/CalendarEventDetailPage';
import {
  CalendarEventFormPage,
  eventToFormValues,
  formValuesToEvent,
  type CalendarEventFormValues,
} from './planning/CalendarEventFormPage';
import type { CalendarEvent } from '../types/calendarEvent';
import {
  serializeEvents,
  deserializeEvents,
  applyEnrichmentsToEvents,
  loadEnrichments,
} from '../utils/calendarEventStore';
import {
  getCeremonyBadge,
  getEventColorClass as getEventColor,
  formatDateInput,
} from '../utils/calendarEventPresentation';
import { DOCS_STORAGE_KEY } from '../utils/pipelineSync';

type PageMode = 'create' | 'view' | 'edit';
type ListTab = 'calendar' | 'agenda' | 'gantt';
type TypeFilter = 'all' | CalendarEvent['type'];

const STORAGE_KEY = CALENDAR_STORAGE_KEY;

const DEFAULT_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'Réunion de lancement POPY',
    date: new Date(2026, 0, 20),
    type: 'meeting',
    time: '14:00',
    participants: ['Jean Dupont', 'Marie Martin', 'Pierre Dubois'],
    description: 'Kickoff du projet POPY',
  },
  {
    id: '2',
    title: 'Revue de conception',
    date: new Date(2026, 0, 22),
    type: 'meeting',
    time: '10:00',
    participants: ['Jean Dupont', 'Sophie Bernard'],
  },
  {
    id: '3',
    title: 'Livraison prototype V1',
    date: new Date(2026, 0, 25),
    type: 'deadline',
    priority: 'high',
    description: 'Date limite pour la livraison du premier prototype',
  },
  {
    id: '4',
    title: 'Formation équipe',
    date: new Date(2026, 0, 28),
    type: 'event',
    time: '09:00',
    description: 'Formation sur les nouveaux outils',
  },
];

const emptyForm: CalendarEventFormValues = eventToFormValues(null);

function loadProjectDocuments(projectId?: string): { id: string; title: string }[] {
  try {
    const raw = localStorage.getItem(DOCS_STORAGE_KEY);
    const docs = raw ? JSON.parse(raw) : [];
    return docs
      .filter((d: { linkedTo?: { projectId?: string } }) => !projectId || d.linkedTo?.projectId === projectId)
      .map((d: { id: string; title: string }) => ({ id: d.id, title: d.title }));
  } catch {
    return [];
  }
}

function loadTasksForInsights(): TestTask[] {
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function Calendar() {
  const navigate = useNavigate();
  const { matchesProject, activeProjectSlug, activeProject } = useProjectContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [listTab, setListTab] = useState<ListTab>('calendar');
  const [pageMode, setPageMode] = useState<PageMode | 'list'>('list');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [events, setEvents] = useState<CalendarEvent[]>(DEFAULT_EVENTS);
  const [ganttItems, setGanttItems] = useState<GanttItem[]>(() => loadGanttItems());
  const [meetings, setMeetings] = useState(() => loadMeetings());
  const [tasks, setTasks] = useState<TestTask[]>(() => loadTasksForInsights());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [form, setForm] = useState<CalendarEventFormValues>(emptyForm);

  const documents = useMemo(
    () => loadProjectDocuments(activeProjectSlug ?? 'popy'),
    [activeProjectSlug, events]
  );

  const reloadEvents = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const saved = raw ? deserializeEvents(JSON.parse(raw)) : [];
      const planningDemo = buildPlanningCalendarDemo().map((e) => ({
        ...e,
        date: new Date(e.date),
      }));
      const merged = mergeDemoData(saved, planningDemo, DEFAULT_EVENTS);
      setEvents(applyEnrichmentsToEvents(merged, loadEnrichments()));
    } catch {
      /* ignore */
    }
  };

  const refreshAll = () => {
    reloadEvents();
    setGanttItems(loadGanttItems());
    setMeetings(loadMeetings());
    setTasks(loadTasksForInsights());
  };

  useEffect(() => {
    refreshAll();
  }, []);

  useEffect(() => {
    const refresh = () => refreshAll();
    window.addEventListener('popilot:calendar-updated', refresh);
    window.addEventListener('popilot:gantt-updated', refresh);
    window.addEventListener('popilot:pipeline-updated', refresh);
    return () => {
      window.removeEventListener('popilot:calendar-updated', refresh);
      window.removeEventListener('popilot:gantt-updated', refresh);
      window.removeEventListener('popilot:pipeline-updated', refresh);
    };
  }, []);

  useEffect(() => {
    if (pageMode === 'create' || pageMode === 'edit') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeEvents(events)));
    } catch {}
  }, [events, pageMode]);

  const scopedEvents = useMemo(
    () => filterByActiveProject(events, matchesProject),
    [events, matchesProject]
  );

  const filteredEvents = useMemo(
    () => (typeFilter === 'all' ? scopedEvents : scopedEvents.filter((e) => e.type === typeFilter)),
    [scopedEvents, typeFilter]
  );

  const scopedMeetings = useMemo(
    () => meetings.filter((m) => matchesProject(m.projectId ?? 'popy')),
    [meetings, matchesProject]
  );

  const scopedTasks = useMemo(
    () => tasks.filter((t) => matchesProject(t.projectId ?? 'popy')),
    [tasks, matchesProject]
  );

  const insights = useMemo(
    () => buildPlanningInsights(filteredEvents, scopedMeetings, scopedTasks),
    [filteredEvents, scopedMeetings, scopedTasks]
  );

  const weekEvents = useMemo(() => eventsThisWeek(filteredEvents), [filteredEvents]);

  const agendaGroups = useMemo(() => groupEventsByWeek(filteredEvents), [filteredEvents]);

  const scopedGantt = useMemo(
    () => ganttItems.filter((g) => matchesProject(g.projectId ?? 'popy')),
    [ganttItems, matchesProject]
  );

  const monthStats = useMemo(() => {
    const m = currentDate.getMonth();
    const y = currentDate.getFullYear();
    const inMonth = filteredEvents.filter(
      (e) => e.date.getMonth() === m && e.date.getFullYear() === y
    );
    return {
      meetings: inMonth.filter((e) => e.type === 'meeting').length,
      deadlines: inMonth.filter((e) => e.type === 'deadline').length,
      events: inMonth.filter((e) => e.type === 'event').length,
      gantt: scopedGantt.length,
    };
  }, [filteredEvents, currentDate, scopedGantt]);

  const handleInsightAction = (insight: PlanningInsight) => {
    if (insight.id === 'overdue-tasks' || insight.id === 'critical-deadlines') {
      navigate(`/${getRoutePath('tasks')}`);
      return;
    }
    navigate(`/${getRoutePath('meetings')}`);
  };

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
  ];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const startingDayOfWeek = firstDay.getDay();
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevMonthDay = new Date(year, month, -startingDayOfWeek + i + 1);
      days.push({ date: prevMonthDay, isCurrentMonth: false });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return days;
  };

  const getEventsForDate = (date: Date) =>
    filteredEvents.filter(
      (event) =>
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear()
    );

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const today = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date: Date) => {
    const now = new Date();
    return (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-500';
      case 'deadline':
        return 'bg-red-500';
      case 'event':
        return 'bg-green-500';
      case 'gantt-bar':
        return 'bg-violet-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'meeting':
        return Users;
      case 'deadline':
        return AlertCircle;
      case 'event':
        return CalendarIcon;
      default:
        return CalendarIcon;
    }
  };

  const openCreate = (prefillDate?: Date) => {
    setForm({
      ...eventToFormValues(null),
      date: prefillDate ? formatDateInput(prefillDate) : '',
    });
    setSelectedEvent(null);
    setPageMode('create');
  };

  const openView = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setPageMode('view');
  };

  const openEdit = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setForm(eventToFormValues(event));
    setPageMode('edit');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.date) return;

    const base = pageMode === 'edit' && selectedEvent
      ? selectedEvent
      : { id: Date.now().toString(), projectId: activeProjectSlug ?? 'popy', source: 'manual' as const };

    const next = formValuesToEvent(form, {
      id: base.id,
      projectId: base.projectId,
      source: base.source ?? 'manual',
      participants: 'participants' in base ? base.participants : undefined,
      linkedMeetingId: 'linkedMeetingId' in base ? base.linkedMeetingId : undefined,
      linkedTaskId: 'linkedTaskId' in base ? base.linkedTaskId : undefined,
      ceremonyType: 'ceremonyType' in base ? base.ceremonyType : undefined,
    });

    if (pageMode === 'create') {
      setEvents((prev) => [...prev, next]);
    } else {
      setEvents((prev) => prev.map((ev) => (ev.id === next.id ? next : ev)));
      setSelectedEvent(next);
    }
    setForm(emptyForm);
    setPageMode(pageMode === 'create' ? 'list' : 'view');
  };

  const handleDuplicate = (event: CalendarEvent) => {
    const copy: CalendarEvent = {
      ...event,
      id: `dup-${Date.now()}`,
      title: `${event.title} (copie)`,
      source: 'manual',
      linkedMeetingId: undefined,
    };
    setEvents((prev) => [...prev, copy]);
    setSelectedEvent(copy);
    setPageMode('view');
  };

  const handleEventUpdated = (updated: CalendarEvent) => {
    setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    setSelectedEvent(updated);
  };

  const handleDelete = (id: string) => {
    setEvents((prev) => prev.filter((ev) => ev.id !== id));
    setSelectedEvent(null);
    setPageMode('list');
  };

  if (pageMode === 'create' || pageMode === 'edit') {
    return (
      <CalendarEventFormPage
        mode={pageMode}
        values={form}
        documents={documents}
        onChange={setForm}
        onBack={() => {
          setForm(emptyForm);
          setPageMode(selectedEvent ? 'view' : 'list');
        }}
        onSubmit={handleSubmit}
      />
    );
  }

  if (pageMode === 'view' && selectedEvent) {
    return (
      <CalendarEventDetailPage
        event={selectedEvent}
        allEvents={filteredEvents}
        documents={documents}
        onBack={() => {
          setSelectedEvent(null);
          setPageMode('list');
        }}
        onEdit={() => openEdit(selectedEvent)}
        onDelete={() => handleDelete(selectedEvent.id)}
        onNavigateMeetings={() => navigate(`/${getRoutePath('meetings')}`)}
        onNavigateTasks={() => navigate(`/${getRoutePath('tasks')}`)}
        onNavigateDocs={() => navigate(`/${getRoutePath('documentation')}`)}
        onEventUpdated={handleEventUpdated}
        onDuplicate={handleDuplicate}
      />
    );
  }

  const days = getDaysInMonth(currentDate);

  const typeFilters: { id: TypeFilter; label: string }[] = [
    { id: 'all', label: 'Tous' },
    { id: 'meeting', label: 'Réunions' },
    { id: 'deadline', label: 'Échéances' },
    { id: 'event', label: 'Événements' },
    { id: 'gantt-bar', label: 'Gantt' },
  ];

  return (
    <ViewShell>
      <ViewHero
        title="Planning intelligent"
        subtitle={`Vue unifiée pour ${activeProject?.name ?? 'POPY'} — cérémonies Scrum, jalons, échéances et Gantt synchronisé avec les comptes rendus.`}
        badge="Planning · Calendrier & Gantt"
        theme="violet"
        actions={
          <ActionButton icon={Plus} onClick={() => openCreate(selectedDate ?? undefined)}>
            Nouvel événement
          </ActionButton>
        }
        stats={
          <ViewStatsGrid cols={4}>
            <ViewStatCard onDark label="Cette semaine" value={String(weekEvents.length)} icon={CalendarIcon} gradient="from-violet-500 to-purple-500" hint="événements planifiés" />
            <ViewStatCard onDark label="Réunions (mois)" value={String(monthStats.meetings)} icon={Users} gradient="from-blue-500 to-cyan-500" />
            <ViewStatCard onDark label="Échéances (mois)" value={String(monthStats.deadlines)} icon={AlertCircle} gradient="from-rose-500 to-red-500" />
            <ViewStatCard onDark label="Barres Gantt" value={String(monthStats.gantt)} icon={BarChart3} gradient="from-indigo-500 to-violet-500" hint="sync CR" />
          </ViewStatsGrid>
        }
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <ViewTabPills>
          <ViewTabBtn active={listTab === 'calendar'} onClick={() => setListTab('calendar')} icon={CalendarIcon}>
            Calendrier
          </ViewTabBtn>
          <ViewTabBtn active={listTab === 'agenda'} onClick={() => setListTab('agenda')} icon={List}>
            Agenda
          </ViewTabBtn>
          <ViewTabBtn active={listTab === 'gantt'} onClick={() => setListTab('gantt')} icon={BarChart3}>
            Gantt annuel
          </ViewTabBtn>
        </ViewTabPills>

        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {typeFilters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setTypeFilter(f.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                typeFilter === f.id
                  ? 'bg-violet-600 text-white border-violet-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {listTab === 'gantt' ? (
        <MeetingGanttPanel
          items={scopedGantt}
          projectName={activeProject?.name ?? 'Projet'}
          title={`Gantt — ${activeProject?.name ?? 'Projet'}`}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {listTab === 'calendar' ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                    <button
                      onClick={today}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Aujourd'hui
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconButton icon={ChevronLeft} label="Mois précédent" onClick={previousMonth} />
                    <IconButton icon={ChevronRight} label="Mois suivant" onClick={nextMonth} />
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {dayNames.map((day) => (
                      <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {days.map((day, index) => {
                      const dayEvents = getEventsForDate(day.date);
                      const isTodayDate = isToday(day.date);
                      const isSelected =
                        selectedDate &&
                        day.date.getDate() === selectedDate.getDate() &&
                        day.date.getMonth() === selectedDate.getMonth() &&
                        day.date.getFullYear() === selectedDate.getFullYear();

                      return (
                        <div
                          key={index}
                          onClick={() => setSelectedDate(day.date)}
                          className={`min-h-16 sm:min-h-24 p-1.5 sm:p-2 rounded-lg border cursor-pointer transition-all ${
                            day.isCurrentMonth
                              ? 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-sm'
                              : 'bg-gray-50 border-gray-100'
                          } ${isTodayDate ? 'ring-2 ring-indigo-500' : ''} ${isSelected ? 'border-violet-400 bg-violet-50/40' : ''}`}
                        >
                          <div
                            className={`text-sm font-medium mb-1 ${
                              day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                            } ${isTodayDate ? 'text-indigo-600 font-bold' : ''}`}
                          >
                            {day.date.getDate()}
                            {dayEvents.length > 0 && (
                              <span className="ml-1 text-[10px] text-violet-600 font-semibold">
                                ({dayEvents.length})
                              </span>
                            )}
                          </div>

                          <div className="space-y-1">
                            {dayEvents.slice(0, 2).map((event) => (
                              <button
                                key={event.id}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openView(event);
                                }}
                                className={`w-full text-left text-xs px-2 py-1 rounded ${getEventColor(event.type)} text-white truncate hover:opacity-90`}
                                title={event.title}
                              >
                                {event.time && <span className="mr-1">{event.time}</span>}
                                {event.title}
                              </button>
                            ))}
                            {dayEvents.length > 2 && (
                              <div className="text-xs text-gray-500 px-2">+{dayEvents.length - 2} autre(s)</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <ViewSectionTitle icon={List} title="Agenda à venir" count={agendaGroups.reduce((n, g) => n + g.events.length, 0)} />
                {agendaGroups.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-slate-500 text-sm">
                    Aucun événement à afficher avec les filtres actuels.
                  </div>
                ) : (
                  agendaGroups.map((group) => (
                    <div key={group.label} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                      <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 font-semibold text-slate-800 text-sm">
                        {group.label}
                      </div>
                      <div className="divide-y divide-slate-100">
                        {group.events.map((event) => {
                          const EventIcon = getEventIcon(event.type);
                          const badge = getCeremonyBadge(event.ceremonyType);
                          return (
                            <button
                              key={event.id}
                              type="button"
                              onClick={() => openView(event as CalendarEvent)}
                              className="w-full flex items-start gap-4 p-4 hover:bg-slate-50 text-left transition-colors"
                            >
                              <div className={`p-2.5 rounded-xl shrink-0 ${getEventColor(event.type)}`}>
                                <EventIcon className="w-4 h-4 text-white" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-medium text-slate-900">{event.title}</span>
                                  {badge ? (
                                    <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                                      {badge}
                                    </span>
                                  ) : null}
                                </div>
                                <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                                  <CalendarIcon className="w-3 h-3" />
                                  {event.date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                                  {event.time ? (
                                    <>
                                      <Clock className="w-3 h-3" />
                                      {event.time}
                                    </>
                                  ) : null}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {selectedDate && listTab === 'calendar' && (
              <div className="bg-violet-50 border border-violet-100 rounded-xl p-4">
                <p className="text-sm font-semibold text-violet-900 mb-2">
                  {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
                <div className="space-y-2">
                  {getEventsForDate(selectedDate).length === 0 ? (
                    <p className="text-xs text-violet-700">Aucun événement ce jour — ajoutez-en un.</p>
                  ) : (
                    getEventsForDate(selectedDate).map((ev) => (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => openView(ev)}
                        className="w-full text-left text-sm px-3 py-2 rounded-lg bg-white border border-violet-100 hover:border-violet-300"
                      >
                        {ev.time ? `${ev.time} — ` : ''}
                        {ev.title}
                      </button>
                    ))
                  )}
                  <ActionButton variant="secondary" icon={Plus} onClick={() => openCreate(selectedDate)}>
                    Ajouter sur ce jour
                  </ActionButton>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <PlanningAssistantHeader />
              <PlanningIntelligencePanel insights={insights} onAction={handleInsightAction} />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <ViewSectionTitle icon={Sparkles} title="Prochains événements" count={5} />
              <div className="space-y-3 mt-4">
                {filteredEvents
                  .filter((event) => event.date >= new Date(new Date().setHours(0, 0, 0, 0)))
                  .sort((a, b) => a.date.getTime() - b.date.getTime())
                  .slice(0, 5)
                  .map((event) => {
                    const EventIcon = getEventIcon(event.type);
                    return (
                      <button
                        key={event.id}
                        type="button"
                        onClick={() => openView(event)}
                        className="w-full flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                      >
                        <div className={`p-2 rounded-lg ${getEventColor(event.type)}`}>
                          <EventIcon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-sm truncate">{event.title}</div>
                          <div className="text-xs text-gray-600 mt-1 flex items-center gap-2">
                            <CalendarIcon className="w-3 h-3" />
                            {event.date.toLocaleDateString('fr-FR')}
                            {event.time && (
                              <>
                                <Clock className="w-3 h-3 ml-1" />
                                {event.time}
                              </>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Légende</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-blue-500" />
                  <span className="text-sm text-gray-700">Réunions & cérémonies</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-red-500" />
                  <span className="text-sm text-gray-700">Échéances & jalons</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-green-500" />
                  <span className="text-sm text-gray-700">Événements & formations</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-violet-500" />
                  <span className="text-sm text-gray-700">Barres Gantt (sync CR)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </ViewShell>
  );
}
