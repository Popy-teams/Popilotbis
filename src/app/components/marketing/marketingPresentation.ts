import type {
  MarketingAction,
  MarketingActionFormValues,
  MarketingActionStatus,
  MarketingPhase,
  RoadmapPhase,
  RoadmapPhaseFormValues,
} from '../../types/marketing';

export function linesToList(text: string): string[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

export function listToLines(items: string[]): string {
  return items.join('\n');
}

export function phaseToFormValues(phase: RoadmapPhase): RoadmapPhaseFormValues {
  return {
    year: phase.year,
    label: phase.label,
    volume: phase.volume,
    unitCost: phase.unitCost,
    sellingPrice: phase.sellingPrice ?? '',
    margin: phase.margin ?? '',
    objectives: listToLines(phase.objectives),
    marketing: listToLines(phase.marketing),
    risks: listToLines(phase.risks),
    linkedTasks: listToLines(phase.linkedTasks ?? []),
  };
}

export function buildPhaseFromForm(
  form: RoadmapPhaseFormValues,
  base: RoadmapPhase
): RoadmapPhase {
  return {
    ...base,
    year: form.year.trim(),
    label: form.label.trim(),
    volume: form.volume.trim(),
    unitCost: form.unitCost.trim(),
    sellingPrice: form.sellingPrice.trim() || undefined,
    margin: form.margin.trim() || undefined,
    objectives: linesToList(form.objectives),
    marketing: linesToList(form.marketing),
    risks: linesToList(form.risks),
    linkedTasks: linesToList(form.linkedTasks),
  };
}

export function phaseLabel(phase: MarketingPhase, phases: RoadmapPhase[]) {
  return phases.find((p) => p.id === phase)?.year ?? phase;
}

export function phaseFullLabel(phase: MarketingPhase, phases: RoadmapPhase[]) {
  const p = phases.find((x) => x.id === phase);
  return p ? `${p.year} — ${p.label}` : phase;
}

export function emptyActionForm(): MarketingActionFormValues {
  return {
    title: '',
    phase: 'year1',
    channel: '',
    status: 'planned',
    description: '',
  };
}

export function actionToFormValues(action: MarketingAction): MarketingActionFormValues {
  return {
    title: action.title,
    phase: action.phase,
    channel: action.channel,
    status: action.status,
    description: action.description,
  };
}

export function buildActionFromForm(
  form: MarketingActionFormValues,
  base: MarketingAction | undefined,
  projectId: string
): MarketingAction {
  return {
    id: base?.id ?? `ma-${Date.now()}`,
    projectId: base?.projectId ?? projectId,
    title: form.title.trim(),
    phase: form.phase,
    channel: form.channel.trim(),
    status: form.status,
    description: form.description.trim(),
  };
}


export function statusLabel(status: MarketingActionStatus) {
  const map: Record<MarketingActionStatus, string> = {
    planned: 'Planifiée',
    'in-progress': 'En cours',
    done: 'Terminée',
  };
  return map[status];
}

export function statusTone(status: MarketingActionStatus) {
  const map: Record<MarketingActionStatus, string> = {
    planned: 'bg-stone-100 text-stone-700 border-stone-200',
    'in-progress': 'bg-violet-50 text-violet-800 border-violet-200',
    done: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  };
  return map[status];
}

export function priorityLabel(priority: 'high' | 'medium' | 'low') {
  const map = { high: 'Prioritaire', medium: 'Moyen', low: 'Optionnel' };
  return map[priority];
}

export function computeActionStats(actions: MarketingAction[]) {
  return {
    total: actions.length,
    planned: actions.filter((a) => a.status === 'planned').length,
    inProgress: actions.filter((a) => a.status === 'in-progress').length,
    done: actions.filter((a) => a.status === 'done').length,
  };
}

export const inputClass =
  'w-full rounded-xl border border-stone-200 bg-stone-50/60 px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 transition focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-violet-500/10';

export const labelClass = 'block text-sm font-medium text-stone-700 mb-1.5';

export const sectionClass = 'rounded-2xl border border-stone-200/90 bg-white p-4 sm:p-6 shadow-sm space-y-4 sm:space-y-5 min-w-0';

export const MARKETING_CHANNELS_SUGGESTIONS = ['LinkedIn', 'Instagram', 'TikTok', 'Facebook', 'Presse', 'Salon', 'Email'];
