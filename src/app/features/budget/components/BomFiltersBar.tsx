import { LayoutGrid, List, Plus, SlidersHorizontal } from 'lucide-react';
import { FormSelect, SearchField } from '../../../components/shared';
import type { ComponentStatus } from '../../../types/budget';

interface BomFiltersBarProps {
  searchQuery: string;
  selectedStatus: ComponentStatus | 'all';
  viewMode: 'cards' | 'table';
  onSearchChange: (q: string) => void;
  onStatusChange: (s: ComponentStatus | 'all') => void;
  onViewModeChange: (m: 'cards' | 'table') => void;
  onCreateComponent: () => void;
  resultCount: number;
}

export function BomFiltersBar({
  searchQuery,
  selectedStatus,
  viewMode,
  onSearchChange,
  onStatusChange,
  onViewModeChange,
  onCreateComponent,
  resultCount,
}: BomFiltersBarProps) {
  return (
    <div className="budget-filters-bar">
      <div className="budget-filters-bar__top">
        <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
        <SearchField
          wrapperClassName="budget-filters-bar__search"
          placeholder="Rechercher un composant…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <span className="budget-filters-bar__count">{resultCount} résultat{resultCount !== 1 ? 's' : ''}</span>
      </div>

      <div className="budget-filters-bar__bottom">
        <FormSelect
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value as ComponentStatus | 'all')}
          className="budget-filters-bar__select w-full sm:w-auto sm:min-w-[160px]"
        >
          <option value="all">Tous les statuts</option>
          <option value="to-quote">À chiffrer</option>
          <option value="quote-requested">Devis demandé</option>
          <option value="quote-received">Devis reçu</option>
          <option value="validated">Validé</option>
          <option value="ordered">Commandé</option>
          <option value="received">Reçu</option>
        </FormSelect>

        <div className="budget-filters-bar__view-toggle" role="group" aria-label="Mode d'affichage">
          <button
            type="button"
            onClick={() => onViewModeChange('cards')}
            className={viewMode === 'cards' ? 'is-active' : ''}
            title="Vue cartes"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden md:inline">Cartes</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('table')}
            className={viewMode === 'table' ? 'is-active' : ''}
            title="Vue tableau"
          >
            <List className="w-4 h-4" />
            <span className="hidden md:inline">Tableau</span>
          </button>
        </div>

        <button type="button" onClick={onCreateComponent} className="budget-filters-bar__add">
          <Plus className="w-4 h-4" />
          <span>Composant</span>
        </button>
      </div>
    </div>
  );
}
