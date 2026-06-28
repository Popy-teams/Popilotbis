import type { AuditBlockId, ComplianceStatus } from '../data/auditHelpers';

export type AuditTab = 'overview' | 'blocks' | 'actions' | 'export';

export type AuditPageMode = 'list' | 'export' | 'create' | 'view' | 'edit';

export interface CriterionFormValues {
  blockId: AuditBlockId;
  title: string;
  description: string;
  status: ComplianceStatus;
  score: number;
  isoRef: string;
  evidence: string;
  gaps: string;
  actions: string;
  linkedModules: string;
}

export interface AuditStats {
  globalScore: number;
  totalCriteria: number;
  compliant: number;
  partial: number;
  nonCompliant: number;
  notApplicable: number;
  totalActions: number;
}
