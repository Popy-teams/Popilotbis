import { Plus } from 'lucide-react';
import type { MarketingAction, MarketingActionStatus, MarketingPhase, RoadmapPhase } from '../../types/marketing';
import {
  ActionButton,
  FormSelect,
  SearchField,
  ViewEmptyState,
  ViewFilterPanel,
} from '../shared';
import { MarketingActionCard } from './MarketingActionCard';
import { statusLabel } from './marketingPresentation';

interface MarketingActionsTabProps {
  phases: RoadmapPhase[];
  actions: MarketingAction[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filterPhase: MarketingPhase | 'all';
  onFilterPhaseChange: (p: MarketingPhase | 'all') => void;
  filterStatus: MarketingActionStatus | 'all';
  onFilterStatusChange: (s: MarketingActionStatus | 'all') => void;
  onCreate: () => void;
  onView: (action: MarketingAction) => void;
  onEdit: (action: MarketingAction) => void;
}

export function MarketingActionsTab({
  phases,
  actions,
  searchQuery,
  onSearchChange,
  filterPhase,
  onFilterPhaseChange,
  filterStatus,
  onFilterStatusChange,
  onCreate,
  onView,
  onEdit,
}: MarketingActionsTabProps) {
  return (
    <div className="space-y-5 min-w-0">
      <ViewFilterPanel>
        <div className="filter-toolbar">
          <SearchField
            wrapperClassName="filter-toolbar-grow"
            placeholder="Rechercher une action…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <FormSelect
            value={filterPhase}
            onChange={(e) => onFilterPhaseChange(e.target.value as MarketingPhase | 'all')}
          >
            <option value="all">Toutes phases</option>
            {phases.map((p) => (
              <option key={p.id} value={p.id}>
                {p.year}
              </option>
            ))}
          </FormSelect>
          <FormSelect
            value={filterStatus}
            onChange={(e) => onFilterStatusChange(e.target.value as MarketingActionStatus | 'all')}
          >
            <option value="all">Tous statuts</option>
            {(['planned', 'in-progress', 'done'] as const).map((s) => (
              <option key={s} value={s}>
                {statusLabel(s)}
              </option>
            ))}
          </FormSelect>
          <ActionButton icon={Plus} onClick={onCreate} className="w-full sm:w-auto shrink-0">
            Nouvelle action
          </ActionButton>
        </div>
      </ViewFilterPanel>

      {actions.length === 0 ? (
        <ViewEmptyState
          icon={Plus}
          title="Aucune action marketing"
          description="Créez une action ou ajustez les filtres pour alimenter le plan marketing."
          action={
            <ActionButton icon={Plus} onClick={onCreate}>
              Créer une action
            </ActionButton>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {actions.map((action) => (
            <MarketingActionCard
              key={action.id}
              action={action}
              phases={phases}
              onView={() => onView(action)}
              onEdit={() => onEdit(action)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
