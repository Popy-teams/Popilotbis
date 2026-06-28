import type { BOMComponent, FundingSource, Quote, Supplier } from '../types/budget';
import type { BOMCategoryDefinition } from './budgetCategoryStore';

export interface BudgetExportBundle {
  version: 1;
  exportedAt: string;
  bom: BOMComponent[];
  quotes: Quote[];
  suppliers: Supplier[];
  funding: FundingSource[];
  categories: BOMCategoryDefinition[];
}

export function buildBudgetExport(
  bom: BOMComponent[],
  quotes: Quote[],
  suppliers: Supplier[],
  funding: FundingSource[],
  categories: BOMCategoryDefinition[]
): BudgetExportBundle {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    bom,
    quotes,
    suppliers,
    funding,
    categories,
  };
}

export function downloadBudgetExport(bundle: BudgetExportBundle, filename?: string): void {
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename ?? `popilot-budget-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export type BudgetImportResult =
  | { ok: true; bundle: BudgetExportBundle }
  | { ok: false; error: string };

export function parseBudgetImportFile(text: string): BudgetImportResult {
  try {
    const data = JSON.parse(text) as Partial<BudgetExportBundle>;
    if (!data || typeof data !== 'object') {
      return { ok: false, error: 'Fichier JSON invalide' };
    }
    if (!Array.isArray(data.bom)) {
      return { ok: false, error: 'Le fichier doit contenir un tableau "bom"' };
    }
    return {
      ok: true,
      bundle: {
        version: 1,
        exportedAt: data.exportedAt ?? new Date().toISOString(),
        bom: data.bom as BOMComponent[],
        quotes: (data.quotes as Quote[]) ?? [],
        suppliers: (data.suppliers as Supplier[]) ?? [],
        funding: (data.funding as FundingSource[]) ?? [],
        categories: (data.categories as BOMCategoryDefinition[]) ?? [],
      },
    };
  } catch {
    return { ok: false, error: 'Impossible de lire le fichier JSON' };
  }
}

export async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Lecture impossible'));
    reader.readAsText(file);
  });
}
