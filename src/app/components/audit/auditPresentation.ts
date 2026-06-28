import type { AuditBlockData, AuditBlockId, AuditCriterion, ComplianceStatus } from '../../data/auditHelpers';
import type { AuditStats, CriterionFormValues } from '../../types/audit';

export const BLOCK_THEMES: Record<
  AuditBlockId,
  { chip: string; border: string; bg: string; icon: string; gradient: string; ring: string }
> = {
  context: {
    chip: 'bg-violet-100 text-violet-800 border-violet-200',
    border: 'border-violet-400',
    bg: 'bg-violet-50/60',
    icon: 'bg-violet-100 text-violet-700',
    gradient: 'from-violet-500 to-purple-600',
    ring: 'ring-violet-200',
  },
  leadership: {
    chip: 'bg-blue-100 text-blue-800 border-blue-200',
    border: 'border-blue-400',
    bg: 'bg-blue-50/60',
    icon: 'bg-blue-100 text-blue-700',
    gradient: 'from-blue-500 to-indigo-600',
    ring: 'ring-blue-200',
  },
  planning: {
    chip: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    border: 'border-indigo-400',
    bg: 'bg-indigo-50/60',
    icon: 'bg-indigo-100 text-indigo-700',
    gradient: 'from-indigo-500 to-violet-600',
    ring: 'ring-indigo-200',
  },
  execution: {
    chip: 'bg-orange-100 text-orange-800 border-orange-200',
    border: 'border-orange-400',
    bg: 'bg-orange-50/60',
    icon: 'bg-orange-100 text-orange-700',
    gradient: 'from-orange-500 to-amber-600',
    ring: 'ring-orange-200',
  },
  documentation: {
    chip: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    border: 'border-emerald-400',
    bg: 'bg-emerald-50/60',
    icon: 'bg-emerald-100 text-emerald-700',
    gradient: 'from-emerald-500 to-teal-600',
    ring: 'ring-emerald-200',
  },
  satisfaction: {
    chip: 'bg-pink-100 text-pink-800 border-pink-200',
    border: 'border-pink-400',
    bg: 'bg-pink-50/60',
    icon: 'bg-pink-100 text-pink-700',
    gradient: 'from-pink-500 to-rose-600',
    ring: 'ring-pink-200',
  },
  improvement: {
    chip: 'bg-teal-100 text-teal-800 border-teal-200',
    border: 'border-teal-400',
    bg: 'bg-teal-50/60',
    icon: 'bg-teal-100 text-teal-700',
    gradient: 'from-teal-500 to-cyan-600',
    ring: 'ring-teal-200',
  },
  continuous: {
    chip: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    border: 'border-cyan-400',
    bg: 'bg-cyan-50/60',
    icon: 'bg-cyan-100 text-cyan-700',
    gradient: 'from-cyan-500 to-sky-600',
    ring: 'ring-cyan-200',
  },
};

export const MODULE_LABELS: Record<string, string> = {
  marketing: 'Marketing',
  documentation: 'Documentation',
  pipeline: 'Pipeline',
  'popy-project': 'Projet POPY',
  budget: 'Budget',
  team: 'Équipe',
  tasks: 'Tâches',
  meetings: 'Réunions',
  veille: 'Veille',
  calendar: 'Calendrier',
  risks: 'Risques',
  satisfaction: 'Satisfaction',
  all: 'Tous modules',
};

export function linesToList(text: string): string[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

export function listToLines(items: string[]): string {
  return items.join('\n');
}

export function emptyCriterionForm(blockId: AuditBlockId = 'context'): CriterionFormValues {
  return {
    blockId,
    title: '',
    description: '',
    status: 'partial',
    score: 75,
    isoRef: '',
    evidence: '',
    gaps: '',
    actions: '',
    linkedModules: '',
  };
}

export function criterionToFormValues(blockId: AuditBlockId, c: AuditCriterion): CriterionFormValues {
  return {
    blockId,
    title: c.title,
    description: c.description,
    status: c.status,
    score: c.score,
    isoRef: c.isoRef,
    evidence: listToLines(c.evidence),
    gaps: listToLines(c.gaps),
    actions: listToLines(c.actions),
    linkedModules: c.linkedModules.join(', '),
  };
}

export function buildCriterionFromForm(form: CriterionFormValues, base?: AuditCriterion): AuditCriterion {
  return {
    id: base?.id ?? `crit-${Date.now()}`,
    title: form.title.trim(),
    description: form.description.trim(),
    status: form.status,
    score: Math.min(100, Math.max(0, form.score)),
    isoRef: form.isoRef.trim() || '§X',
    evidence: linesToList(form.evidence),
    gaps: linesToList(form.gaps),
    actions: linesToList(form.actions),
    linkedModules: form.linkedModules
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean),
    lastReview: new Date().toISOString().slice(0, 10),
  };
}

export function computeBlockScore(criteria: AuditCriterion[]): number {
  if (!criteria.length) return 0;
  return Math.round(criteria.reduce((s, c) => s + c.score, 0) / criteria.length);
}

export function computeAuditStats(blocks: AuditBlockData[]): AuditStats {
  const all = blocks.flatMap((b) => b.criteria);
  const globalScore = blocks.length
    ? Math.round(blocks.reduce((s, b) => s + b.score, 0) / blocks.length)
    : 0;
  return {
    globalScore,
    totalCriteria: all.length,
    compliant: all.filter((c) => c.status === 'compliant').length,
    partial: all.filter((c) => c.status === 'partial').length,
    nonCompliant: all.filter((c) => c.status === 'non-compliant').length,
    notApplicable: all.filter((c) => c.status === 'not-applicable').length,
    totalActions: all.reduce((s, c) => s + c.actions.length, 0),
  };
}

export function scoreTone(score: number): string {
  if (score >= 90) return 'text-emerald-600';
  if (score >= 75) return 'text-amber-600';
  if (score >= 60) return 'text-orange-600';
  return 'text-red-600';
}

export function scoreBarColor(score: number): string {
  if (score >= 90) return 'bg-emerald-500';
  if (score >= 75) return 'bg-amber-500';
  if (score >= 60) return 'bg-orange-500';
  return 'bg-red-500';
}

export function statusLabel(status: ComplianceStatus): string {
  const map: Record<ComplianceStatus, string> = {
    compliant: 'Conforme',
    partial: 'Partiel',
    'non-compliant': 'Non conforme',
    'not-applicable': 'N/A',
  };
  return map[status];
}

export function statusTone(status: ComplianceStatus): string {
  const map: Record<ComplianceStatus, string> = {
    compliant: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    partial: 'bg-amber-50 text-amber-800 border-amber-200',
    'non-compliant': 'bg-red-50 text-red-800 border-red-200',
    'not-applicable': 'bg-stone-100 text-stone-600 border-stone-200',
  };
  return map[status];
}

export function moduleLabel(key: string): string {
  return MODULE_LABELS[key] ?? key;
}

export const inputClass =
  'w-full rounded-xl border border-stone-200 bg-stone-50/60 px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 transition focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10';

export const labelClass = 'block text-sm font-medium text-stone-700 mb-1.5';

export const sectionClass =
  'rounded-2xl border border-stone-200/90 bg-white p-4 sm:p-6 shadow-sm space-y-4 min-w-0';
