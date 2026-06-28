import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  AlertTriangle,
  Bot,
  Brain,
  CheckCircle,
  Cloud,
  Factory,
  GraduationCap,
  Shield,
  Target,
  Users,
  Wrench,
} from 'lucide-react';
import type { KpiCategoryId, KpiFormValues, KpiMetric, KpiStatus, KpiTrend } from '../../types/kpi';
import { KPI_CATEGORIES } from '../../data/kpiReferential';

export const CATEGORY_ICONS: Record<KpiCategoryId, LucideIcon> = {
  robot: Bot,
  ia: Brain,
  ux: Users,
  platform: Cloud,
  engineering: Wrench,
  organization: Target,
  quality: CheckCircle,
  rgpd: Shield,
  educational: GraduationCap,
  industrialization: Factory,
  risks: AlertTriangle,
};

export const CATEGORY_GRADIENTS: Record<KpiCategoryId, string> = {
  robot: 'from-violet-500 to-purple-600',
  ia: 'from-indigo-500 to-blue-600',
  ux: 'from-pink-500 to-rose-600',
  platform: 'from-cyan-500 to-teal-600',
  engineering: 'from-slate-500 to-gray-600',
  organization: 'from-amber-500 to-orange-600',
  quality: 'from-emerald-500 to-green-600',
  rgpd: 'from-blue-500 to-indigo-600',
  educational: 'from-fuchsia-500 to-purple-600',
  industrialization: 'from-stone-500 to-zinc-600',
  risks: 'from-red-500 to-rose-600',
};

export function statusLabel(status: KpiStatus): string {
  const map: Record<KpiStatus, string> = {
    good: 'Conforme',
    warning: 'Surveillance',
    critical: 'Action requise',
  };
  return map[status];
}

export function statusClass(status: KpiStatus): string {
  return statusBadgeClass(status).badge;
}

export function statusBadgeClass(status: KpiStatus): { badge: string; border: string } {
  const map: Record<KpiStatus, { badge: string; border: string }> = {
    good: {
      badge: 'bg-emerald-100 text-emerald-900 border border-emerald-200',
      border: 'border-l-4 border-l-emerald-500',
    },
    warning: {
      badge: 'bg-amber-100 text-amber-950 border border-amber-200',
      border: 'border-l-4 border-l-amber-500',
    },
    critical: {
      badge: 'bg-red-100 text-red-950 border border-red-200',
      border: 'border-l-4 border-l-red-500',
    },
  };
  return map[status];
}

export function statusBorderColor(status: KpiStatus): string {
  const map: Record<KpiStatus, string> = {
    good: '#22c55e',
    warning: '#f59e0b',
    critical: '#ef4444',
  };
  return map[status];
}

export function trendChangePercent(current: number, previous: number): string {
  if (previous === 0) return '0';
  return Math.abs(((current - previous) / previous) * 100).toFixed(1);
}

export function formatKpiValue(value: number, unit?: string): string {
  const rounded = Number.isInteger(value) ? String(value) : value.toFixed(1);
  return unit ? `${rounded} ${unit}` : rounded;
}

export function emptyKpiForm(categoryId: KpiCategoryId = 'robot'): KpiFormValues {
  return {
    name: '',
    categoryId,
    objective: '',
    measurementMethod: '',
    responsible: '',
    targetThreshold: '',
    currentValue: 0,
    previousValue: 0,
    unit: '%',
    status: 'warning',
    trend: 'stable',
  };
}

export function metricToFormValues(metric: KpiMetric): KpiFormValues {
  return {
    name: metric.name,
    categoryId: metric.categoryId,
    objective: metric.objective,
    measurementMethod: metric.measurementMethod,
    responsible: metric.responsible,
    targetThreshold: metric.targetThreshold,
    currentValue: metric.currentValue,
    previousValue: metric.previousValue,
    unit: metric.unit ?? '%',
    status: metric.status,
    trend: metric.trend,
  };
}

export function buildMetricFromForm(
  form: KpiFormValues,
  base?: KpiMetric,
  projectId = 'popy'
): KpiMetric {
  const category = KPI_CATEGORIES.find((c) => c.id === form.categoryId)!;
  return {
    id: base?.id ?? `kpi-custom-${Date.now()}`,
    categoryId: form.categoryId,
    name: form.name,
    objective: form.objective || `Indicateur ${category.shortName}`,
    measurementMethod: form.measurementMethod,
    responsible: form.responsible,
    targetThreshold: form.targetThreshold || '—',
    thresholdKind: base?.thresholdKind ?? 'qualitative',
    targetNumeric: base?.targetNumeric,
    unit: form.unit,
    currentValue: form.currentValue,
    previousValue: form.previousValue,
    status: form.status,
    trend: form.trend,
    projectId,
  };
}

export function healthTone(score: number): string {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-amber-600';
  return 'text-red-600';
}

export { Activity };
