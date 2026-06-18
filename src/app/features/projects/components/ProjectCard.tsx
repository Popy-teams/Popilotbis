import { Archive, Calendar, Edit2, Target, Trash2, Users } from 'lucide-react';
import { Project } from '../../../types';
import { getPriorityBadge, getStatusColor, getStatusLabel, withEffectiveStatus } from './projectPresentation';

interface ProjectCardProps {
  project: Project;
  onOpen: (p: Project) => void;
  onEdit: (p: Project) => void;
  onArchive: (p: Project) => void;
  onDelete: (p: Project) => void;
}

export function ProjectCard({ project: rawProject, onOpen, onEdit, onArchive, onDelete }: ProjectCardProps) {
  const project = withEffectiveStatus(rawProject);
  const priority = getPriorityBadge(project.priority);
  const PriorityIcon = priority.icon;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 group" onClick={() => onOpen(project)}>
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-500" />
      <div className="p-5 sm:p-6 pr-4 sm:pr-6 border-b border-slate-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 inline-flex items-center justify-center shrink-0">
                <Target className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-900 break-words text-base sm:text-lg leading-tight">{project.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Pilotage portfolio</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`saas-badge ${getStatusColor(project.status)}`}>{getStatusLabel(project.status)}</span>
              <span className={`saas-badge ${priority.cls} inline-flex items-center gap-1`}>
                <PriorityIcon className="w-3 h-3" />
                {priority.label} - {Math.ceil(project.progress / 10)}
              </span>
            </div>
            <p className="text-sm text-slate-600 break-words leading-relaxed line-clamp-2">{project.description}</p>
          </div>
          <div className="relative shrink-0 pr-1 sm:pr-2">
            <div className="flex flex-col sm:flex-row gap-1">
              <button className="w-8 h-8 sm:w-9 sm:h-9 inline-flex items-center justify-center hover:bg-slate-100 rounded-lg" onClick={(e) => { e.stopPropagation(); onEdit(project); }}><Edit2 className="w-4 h-4 text-slate-500 shrink-0" /></button>
              <button className="w-8 h-8 sm:w-9 sm:h-9 inline-flex items-center justify-center hover:bg-slate-100 rounded-lg" onClick={(e) => { e.stopPropagation(); onArchive(project); }}><Archive className="w-4 h-4 text-slate-500 shrink-0" /></button>
              <button className="w-8 h-8 sm:w-9 sm:h-9 inline-flex items-center justify-center hover:bg-red-50 rounded" onClick={(e) => { e.stopPropagation(); onDelete(project); }}><Trash2 className="w-4 h-4 text-red-600 shrink-0" /></button>
            </div>
          </div>
        </div>
      </div>
      <div className="px-5 sm:px-6 py-3 bg-slate-50/60">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span>Avancement actions</span>
          <span className="font-semibold text-slate-700">{project.progress}%</span>
        </div>
        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${Math.max(0, Math.min(100, project.progress))}%` }} />
        </div>
      </div>
      <div className="px-5 sm:px-6 py-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-slate-50/60 border-t border-slate-100">
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="text-xs text-slate-500 mb-1 inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Echeance</div>
          <div className="text-base font-semibold text-slate-900">{new Date(project.deadline).toLocaleDateString('fr-FR')}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="text-xs text-slate-500">Equipe</div>
          <div className="text-sm font-semibold text-slate-900 mt-1">{project.team?.slice(0, 3).join(', ') || '-'}</div>
        </div>
      </div>
      <div className="px-5 sm:px-6 py-2.5 bg-white border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-500 inline-flex items-center gap-1"><Users className="w-3.5 h-3.5" />{project.team?.length || 0} membres</span>
        <span className="text-xs text-slate-400 group-hover:text-slate-600 transition-colors">Ouvrir</span>
      </div>
    </div>
  );
}
