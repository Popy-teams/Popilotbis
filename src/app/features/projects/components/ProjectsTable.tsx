import { Archive, Edit2, Trash2 } from 'lucide-react';
import { Project } from '../../../types';
import { getStatusColor, getStatusLabel } from './projectPresentation';

interface ProjectsTableProps {
  projects: Project[];
  onOpen: (p: Project) => void;
  onEdit: (p: Project) => void;
  onArchive: (p: Project) => void;
  onDelete: (p: Project) => void;
}

export function ProjectsTable({ projects, onOpen, onEdit, onArchive, onDelete }: ProjectsTableProps) {
  return (
    <>
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {projects.map((project) => (
          <div key={`mobile-${project.id}`} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm" onClick={() => onOpen(project)}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 truncate">{project.name}</p>
                <p className="text-xs text-slate-500 mt-1">{new Date(project.deadline).toLocaleDateString('fr-FR')}</p>
              </div>
              <span className={`saas-badge ${getStatusColor(project.status)}`}>{getStatusLabel(project.status)}</span>
            </div>
            <div className="mt-3 h-2 w-full bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: `${Math.max(0, Math.min(100, project.progress))}%` }} />
            </div>
            <div className="mt-2 text-xs text-slate-500">Echeance: {new Date(project.deadline).toLocaleDateString('fr-FR')}</div>
            <div className="mt-3 flex items-center justify-end gap-1">
              <button className="w-8 h-8 inline-flex items-center justify-center hover:bg-slate-100 rounded-lg" onClick={(e) => { e.stopPropagation(); onEdit(project); }}><Edit2 className="w-4 h-4 text-slate-500" /></button>
              <button className="w-8 h-8 inline-flex items-center justify-center hover:bg-slate-100 rounded-lg" onClick={(e) => { e.stopPropagation(); onArchive(project); }}><Archive className="w-4 h-4 text-slate-500" /></button>
              <button className="w-8 h-8 inline-flex items-center justify-center hover:bg-red-50 rounded-lg" onClick={(e) => { e.stopPropagation(); onDelete(project); }}><Trash2 className="w-4 h-4 text-red-600" /></button>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[860px] w-full">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Projet</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Statut</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Avancement</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Echeance</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Budget</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Equipe</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-slate-50/70 cursor-pointer" onClick={() => onOpen(project)}>
                  <td className="px-4 py-3"><p className="font-medium text-slate-900">{project.name}</p><p className="text-xs text-slate-500 line-clamp-1">{project.description}</p></td>
                  <td className="px-4 py-3"><span className={`saas-badge ${getStatusColor(project.status)}`}>{getStatusLabel(project.status)}</span></td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="h-2 w-24 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-blue-600 rounded-full" style={{ width: `${Math.max(0, Math.min(100, project.progress))}%` }} /></div><span className="text-xs font-semibold text-slate-700">{project.progress}%</span></div></td>
                  <td className="px-4 py-3 text-sm text-slate-700">{new Date(project.deadline).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{((project.budget.used / project.budget.total) * 100).toFixed(0)}% utilise</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{project.team?.slice(0, 3).join(', ') || '-'}</td>
                  <td className="px-4 py-3"><div className="flex items-center justify-end gap-1"><button className="w-8 h-8 inline-flex items-center justify-center hover:bg-slate-100 rounded-lg" onClick={(e) => { e.stopPropagation(); onEdit(project); }}><Edit2 className="w-4 h-4 text-slate-500" /></button><button className="w-8 h-8 inline-flex items-center justify-center hover:bg-slate-100 rounded-lg" onClick={(e) => { e.stopPropagation(); onArchive(project); }}><Archive className="w-4 h-4 text-slate-500" /></button><button className="w-8 h-8 inline-flex items-center justify-center hover:bg-red-50 rounded-lg" onClick={(e) => { e.stopPropagation(); onDelete(project); }}><Trash2 className="w-4 h-4 text-red-600" /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
