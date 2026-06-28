import type { VeilleEntry, VeilleType } from '../../types/veille';
import { SearchField, FormSelect, ViewFilterPanel, ViewEmptyState, ActionButton } from '../shared';
import { Eye, Plus } from 'lucide-react';
import { VeilleCard } from './VeilleCard';
import { VEILLE_TYPES, statusLabel } from './veillePresentation';

interface VeilleRegistryTabProps {
  entries: VeilleEntry[];
  filterType: VeilleType | 'all';
  filterStatus: VeilleEntry['status'] | 'all';
  searchQuery: string;
  onTypeChange: (t: VeilleType | 'all') => void;
  onStatusChange: (s: VeilleEntry['status'] | 'all') => void;
  onSearchChange: (q: string) => void;
  onView: (entry: VeilleEntry) => void;
  onEdit: (entry: VeilleEntry) => void;
  onCreate: () => void;
}

export function VeilleRegistryTab({
  entries,
  filterType,
  filterStatus,
  searchQuery,
  onTypeChange,
  onStatusChange,
  onSearchChange,
  onView,
  onEdit,
  onCreate,
}: VeilleRegistryTabProps) {
  const filtered = entries
    .filter((e) => filterType === 'all' || e.type === filterType)
    .filter((e) => filterStatus === 'all' || e.status === filterStatus)
    .filter(
      (e) =>
        searchQuery === '' ||
        e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.source.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="space-y-5">
      <ViewFilterPanel>
        <div className="filter-toolbar">
          <SearchField
            wrapperClassName="filter-toolbar-grow"
            placeholder="Rechercher par sujet, source ou description…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <FormSelect value={filterType} onChange={(e) => onTypeChange(e.target.value as VeilleType | 'all')}>
            <option value="all">Tous types</option>
            {VEILLE_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </FormSelect>
          <FormSelect value={filterStatus} onChange={(e) => onStatusChange(e.target.value as VeilleEntry['status'] | 'all')}>
            <option value="all">Tous statuts</option>
            {(['new', 'analyzing', 'action-required', 'monitoring', 'closed'] as const).map((s) => (
              <option key={s} value={s}>
                {statusLabel(s)}
              </option>
            ))}
          </FormSelect>
        </div>
      </ViewFilterPanel>

      {filtered.length === 0 ? (
        <ViewEmptyState
          icon={Eye}
          title="Aucune veille trouvée"
          description="Créez une entrée ou ajustez les filtres pour alimenter le registre ISO."
          action={
            <ActionButton icon={Plus} onClick={onCreate}>
              Nouvelle veille
            </ActionButton>
          }
        />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {filtered.map((entry) => (
            <VeilleCard key={entry.id} entry={entry} onView={() => onView(entry)} onEdit={() => onEdit(entry)} />
          ))}
        </div>
      )}
    </div>
  );
}
