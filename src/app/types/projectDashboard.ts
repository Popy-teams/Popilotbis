import type { Project } from '../types';

export type ProjectDashboardTab = 'overview' | 'alerts' | 'project' | 'actions';

export type ProjectDashboardPageMode = 'list' | 'create-alert' | 'edit-alert' | 'quick-action';

export type QuickActionKind = 'project' | 'report' | 'meeting';

export interface ProjectDashboardAlert {
  id: string;
  projectId?: string;
  message: string;
  severity: 'critical' | 'warning';
}

export interface ProjectDashboardStats {
  activeProjects: number;
  tasksInProgress: number;
  successRate: number | null;
  criticalAlerts: number;
  warningAlerts: number;
  healthScore: number;
  projectProgress: number;
}

export interface AlertFormValues {
  message: string;
  severity: ProjectDashboardAlert['severity'];
}

export type ProjectWithStatus = Project;
