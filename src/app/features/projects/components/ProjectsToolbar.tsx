import { ArrowDownUp, LayoutGrid, List, Plus, FolderKanban, Target, TrendingUp } from 'lucide-react';
import {
  FormSelect,
  SearchField,
  ViewHero,
  ViewStatCard,
  ViewStatsGrid,
  ViewFilterPanel,
  ViewTabPills,
  ViewTabBtn,
} from '../../../components/shared';

interface ProjectsToolbarProps {
  query: string;
  statusFilter: string;
  viewMode: 'cards' | 'table';
  sortKey: 'deadline' | 'progress' | 'status';
  sortLabel: string;
  nextDeadlineLabel: string;
  totalProjects: number;
  activeProjects: number;
  avgProgress: number;
  onQueryChange: (v: string) => void;
  onCreate: () => void;
  onViewModeChange: (v: 'cards' | 'table') => void;
  onStatusFilterChange: (v: string) => void;
  onSortChange: (k: 'deadline' | 'progress' | 'status') => void;
}

export function ProjectsToolbar({
  query,
  statusFilter,
  viewMode,
  sortKey,
  sortLabel,
  nextDeadlineLabel,
  totalProjects,
  activeProjects,
  avgProgress,
  onQueryChange,
  onCreate,
  onViewModeChange,
  onStatusFilterChange,
  onSortChange,
}: ProjectsToolbarProps) {
  return (
    <>
      <ViewHero
        title="Portfolio Projets"
        subtitle="Pilotage stratégique, suivi d'avancement et exécution de vos projets produit."
        badge="Portfolio · Stratégie"
        badgeIcon={FolderKanban}
        theme="blue"
        actions={
          <button
            type="button"
            className="inline-flex items-center gap-2 bg-white text-blue-900 px-4 py-2.5 rounded-xl hover:bg-blue-50 font-semibold shadow-md transition-colors"
            onClick={onCreate}
          >
            <Plus className="w-5 h-5 shrink-0" />
            Nouveau projet
          </button>
        }
        stats={
          <ViewStatsGrid cols={3}>
            <ViewStatCard label="Total projets" value={String(totalProjects)} gradient="from-blue-500 to-indigo-500" icon={FolderKanban} onDark />
            <ViewStatCard label="Actifs" value={String(activeProjects)} gradient="from-emerald-500 to-teal-500" icon={Target} onDark />
            <ViewStatCard label="Progression moyenne" value={`${avgProgress}%`} gradient="from-violet-500 to-purple-500" icon={TrendingUp} onDark />
          </ViewStatsGrid>
        }
      />

      <ViewFilterPanel>
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto_auto_auto] gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Recherche</label>
            <SearchField
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Rechercher un projet..."
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Statut</label>
            <FormSelect value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value)}>
              <option value="all">Tous statuts</option>
              <option value="on-track">Dans les temps</option>
              <option value="at-risk">À risque</option>
              <option value="delayed">En retard</option>
              <option value="completed">Terminé</option>
              <option value="archived">Archivé</option>
            </FormSelect>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Affichage</label>
            <ViewTabPills>
              <ViewTabBtn active={viewMode === 'cards'} onClick={() => onViewModeChange('cards')} icon={LayoutGrid}>
                Cartes
              </ViewTabBtn>
              <ViewTabBtn active={viewMode === 'table'} onClick={() => onViewModeChange('table')} icon={List}>
                Tableau
              </ViewTabBtn>
            </ViewTabPills>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Tri</label>
            <ViewTabPills>
              <ViewTabBtn active={sortKey === 'deadline'} onClick={() => onSortChange('deadline')} icon={ArrowDownUp}>
                Échéance {sortKey === 'deadline' ? sortLabel : ''}
              </ViewTabBtn>
              <ViewTabBtn active={sortKey === 'progress'} onClick={() => onSortChange('progress')} icon={ArrowDownUp}>
                Avancement {sortKey === 'progress' ? sortLabel : ''}
              </ViewTabBtn>
              <ViewTabBtn active={sortKey === 'status'} onClick={() => onSortChange('status')} icon={ArrowDownUp}>
                Statut {sortKey === 'status' ? sortLabel : ''}
              </ViewTabBtn>
            </ViewTabPills>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-500">{nextDeadlineLabel}</p>
      </ViewFilterPanel>
    </>
  );
}
