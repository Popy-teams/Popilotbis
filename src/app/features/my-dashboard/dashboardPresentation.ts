import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Crown,
  Lightbulb,
  type LucideIcon,
} from 'lucide-react';
import type {
  DashboardStats,
  DashboardTask,
  DashboardTaskPriority,
  DashboardTaskStatus,
  BlockageImpact,
} from '../../types/dashboard';
import type { DashboardUserData } from '../../types/dashboard';

export const TROPHY_ICONS: Record<string, LucideIcon> = {
  Leadership: Crown,
  'Respect délais': Clock,
  Innovation: Lightbulb,
};

export function projectRefFromName(name: string): string {
  return name.toLowerCase().includes('popy') ? 'popy' : name.toLowerCase();
}

export function scopeDashboardData(
  data: DashboardUserData,
  matchesProject: (ref?: string) => boolean,
  activeProjectSlug?: string | null
): DashboardUserData {
  const tasks = data.tasks.filter((t) => matchesProject(projectRefFromName(t.project)));
  const showDemoExtras = matchesProject(activeProjectSlug ?? 'popy');
  return {
    workload: data.workload,
    tasks,
    objectives: showDemoExtras ? data.objectives : [],
    trophies: showDemoExtras ? data.trophies : [],
    meetings: showDemoExtras ? data.meetings : [],
    actions: showDemoExtras ? data.actions : [],
  };
}

export function daysUntilDue(dueDate: string): number {
  return Math.ceil(
    (new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
}

export function isTaskUrgent(task: DashboardTask): boolean {
  return daysUntilDue(task.dueDate) <= 3 && task.status !== 'done';
}

export function computeDashboardStats(tasks: DashboardTask[], data: DashboardUserData): DashboardStats {
  return {
    inProgress: tasks.filter((t) => t.status === 'in-progress').length,
    completed: tasks.filter((t) => t.status === 'done').length,
    urgent: tasks.filter(isTaskUrgent).length,
    workload: data.workload,
    pendingActions: data.actions.filter((a) => a.status === 'pending').length,
    upcomingMeetings: data.meetings.length,
  };
}

export function getStatusLabel(status: DashboardTaskStatus): string {
  switch (status) {
    case 'done':
      return 'Terminé';
    case 'in-progress':
      return 'En cours';
    case 'blocked':
      return 'Bloqué';
    default:
      return 'À faire';
  }
}

export function statusBadgeClass(status: DashboardTaskStatus): string {
  switch (status) {
    case 'done':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'in-progress':
      return 'bg-sky-100 text-sky-800 border-sky-200';
    case 'blocked':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

export function taskAccentBar(status: DashboardTaskStatus, urgent = false): string {
  if (urgent) return 'from-red-500 to-rose-500';
  switch (status) {
    case 'done':
      return 'from-emerald-400 to-teal-500';
    case 'in-progress':
      return 'from-sky-400 to-blue-600';
    case 'blocked':
      return 'from-red-400 to-rose-600';
    default:
      return 'from-slate-400 to-slate-500';
  }
}

export function taskIconWrapClass(status: DashboardTaskStatus, urgent = false): string {
  if (urgent) return 'bg-red-50 text-red-700 ring-red-100';
  switch (status) {
    case 'done':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
    case 'in-progress':
      return 'bg-sky-50 text-sky-700 ring-sky-100';
    case 'blocked':
      return 'bg-red-50 text-red-700 ring-red-100';
    default:
      return 'bg-slate-100 text-slate-600 ring-slate-200';
  }
}

export function priorityChipClass(priority: DashboardTaskPriority): string {
  switch (priority) {
    case 'high':
      return 'bg-red-50 text-red-800 border-red-100';
    case 'medium':
      return 'bg-amber-50 text-amber-900 border-amber-100';
    default:
      return 'bg-emerald-50 text-emerald-800 border-emerald-100';
  }
}

export function objectiveAccentBar(progress: number): string {
  if (progress >= 80) return 'from-emerald-400 to-teal-500';
  if (progress >= 50) return 'from-sky-400 to-blue-600';
  return 'from-amber-400 to-orange-500';
}

export function objectiveTone(progress: number): {
  ring: string;
  value: string;
  bar: string;
} {
  if (progress >= 80) {
    return { ring: 'text-emerald-600', value: 'text-emerald-800', bar: 'bg-emerald-500' };
  }
  if (progress >= 50) {
    return { ring: 'text-sky-600', value: 'text-sky-800', bar: 'bg-sky-500' };
  }
  return { ring: 'text-amber-600', value: 'text-amber-800', bar: 'bg-amber-500' };
}

export function priorityLabel(priority: DashboardTaskPriority): string {
  switch (priority) {
    case 'high':
      return 'Haute';
    case 'medium':
      return 'Moyenne';
    default:
      return 'Basse';
  }
}

export function priorityTextClass(priority: DashboardTaskPriority): string {
  switch (priority) {
    case 'high':
      return 'text-red-700';
    case 'medium':
      return 'text-amber-700';
    default:
      return 'text-emerald-700';
  }
}

export function objectiveBarClass(progress: number): string {
  if (progress >= 80) return 'bg-emerald-500';
  if (progress >= 50) return 'bg-sky-500';
  return 'bg-amber-500';
}

export function impactLabel(impact: BlockageImpact): string {
  switch (impact) {
    case 'low':
      return 'Faible';
    case 'medium':
      return 'Moyen';
    case 'high':
      return 'Élevé';
    default:
      return 'Critique';
  }
}

export function formatShortDate(date: string): { day: string; month: string } {
  const d = new Date(date);
  return {
    day: d.toLocaleDateString('fr-FR', { day: '2-digit' }),
    month: d.toLocaleDateString('fr-FR', { month: 'short' }),
  };
}

export function getPriorityTasks(tasks: DashboardTask[], limit = 3): DashboardTask[] {
  return tasks
    .filter((t) => t.status !== 'done')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, limit);
}

export const ASSISTANT_SUGGESTIONS = [
  'Sur quoi me concentrer aujourd\'hui ?',
  'Quel est l\'impact si je suis en retard ?',
  'Dernières décisions du projet ?',
];

export const BLOCKAGE_IMPACTS: { value: BlockageImpact; label: string }[] = [
  { value: 'low', label: 'Faible' },
  { value: 'medium', label: 'Moyen' },
  { value: 'high', label: 'Élevé' },
  { value: 'critical', label: 'Critique' },
];
