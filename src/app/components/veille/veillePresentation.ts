import {
  AlertCircle,
  BarChart3,
  DollarSign,
  Shield,
  TrendingUp,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type {
  VeilleDecision,
  VeilleEntry,
  VeilleFrequency,
  VeillePriority,
  VeilleStatus,
  VeilleType,
} from '../../types/veille';

export interface VeilleTypeConfig {
  id: VeilleType;
  label: string;
  icon: LucideIcon;
  chipClass: string;
  iconWrapClass: string;
  activeBorder: string;
  frequency: VeilleFrequency;
  description: string;
  isoRef: string;
}

export const VEILLE_TYPES: VeilleTypeConfig[] = [
  {
    id: 'regulatory',
    label: 'Réglementaire & normative',
    icon: Shield,
    chipClass: 'bg-red-50 text-red-800 border-red-200',
    iconWrapClass: 'bg-red-100 text-red-700',
    activeBorder: 'border-red-400 bg-red-50/50',
    frequency: 'quarterly',
    description: 'ISO 9001, RGPD, normes CE, sécurité produit',
    isoRef: '§4.1 · §4.2',
  },
  {
    id: 'market',
    label: 'Marché & client',
    icon: TrendingUp,
    chipClass: 'bg-blue-50 text-blue-800 border-blue-200',
    iconWrapClass: 'bg-blue-100 text-blue-700',
    activeBorder: 'border-blue-400 bg-blue-50/50',
    frequency: 'continuous',
    description: 'Besoins clients, retours terrain, usages',
    isoRef: '§5.1.2',
  },
  {
    id: 'technology',
    label: 'Technologique',
    icon: Zap,
    chipClass: 'bg-violet-50 text-violet-800 border-violet-200',
    iconWrapClass: 'bg-violet-100 text-violet-700',
    activeBorder: 'border-violet-400 bg-violet-50/50',
    frequency: 'monthly',
    description: 'Hardware, IA, obsolescence composants',
    isoRef: '§7.1.5',
  },
  {
    id: 'economic',
    label: 'Économique & fournisseurs',
    icon: DollarSign,
    chipClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    iconWrapClass: 'bg-emerald-100 text-emerald-700',
    activeBorder: 'border-emerald-400 bg-emerald-50/50',
    frequency: 'monthly',
    description: 'Prix, dépendances, approvisionnement',
    isoRef: '§7.1.3',
  },
  {
    id: 'hr',
    label: 'RH & compétences',
    icon: Users,
    chipClass: 'bg-orange-50 text-orange-800 border-orange-200',
    iconWrapClass: 'bg-orange-100 text-orange-700',
    activeBorder: 'border-orange-400 bg-orange-50/50',
    frequency: 'quarterly',
    description: 'Compétences émergentes, talents, formations',
    isoRef: '§7.2',
  },
  {
    id: 'risks',
    label: 'Risques & opportunités',
    icon: AlertCircle,
    chipClass: 'bg-amber-50 text-amber-800 border-amber-200',
    iconWrapClass: 'bg-amber-100 text-amber-700',
    activeBorder: 'border-amber-400 bg-amber-50/50',
    frequency: 'continuous',
    description: 'Signaux faibles, nouvelles menaces ou opportunités',
    isoRef: '§6.1',
  },
  {
    id: 'internal',
    label: 'Interne (performance)',
    icon: BarChart3,
    chipClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    iconWrapClass: 'bg-indigo-100 text-indigo-700',
    activeBorder: 'border-indigo-400 bg-indigo-50/50',
    frequency: 'monthly',
    description: 'KPI, non-conformités, écarts internes',
    isoRef: '§9',
  },
];

export interface VeilleFormValues {
  type: VeilleType;
  source: string;
  subject: string;
  description: string;
  impactAnalysis: string;
  priority: VeillePriority;
  status: VeilleStatus;
  decision: VeilleDecision;
  decisionNotes: string;
  responsible: string;
  nextReviewDate: string;
}

export function emptyVeilleForm(): VeilleFormValues {
  return {
    type: 'regulatory',
    source: '',
    subject: '',
    description: '',
    impactAnalysis: '',
    priority: 'medium',
    status: 'new',
    decision: 'pending',
    decisionNotes: '',
    responsible: 'Jean Dupont',
    nextReviewDate: '',
  };
}

export function entryToFormValues(entry: VeilleEntry): VeilleFormValues {
  return {
    type: entry.type,
    source: entry.source,
    subject: entry.subject,
    description: entry.description,
    impactAnalysis: entry.impactAnalysis,
    priority: entry.priority,
    status: entry.status,
    decision: entry.decision,
    decisionNotes: entry.decisionNotes ?? '',
    responsible: entry.responsible,
    nextReviewDate: entry.nextReviewDate ?? '',
  };
}

export function buildEntryFromForm(form: VeilleFormValues, base: VeilleEntry | undefined, projectId: string): VeilleEntry {
  const now = new Date().toISOString().split('T')[0];
  return {
    id: base?.id ?? `v-${Date.now()}`,
    projectId: base?.projectId ?? projectId,
    type: form.type,
    source: form.source.trim(),
    date: base?.date ?? now,
    subject: form.subject.trim(),
    description: form.description.trim(),
    impactAnalysis: form.impactAnalysis.trim(),
    decision: form.decision,
    decisionNotes: form.decisionNotes.trim() || undefined,
    status: form.status,
    responsible: form.responsible.trim(),
    priority: form.priority,
    nextReviewDate: form.nextReviewDate || undefined,
    linkedRisks: base?.linkedRisks,
    linkedTasks: base?.linkedTasks,
    linkedDocs: base?.linkedDocs,
  };
}

export function typeConfig(type: VeilleType) {
  return VEILLE_TYPES.find((t) => t.id === type)!;
}

export function typeLabel(type: VeilleType) {
  return typeConfig(type).label;
}

export function frequencyLabel(freq: VeilleFrequency) {
  const map: Record<VeilleFrequency, string> = {
    daily: 'Quotidienne',
    weekly: 'Hebdomadaire',
    monthly: 'Mensuelle',
    quarterly: 'Trimestrielle',
    continuous: 'Continue',
  };
  return map[freq];
}

export function statusLabel(status: VeilleStatus) {
  const map: Record<VeilleStatus, string> = {
    new: 'Nouveau',
    analyzing: 'En analyse',
    'action-required': 'Action requise',
    monitoring: 'Suivi',
    closed: 'Clôturé',
  };
  return map[status];
}

export function statusTone(status: VeilleStatus) {
  const map: Record<VeilleStatus, string> = {
    new: 'bg-blue-50 text-blue-800 border-blue-200',
    analyzing: 'bg-amber-50 text-amber-800 border-amber-200',
    'action-required': 'bg-red-50 text-red-800 border-red-200',
    monitoring: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    closed: 'bg-stone-100 text-stone-700 border-stone-200',
  };
  return map[status];
}

export function decisionLabel(decision: VeilleDecision) {
  const map: Record<VeilleDecision, string> = {
    pending: 'En attente',
    accepted: 'Acceptée',
    rejected: 'Rejetée',
    'action-planned': 'Action planifiée',
  };
  return map[decision];
}

export function decisionTone(decision: VeilleDecision) {
  const map: Record<VeilleDecision, string> = {
    pending: 'bg-stone-100 text-stone-700 border-stone-200',
    accepted: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    rejected: 'bg-stone-100 text-stone-600 border-stone-200',
    'action-planned': 'bg-cyan-50 text-cyan-800 border-cyan-200',
  };
  return map[decision];
}

export function priorityLabel(priority: VeillePriority) {
  const map: Record<VeillePriority, string> = {
    critical: 'Critique',
    high: 'Haute',
    medium: 'Moyenne',
    low: 'Basse',
  };
  return map[priority];
}

export function priorityTone(priority: VeillePriority) {
  const map: Record<VeillePriority, string> = {
    critical: 'bg-red-50 text-red-800 border-red-200',
    high: 'bg-orange-50 text-orange-800 border-orange-200',
    medium: 'bg-amber-50 text-amber-800 border-amber-200',
    low: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  };
  return map[priority];
}

export function computeVeilleStats(entries: VeilleEntry[]) {
  return {
    total: entries.length,
    actionRequired: entries.filter((e) => e.status === 'action-required').length,
    analyzing: entries.filter((e) => e.status === 'analyzing').length,
    monitoring: entries.filter((e) => e.status === 'monitoring').length,
    critical: entries.filter((e) => e.priority === 'critical').length,
    pendingDecision: entries.filter((e) => e.decision === 'pending').length,
    byType: VEILLE_TYPES.map((t) => ({
      type: t.id,
      label: t.label,
      count: entries.filter((e) => e.type === t.id).length,
    })),
    byStatus: (['new', 'analyzing', 'action-required', 'monitoring', 'closed'] as VeilleStatus[]).map((s) => ({
      status: s,
      label: statusLabel(s),
      count: entries.filter((e) => e.status === s).length,
    })),
  };
}

export const inputClass =
  'w-full rounded-xl border border-stone-200 bg-stone-50/60 px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 transition focus:border-cyan-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-cyan-500/10';

export const labelClass = 'block text-sm font-medium text-stone-700 mb-1.5';

export const sectionClass = 'rounded-2xl border border-stone-200/90 bg-white p-4 sm:p-6 shadow-sm space-y-5';
