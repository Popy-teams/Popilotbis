export type CalendarEventType = 'meeting' | 'deadline' | 'event' | 'gantt-bar';
export type CalendarEventSource = 'manual' | 'meeting-sync' | 'planning-demo';
export type CalendarEventPriority = 'low' | 'medium' | 'high';

export interface CalendarEventLink {
  id: string;
  label: string;
  url: string;
}

export interface CalendarEventAttachment {
  id: string;
  name: string;
  url: string;
  kind: 'link' | 'document' | 'file';
  linkedDocumentId?: string;
}

export interface CalendarEventReminder {
  id: string;
  minutesBefore: number;
  label?: string;
}

/** Champs enrichissables (stockés aussi dans popilot:calendar-enrichments pour les événements sync/démo) */
export interface CalendarEventEnrichment {
  location?: string;
  endTime?: string;
  allDay?: boolean;
  notes?: string;
  videoConferenceUrl?: string;
  links?: CalendarEventLink[];
  attachments?: CalendarEventAttachment[];
  linkedDocumentIds?: string[];
  reminders?: CalendarEventReminder[];
  organizer?: string;
  updatedAt?: string;
}

export interface CalendarEventStored extends CalendarEventEnrichment {
  id: string;
  projectId?: string;
  title: string;
  /** ISO date string in storage */
  date: string;
  type: CalendarEventType;
  time?: string;
  endDate?: string;
  participants?: string[];
  description?: string;
  priority?: CalendarEventPriority;
  linkedMeetingId?: string;
  linkedTaskId?: string;
  source?: CalendarEventSource;
  ceremonyType?: string;
}

export interface CalendarEvent extends CalendarEventEnrichment {
  id: string;
  projectId?: string;
  title: string;
  date: Date;
  type: CalendarEventType;
  time?: string;
  endDate?: string;
  participants?: string[];
  description?: string;
  priority?: CalendarEventPriority;
  linkedMeetingId?: string;
  linkedTaskId?: string;
  source?: CalendarEventSource;
  ceremonyType?: string;
}
