import { Calendar, FolderKanban, Link2, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import type { TestTask, TestTeamMember } from '../../data/testData';
import { calculateTaskProgress } from '../../data/testData';
import type { PipelineStage } from '../../types/planning';
import { PriorityBadge, TaskStatusBadge } from '../shared/displayHelpers';
import { IconButton } from '../shared';

interface TasksTableProps {
  tasks: TestTask[];
  members: TestTeamMember[];
  stages: PipelineStage[];
  onOpen: (task: TestTask) => void;
  onEdit: (task: TestTask) => void;
  onDelete: (task: TestTask) => void;
}

export function TasksTable({
  tasks,
  members,
  stages,
  onOpen,
  onEdit,
  onDelete,
}: TasksTableProps) {
  const isOverdue = (dueDate: string, status: string) =>
    new Date(dueDate) < new Date() && status !== 'done';

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80">
              <th className="text-left px-4 py-3 font-medium text-slate-500">Tâche</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500 w-36">Assignée</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500 w-28">Échéance</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500 w-24">Priorité</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500 w-28">Statut</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500 w-32">Avancement</th>
              <th className="text-right px-4 py-3 font-medium text-slate-500 w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.map((task) => {
              const progress = calculateTaskProgress(task);
              const member = members.find((m) => m.id === task.assignedTo);
              const stageName = stages.find((s) => s.id === task.stageId)?.name;
              const overdue = isOverdue(task.dueDate, task.status);

              return (
                <tr
                  key={task.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onOpen(task)}
                      className="text-left w-full"
                    >
                      <p className="font-medium text-slate-900 group-hover:text-indigo-700 transition-colors line-clamp-1">
                        {task.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {stageName && (
                          <span className="inline-flex items-center gap-1 text-xs text-violet-600">
                            <FolderKanban className="w-3 h-3" />
                            {stageName}
                          </span>
                        )}
                        {task.linkedToProcesses && task.linkedToProcesses.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs text-purple-600">
                            <Link2 className="w-3 h-3" />
                            {task.linkedToProcesses.length} proc.
                          </span>
                        )}
                        {task.subtasks.length > 0 && (
                          <span className="text-xs text-slate-400">
                            {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length} sous-tâches
                          </span>
                        )}
                      </div>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600">
                        {member?.initials ?? '?'}
                      </span>
                      <span className="text-slate-700 truncate max-w-[7rem]">{task.assignedToName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 text-xs ${
                        overdue ? 'text-red-600 font-medium' : 'text-slate-600'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      {new Date(task.dueDate).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={task.priority} />
                  </td>
                  <td className="px-4 py-3">
                    <TaskStatusBadge status={task.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden min-w-[3rem]">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-600 w-8 text-right">{progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-0.5 opacity-70 group-hover:opacity-100 transition-opacity">
                      <IconButton icon={Pencil} label="Modifier" onClick={() => onEdit(task)} />
                      <IconButton icon={Trash2} label="Supprimer" variant="danger" onClick={() => onDelete(task)} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {tasks.map((task) => (
          <TaskMobileCard
            key={task.id}
            task={task}
            members={members}
            stages={stages}
            onOpen={onOpen}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </>
  );
}

function TaskMobileCard({
  task,
  members,
  stages,
  onOpen,
  onEdit,
  onDelete,
}: {
  task: TestTask;
  members: TestTeamMember[];
  stages: PipelineStage[];
  onOpen: (t: TestTask) => void;
  onEdit: (t: TestTask) => void;
  onDelete: (t: TestTask) => void;
}) {
  const progress = calculateTaskProgress(task);
  const member = members.find((m) => m.id === task.assignedTo);
  const stageName = stages.find((s) => s.id === task.stageId)?.name;
  const overdue = new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm active:scale-[0.99] transition-transform">
      <button type="button" onClick={() => onOpen(task)} className="w-full text-left">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-slate-900 leading-snug pr-2">{task.title}</h3>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
            {member?.initials ?? '?'}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          <TaskStatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span className={overdue ? 'text-red-600 font-medium' : ''}>
            {new Date(task.dueDate).toLocaleDateString('fr-FR')}
          </span>
          {stageName && <span className="text-violet-600">{stageName}</span>}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs font-medium text-slate-600">{progress}%</span>
        </div>
      </button>
      <div className="flex justify-end gap-1 mt-3 pt-3 border-t border-slate-100">
        <IconButton icon={Pencil} label="Modifier" onClick={() => onEdit(task)} />
        <IconButton icon={Trash2} label="Supprimer" variant="danger" onClick={() => onDelete(task)} />
      </div>
    </article>
  );
}

export function TasksEmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <MoreHorizontal className="w-7 h-7" />
      </div>
      <p className="font-medium text-slate-800">Aucune tâche trouvée</p>
      <p className="text-sm text-slate-500 mt-1 mb-4">Modifiez les filtres ou créez une nouvelle tâche.</p>
      <button
        type="button"
        onClick={onCreate}
        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Nouvelle tâche
      </button>
    </div>
  );
}
