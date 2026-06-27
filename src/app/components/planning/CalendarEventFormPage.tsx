import type { FormEvent } from 'react';
import type { CalendarEvent, CalendarEventLink, CalendarEventReminder } from '../../types/calendarEvent';
import { ViewShell } from '../shared';
import { PageBackHeader } from '../shared/PageBackHeader';
import { normalizeUrl } from '../../utils/calendarEventPresentation';

export interface CalendarEventFormValues {
  title: string;
  date: string;
  type: CalendarEvent['type'];
  time: string;
  endTime: string;
  allDay: boolean;
  location: string;
  videoConferenceUrl: string;
  description: string;
  notes: string;
  priority: 'low' | 'medium' | 'high';
  participantsText: string;
  links: CalendarEventLink[];
  reminders: CalendarEventReminder[];
  linkedDocumentIds: string[];
}

interface DocOption {
  id: string;
  title: string;
}

export interface CalendarEventFormPageProps {
  mode: 'create' | 'edit';
  values: CalendarEventFormValues;
  documents: DocOption[];
  onChange: (values: CalendarEventFormValues) => void;
  onBack: () => void;
  onSubmit: (e: FormEvent) => void;
}

const REMINDER_PRESETS = [
  { minutes: 15, label: '15 min avant' },
  { minutes: 30, label: '30 min avant' },
  { minutes: 60, label: '1 h avant' },
  { minutes: 1440, label: '1 jour avant' },
];

function newId(): string {
  return `cal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function eventToFormValues(event?: CalendarEvent | null): CalendarEventFormValues {
  if (!event) {
    return {
      title: '',
      date: '',
      type: 'meeting',
      time: '',
      endTime: '',
      allDay: false,
      location: '',
      videoConferenceUrl: '',
      description: '',
      notes: '',
      priority: 'medium',
      participantsText: '',
      links: [],
      reminders: [],
      linkedDocumentIds: [],
    };
  }
  const y = event.date.getFullYear();
  const m = String(event.date.getMonth() + 1).padStart(2, '0');
  const d = String(event.date.getDate()).padStart(2, '0');
  return {
    title: event.title,
    date: `${y}-${m}-${d}`,
    type: event.type === 'gantt-bar' ? 'meeting' : event.type,
    time: event.time ?? '',
    endTime: event.endTime ?? '',
    allDay: event.allDay ?? false,
    location: event.location ?? '',
    videoConferenceUrl: event.videoConferenceUrl ?? '',
    description: event.description ?? '',
    notes: event.notes ?? '',
    priority: event.priority ?? 'medium',
    participantsText: (event.participants ?? []).join(', '),
    links: event.links ?? [],
    reminders: event.reminders ?? [],
    linkedDocumentIds: event.linkedDocumentIds ?? [],
  };
}

export function formValuesToEvent(
  values: CalendarEventFormValues,
  base: Partial<CalendarEvent> & { id: string; projectId?: string }
): CalendarEvent {
  const participants = values.participantsText
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);

  return {
    id: base.id,
    projectId: base.projectId,
    source: base.source ?? 'manual',
    title: values.title.trim(),
    date: new Date(values.date),
    type: values.type,
    time: values.allDay || values.type === 'deadline' ? undefined : values.time || undefined,
    endTime: values.allDay || !values.endTime ? undefined : values.endTime,
    allDay: values.allDay,
    location: values.location.trim() || undefined,
    videoConferenceUrl: values.videoConferenceUrl.trim()
      ? normalizeUrl(values.videoConferenceUrl)
      : undefined,
    description: values.description.trim() || undefined,
    notes: values.notes.trim() || undefined,
    priority: values.type === 'deadline' ? values.priority : undefined,
    participants: participants.length ? participants : base.participants,
    links: values.links.filter((l) => l.label.trim() && l.url.trim()).length
      ? values.links
          .filter((l) => l.label.trim() && l.url.trim())
          .map((l) => ({ ...l, url: normalizeUrl(l.url) }))
      : undefined,
    reminders: values.reminders.length ? values.reminders : undefined,
    linkedDocumentIds: values.linkedDocumentIds.length ? values.linkedDocumentIds : undefined,
    linkedMeetingId: base.linkedMeetingId,
    linkedTaskId: base.linkedTaskId,
    ceremonyType: base.ceremonyType,
  };
}

export function CalendarEventFormPage({
  mode,
  values,
  documents,
  onChange,
  onBack,
  onSubmit,
}: CalendarEventFormPageProps) {
  const set = (patch: Partial<CalendarEventFormValues>) => onChange({ ...values, ...patch });

  const toggleReminder = (minutes: number, label: string) => {
    const exists = values.reminders.find((r) => r.minutesBefore === minutes);
    if (exists) {
      set({ reminders: values.reminders.filter((r) => r.minutesBefore !== minutes) });
    } else {
      set({
        reminders: [...values.reminders, { id: newId(), minutesBefore: minutes, label }],
      });
    }
  };

  return (
    <ViewShell narrow>
      <PageBackHeader
        title={mode === 'create' ? 'Nouvel événement' : "Modifier l'événement"}
        subtitle="Comme Google Calendar — lieu, visio, notes, liens et rappels"
        onBack={onBack}
      />
      <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5 shadow-sm">
        <Field label="Titre *">
          <input
            type="text"
            required
            value={values.title}
            onChange={(e) => set({ title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            placeholder="Ex: Sprint Review #12"
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Type">
            <select value={values.type} onChange={(e) => set({ type: e.target.value as CalendarEvent['type'] })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent">
              <option value="meeting">Réunion</option>
              <option value="deadline">Échéance</option>
              <option value="event">Événement</option>
            </select>
          </Field>
          <Field label="Date *">
            <input type="date" required value={values.date} onChange={(e) => set({ date: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent" />
          </Field>
        </div>

        {values.type !== 'deadline' && (
          <>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={values.allDay} onChange={(e) => set({ allDay: e.target.checked })} />
              Toute la journée
            </label>
            {!values.allDay && (
              <div className="grid grid-cols-2 gap-4">
                <Field label="Début">
                  <input type="time" value={values.time} onChange={(e) => set({ time: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent" />
                </Field>
                <Field label="Fin">
                  <input type="time" value={values.endTime} onChange={(e) => set({ endTime: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent" />
                </Field>
              </div>
            )}
          </>
        )}

        <Field label="Lieu">
          <input
            type="text"
            value={values.location}
            onChange={(e) => set({ location: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            placeholder="Salle Atlas, 12 rue de la Paix, Paris…"
          />
        </Field>

        {values.type !== 'deadline' && (
          <Field label="Lien visioconférence">
            <input
              type="url"
              value={values.videoConferenceUrl}
              onChange={(e) => set({ videoConferenceUrl: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="https://meet.google.com/…"
            />
          </Field>
        )}

        <Field label="Participants">
          <input
            type="text"
            value={values.participantsText}
            onChange={(e) => set({ participantsText: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            placeholder="Alice Martin, Bob Dupont…"
          />
          <p className="text-xs text-slate-400 mt-1">Séparez les noms par des virgules.</p>
        </Field>

        <Field label="Description">
          <textarea
            value={values.description}
            onChange={(e) => set({ description: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-y"
            placeholder="Ordre du jour, contexte…"
          />
        </Field>

        <Field label="Notes">
          <textarea
            value={values.notes}
            onChange={(e) => set({ notes: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-y"
            placeholder="Notes privées"
          />
        </Field>

        {values.type === 'deadline' && (
          <Field label="Priorité">
            <select value={values.priority} onChange={(e) => set({ priority: e.target.value as CalendarEventFormValues['priority'] })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent">
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
            </select>
          </Field>
        )}

        <Field label="Liens">
          {values.links.map((link, idx) => (
            <div key={link.id} className="flex gap-2 mb-2">
              <input
                type="text"
                value={link.label}
                onChange={(e) => {
                  const links = [...values.links];
                  links[idx] = { ...link, label: e.target.value };
                  set({ links });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent flex-1"
                placeholder="Libellé"
              />
              <input
                type="url"
                value={link.url}
                onChange={(e) => {
                  const links = [...values.links];
                  links[idx] = { ...link, url: e.target.value };
                  set({ links });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent flex-[2]"
                placeholder="URL"
              />
              <button type="button" onClick={() => set({ links: values.links.filter((l) => l.id !== link.id) })} className="text-red-600 text-sm px-2">
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => set({ links: [...values.links, { id: newId(), label: '', url: '' }] })}
            className="text-sm text-violet-700 font-medium"
          >
            + Ajouter un lien
          </button>
        </Field>

        {documents.length > 0 && (
          <Field label="Documents ISO liés">
            <div className="space-y-2 max-h-40 overflow-y-auto border border-slate-100 rounded-xl p-3">
              {documents.map((doc) => (
                <label key={doc.id} className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={values.linkedDocumentIds.includes(doc.id)}
                    onChange={(e) => {
                      const ids = e.target.checked
                        ? [...values.linkedDocumentIds, doc.id]
                        : values.linkedDocumentIds.filter((id) => id !== doc.id);
                      set({ linkedDocumentIds: ids });
                    }}
                  />
                  <span className="truncate">{doc.title}</span>
                </label>
              ))}
            </div>
          </Field>
        )}

        {values.type !== 'deadline' && (
          <Field label="Rappels">
            <div className="flex flex-wrap gap-2">
              {REMINDER_PRESETS.map((p) => {
                const active = values.reminders.some((r) => r.minutesBefore === p.minutes);
                return (
                  <button
                    key={p.minutes}
                    type="button"
                    onClick={() => toggleReminder(p.minutes, p.label)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                      active ? 'bg-violet-600 text-white border-violet-600' : 'border-slate-200 text-slate-600 hover:border-violet-300'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </Field>
        )}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onBack} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50">
            Annuler
          </button>
          <button type="submit" className="flex-1 px-4 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 font-medium">
            {mode === 'create' ? 'Créer l\'événement' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </ViewShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      {children}
    </div>
  );
}
