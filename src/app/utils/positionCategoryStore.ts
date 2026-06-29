export const POSITION_CATEGORIES_STORAGE_KEY = 'popilot:position-categories-local';

export const DEFAULT_POSITION_CATEGORIES = [
  'Direction & Coordination',
  'Hardware & IoT',
  'Intelligence Artificielle',
  'Cybersécurité & protection enfant',
  'Cloud, Backend & Big Data',
] as const;

export function loadPositionCategories(): string[] {
  try {
    const raw = localStorage.getItem(POSITION_CATEGORIES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as string[];
      if (Array.isArray(parsed) && parsed.length) {
        return mergePositionCategoryLists([], parsed);
      }
    }
  } catch {
    /* ignore */
  }
  return [...DEFAULT_POSITION_CATEGORIES];
}

export function savePositionCategories(categories: string[]): void {
  try {
    localStorage.setItem(POSITION_CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
  } catch {
    /* ignore */
  }
}

export function normalizeCategoryLabel(label: string): string {
  return label.trim().replace(/\s+/g, ' ');
}

export function mergePositionCategoryLists(...lists: string[][]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const list of lists) {
    for (const item of list) {
      const label = normalizeCategoryLabel(item);
      if (!label) continue;
      const key = label.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(label);
    }
  }
  return result;
}

export function addPositionCategory(label: string, existing: string[]): string[] {
  const normalized = normalizeCategoryLabel(label);
  if (!normalized) return existing;
  const next = mergePositionCategoryLists(existing, [normalized]);
  savePositionCategories(next);
  return next;
}
