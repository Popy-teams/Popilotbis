import type { Project } from '../../types';
import type {
  ProjectDashboardAlert,
  ProjectDashboardStats,
  AlertFormValues,
  ProjectDashboardAlert as Alert,
} from '../../types/projectDashboard';

export const ALERTS_STORAGE_KEY = 'popilot:dashboard-alerts-local';

export const DEFAULT_ALERTS: ProjectDashboardAlert[] = [
  {
    id: 'a1',
    projectId: 'popy',
    message: 'Retard approvisionnement capteurs ToF — impact prototype POPY',
    severity: 'critical',
  },
  {
    id: 'a2',
    projectId: 'popy',
    message: 'Budget POPY : dépassement prévu à 105% sur la ligne électronique',
    severity: 'critical',
  },
  {
    id: 'a3',
    projectId: 'popy',
    message: '5 tâches POPY bloquées nécessitent une action immédiate',
    severity: 'critical',
  },
];

export function emptyAlertForm(): AlertFormValues {
  return { message: '', severity: 'critical' };
}

export function alertToFormValues(alert: ProjectDashboardAlert): AlertFormValues {
  return { message: alert.message, severity: alert.severity };
}

export function buildAlertFromForm(
  values: AlertFormValues,
  base?: ProjectDashboardAlert,
  projectId?: string
): ProjectDashboardAlert {
  return {
    id: base?.id ?? `a-${Date.now()}`,
    projectId: base?.projectId ?? projectId ?? 'popy',
    message: values.message.trim(),
    severity: values.severity,
  };
}

export function computeProjectDashboardStats(
  activeProject: Project | null,
  visibleProjects: Project[],
  alerts: ProjectDashboardAlert[],
  tasksInProgress: number
): ProjectDashboardStats {
  const criticalAlerts = alerts.filter((a) => a.severity === 'critical').length;
  const warningAlerts = alerts.filter((a) => a.severity === 'warning').length;
  const projectProgress = activeProject?.progress ?? 0;

  let healthScore = projectProgress;
  healthScore -= criticalAlerts * 8;
  healthScore -= warningAlerts * 3;
  if (activeProject?.status === 'delayed') healthScore -= 15;
  if (activeProject?.status === 'at-risk') healthScore -= 8;
  healthScore = Math.max(0, Math.min(100, Math.round(healthScore)));

  return {
    activeProjects: visibleProjects.filter((p) => p.status !== 'archived').length,
    tasksInProgress,
    successRate: activeProject ? Math.min(99, 70 + Math.round(projectProgress / 5)) : null,
    criticalAlerts,
    warningAlerts,
    healthScore,
    projectProgress,
  };
}

export function severityLabel(severity: Alert['severity']): string {
  return severity === 'critical' ? 'Critique' : 'Avertissement';
}

export function severityBadgeClass(severity: Alert['severity']): string {
  return severity === 'critical'
    ? 'bg-red-50 text-red-800 border-red-200'
    : 'bg-amber-50 text-amber-900 border-amber-200';
}

export interface HealthAssessment {
  label: string;
  hint: string;
  tone: 'good' | 'watch' | 'risk';
  bannerTheme: 'emerald' | 'amber' | 'red';
}

export function getHealthAssessment(
  healthScore: number,
  criticalAlerts: number,
  warningAlerts: number
): HealthAssessment {
  if (criticalAlerts > 0 || healthScore < 45) {
    return {
      label: 'Attention requise',
      hint:
        criticalAlerts > 0
          ? `${criticalAlerts} alerte(s) critique(s) à traiter en priorité.`
          : 'La santé projet est fragile — vérifiez l’avancement et le budget.',
      tone: 'risk',
      bannerTheme: 'red',
    };
  }
  if (warningAlerts > 0 || healthScore < 70) {
    return {
      label: 'À surveiller',
      hint: 'Quelques signaux à suivre — consultez les alertes et l’échéance.',
      tone: 'watch',
      bannerTheme: 'amber',
    };
  }
  return {
    label: 'Projet sous contrôle',
    hint: 'Indicateurs stables — poursuivez le pilotage habituel.',
    tone: 'good',
    bannerTheme: 'emerald',
  };
}

export function getOverviewPriorityMessage(
  stats: ProjectDashboardStats,
  alertCount: number
): string | null {
  if (stats.criticalAlerts > 0) {
    return `Traitez d’abord les ${stats.criticalAlerts} alerte(s) critique(s), puis vérifiez l’avancement du projet.`;
  }
  if (stats.tasksInProgress > 0 && stats.healthScore < 70) {
    return `${stats.tasksInProgress} tâche(s) en cours — assurez-vous qu’aucun blocage ne freine la livraison.`;
  }
  if (alertCount === 0 && stats.projectProgress < 30) {
    return 'Le projet démarre — définissez les prochaines étapes dans Actions rapides.';
  }
  return null;
}
