import { ChevronLeft, ChevronRight, Layers, Plus, Settings2 } from 'lucide-react';
import { useRef } from 'react';
import type { BOMCategoryDefinition } from '../../../utils/budgetCategoryStore';

interface BudgetCategoryStripProps {
  categories: BOMCategoryDefinition[];
  selectedId: string | 'all';
  componentCounts: Record<string, number>;
  onSelect: (id: string | 'all') => void;
  onCreateClick: () => void;
  onManageClick: (cat: BOMCategoryDefinition) => void;
}

export function BudgetCategoryStrip({
  categories,
  selectedId,
  componentCounts,
  onSelect,
  onCreateClick,
  onManageClick,
}: BudgetCategoryStripProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const total = Object.values(componentCounts).reduce((a, b) => a + b, 0);

  const scroll = (dir: -1 | 1) => {
    trackRef.current?.scrollBy({ left: dir * 200, behavior: 'smooth' });
  };

  return (
    <div className="budget-category-nav mb-5">
      <div className="budget-category-nav__header">
        <span className="budget-category-nav__title">
          <Layers className="w-4 h-4" />
          Catégories BOM
        </span>
        <button type="button" onClick={onCreateClick} className="budget-category-nav__add">
          <Plus className="w-4 h-4" />
          <span className="hidden xs:inline">Nouvelle</span>
        </button>
      </div>

      <div className="budget-category-nav__scroll-wrap">
        <button
          type="button"
          className="budget-category-nav__arrow budget-category-nav__arrow--left hidden sm:flex"
          onClick={() => scroll(-1)}
          aria-label="Catégories précédentes"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div ref={trackRef} className="budget-category-nav__track" role="tablist" aria-label="Catégories BOM">
          <button
            type="button"
            role="tab"
            aria-selected={selectedId === 'all'}
            onClick={() => onSelect('all')}
            className={`budget-category-pill budget-category-pill--all ${
              selectedId === 'all' ? 'budget-category-pill--all-selected' : ''
            }`}
          >
            Toutes
            <span className="budget-category-pill__count">({total})</span>
          </button>

          {categories.map((cat) => {
            const count = componentCounts[cat.id] ?? 0;
            const selected = selectedId === cat.id;
            return (
              <div key={cat.id} className="budget-category-nav__item">
                <button
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => onSelect(cat.id)}
                  className={`budget-category-pill budget-category-pill--colored bg-gradient-to-r ${cat.gradient} ${
                    selected ? 'budget-category-pill--selected' : ''
                  }`}
                >
                  <span className="budget-category-pill__label">{cat.label}</span>
                  {count > 0 && <span className="budget-category-pill__count">({count})</span>}
                </button>
                <button
                  type="button"
                  className="budget-category-nav__settings"
                  onClick={() => onManageClick(cat)}
                  title="Personnaliser"
                  aria-label={`Paramètres ${cat.label}`}
                >
                  <Settings2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          className="budget-category-nav__arrow budget-category-nav__arrow--right hidden sm:flex"
          onClick={() => scroll(1)}
          aria-label="Catégories suivantes"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
