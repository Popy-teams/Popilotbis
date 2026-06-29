import type { CalendarEvent } from '../types/calendarEvent';
import { formatDateInput } from './calendarEventPresentation';

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function toIcsDateTime(date: Date, time?: string): string {
  const y = date.getFullYear();
  const mo = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  if (!time) return `${y}${mo}${d}`;
  const [h, mi] = time.split(':');
  return `${y}${mo}${d}T${pad(Number(h))}${pad(Number(mi))}00`;
}

function escapeIcs(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

export function buildIcsContent(event: CalendarEvent): string {
  const uid = `${event.id}@popilot.local`;
  const now = new Date();
  const dtstamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}T${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

  const dtstart = event.allDay
    ? `;VALUE=DATE:${formatDateInput(event.date).replace(/-/g, '')}`
    : `:${toIcsDateTime(event.date, event.time ?? '09:00')}`;

  let dtend = '';
  if (event.endTime) {
    dtend = `DTEND:${toIcsDateTime(event.date, event.endTime)}\r\n`;
  } else if (event.allDay) {
    const end = new Date(event.date);
    end.setDate(end.getDate() + 1);
    dtend = `DTEND;VALUE=DATE:${formatDateInput(end).replace(/-/g, '')}\r\n`;
  }

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Popilot//Planning//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART${dtstart}`,
    dtend.trim(),
    `SUMMARY:${escapeIcs(event.title)}`,
  ];

  if (event.description) lines.push(`DESCRIPTION:${escapeIcs(event.description)}`);
  if (event.notes) lines.push(`COMMENT:${escapeIcs(event.notes)}`);
  if (event.location) lines.push(`LOCATION:${escapeIcs(event.location)}`);
  if (event.videoConferenceUrl) lines.push(`URL:${escapeIcs(event.videoConferenceUrl)}`);

  lines.push('END:VEVENT', 'END:VCALENDAR');
  return lines.filter(Boolean).join('\r\n');
}

export function downloadIcsEvent(event: CalendarEvent): void {
  const ics = buildIcsContent(event);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${event.title.replace(/[^\w-]+/g, '_').slice(0, 40)}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}
