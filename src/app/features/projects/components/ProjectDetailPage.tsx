import { ArrowLeft, Archive, Edit2, Trash2 } from 'lucide-react';
import { Project } from '../../../types';
import { ViewShell, ViewHeader, viewGrids, TableWrap, AppIcon, IconButton, ActionButton } from '../../../components/shared';

interface ProjectDetailPageProps {
  project: Project;
  onBack: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

export function ProjectDetailPage({ project, onBack, onEdit, onArchive, onDelete }: ProjectDetailPageProps) {
  const getStatusLabel = (status: string) => {
    if (status === 'on-track') return 'Dans les temps';
    if (status === 'at-risk') return 'A risque';
    if (status === 'delayed') return 'En retard';
    if (status === 'archived') return 'Archive';
    return status;
  };
  const budgetRate = project.budget.total > 0 ? Math.round((project.budget.used / project.budget.total) * 100) : 0;

  return (
    <ViewShell>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex items-start sm:items-center justify-between gap-3 min-w-0 w-full">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 break-words tracking-tight">{project.name}</h1>
            <p className="text-slate-600 mt-1">Consultation projet</p>
          </div>
          <button onClick={onBack} className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 shrink-0" aria-label="Retour">
            <AppIcon icon={ArrowLeft} size="sm" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full lg:w-auto">
          <button onClick={onEdit} className="px-4 py-2 border border-slate-300 rounded-xl hover:bg-slate-50 flex items-center justify-center gap-2">
            <AppIcon icon={Edit2} size="sm" /> Modifier
          </button>
          <button onClick={onArchive} className="px-4 py-2 border border-slate-300 rounded-xl hover:bg-slate-50 flex items-center justify-center gap-2">
            <AppIcon icon={Archive} size="sm" /> Archiver
          </button>
          <button onClick={onDelete} className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 flex items-center justify-center gap-2">
            <AppIcon icon={Trash2} size="sm" /> Supprimer
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 space-y-5 shadow-sm">
        <p className="text-slate-700 break-words leading-relaxed">{project.description || 'Aucune description'}</p>
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Avancement projet</span>
            <span className="font-semibold text-slate-700">{project.progress}%</span>
          </div>
          <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${Math.max(0, Math.min(100, project.progress))}%` }} />
          </div>
        </div>
        <div className={viewGrids.stats4}>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80"><div className="text-xs text-slate-500">Statut</div><div className="font-semibold mt-1 text-slate-900 text-sm sm:text-base">{getStatusLabel(project.status)}</div></div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80"><div className="text-xs text-slate-500">Priorite</div><div className="font-semibold mt-1 text-slate-900 text-sm sm:text-base">{project.priority}</div></div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80"><div className="text-xs text-slate-500">Echeance</div><div className="font-semibold mt-1 text-slate-900 text-sm sm:text-base">{new Date(project.deadline).toLocaleDateString('fr-FR')}</div></div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80"><div className="text-xs text-slate-500">Avancement</div><div className="font-semibold mt-1 text-slate-900 text-sm sm:text-base">{project.progress}%</div></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="text-xs text-slate-500 mb-1">Budget</div>
            <div className="font-semibold text-slate-900">{project.budget.used.toLocaleString('fr-FR')} EUR / {project.budget.total.toLocaleString('fr-FR')} EUR</div>
            <div className="text-sm text-slate-600 mt-1">{budgetRate}% consomme</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="text-xs text-slate-500 mb-2">Equipe</div>
            <div className="flex flex-wrap gap-2">
              {(project.team || []).map((member) => (
                <span key={member} className="saas-badge saas-badge-neutral">{member}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ViewShell>
  );
}
