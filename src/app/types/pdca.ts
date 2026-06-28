import type { ViewType } from '../routes/viewRoutes';

export type PdcaPhase = 'plan' | 'do' | 'check' | 'act';

export type PdcaItemStatus =
  | 'todo'
  | 'in-progress'
  | 'done'
  | 'blocked'
  | 'open'
  | 'closed'
  | 'accepted'
  | 'monitoring';

export interface PdcaItem {
  id: string;
  phase: PdcaPhase;
  title: string;
  description?: string;
  status: PdcaItemStatus;
  source: string;
  sourceLabel: string;
  moduleId?: ViewType;
  routePath?: string;
  date?: string;
}

export interface PdcaModuleLink {
  id: ViewType;
  phase: PdcaPhase;
  label: string;
  isoRef: string;
  description: string;
}

export interface PdcaPhaseStats {
  phase: PdcaPhase;
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  completionRate: number;
}

export interface PdcaSnapshot {
  items: PdcaItem[];
  byPhase: Record<PdcaPhase, PdcaItem[]>;
  phaseStats: PdcaPhaseStats[];
  moduleCounts: { module: string; plan: number; do: number; check: number; act: number }[];
  trend: { month: string; plan: number; do: number; check: number; act: number }[];
  healthScore: number;
}
