import type { LucideIcon } from 'lucide-react';
import {
  Package,
  FileText,
  Building2,
  TrendingUp,
  Wallet,
} from 'lucide-react';

export type BudgetTabId = 'bom' | 'quotes' | 'suppliers' | 'tracking' | 'funding';

export const BUDGET_TABS: { id: BudgetTabId; label: string; icon: LucideIcon; shortLabel?: string }[] = [
  { id: 'bom', label: 'BOM', shortLabel: 'BOM', icon: Package },
  { id: 'quotes', label: 'Devis', icon: FileText },
  { id: 'suppliers', label: 'Fournisseurs', shortLabel: 'Fourn.', icon: Building2 },
  { id: 'tracking', label: 'Suivi', icon: TrendingUp },
  { id: 'funding', label: 'Financement', shortLabel: 'Finance.', icon: Wallet },
];

interface BudgetTabsNavProps {
  active: BudgetTabId;
  counts: Partial<Record<BudgetTabId, number>>;
  onChange: (tab: BudgetTabId) => void;
}

export function BudgetTabsNav({ active, counts, onChange }: BudgetTabsNavProps) {
  return (
    <nav className="budget-tabs mb-6" aria-label="Sections budget">
      {BUDGET_TABS.map(({ id, label, shortLabel, icon: Icon }) => {
        const isActive = active === id;
        const count = counts[id];
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`budget-tab ${isActive ? 'budget-tab--active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="budget-tab__reflet" aria-hidden />
            <Icon className="w-4 h-4 shrink-0 relative z-[1]" />
            <span className="hidden sm:inline relative z-[1]">{label}</span>
            <span className="sm:hidden relative z-[1]">{shortLabel ?? label}</span>
            {count !== undefined && (
              <span
                className={`relative z-[1] text-xs px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
