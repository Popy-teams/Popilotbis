import type { BudgetAccent } from './BudgetUIKit';

export type BudgetRichAccent = BudgetAccent | 'tracking';

export interface BudgetAccentTheme {
  gradient: string;
  chip: string;
  bar: string;
  ring: string;
}

export const BUDGET_ACCENT_THEMES: Record<BudgetRichAccent, BudgetAccentTheme> = {
  bom: {
    gradient: 'from-emerald-500 to-teal-600',
    chip: 'bg-emerald-50 text-emerald-800 border-emerald-100',
    bar: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    ring: '#059669',
  },
  quote: {
    gradient: 'from-violet-500 to-purple-600',
    chip: 'bg-violet-50 text-violet-800 border-violet-100',
    bar: 'bg-gradient-to-r from-violet-500 to-purple-500',
    ring: '#7c3aed',
  },
  supplier: {
    gradient: 'from-blue-500 to-cyan-600',
    chip: 'bg-sky-50 text-sky-800 border-sky-100',
    bar: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    ring: '#0284c7',
  },
  funding: {
    gradient: 'from-amber-500 to-orange-600',
    chip: 'bg-amber-50 text-amber-900 border-amber-100',
    bar: 'bg-gradient-to-r from-amber-500 to-orange-500',
    ring: '#d97706',
  },
  tracking: {
    gradient: 'from-emerald-500 to-teal-600',
    chip: 'bg-emerald-50 text-emerald-800 border-emerald-100',
    bar: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    ring: '#059669',
  },
};

