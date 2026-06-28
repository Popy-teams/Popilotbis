import type { KpiCategoryId, KpiDefinition, KpiMetric, KpiStats, KpiStatus, KpiTrend } from '../types/kpi';
import { KPI_CATEGORIES, KPI_REFERENTIAL } from './kpiReferential';

export const KPI_STORAGE_KEY = 'popilot:kpi-local-v2';
export const KPI_FIXTURE_VERSION_KEY = 'popilot:kpi-fixture-version';
export const KPI_FIXTURE_VERSION = 'kpi-v1-referential';

type DemoSeed = {
  currentValue: number;
  previousValue: number;
  status?: KpiStatus;
  trend?: KpiTrend;
};

const DEMO_VALUES: Record<string, DemoSeed> = {
  'robot-startup': { currentValue: 8.2, previousValue: 9.5, status: 'good', trend: 'down' },
  'robot-battery': { currentValue: 2.4, previousValue: 2.1, status: 'good', trend: 'up' },
  'robot-stability': { currentValue: 1.8, previousValue: 2.5, status: 'good', trend: 'down' },
  'robot-temperature': { currentValue: 42, previousValue: 44, status: 'good', trend: 'down' },
  'robot-actuator-force': { currentValue: 12, previousValue: 13, status: 'good', trend: 'down' },
  'ia-voice': { currentValue: 91, previousValue: 88, status: 'good', trend: 'up' },
  'ia-adaptation': { currentValue: 82, previousValue: 79, status: 'warning', trend: 'up' },
  'ia-error-rate': { currentValue: 11, previousValue: 14, status: 'warning', trend: 'down' },
  'ia-latency': { currentValue: 420, previousValue: 480, status: 'good', trend: 'down' },
  'ia-feedback': { currentValue: 87, previousValue: 84, status: 'good', trend: 'up' },
  'ux-session-duration': { currentValue: 12, previousValue: 10, status: 'good', trend: 'up' },
  'ux-abandon': { currentValue: 13, previousValue: 16, status: 'good', trend: 'down' },
  'ux-instructions': { currentValue: 78, previousValue: 75, status: 'warning', trend: 'up' },
  'ux-reaction-time': { currentValue: 0.9, previousValue: 1.1, status: 'good', trend: 'down' },
  'platform-uptime': { currentValue: 99.2, previousValue: 98.8, status: 'good', trend: 'up' },
  'platform-load-time': { currentValue: 1.6, previousValue: 1.9, status: 'good', trend: 'down' },
  'platform-api-errors': { currentValue: 2.1, previousValue: 2.8, status: 'good', trend: 'down' },
  'platform-sync': { currentValue: 97, previousValue: 96, status: 'warning', trend: 'up' },
  'platform-data-completeness': { currentValue: 93, previousValue: 90, status: 'warning', trend: 'up' },
  'eng-requirements': { currentValue: 92, previousValue: 88, status: 'warning', trend: 'up' },
  'eng-integration': { currentValue: 88, previousValue: 85, status: 'warning', trend: 'up' },
  'eng-critical-anomalies': { currentValue: 1, previousValue: 2, status: 'critical', trend: 'down' },
  'eng-fix-time': { currentValue: 8, previousValue: 11, status: 'good', trend: 'down' },
  'org-schedule': { currentValue: 88, previousValue: 85, status: 'warning', trend: 'up' },
  'org-participation': { currentValue: 91, previousValue: 89, status: 'good', trend: 'up' },
  'org-workload': { currentValue: 18, previousValue: 22, status: 'good', trend: 'down' },
  'org-active-risks': { currentValue: 6, previousValue: 7, status: 'good', trend: 'down' },
  'qual-nc-count': { currentValue: 4, previousValue: 7, status: 'good', trend: 'down' },
  'qual-corrective': { currentValue: 88, previousValue: 85, status: 'warning', trend: 'up' },
  'qual-process': { currentValue: 91, previousValue: 88, status: 'good', trend: 'up' },
  'qual-stakeholders': { currentValue: 4.2, previousValue: 4.0, status: 'good', trend: 'up' },
  'rgpd-minimization': { currentValue: 92, previousValue: 90, status: 'good', trend: 'up' },
  'rgpd-anonymization': { currentValue: 96, previousValue: 94, status: 'good', trend: 'up' },
  'rgpd-incidents': { currentValue: 0, previousValue: 0, status: 'good', trend: 'stable' },
  'rgpd-consent': { currentValue: 100, previousValue: 98, status: 'good', trend: 'up' },
  'edu-progress': { currentValue: 18, previousValue: 14, status: 'good', trend: 'up' },
  'edu-engagement': { currentValue: 82, previousValue: 78, status: 'good', trend: 'up' },
  'edu-autonomy': { currentValue: 68, previousValue: 65, status: 'warning', trend: 'up' },
  'edu-retention': { currentValue: 72, previousValue: 69, status: 'good', trend: 'up' },
  'ind-bom': { currentValue: 108, previousValue: 112, status: 'warning', trend: 'down' },
  'ind-defect': { currentValue: 4.2, previousValue: 5.1, status: 'good', trend: 'down' },
  'ind-assembly': { currentValue: 48, previousValue: 52, status: 'good', trend: 'down' },
  'ind-yield': { currentValue: 14, previousValue: 11, status: 'good', trend: 'up' },
  'risk-critical-open': { currentValue: 2, previousValue: 3, status: 'good', trend: 'down' },
  'risk-mitigation': { currentValue: 76, previousValue: 72, status: 'warning', trend: 'up' },
  'risk-severity': { currentValue: 11, previousValue: 13, status: 'good', trend: 'down' },
};

export function inferStatus(def: KpiDefinition, current: number, previous: number): KpiStatus {
  const target = def.targetNumeric;
  if (target === undefined) return 'warning';

  switch (def.thresholdKind) {
    case 'min':
      if (current >= target) return 'good';
      if (current >= target * 0.9) return 'warning';
      return 'critical';
    case 'max':
      if (current <= target) return 'good';
      if (current <= target * 1.15) return 'warning';
      return 'critical';
    case 'exact':
      return current === target ? 'good' : current <= target + 1 ? 'warning' : 'critical';
    case 'trend_down':
      return current <= previous ? 'good' : current <= previous * 1.1 ? 'warning' : 'critical';
    case 'trend_up':
      return current >= previous ? 'good' : current >= previous * 0.9 ? 'warning' : 'critical';
    case 'qualitative':
      return current >= target ? 'good' : current >= target * 0.85 ? 'warning' : 'critical';
    default:
      return 'warning';
  }
}

export function inferTrend(current: number, previous: number): KpiTrend {
  if (current > previous) return 'up';
  if (current < previous) return 'down';
  return 'stable';
}

export function definitionToMetric(def: KpiDefinition, seed?: DemoSeed, projectId = 'popy'): KpiMetric {
  const demo = seed ?? { currentValue: def.targetNumeric ?? 0, previousValue: def.targetNumeric ?? 0 };
  const trend = demo.trend ?? inferTrend(demo.currentValue, demo.previousValue);
  const status = demo.status ?? inferStatus(def, demo.currentValue, demo.previousValue);
  return { ...def, ...demo, trend, status, projectId };
}

export function createDemoKpiMetrics(projectId = 'popy'): KpiMetric[] {
  return KPI_REFERENTIAL.map((def) => definitionToMetric(def, DEMO_VALUES[def.id], projectId));
}

export const FULL_KPI_FIXTURES = createDemoKpiMetrics('popy');

export function mergeKpiMetrics(saved: KpiMetric[], fixtures: KpiMetric[]): KpiMetric[] {
  const map = new Map<string, KpiMetric>();
  for (const item of fixtures) {
    map.set(`${item.projectId ?? 'popy'}:${item.id}`, item);
  }
  for (const item of saved) {
    map.set(`${item.projectId ?? 'popy'}:${item.id}`, item);
  }
  return Array.from(map.values());
}

export function computeKpiStats(metrics: KpiMetric[]): KpiStats {
  const byCategory = {} as KpiStats['byCategory'];
  for (const cat of KPI_CATEGORIES) {
    byCategory[cat.id] = { total: 0, good: 0, warning: 0, critical: 0 };
  }

  let good = 0;
  let warning = 0;
  let critical = 0;

  for (const m of metrics) {
    byCategory[m.categoryId].total += 1;
    byCategory[m.categoryId][m.status] += 1;
    if (m.status === 'good') good += 1;
    else if (m.status === 'warning') warning += 1;
    else critical += 1;
  }

  const total = metrics.length || 1;
  const healthScore = Math.round((good * 100 + warning * 50 + critical * 0) / total);

  return { total: metrics.length, good, warning, critical, healthScore, byCategory };
}

export function getCategoryName(categoryId: KpiCategoryId): string {
  return KPI_CATEGORIES.find((c) => c.id === categoryId)?.name ?? categoryId;
}

export function progressPercent(metric: KpiMetric): number {
  const target = metric.targetNumeric;
  if (!target) return 50;
  if (metric.unit === '%' || metric.thresholdKind === 'min') {
    return Math.min(100, Math.round((metric.currentValue / target) * 100));
  }
  if (metric.thresholdKind === 'max' || metric.thresholdKind === 'exact') {
    if (metric.currentValue <= target) return 100;
    return Math.max(0, Math.round((target / metric.currentValue) * 100));
  }
  return Math.min(100, Math.round((metric.currentValue / target) * 100));
}
