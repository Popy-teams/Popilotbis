import { useEffect, useMemo, useState } from 'react';
import { useProjectContext } from '../context/ProjectContext';
import { filterByActiveProject } from '../utils/projectMatch';
import { DEMO_CALENDAR_BY_PROJECT } from '../data/multiProjectDemoFixtures';
import { mergeDemoData } from '../utils/demoDataMerge';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Users,
  AlertCircle,
  Calendar as CalendarIcon,
  Pencil,
  Trash2,
} from 'lucide-react';
import { PageBackHeader } from './shared/PageBackHeader';
import { ViewShell, ViewHeader, viewGrids, TableWrap, AppIcon, IconButton, ActionButton } from './shared';
import { MeetingGanttPanel } from './meetings/MeetingGanttPanel';
import { loadGanttItems, CALENDAR_STORAGE_KEY } from '../utils/meetingSync';
import type { GanttItem } from '../types/scrumMeetings';

interface CalendarEvent {
  id: string;
  projectId?: string;
  title: string;
  date: Date;
  type: 'meeting' | 'deadline' | 'event' | 'gantt-bar';
  time?: string;
  endDate?: string;
  participants?: string[];
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  linkedMeetingId?: string;
  linkedTaskId?: string;
  source?: 'manual' | 'meeting-sync';
}

type PageMode = 'calendar' | 'gantt' | 'create' | 'view' | 'edit';

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

const emptyForm = {
  title: '',
  date: '',
  type: 'meeting' as CalendarEvent['type'],
  time: '',
  description: '',
  priority: 'medium' as 'low' | 'medium' | 'high',
};

function serializeEvents(events: CalendarEvent[]) {
  return events.map((e) => ({ ...e, date: e.date.toISOString() }));
}

function deserializeEvents(raw: unknown): CalendarEvent[] {
  if (!Array.isArray(raw)) return DEFAULT_EVENTS;
  return raw
    .map((e) => ({
      ...e,
      date: new Date(e.date),
    }))
    .filter((e) => !Number.isNaN(e.date.getTime()));
}

function formatDateInput(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getTypeLabel(type: CalendarEvent['type']) {
  switch (type) {
    case 'meeting':
      return 'Réunion';
    case 'deadline':
      return 'Échéance';
    case 'event':
      return 'Événement';
    case 'gantt-bar':
      return 'Gantt (réunion)';
  }
}

function getPriorityLabel(priority: CalendarEvent['priority']) {
  switch (priority) {
    case 'low':
      return 'Basse';
    case 'medium':
      return 'Moyenne';
    case 'high':
      return 'Haute';
    default:
      return '';
  }
}

export function Calendar() {
  const { matchesProject, activeProjectSlug, activeProject } = useProjectContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [pageMode, setPageMode] = useState<PageMode>('calendar');
  const [events, setEvents] = useState<CalendarEvent[]>(DEFAULT_EVENTS);
  const [ganttItems, setGanttItems] = useState<GanttItem[]>(() => loadGanttItems());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [form, setForm] = useState(emptyForm);

  const reloadEvents = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const saved = raw ? deserializeEvents(JSON.parse(raw)) : [];
      const demoEvents = DEMO_CALENDAR_BY_PROJECT.map((e) => ({
        ...e,
        date: new Date(e.date),
      }));
      setEvents(mergeDemoData(saved, demoEvents, DEFAULT_EVENTS));
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    reloadEvents();
  }, []);

  useEffect(() => {
    const refresh = () => {
      reloadEvents();
      setGanttItems(loadGanttItems());
    };
    window.addEventListener('popilot:calendar-updated', refresh);
    window.addEventListener('popilot:gantt-updated', refresh);
    return () => {
      window.removeEventListener('popilot:calendar-updated', refresh);
      window.removeEventListener('popilot:gantt-updated', refresh);
    };
  }, []);

  useEffect(() => {
    if (pageMode === 'create' || pageMode === 'edit') return;
    try {
      const manual = events.filter((e) => e.source !== 'meeting-sync');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeEvents(manual)));
    } catch {}
  }, [events, pageMode]);

  const scopedEvents = useMemo(
    () => filterByActiveProject(events, matchesProject),
    [events, matchesProject]
  );

  const scopedGantt = useMemo(
    () => ganttItems.filter((g) => matchesProject(g.projectId ?? 'popy')),
    [ganttItems, matchesProject]
  );

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
    scopedEvents.filter(
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
      ...emptyForm,
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
    setForm({
      title: event.title,
      date: formatDateInput(event.date),
      type: event.type,
      time: event.time ?? '',
      description: event.description ?? '',
      priority: event.priority ?? 'medium',
    });
    setPageMode('edit');
  };

  const toEvent = (base?: CalendarEvent): CalendarEvent => ({
    id: base?.id ?? Date.now().toString(),
    projectId: base?.projectId ?? activeProjectSlug ?? 'popy',
    title: form.title,
    date: new Date(form.date),
    type: form.type,
    time: form.type !== 'deadline' && form.time ? form.time : undefined,
    description: form.description || undefined,
    priority: form.type === 'deadline' ? form.priority : undefined,
    participants: base?.participants,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.date) return;

    const next = toEvent(pageMode === 'edit' ? selectedEvent ?? undefined : undefined);
    if (pageMode === 'create') {
      setEvents((prev) => [...prev, next]);
    } else {
      setEvents((prev) => prev.map((ev) => (ev.id === next.id ? next : ev)));
      setSelectedEvent(next);
    }
    setForm(emptyForm);
    setPageMode(pageMode === 'create' ? 'calendar' : 'view');
  };

  const handleDelete = (id: string) => {
    setEvents((prev) => prev.filter((ev) => ev.id !== id));
    setSelectedEvent(null);
    setPageMode('calendar');
  };

  const eventFormPage = (
    <ViewShell narrow>
      <PageBackHeader
        title={pageMode === 'create' ? 'Nouvel événement' : "Modifier l'événement"}
        subtitle="Réunions, événements et échéances importantes"
        onBack={() => {
          setForm(emptyForm);
          setPageMode(selectedEvent ? 'view' : 'calendar');
        }}
      />
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Titre de l'événement *</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Ex: Réunion d'équipe..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as CalendarEvent['type'] })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="meeting">Réunion</option>
              <option value="deadline">Échéance</option>
              <option value="event">Événement</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {form.type !== 'deadline' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Heure (optionnel)</label>
            <input
              type="time"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        )}

        {form.type === 'deadline' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priorité</label>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value as CalendarEvent['priority'] })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description (optionnel)</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Ajoutez des détails..."
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setForm(emptyForm);
              setPageMode(selectedEvent ? 'view' : 'calendar');
            }}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {pageMode === 'create' ? 'Ajouter' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </ViewShell>
  );

  if (pageMode === 'create' || pageMode === 'edit') return eventFormPage;

  if (pageMode === 'view' && selectedEvent) {
    const event = selectedEvent;
    const EventIcon = getEventIcon(event.type);

    return (
      <ViewShell>
        <PageBackHeader
          title={event.title}
          subtitle={getTypeLabel(event.type)}
          onBack={() => {
            setSelectedEvent(null);
            setPageMode('calendar');
          }}
          actions={
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => openEdit(event)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Pencil className="w-4 h-4" />
                Modifier
              </button>
              <button
                type="button"
                onClick={() => handleDelete(event.id)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 text-red-700 rounded-lg hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>
            </div>
          }
        />
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${getEventColor(event.type)}`}>
              <EventIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{getTypeLabel(event.type)}</p>
              <p className="font-medium text-gray-900 flex items-center gap-2 mt-1">
                <CalendarIcon className="w-4 h-4 text-gray-500" />
                {event.date.toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
                {event.time && (
                  <>
                    <Clock className="w-4 h-4 text-gray-500 ml-2" />
                    {event.time}
                  </>
                )}
              </p>
            </div>
          </div>

          {event.priority && (
            <div>
              <span className="text-sm font-medium text-gray-700">Priorité : </span>
              <span className="text-sm text-gray-900">{getPriorityLabel(event.priority)}</span>
            </div>
          )}

          {event.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">Description</h3>
              <p className="text-gray-600">{event.description}</p>
            </div>
          )}

          {event.participants && event.participants.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Participants
              </h3>
              <ul className="space-y-1">
                {event.participants.map((p) => (
                  <li key={p} className="text-sm text-gray-600">
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </ViewShell>
    );
  }

  const days = getDaysInMonth(currentDate);

  if (pageMode === 'gantt') {
    return (
      <ViewShell>
        <ViewHeader
          title="Planning — Gantt"
          subtitle="Barres synchronisées depuis les comptes rendus de réunion"
          badge="Planning · Gantt"
          theme="violet"
          actions={
            <ActionButton variant="secondary" onClick={() => setPageMode('calendar')}>
              Retour au calendrier
            </ActionButton>
          }
        />
        <MeetingGanttPanel
          items={scopedGantt}
          projectName={activeProject?.name ?? 'Projet'}
          title={`Gantt — ${activeProject?.name ?? 'Projet'}`}
        />
      </ViewShell>
    );
  }

  return (
    <ViewShell>
      <ViewHeader
        title="Calendrier & Planning"
        subtitle="Réunions Scrum, échéances de projet et diagramme de Gantt synchronisé"
        badge="Planning · Calendrier"
        theme="violet"
        actions={
          <div className="flex gap-2">
            <ActionButton variant="secondary" onClick={() => setPageMode('gantt')}>
              Voir le Gantt
            </ActionButton>
            <ActionButton icon={Plus} onClick={() => openCreate(selectedDate ?? undefined)}>
              Nouvel événement
            </ActionButton>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
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

                  return (
                    <div
                      key={index}
                      onClick={() => setSelectedDate(day.date)}
                      className={`min-h-16 sm:min-h-24 p-1.5 sm:p-2 rounded-lg border cursor-pointer transition-all ${
                        day.isCurrentMonth
                          ? 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-sm'
                          : 'bg-gray-50 border-gray-100'
                      } ${isTodayDate ? 'ring-2 ring-indigo-500' : ''}`}
                    >
                      <div
                        className={`text-sm font-medium mb-1 ${
                          day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                        } ${isTodayDate ? 'text-indigo-600 font-bold' : ''}`}
                      >
                        {day.date.getDate()}
                      </div>

                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            className={`text-xs px-2 py-1 rounded ${getEventColor(event.type)} text-white truncate`}
                            title={event.title}
                          >
                            {event.time && <span className="mr-1">{event.time}</span>}
                            {event.title}
                          </div>
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
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Légende</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-blue-500" />
                <span className="text-sm text-gray-700">Réunions</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-red-500" />
                <span className="text-sm text-gray-700">Échéances</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-green-500" />
                <span className="text-sm text-gray-700">Événements</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-violet-500" />
                <span className="text-sm text-gray-700">Gantt (sync réunions)</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Prochains événements</h3>
            <div className="space-y-3">
              {scopedEvents
                .filter((event) => event.date >= new Date())
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

          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
            <h3 className="font-semibold mb-4">Ce mois-ci</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-indigo-100">Réunions</span>
                <span className="text-2xl font-bold">
                  {scopedEvents.filter((e) => e.type === 'meeting' && e.date.getMonth() === currentDate.getMonth()).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-indigo-100">Échéances</span>
                <span className="text-2xl font-bold">
                  {scopedEvents.filter((e) => e.type === 'deadline' && e.date.getMonth() === currentDate.getMonth()).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-indigo-100">Événements</span>
                <span className="text-2xl font-bold">
                  {scopedEvents.filter((e) => e.type === 'event' && e.date.getMonth() === currentDate.getMonth()).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ViewShell>
  );
}
