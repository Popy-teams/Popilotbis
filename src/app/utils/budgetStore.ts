import type { FundingSource, Quote, Supplier } from '../types/budget';
import { DEMO_FUNDING, DEMO_QUOTES, DEMO_SUPPLIERS } from '../features/budget/data/budgetDemoData';

export const QUOTES_STORAGE_KEY = 'popilot:budget-quotes-local';
export const SUPPLIERS_STORAGE_KEY = 'popilot:budget-suppliers-local';
export const FUNDING_STORAGE_KEY = 'popilot:budget-funding-local';

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, data: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('popilot:budget-updated'));
  } catch {
    /* ignore */
  }
}

export function loadQuotes(): Quote[] {
  const saved = readJson<Quote[]>(QUOTES_STORAGE_KEY, []);
  return saved.length ? saved : [...DEMO_QUOTES];
}

export function saveQuotes(quotes: Quote[]): void {
  writeJson(QUOTES_STORAGE_KEY, quotes);
}

export function loadSuppliers(): Supplier[] {
  const saved = readJson<Supplier[]>(SUPPLIERS_STORAGE_KEY, []);
  return saved.length ? saved : [...DEMO_SUPPLIERS];
}

export function saveSuppliers(suppliers: Supplier[]): void {
  writeJson(SUPPLIERS_STORAGE_KEY, suppliers);
}

export function loadFundingSources(): FundingSource[] {
  const saved = readJson<FundingSource[]>(FUNDING_STORAGE_KEY, []);
  return saved.length ? saved : [...DEMO_FUNDING];
}

export function saveFundingSources(sources: FundingSource[]): void {
  writeJson(FUNDING_STORAGE_KEY, sources);
}

export const BUDGET_PAGE_SIZE = 5;

export function paginate<T>(items: T[], page: number, pageSize = BUDGET_PAGE_SIZE): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function totalPages(count: number, pageSize = BUDGET_PAGE_SIZE): number {
  return Math.max(1, Math.ceil(count / pageSize));
}
