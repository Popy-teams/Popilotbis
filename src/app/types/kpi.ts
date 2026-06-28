export type KpiCategoryId =
  | 'robot'
  | 'ia'
  | 'ux'
  | 'platform'
  | 'engineering'
  | 'organization'
  | 'quality'
  | 'rgpd'
  | 'educational'
  | 'industrialization'
  | 'risks';

export type KpiStatus = 'good' | 'warning' | 'critical';
export type KpiTrend = 'up' | 'down' | 'stable';
export type KpiTab = 'overview' | 'categories' | 'referential';
export type KpiPageMode = 'list' | 'create' | 'view' | 'edit';

export type ThresholdKind =
  | 'min'
  | 'max'
  | 'exact'
  | 'trend_down'
  | 'trend_up'
  | 'qualitative';

export interface KpiDefinition {
  id: string;
  categoryId: KpiCategoryId;
  name: string;
  objective: string;
  measurementMethod: string;
  responsible: string;
  targetThreshold: string;
  thresholdKind: ThresholdKind;
  /** Valeur numérique cible quand applicable (ex. 90 pour ≥ 90 %) */
  targetNumeric?: number;
  unit?: string;
}

export interface KpiMetric extends KpiDefinition {
  currentValue: number;
  previousValue: number;
  status: KpiStatus;
  trend: KpiTrend;
  projectId?: string;
}

export interface KpiCategoryMeta {
  id: KpiCategoryId;
  name: string;
  shortName: string;
  description: string;
}

export interface KpiStats {
  total: number;
  good: number;
  warning: number;
  critical: number;
  healthScore: number;
  byCategory: Record<KpiCategoryId, { total: number; good: number; warning: number; critical: number }>;
}

export interface KpiFormValues {
  name: string;
  categoryId: KpiCategoryId;
  objective: string;
  measurementMethod: string;
  responsible: string;
  targetThreshold: string;
  currentValue: number;
  previousValue: number;
  unit: string;
  status: KpiStatus;
  trend: KpiTrend;
}
