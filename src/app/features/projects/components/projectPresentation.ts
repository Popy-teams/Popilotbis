import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { Project } from '../../../types';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** Jours restants avant l'échéance (négatif = dépassé). */
export function getDaysUntilDeadline(deadline: string, refDate = new Date()): number {
  const end = new Date(deadline);
  end.setHours(0, 0, 0, 0);
  const now = new Date(refDate);
  now.setHours(0, 0, 0, 0);
  return Math.ceil((end.getTime() - now.getTime()) / MS_PER_DAY);
}

/**
 * Calcule le statut à partir de l'échéance et de l'avancement.
 * - archived : conservé si déjà archivé manuellement
 * - completed : avancement à 100 %
 * - delayed : échéance dépassée
 * - at-risk : échéance dans les 14 prochains jours
 * - on-track : sinon
 */
export function computeProjectStatus(input: {
  deadline: string;
  progress?: number;
  status?: Project['status'];
}): Project['status'] {
  if (input.status === 'archived') return 'archived';

  const progress = input.progress ?? 0;
  if (progress >= 100) return 'completed';

  if (!input.deadline) return 'on-track';

  const daysLeft = getDaysUntilDeadline(input.deadline);
  if (daysLeft < 0) return 'delayed';
  if (daysLeft <= 14) return 'at-risk';
  return 'on-track';
}

/** Projet avec statut recalculé (sauf archivé). */
export function withEffectiveStatus(project: Project): Project {
  const status = computeProjectStatus({
    deadline: project.deadline,
    progress: project.progress,
    status: project.status,
  });
  if (status === project.status) return project;
  return { ...project, status };
}

export function getStatusColor(status: string) {
  if (status === 'on-track') return 'saas-badge-success';
  if (status === 'at-risk') return 'saas-badge-warning';
  if (status === 'delayed') return 'saas-badge-danger';
  if (status === 'completed') return 'saas-badge-success';
  return 'saas-badge-neutral';
}

export function getStatusLabel(status: string) {
  if (status === 'on-track') return 'Dans les temps';
  if (status === 'at-risk') return 'À risque';
  if (status === 'delayed') return 'En retard';
  if (status === 'completed') return 'Terminé';
  if (status === 'archived') return 'Archivé';
  return status;
}

export function getStatusHint(status: Project['status'], deadline: string): string {
  const days = getDaysUntilDeadline(deadline);
  if (status === 'archived') return 'Projet archivé manuellement.';
  if (status === 'completed') return 'Avancement à 100 % — projet terminé.';
  if (status === 'delayed') {
    const overdue = Math.abs(days);
    return `Échéance dépassée de ${overdue} jour${overdue > 1 ? 's' : ''}.`;
  }
  if (status === 'at-risk') {
    return days === 0
      ? "Échéance aujourd'hui — vigilance requise."
      : `Échéance dans ${days} jour${days > 1 ? 's' : ''} (seuil 14 jours).`;
  }
  return `Échéance dans ${days} jour${days > 1 ? 's' : ''} — délai confortable.`;
}

export function getPriorityBadge(priority: Project['priority']) {
  if (priority === 'high') return { label: 'Élevée', cls: 'saas-badge-danger', icon: AlertTriangle };
  if (priority === 'medium') return { label: 'Moyenne', cls: 'saas-badge-warning', icon: ShieldCheck };
  return { label: 'Basse', cls: 'saas-badge-success', icon: ShieldCheck };
}

export function getPriorityLabel(priority: Project['priority']) {
  return getPriorityBadge(priority).label;
}

export function formatBudget(amount: number) {
  return `${amount.toLocaleString('fr-FR')} €`;
}

const DEFAULT_BUDGET = { total: 0, used: 0, committed: 0 };

/** Budget normalisé — évite les crashs si données API incomplètes */
export function getProjectBudget(project: Pick<Project, 'budget'> | Partial<Project>) {
  const budget = project.budget ?? DEFAULT_BUDGET;
  return {
    total: budget.total ?? 0,
    used: budget.used ?? 0,
    committed: budget.committed ?? 0,
  };
}

export function getBudgetUsagePercent(project: Pick<Project, 'budget'> | Partial<Project>): number {
  const { total, used } = getProjectBudget(project);
  if (total <= 0) return 0;
  return Math.round((used / total) * 100);
}
