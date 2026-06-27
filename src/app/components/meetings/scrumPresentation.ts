import type { LucideIcon } from 'lucide-react';
import {
  Target,
  Sun,
  Presentation,
  RefreshCw,
  CalendarDays,
} from 'lucide-react';
import type { ScrumMeetingType, ScrumMeetingRecord } from '../../types/scrumMeetings';
import { SCRUM_MEETING_LABELS } from '../../types/scrumMeetings';

export type MeetingTypeAccent = {
  gradient: string;
  softBg: string;
  glow: string;
  iconBg: string;
  iconColor: string;
  badge: string;
  chip: string;
  Icon: LucideIcon;
  description: string;
};

export function getMeetingTypeAccent(type: ScrumMeetingType): MeetingTypeAccent {
  const map: Record<ScrumMeetingType, MeetingTypeAccent> = {
    planning: {
      gradient: 'from-violet-600 via-purple-500 to-indigo-600',
      softBg: 'from-violet-500/10 via-purple-500/5 to-transparent',
      glow: 'bg-violet-400/20',
      iconBg: 'bg-white/90 backdrop-blur-sm shadow-lg shadow-violet-200/50',
      iconColor: 'text-violet-600',
      badge: 'bg-white/80 text-violet-800 border-violet-200/60 backdrop-blur-sm',
      chip: 'bg-violet-50 text-violet-700 border-violet-100',
      Icon: Target,
      description: 'Backlog, capacité & sprint goal',
    },
    daily: {
      gradient: 'from-sky-500 via-blue-500 to-cyan-600',
      softBg: 'from-sky-500/10 via-blue-500/5 to-transparent',
      glow: 'bg-sky-400/20',
      iconBg: 'bg-white/90 backdrop-blur-sm shadow-lg shadow-sky-200/50',
      iconColor: 'text-sky-600',
      badge: 'bg-white/80 text-sky-800 border-sky-200/60 backdrop-blur-sm',
      chip: 'bg-sky-50 text-sky-700 border-sky-100',
      Icon: Sun,
      description: 'Fait · En cours · Bloqué',
    },
    review: {
      gradient: 'from-emerald-500 via-teal-500 to-green-600',
      softBg: 'from-emerald-500/10 via-teal-500/5 to-transparent',
      glow: 'bg-emerald-400/20',
      iconBg: 'bg-white/90 backdrop-blur-sm shadow-lg shadow-emerald-200/50',
      iconColor: 'text-emerald-600',
      badge: 'bg-white/80 text-emerald-800 border-emerald-200/60 backdrop-blur-sm',
      chip: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      Icon: Presentation,
      description: 'Démo & feedback stakeholders',
    },
    retro: {
      gradient: 'from-amber-500 via-orange-500 to-rose-500',
      softBg: 'from-amber-500/10 via-orange-500/5 to-transparent',
      glow: 'bg-amber-400/20',
      iconBg: 'bg-white/90 backdrop-blur-sm shadow-lg shadow-amber-200/50',
      iconColor: 'text-amber-600',
      badge: 'bg-white/80 text-amber-900 border-amber-200/60 backdrop-blur-sm',
      chip: 'bg-amber-50 text-amber-800 border-amber-100',
      Icon: RefreshCw,
      description: 'Amélioration continue',
    },
    other: {
      gradient: 'from-slate-600 via-slate-500 to-slate-700',
      softBg: 'from-slate-500/10 to-transparent',
      glow: 'bg-slate-400/15',
      iconBg: 'bg-white/90 backdrop-blur-sm shadow-lg shadow-slate-200/50',
      iconColor: 'text-slate-600',
      badge: 'bg-white/80 text-slate-700 border-slate-200/60 backdrop-blur-sm',
      chip: 'bg-slate-50 text-slate-600 border-slate-200',
      Icon: CalendarDays,
      description: 'Réunion projet',
    },
  };
  return map[type];
}

export function getMeetingTypeBadge(type: ScrumMeetingType): string {
  return getMeetingTypeAccent(type).badge;
}

export function getMeetingStatusBadge(status: string): string {
  switch (status) {
    case 'completed':
      return 'saas-badge saas-badge-success';
    case 'in-progress':
      return 'saas-badge saas-badge-warning';
    default:
      return 'saas-badge saas-badge-neutral';
  }
}

export function getMeetingStatusLabel(status: string): string {
  switch (status) {
    case 'completed':
      return 'CR publié';
    case 'in-progress':
      return 'En cours';
    default:
      return 'Planifiée';
  }
}

export function getMeetingTypeLabel(type: ScrumMeetingType): string {
  return SCRUM_MEETING_LABELS[type];
}

export function formatMeetingDate(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Affichage du numéro sans dièse : « n° 44 » */
export function formatMeetingNumber(number: number): string {
  return `n° ${number}`;
}

/** Libellé court CR : « CR n° 44 » */
export function formatCrLabel(number: number): string {
  return `CR ${formatMeetingNumber(number)}`;
}

/** Prochain numéro pour un type de réunion (daily 44 → daily 45) */
export function getNextMeetingNumber(
  meetings: { number: number; meetingType: ScrumMeetingType; projectId?: string }[],
  meetingType: ScrumMeetingType,
  projectId: string
): number {
  const sameSeries = meetings.filter(
    (m) => m.meetingType === meetingType && (m.projectId ?? 'popy') === projectId
  );
  if (sameSeries.length === 0) return 1;
  return Math.max(...sameSeries.map((m) => m.number)) + 1;
}

export function getMaxSprintNumber(
  meetings: { sprintNumber?: number; projectId?: string }[],
  projectId: string
): number {
  const nums = meetings
    .filter((m) => (m.projectId ?? 'popy') === projectId && m.sprintNumber != null && m.sprintNumber > 0)
    .map((m) => m.sprintNumber!);
  return nums.length ? Math.max(...nums) : 0;
}

export function getSuggestedSprintNumber(
  meetings: ScrumMeetingRecord[],
  projectId: string,
  meetingType: ScrumMeetingType
): number {
  const maxSprint = getMaxSprintNumber(meetings, projectId);
  if (maxSprint === 0) return 1;

  if (meetingType === 'planning') {
    const planningDone = meetings.some(
      (m) =>
        (m.projectId ?? 'popy') === projectId &&
        m.meetingType === 'planning' &&
        m.sprintNumber === maxSprint &&
        m.hasReport
    );
    return planningDone ? maxSprint + 1 : maxSprint;
  }

  return maxSprint;
}

export function buildDefaultMeetingTitle(
  meetingType: ScrumMeetingType,
  sprint: number,
  ceremonyNumber: number
): string {
  const typeLabel = SCRUM_MEETING_LABELS[meetingType];
  if (meetingType === 'daily') {
    return `${typeLabel} ${formatMeetingNumber(ceremonyNumber)} — Sprint ${sprint}`;
  }
  return `${typeLabel} — Sprint ${sprint}`;
}
