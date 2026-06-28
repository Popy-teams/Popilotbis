import type { LucideIcon } from 'lucide-react';

export type MarketingPhase = 'year1' | 'year2' | 'year3' | 'year4-5';

export type MarketingActionStatus = 'planned' | 'in-progress' | 'done';

export type MarketingTab = 'overview' | 'actions' | 'roadmap' | 'pillars' | 'digital' | 'indicators';

export type MarketingPageMode =
  | 'list'
  | 'create'
  | 'view'
  | 'edit'
  | 'strategy-view'
  | 'phase-view'
  | 'phase-edit';

export interface MarketingAction {
  id: string;
  projectId?: string;
  title: string;
  phase: MarketingPhase;
  channel: string;
  status: MarketingActionStatus;
  description: string;
}

export interface RoadmapPhase {
  id: MarketingPhase;
  year: string;
  label: string;
  volume: string;
  unitCost: string;
  sellingPrice?: string;
  margin?: string;
  chipClass: string;
  activeBorder: string;
  objectives: string[];
  marketing: string[];
  risks: string[];
  linkedTasks?: string[];
}

export interface StrategyPillar {
  id: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  iconWrapClass: string;
  chipClass: string;
  principle: string;
  description: string;
  advantages: string[];
  isoLink: string;
}

export interface DigitalChannel {
  id: string;
  name: string;
  icon: LucideIcon;
  iconWrapClass: string;
  chipClass: string;
  activeBorder: string;
  target: string;
  content: string;
  frequency: string;
  priority: 'high' | 'medium' | 'low';
}

export interface MarketingKpi {
  id: string;
  label: string;
  value: string;
  evolution: string;
  trend: 'up' | 'down' | 'neutral';
  gradient: string;
}

export const MARKETING_STORAGE_KEY = 'popilot:marketing-local';
export const MARKETING_ROADMAP_STORAGE_KEY = 'popilot:marketing-roadmap-local';

export interface MarketingActionFormValues {
  title: string;
  phase: MarketingPhase;
  channel: string;
  status: MarketingActionStatus;
  description: string;
}

export interface RoadmapPhaseFormValues {
  year: string;
  label: string;
  volume: string;
  unitCost: string;
  sellingPrice: string;
  margin: string;
  objectives: string;
  marketing: string;
  risks: string;
  linkedTasks: string;
}

export interface CostEvolutionPoint {
  phase: string;
  label: string;
  unitCost: number;
  sellingPrice?: number;
  volume: string;
}

export type RoadmapByProject = Record<string, RoadmapPhase[]>;
