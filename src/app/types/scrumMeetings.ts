import type { AgendaItem, Annexe, Decision, RoundTableEntry } from './meetings';

export type ScrumMeetingType = 'planning' | 'daily' | 'review' | 'retro' | 'other';
export type MeetingStatus = 'planned' | 'in-progress' | 'completed';

export interface MeetingActionItem {
  id: string;
  description: string;
  assignedTo: string;
  assignedToName: string;
  /** Date de début (par défaut = date de la réunion source) */
  startDate?: string;
  /** Échéance de l'action */
  dueDate: string;
  stageId?: string;
  createTask: boolean;
  linkedTaskId?: string;
  status: 'pending' | 'in-progress' | 'completed';
  source: string;
  /** Action reportée depuis une réunion précédente */
  carryOver?: boolean;
  sourceMeetingId?: string;
  originMeetingNumber?: number;
  originSprintNumber?: number;
}

export interface MeetingDecisionItem {
  id: string;
  description: string;
  decidedBy: string;
  date: string;
  impact: Decision['impact'];
  impactDescription?: string;
}

export interface ScrumMeetingRecord {
  id: string;
  number: number;
  title: string;
  meetingType: ScrumMeetingType;
  sprintNumber?: number;
  date: string;
  time: string;
  duration: number;
  participants: string[];
  writerId: string;
  writerName: string;
  facilitator?: string;
  status: MeetingStatus;
  hasReport: boolean;
  projectId?: string;
  projectName: string;
  agenda: AgendaItem[];
  roundTable: RoundTableEntry[];
  decisions: MeetingDecisionItem[];
  actions: MeetingActionItem[];
  notes?: string;
  linkedDocumentId?: string;
  linkedTaskIds?: string[];
  annexes?: Annexe[];
  /** Compatibilité ancien CR texte libre */
  reportDecisions?: string;
  reportActions?: string;
}

export interface GanttItem {
  id: string;
  projectId?: string;
  label: string;
  startDate: string;
  endDate: string;
  assignee?: string;
  meetingId?: string;
  taskId?: string;
  color: string;
  source: 'meeting' | 'manual';
  /** Jalon ponctuel vs barre de tâche */
  kind?: 'task' | 'milestone';
  /** Groupe visuel (ex. Jalons, Sprint, Certification) */
  category?: string;
  progress?: number;
}

export const SCRUM_MEETING_LABELS: Record<ScrumMeetingType, string> = {
  planning: 'Sprint Planning',
  daily: 'Daily Stand-up',
  review: 'Sprint Review',
  retro: 'Rétrospective',
  other: 'Autre réunion',
};

export const SCRUM_MEETING_COLORS: Record<ScrumMeetingType, string> = {
  planning: 'from-violet-600 to-indigo-600',
  daily: 'from-sky-500 to-blue-600',
  review: 'from-emerald-500 to-teal-600',
  retro: 'from-amber-500 to-orange-600',
  other: 'from-slate-500 to-slate-600',
};

export function defaultAgendaForType(type: ScrumMeetingType): AgendaItem[] {
  const id = () => `ag-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  switch (type) {
    case 'planning':
      return [
        { id: id(), title: 'Objectif du sprint', objective: 'Définir le sprint goal', duration: 15 },
        { id: id(), title: 'Backlog priorisé', objective: 'Sélectionner les user stories', duration: 45 },
        { id: id(), title: 'Capacité équipe', objective: 'Estimer la vélocité', duration: 20 },
        { id: id(), title: 'Plan de livraison', objective: 'Répartir les tâches', duration: 40 },
      ];
    case 'daily':
      return [
        { id: id(), title: 'Tour de table', objective: 'Fait / En cours / Bloqué', duration: 15 },
      ];
    case 'review':
      return [
        { id: id(), title: 'Démo incrément', objective: 'Présenter le livrable du sprint', duration: 40 },
        { id: id(), title: 'Feedback parties prenantes', objective: 'Collecter retours', duration: 30 },
        { id: id(), title: 'Mise à jour backlog', objective: 'Ajuster le périmètre', duration: 20 },
      ];
    case 'retro':
      return [
        { id: id(), title: 'Ce qui a bien fonctionné', objective: 'Continuer', duration: 20 },
        { id: id(), title: 'Points d\'amélioration', objective: 'Arrêter / Essayer', duration: 25 },
        { id: id(), title: 'Actions d\'amélioration', objective: 'Définir 1-3 actions', duration: 15 },
      ];
    default:
      return [{ id: id(), title: 'Ordre du jour', objective: 'Points à traiter', duration: 60 }];
  }
}
