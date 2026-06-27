import type {
  CalendarEvent,
  CalendarEventEnrichment,
  CalendarEventStored,
} from '../types/calendarEvent';
import { CALENDAR_STORAGE_KEY } from '../data/initialMeetings';

export const CALENDAR_ENRICHMENTS_KEY = 'popilot:calendar-enrichments';

export function serializeEvents(events: CalendarEvent[]): CalendarEventStored[] {
  return events.map((e) => ({ ...e, date: e.date.toISOString() }));
}

export function deserializeEvents(raw: unknown): CalendarEvent[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((e) => ({
      ...e,
      date: new Date(e.date),
    }))
    .filter((e) => !Number.isNaN(e.date.getTime()));
}

export function loadEnrichments(): Record<string, CalendarEventEnrichment> {
  try {
    const raw = localStorage.getItem(CALENDAR_ENRICHMENTS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, CalendarEventEnrichment>) : {};
  } catch {
    return {};
  }
}

export function saveEnrichment(eventId: string, patch: CalendarEventEnrichment): void {
  const all = loadEnrichments();
  all[eventId] = { ...all[eventId], ...patch, updatedAt: new Date().toISOString() };
  try {
    localStorage.setItem(CALENDAR_ENRICHMENTS_KEY, JSON.stringify(all));
    window.dispatchEvent(new CustomEvent('popilot:calendar-updated'));
  } catch {
    // ignore
  }
}

export function mergeEventEnrichment(
  event: CalendarEvent,
  enrichment?: CalendarEventEnrichment
): CalendarEvent {
  if (!enrichment) return event;
  return {
    ...event,
    location: enrichment.location ?? event.location,
    endTime: enrichment.endTime ?? event.endTime,
    allDay: enrichment.allDay ?? event.allDay,
    notes: enrichment.notes !== undefined ? enrichment.notes : event.notes,
    videoConferenceUrl: enrichment.videoConferenceUrl ?? event.videoConferenceUrl,
    links: enrichment.links !== undefined ? enrichment.links : event.links,
    attachments: enrichment.attachments !== undefined ? enrichment.attachments : event.attachments,
    linkedDocumentIds:
      enrichment.linkedDocumentIds !== undefined ? enrichment.linkedDocumentIds : event.linkedDocumentIds,
    reminders: enrichment.reminders !== undefined ? enrichment.reminders : event.reminders,
    organizer: enrichment.organizer ?? event.organizer,
  };
}

export function applyEnrichmentsToEvents(
  events: CalendarEvent[],
  enrichments = loadEnrichments()
): CalendarEvent[] {
  return events.map((e) => mergeEventEnrichment(e, enrichments[e.id]));
}

export function loadCalendarEventsFromStorage(): CalendarEvent[] {
  try {
    const raw = localStorage.getItem(CALENDAR_STORAGE_KEY);
    const saved = raw ? deserializeEvents(JSON.parse(raw)) : [];
    return applyEnrichmentsToEvents(saved);
  } catch {
    return [];
  }
}

export function isEventCoreEditable(event: CalendarEvent): boolean {
  return !event.source || event.source === 'manual';
}
