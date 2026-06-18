import { ArrowDownUp, LayoutGrid, List, Plus } from 'lucide-react';
import { FormSelect, SearchField } from '../../../components/shared';

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
      <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Portfolio Projets</h1>
            <p className="text-slate-600 mt-1 text-sm sm:text-base">Pilotage strategique et execution de vos projets</p>
          </div>
          <button className="w-full sm:w-auto justify-center flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 shadow-sm" onClick={onCreate}>
            <Plus className="w-5 h-5 shrink-0" /> Nouveau projet
          </button>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3"><p className="text-xs text-slate-500">Total</p><p className="text-xl font-semibold text-slate-900">{totalProjects}</p></div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3"><p className="text-xs text-slate-500">Actifs</p><p className="text-xl font-semibold text-slate-900">{activeProjects}</p></div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3"><p className="text-xs text-slate-500">Progression moyenne</p><p className="text-xl font-semibold text-slate-900">{avgProgress}%</p></div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto_auto_auto] gap-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 min-w-0">
            <SearchField
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Rechercher un projet..."
              className="border-0 bg-transparent shadow-none focus:shadow-none min-h-10"
            />
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-2 min-w-0">
            <FormSelect value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value)}>
              <option value="all">Tous statuts</option><option value="on-track">Dans les temps</option><option value="at-risk">À risque</option><option value="delayed">En retard</option><option value="completed">Terminé</option><option value="archived">Archivé</option>
            </FormSelect>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-2 flex items-center justify-center gap-1">
            <button onClick={() => onViewModeChange('cards')} className={`min-h-10 px-3 rounded-lg text-sm inline-flex items-center gap-2 ${viewMode === 'cards' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}><LayoutGrid className="w-4 h-4" /> Cartes</button>
            <button onClick={() => onViewModeChange('table')} className={`min-h-10 px-3 rounded-lg text-sm inline-flex items-center gap-2 ${viewMode === 'table' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}><List className="w-4 h-4" /> Tableau</button>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-2 flex items-center justify-center gap-1">
            <button onClick={() => onSortChange('deadline')} className={`min-h-10 px-3 rounded-lg text-sm inline-flex items-center gap-1 ${sortKey === 'deadline' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}><ArrowDownUp className="w-3.5 h-3.5" /> Echeance {sortKey === 'deadline' ? sortLabel : ''}</button>
            <button onClick={() => onSortChange('progress')} className={`min-h-10 px-3 rounded-lg text-sm inline-flex items-center gap-1 ${sortKey === 'progress' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}><ArrowDownUp className="w-3.5 h-3.5" /> Avancement {sortKey === 'progress' ? sortLabel : ''}</button>
            <button onClick={() => onSortChange('status')} className={`min-h-10 px-3 rounded-lg text-sm inline-flex items-center gap-1 ${sortKey === 'status' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}><ArrowDownUp className="w-3.5 h-3.5" /> Statut {sortKey === 'status' ? sortLabel : ''}</button>
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-500">{nextDeadlineLabel}</p>
      </section>
    </>
  );
}
