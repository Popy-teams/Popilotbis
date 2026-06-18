import { useMemo, useState } from 'react';
import { Target } from 'lucide-react';
import { Project } from '../../../types';
import { ProjectCard } from './ProjectCard';
import { ProjectsTable } from './ProjectsTable';
import { ProjectsToolbar } from './ProjectsToolbar';
import { ViewShell, ViewHeader, viewGrids, TableWrap, AppIcon, IconButton, ActionButton } from '../../../components/shared';

interface ProjectsListPageProps {
  loading: boolean;
  projects: Project[];
  viewMode: 'cards' | 'table';
  sortKey: 'deadline' | 'progress' | 'status';
  sortDirection: 'asc' | 'desc';
  statusFilter: string;
  onViewModeChange: (v: 'cards' | 'table') => void;
  onSortChange: (k: 'deadline' | 'progress' | 'status') => void;
  onStatusFilterChange: (v: string) => void;
  onCreate: () => void;
  onOpen: (p: Project) => void;
  onEdit: (p: Project) => void;
  onArchive: (p: Project) => void;
  onDelete: (p: Project) => void;
}

export function ProjectsListPage({
  loading,
  projects,
  viewMode,
  sortKey,
  sortDirection,
  statusFilter,
  onViewModeChange,
  onSortChange,
  onStatusFilterChange,
  onCreate,
  onOpen,
  onEdit,
  onArchive,
  onDelete,
}: ProjectsListPageProps) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(
    () =>
      projects.filter((p) => {
        const byStatus = statusFilter === 'all' ? true : p.status === statusFilter;
        const q = query.trim().toLowerCase();
        const byQuery =
          q.length === 0 ||
          p.name.toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q) ||
          (p.team || []).join(' ').toLowerCase().includes(q);
        return byStatus && byQuery;
      }),
    [projects, statusFilter, query]
  );
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status !== 'archived').length;
  const avgProgress = projects.length ? Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length) : 0;
  const sortLabel = `${sortDirection === 'asc' ? 'ASC' : 'DESC'}`;
  const nextDeadline = filtered
    .map((p) => new Date(p.deadline))
    .sort((a, b) => a.getTime() - b.getTime())[0];

  return (
    <ViewShell>
      <ProjectsToolbar
        query={query}
        statusFilter={statusFilter}
        viewMode={viewMode}
        sortKey={sortKey}
        sortLabel={sortLabel}
        nextDeadlineLabel={nextDeadline ? `Prochaine echeance: ${nextDeadline.toLocaleDateString('fr-FR')}` : 'Aucune echeance'}
        totalProjects={totalProjects}
        activeProjects={activeProjects}
        avgProgress={avgProgress}
        onQueryChange={setQuery}
        onCreate={onCreate}
        onViewModeChange={onViewModeChange}
        onStatusFilterChange={onStatusFilterChange}
        onSortChange={onSortChange}
      />

      {loading ? (
        <div className="text-center py-12 text-gray-500">Chargement...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 shadow-sm">
          <AppIcon icon={Target} size="xl" className="mx-auto mb-3 text-slate-300" />
          <p className="font-medium">Aucun projet pour ce filtre</p>
          <p className="text-sm mt-1">Change le statut ou cree un nouveau projet.</p>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered.map((project) => <ProjectCard key={project.id} project={project} onOpen={onOpen} onEdit={onEdit} onArchive={onArchive} onDelete={onDelete} />)}
        </div>
      ) : (
        <ProjectsTable projects={filtered} onOpen={onOpen} onEdit={onEdit} onArchive={onArchive} onDelete={onDelete} />
      )}
    </ViewShell>
  );
}
