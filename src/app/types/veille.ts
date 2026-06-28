export type VeilleType =
  | 'regulatory'
  | 'market'
  | 'technology'
  | 'economic'
  | 'hr'
  | 'risks'
  | 'internal';

export type VeilleFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'continuous';

export type VeilleStatus = 'new' | 'analyzing' | 'action-required' | 'monitoring' | 'closed';

export type VeilleDecision = 'pending' | 'accepted' | 'rejected' | 'action-planned';

export type VeillePriority = 'low' | 'medium' | 'high' | 'critical';

export interface VeilleEntry {
  id: string;
  projectId?: string;
  type: VeilleType;
  source: string;
  date: string;
  subject: string;
  description: string;
  impactAnalysis: string;
  decision: VeilleDecision;
  decisionNotes?: string;
  status: VeilleStatus;
  responsible: string;
  linkedRisks?: string[];
  linkedTasks?: string[];
  linkedDocs?: string[];
  nextReviewDate?: string;
  priority: VeillePriority;
}

export const VEILLE_STORAGE_KEY = 'popilot:veille-local';

export type VeilleTab = 'registry' | 'types' | 'reviews' | 'indicators';

export type VeillePageMode = 'list' | 'create' | 'view' | 'edit' | 'type-view';
