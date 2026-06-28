import { filterByActiveProject } from './projectMatch';

export interface BOMCategoryDefinition {
  id: string;
  label: string;
  /** Classe Tailwind gradient, ex. from-violet-500 to-purple-600 */
  gradient: string;
  /** Couleur d'accent pour badges */
  accent: string;
  sortOrder: number;
  projectId?: string;
  isBuiltIn?: boolean;
}

export const BUDGET_CATEGORIES_KEY = 'popilot:budget-categories-local';

export const DEFAULT_BOM_CATEGORIES: BOMCategoryDefinition[] = [
  { id: 'brain-ai', label: 'Cerveau & IA', gradient: 'from-violet-500 to-purple-600', accent: 'violet', sortOrder: 0, isBuiltIn: true },
  { id: 'vision', label: 'Vision & Perception', gradient: 'from-blue-500 to-cyan-600', accent: 'blue', sortOrder: 1, isBuiltIn: true },
  { id: 'audio', label: 'Audio (Micros + HP)', gradient: 'from-pink-500 to-rose-600', accent: 'pink', sortOrder: 2, isBuiltIn: true },
  { id: 'movement', label: 'Mouvements (Servos + Roues)', gradient: 'from-orange-500 to-amber-600', accent: 'orange', sortOrder: 3, isBuiltIn: true },
  { id: 'visual-interface', label: 'Interface Visuelle & LEDs', gradient: 'from-cyan-500 to-teal-600', accent: 'cyan', sortOrder: 4, isBuiltIn: true },
  { id: 'power', label: 'Alimentation & Batterie', gradient: 'from-amber-500 to-yellow-600', accent: 'amber', sortOrder: 5, isBuiltIn: true },
  { id: 'structure', label: 'Structure & Mécanique', gradient: 'from-slate-500 to-zinc-600', accent: 'slate', sortOrder: 6, isBuiltIn: true },
  { id: 'electronics', label: "Électronique d'Intégration", gradient: 'from-emerald-500 to-green-600', accent: 'emerald', sortOrder: 7, isBuiltIn: true },
];

export const CATEGORY_COLOR_PRESETS: { gradient: string; accent: string }[] = [
  { gradient: 'from-violet-500 to-purple-600', accent: 'violet' },
  { gradient: 'from-blue-500 to-cyan-600', accent: 'blue' },
  { gradient: 'from-pink-500 to-rose-600', accent: 'pink' },
  { gradient: 'from-orange-500 to-amber-600', accent: 'orange' },
  { gradient: 'from-cyan-500 to-teal-600', accent: 'cyan' },
  { gradient: 'from-amber-500 to-yellow-600', accent: 'amber' },
  { gradient: 'from-emerald-500 to-green-600', accent: 'emerald' },
  { gradient: 'from-red-500 to-rose-600', accent: 'red' },
  { gradient: 'from-indigo-500 to-blue-600', accent: 'indigo' },
  { gradient: 'from-fuchsia-500 to-pink-600', accent: 'fuchsia' },
];

const BUILTIN_LABELS: Record<string, string> = Object.fromEntries(
  DEFAULT_BOM_CATEGORIES.map((c) => [c.id, c.label])
);

export function slugifyCategoryLabel(label: string): string {
  return (
    label
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40) || `cat-${Date.now()}`
  );
}

export function loadBudgetCategories(): BOMCategoryDefinition[] {
  try {
    const raw = localStorage.getItem(BUDGET_CATEGORIES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as BOMCategoryDefinition[];
      if (parsed.length) return mergeWithBuiltIns(parsed);
    }
  } catch {
    /* ignore */
  }
  return [...DEFAULT_BOM_CATEGORIES];
}

function mergeWithBuiltIns(saved: BOMCategoryDefinition[]): BOMCategoryDefinition[] {
  const byId = new Map<string, BOMCategoryDefinition>();
  for (const built of DEFAULT_BOM_CATEGORIES) {
    byId.set(built.id, { ...built });
  }
  for (const cat of saved) {
    byId.set(cat.id, { ...byId.get(cat.id), ...cat, id: cat.id });
  }
  return [...byId.values()].sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label));
}

export function saveBudgetCategories(categories: BOMCategoryDefinition[]): void {
  try {
    localStorage.setItem(BUDGET_CATEGORIES_KEY, JSON.stringify(categories));
    window.dispatchEvent(new CustomEvent('popilot:budget-updated'));
  } catch {
    /* ignore */
  }
}

export function getScopedCategories(
  categories: BOMCategoryDefinition[],
  matchesProject: (ref?: string) => boolean
): BOMCategoryDefinition[] {
  const scoped = filterByActiveProject(categories, matchesProject);
  const builtIns = DEFAULT_BOM_CATEGORIES.filter((c) => !scoped.some((s) => s.id === c.id));
  return [...builtIns, ...scoped].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getCategoryLabel(
  categoryId: string,
  categories: BOMCategoryDefinition[]
): string {
  return categories.find((c) => c.id === categoryId)?.label ?? BUILTIN_LABELS[categoryId] ?? categoryId;
}

export function getCategoryDef(
  categoryId: string,
  categories: BOMCategoryDefinition[]
): BOMCategoryDefinition | undefined {
  return categories.find((c) => c.id === categoryId) ?? DEFAULT_BOM_CATEGORIES.find((c) => c.id === categoryId);
}

export function createCategory(
  label: string,
  colorIndex: number,
  projectId?: string,
  existing = loadBudgetCategories()
): BOMCategoryDefinition {
  const preset = CATEGORY_COLOR_PRESETS[colorIndex % CATEGORY_COLOR_PRESETS.length];
  let id = slugifyCategoryLabel(label);
  if (existing.some((c) => c.id === id)) id = `${id}-${Date.now()}`;
  const maxOrder = existing.reduce((m, c) => Math.max(m, c.sortOrder), -1);
  const cat: BOMCategoryDefinition = {
    id,
    label: label.trim(),
    gradient: preset.gradient,
    accent: preset.accent,
    sortOrder: maxOrder + 1,
    projectId,
    isBuiltIn: false,
  };
  const next = [...existing, cat];
  saveBudgetCategories(next);
  return cat;
}

export function updateCategory(
  id: string,
  patch: Partial<Pick<BOMCategoryDefinition, 'label' | 'gradient' | 'accent'>>,
  existing = loadBudgetCategories()
): BOMCategoryDefinition[] {
  const next = existing.map((c) => (c.id === id ? { ...c, ...patch } : c));
  saveBudgetCategories(next);
  return next;
}

export function deleteCategory(
  id: string,
  existing = loadBudgetCategories()
): BOMCategoryDefinition[] {
  const cat = existing.find((c) => c.id === id);
  if (cat?.isBuiltIn) return existing;
  const next = existing.filter((c) => c.id !== id);
  saveBudgetCategories(next);
  return next;
}
