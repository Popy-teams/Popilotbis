import type { CalendarEvent, CalendarEventType } from '../types/calendarEvent';

export function getTypeLabel(type: CalendarEventType): string {
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

export function getPriorityLabel(priority?: string): string {
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

export function getEventColorClass(type: string): string {
  switch (type) {
    case 'meeting':
      return 'bg-blue-500';
    case 'deadline':
      return 'bg-red-500';
    case 'event':
      return 'bg-emerald-500';
    case 'gantt-bar':
      return 'bg-violet-500';
    default:
      return 'bg-slate-500';
  }
}

export function getEventAccentBorder(type: string): string {
  switch (type) {
    case 'meeting':
      return 'border-l-blue-500';
    case 'deadline':
      return 'border-l-red-500';
    case 'event':
      return 'border-l-emerald-500';
    case 'gantt-bar':
      return 'border-l-violet-500';
    default:
      return 'border-l-slate-400';
  }
}

export function formatDateInput(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatEventDateTime(event: CalendarEvent): string {
  const dateStr = event.date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  if (event.allDay || (!event.time && !event.endTime)) {
    return event.type === 'deadline' ? `Échéance · ${dateStr}` : dateStr;
  }
  if (event.time && event.endTime) {
    return `${dateStr} · ${event.time} – ${event.endTime}`;
  }
  if (event.time) return `${dateStr} · ${event.time}`;
  return dateStr;
}

export function buildGoogleMapsUrl(location: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}

export function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function findScheduleConflicts(
  event: CalendarEvent,
  allEvents: CalendarEvent[]
): CalendarEvent[] {
  if (!event.time || event.allDay) return [];
  const [h, m] = event.time.split(':').map(Number);
  const start = new Date(event.date);
  start.setHours(h, m, 0, 0);
  let end = new Date(start);
  if (event.endTime) {
    const [eh, em] = event.endTime.split(':').map(Number);
    end.setHours(eh, em, 0, 0);
  } else {
    end = new Date(start.getTime() + 60 * 60 * 1000);
  }

  return allEvents.filter((other) => {
    if (other.id === event.id || !other.time || other.allDay) return false;
    if (other.date.toDateString() !== event.date.toDateString()) return false;
    const [oh, om] = other.time.split(':').map(Number);
    const oStart = new Date(other.date);
    oStart.setHours(oh, om, 0, 0);
    let oEnd = new Date(oStart);
    if (other.endTime) {
      const [oeh, oem] = other.endTime.split(':').map(Number);
      oEnd.setHours(oeh, oem, 0, 0);
    } else {
      oEnd = new Date(oStart.getTime() + 60 * 60 * 1000);
    }
    return start < oEnd && end > oStart;
  });
}

export function getCeremonyBadge(ceremonyType?: string): string | null {
  switch (ceremonyType) {
    case 'daily':
      return 'Daily';
    case 'planning':
      return 'Planning';
    case 'review':
      return 'Review';
    case 'retro':
      return 'Rétro';
    case 'milestone':
      return 'Jalon';
    case 'comite':
      return 'Comité';
    case 'training':
      return 'Formation';
    default:
      return null;
  }
}

export function meetingPrepHints(ceremonyType?: string): string[] {
  switch (ceremonyType) {
    case 'review':
      return ['Préparer la démo', 'Vérifier le burndown', 'Mettre à jour le CR'];
    case 'planning':
      return ['Backlog groomé', 'Capacité équipe validée', 'Sprint goal rédigé'];
    case 'daily':
      return ['Mettre à jour les actions CR', 'Préparer fait / en cours / bloqué'];
    case 'retro':
      return ['Collecter les sujets', 'Préparer le board rétro'];
    default:
      return ['Vérifier l’ordre du jour', 'Joindre les documents utiles'];
  }
}
