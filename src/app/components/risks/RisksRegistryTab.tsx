import type { Risk, RiskCategory } from '../../types/risks';
import type { PipelineStage } from '../../types/planning';
import { SearchField, FormSelect, ViewFilterPanel, ViewEmptyState, ActionButton } from '../shared';
import { Shield, Plus } from 'lucide-react';
import { RiskCard } from './RiskCard';
import { CATEGORY_CONFIG } from './riskPresentation';

interface RisksRegistryTabProps {
  risks: Risk[];
  stages: PipelineStage[];
  searchQuery: string;
  filterCategory: RiskCategory | 'all';
  filterType: 'all' | 'risk' | 'opportunity';
  filterStatus: 'all' | 'open' | 'closed';
  onSearchChange: (q: string) => void;
  onCategoryChange: (c: RiskCategory | 'all') => void;
  onTypeChange: (t: 'all' | 'risk' | 'opportunity') => void;
  onStatusChange: (s: 'all' | 'open' | 'closed') => void;
  onView: (risk: Risk) => void;
  onEdit: (risk: Risk) => void;
  onCreate: () => void;
}

export function RisksRegistryTab({
  risks,
  stages,
  searchQuery,
  filterCategory,
  filterType,
  filterStatus,
  onSearchChange,
  onCategoryChange,
  onTypeChange,
  onStatusChange,
  onView,
  onEdit,
  onCreate,
}: RisksRegistryTabProps) {
  const selectedCategoryConfig = CATEGORY_CONFIG.find((c) => c.id === filterCategory) ?? CATEGORY_CONFIG[0];
  const SelectedCategoryIcon = selectedCategoryConfig.icon;

  const filtered = risks
    .filter((r) => filterCategory === 'all' || r.category === filterCategory)
    .filter((r) => filterType === 'all' || r.type === filterType)
    .filter((r) => {
      if (filterStatus === 'all') return true;
      if (filterStatus === 'open') return r.status === 'open' || r.status === 'in-treatment';
      return r.status === 'closed';
    })
    .filter(
      (r) =>
        searchQuery === '' ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="space-y-5">
      <ViewFilterPanel>
        <div className="filter-toolbar">
          <SearchField
            wrapperClassName="filter-toolbar-grow"
            placeholder="Rechercher un risque ou une opportunité…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <FormSelect value={filterType} onChange={(e) => onTypeChange(e.target.value as typeof filterType)}>
            <option value="all">Tous types</option>
            <option value="risk">Risques</option>
            <option value="opportunity">Opportunités</option>
          </FormSelect>
          <FormSelect
            value={filterCategory}
            onChange={(e) => onCategoryChange(e.target.value as RiskCategory | 'all')}
            leadingIconElement={<SelectedCategoryIcon className="w-4 h-4 text-stone-600" />}
          >
            {CATEGORY_CONFIG.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </FormSelect>
          <FormSelect value={filterStatus} onChange={(e) => onStatusChange(e.target.value as typeof filterStatus)}>
            <option value="all">Tous statuts</option>
            <option value="open">Ouverts</option>
            <option value="closed">Fermés</option>
          </FormSelect>
        </div>
      </ViewFilterPanel>

      {filtered.length === 0 ? (
        <ViewEmptyState
          icon={Shield}
          title="Aucun risque trouvé"
          description="Ajustez les filtres ou enregistrez un nouveau risque dans le registre ISO."
          action={
            <ActionButton icon={Plus} onClick={onCreate}>
              Nouveau risque
            </ActionButton>
          }
        />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {filtered.map((risk) => (
            <RiskCard
              key={risk.id}
              risk={risk}
              stageName={stages.find((s) => s.id === risk.linkedTo?.stageId)?.name}
              onView={() => onView(risk)}
              onEdit={() => onEdit(risk)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
