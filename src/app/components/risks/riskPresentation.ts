import {
  Calendar,
  Check,
  DollarSign,
  Lock,
  Megaphone,
  Package,
  Scale,
  Shield,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import {
  calculateCriticality,
  type AutoRiskSuggestion,
  type Risk,
  type RiskAction,
  type RiskCategory,
  type RiskOrigin,
} from '../../types/risks';

export type RiskTab = 'registry' | 'matrix' | 'suggestions' | 'indicators';
export type RiskPageMode =
  | 'list'
  | 'create'
  | 'view'
  | 'edit'
  | 'suggestion-view'
  | 'indicator-view'
  | 'indicator-edit';

export const CATEGORY_CONFIG: {
  id: RiskCategory | 'all';
  label: string;
  icon: LucideIcon;
  chipClass: string;
}[] = [
  { id: 'all', label: 'Toutes catégories', icon: Shield, chipClass: 'bg-stone-100 text-stone-700' },
  { id: 'technical', label: 'Technique', icon: Wrench, chipClass: 'bg-blue-50 text-blue-700' },
  { id: 'quality', label: 'Qualité', icon: Check, chipClass: 'bg-emerald-50 text-emerald-700' },
  { id: 'planning', label: 'Planning', icon: Calendar, chipClass: 'bg-amber-50 text-amber-700' },
  { id: 'financial', label: 'Financier', icon: DollarSign, chipClass: 'bg-lime-50 text-lime-800' },
  { id: 'hr', label: 'RH', icon: Users, chipClass: 'bg-violet-50 text-violet-700' },
  { id: 'security', label: 'Sécurité', icon: Lock, chipClass: 'bg-rose-50 text-rose-700' },
  { id: 'legal', label: 'Juridique', icon: Scale, chipClass: 'bg-indigo-50 text-indigo-700' },
  { id: 'supply-chain', label: 'Supply Chain', icon: Package, chipClass: 'bg-orange-50 text-orange-700' },
  { id: 'communication', label: 'Communication', icon: Megaphone, chipClass: 'bg-cyan-50 text-cyan-700' },
];

export const IMPACT_AXES: { key: keyof Risk['impacts']; label: string }[] = [
  { key: 'cost', label: 'Coût' },
  { key: 'delay', label: 'Délai' },
  { key: 'quality', label: 'Qualité' },
  { key: 'security', label: 'Sécurité' },
  { key: 'image', label: 'Image' },
];

export interface RiskFormValues {
  title: string;
  description: string;
  category: RiskCategory;
  type: Risk['type'];
  status: Risk['status'];
  probability: Risk['probability'];
  impacts: Risk['impacts'];
  strategy: Risk['strategy'];
  ownerName: string;
  visibility: Risk['visibility'];
  origin: RiskOrigin;
  stageId: string;
  tags: string;
  actionTitle: string;
  actionDueDate: string;
}

export interface RiskIndicatorConfig {
  id: string;
  label: string;
  description: string;
  target: number;
  unit: '%' | 'count' | 'days';
  direction: 'lower-is-better' | 'higher-is-better';
}

export const DEFAULT_RISK_INDICATORS: RiskIndicatorConfig[] = [
  {
    id: 'treatment-rate',
    label: 'Taux de traitement',
    description: 'Part des risques fermés ou acceptés avec plan de suivi.',
    target: 75,
    unit: '%',
    direction: 'higher-is-better',
  },
  {
    id: 'critical-open',
    label: 'Risques critiques ouverts',
    description: 'Nombre de risques critiques nécessitant une action immédiate.',
    target: 0,
    unit: 'count',
    direction: 'lower-is-better',
  },
  {
    id: 'avg-close-days',
    label: 'Délai moyen de clôture',
    description: 'Nombre de jours entre détection et clôture.',
    target: 14,
    unit: 'days',
    direction: 'lower-is-better',
  },
];

export const RISK_INDICATORS_STORAGE_KEY = 'popilot-risk-indicators';

export function categoryLabel(category: RiskCategory) {
  return CATEGORY_CONFIG.find((c) => c.id === category)?.label ?? category;
}

export function categoryChipClass(category: RiskCategory) {
  return CATEGORY_CONFIG.find((c) => c.id === category)?.chipClass ?? 'bg-stone-100 text-stone-700';
}

export function statusLabel(status: Risk['status']) {
  const labels: Record<Risk['status'], string> = {
    open: 'Ouvert',
    'in-treatment': 'En traitement',
    closed: 'Fermé',
    accepted: 'Accepté',
  };
  return labels[status];
}

export function statusTone(status: Risk['status']) {
  const tones: Record<Risk['status'], string> = {
    open: 'bg-amber-50 text-amber-800 border-amber-200',
    'in-treatment': 'bg-blue-50 text-blue-800 border-blue-200',
    closed: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    accepted: 'bg-stone-100 text-stone-700 border-stone-200',
  };
  return tones[status];
}

export function strategyLabel(strategy: Risk['strategy']) {
  const labels: Record<Risk['strategy'], string> = {
    avoid: 'Éviter',
    reduce: 'Réduire',
    transfer: 'Transférer',
    accept: 'Accepter',
  };
  return labels[strategy];
}

export function originLabel(origin: RiskOrigin) {
  const labels: Record<RiskOrigin, string> = {
    meeting: 'Réunion',
    study: 'Étude',
    'field-feedback': 'Retour terrain',
    'auto-detection': 'Détection auto',
    audit: 'Audit',
    brainstorming: 'Brainstorming',
    review: 'Revue',
  };
  return labels[origin];
}

export function criticalityLabel(criticality: Risk['criticality']) {
  const labels: Record<Risk['criticality'], string> = {
    critical: 'Critique',
    high: 'Élevé',
    medium: 'Modéré',
    low: 'Faible',
  };
  return labels[criticality];
}

export function criticalityTone(criticality: Risk['criticality']) {
  const tones: Record<Risk['criticality'], string> = {
    critical: 'bg-red-50 text-red-800 border-red-200',
    high: 'bg-orange-50 text-orange-800 border-orange-200',
    medium: 'bg-amber-50 text-amber-800 border-amber-200',
    low: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  };
  return tones[criticality];
}

export function maxImpact(impacts: Risk['impacts']) {
  return Math.max(...Object.values(impacts));
}

export function emptyRiskForm(): RiskFormValues {
  return {
    title: '',
    description: '',
    category: 'technical',
    type: 'risk',
    status: 'open',
    probability: 3,
    impacts: { cost: 3, delay: 3, quality: 3, security: 2, image: 2 },
    strategy: 'reduce',
    ownerName: 'Jean Dupont',
    visibility: 'management',
    origin: 'review',
    stageId: '',
    tags: '',
    actionTitle: '',
    actionDueDate: '',
  };
}

export function riskToFormValues(risk: Risk): RiskFormValues {
  return {
    title: risk.title,
    description: risk.description,
    category: risk.category,
    type: risk.type,
    status: risk.status,
    probability: risk.probability,
    impacts: { ...risk.impacts },
    strategy: risk.strategy,
    ownerName: risk.ownerName ?? '',
    visibility: risk.visibility,
    origin: risk.origin,
    stageId: risk.linkedTo?.stageId ?? '',
    tags: (risk.tags ?? []).join(', '),
    actionTitle: '',
    actionDueDate: '',
  };
}

export function suggestionToFormValues(suggestion: AutoRiskSuggestion): RiskFormValues {
  return {
    ...emptyRiskForm(),
    title: suggestion.title,
    description: suggestion.description,
    category: suggestion.category,
    probability: suggestion.suggestedProbability as Risk['probability'],
    impacts: { ...suggestion.suggestedImpacts },
    origin: 'auto-detection',
    tags: 'auto-détecté',
  };
}

export function buildRiskFromForm(
  form: RiskFormValues,
  base: Risk | undefined,
  projectId: string
): Risk {
  const { criticality, score } = calculateCriticality(form.probability, form.impacts);
  const now = new Date().toISOString().split('T')[0];
  const tags = form.tags
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  let actions = base?.actions ?? [];
  if (form.actionTitle.trim()) {
    const newAction: RiskAction = {
      id: `action-${Date.now()}`,
      title: form.actionTitle.trim(),
      type: 'preventive',
      responsible: base?.owner ?? 'user-1',
      responsibleName: form.ownerName,
      dueDate: form.actionDueDate || now,
      status: 'pending',
      createdAt: now,
    };
    actions = [...actions, newAction];
  }

  return {
    id: base?.id ?? `risk-${Date.now()}`,
    projectId: base?.projectId ?? projectId,
    title: form.title.trim(),
    description: form.description.trim(),
    category: form.category,
    type: form.type,
    status: form.status,
    probability: form.probability,
    impacts: form.impacts,
    criticality,
    criticalityScore: score,
    strategy: form.strategy,
    actions,
    origin: form.origin,
    detectedBy: base?.detectedBy ?? 'user-1',
    detectedByName: base?.detectedByName ?? form.ownerName,
    detectedAt: base?.detectedAt ?? now,
    owner: base?.owner ?? 'user-1',
    ownerName: form.ownerName,
    visibility: form.visibility,
    history:
      base?.history ??
      [
        {
          date: now,
          author: 'user-1',
          authorName: form.ownerName,
          action: 'created',
          description: 'Risque enregistré dans le registre ISO §6.1',
        },
      ],
    linkedTo: form.stageId ? { ...base?.linkedTo, stageId: form.stageId } : base?.linkedTo,
    createdAt: base?.createdAt ?? now,
    updatedAt: now,
    tags: tags.length ? tags : base?.tags,
    autoDetected: base?.autoDetected,
    autoDetectionSource: base?.autoDetectionSource,
    closedAt: base?.closedAt,
  };
}

export function computeRiskStats(risks: Risk[]) {
  return {
    total: risks.length,
    risks: risks.filter((r) => r.type === 'risk').length,
    opportunities: risks.filter((r) => r.type === 'opportunity').length,
    open: risks.filter((r) => r.status === 'open').length,
    inTreatment: risks.filter((r) => r.status === 'in-treatment').length,
    closed: risks.filter((r) => r.status === 'closed' || r.status === 'accepted').length,
    critical: risks.filter((r) => r.criticality === 'critical').length,
    high: risks.filter((r) => r.criticality === 'high').length,
    medium: risks.filter((r) => r.criticality === 'medium').length,
    low: risks.filter((r) => r.criticality === 'low').length,
    treatmentRate:
      risks.length === 0
        ? 0
        : Math.round(
            (risks.filter((r) => r.status === 'closed' || r.status === 'accepted').length / risks.length) *
              100
          ),
  };
}

export function categoryBreakdown(risks: Risk[]) {
  return CATEGORY_CONFIG.filter((c) => c.id !== 'all').map((cat) => ({
    category: cat.id as RiskCategory,
    label: cat.label,
    count: risks.filter((r) => r.category === cat.id).length,
  }));
}

export const inputClass =
  'w-full rounded-xl border border-stone-200 bg-stone-50/60 px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 transition focus:border-stone-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-stone-400/15';

export const labelClass = 'block text-sm font-medium text-stone-700 mb-1.5';

export const sectionClass = 'rounded-2xl border border-stone-200/90 bg-white p-4 sm:p-6 shadow-sm space-y-5';
