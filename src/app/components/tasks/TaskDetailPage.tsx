import {
  Calendar,
  Check,
  CheckSquare,
  FolderKanban,
  Link2,
  Pencil,
  Trash2,
  User,
  ChevronRight,
} from 'lucide-react';
import type { PipelineStage } from '../../types/planning';
import type { LinkedProcessForTask } from '../../data/testProcesses';
import type { TestTask } from '../../data/testData';
import { calculateTaskProgress } from '../../data/testData';
import { PageBackHeader, ViewShell } from '../shared';
import { PriorityBadge, TaskStatusBadge } from '../shared/displayHelpers';

interface TaskDetailPageProps {
  task: TestTask;
  stages: PipelineStage[];
  linkedProcesses: LinkedProcessForTask[];
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onOpenPipeline?: () => void;
  onOpenProcess?: (processId: string) => void;
}

export function TaskDetailPage({
  task,
  stages,
  linkedProcesses,
  onBack,
  onEdit,
  onDelete,
  onOpenPipeline,
  onOpenProcess,
}: TaskDetailPageProps) {
  const progress = calculateTaskProgress(task);
  const stageName = stages.find((s) => s.id === task.stageId)?.name;
  const overdue = new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <ViewShell>
      <PageBackHeader
        title={task.title}
        subtitle={task.projectName}
        onBack={onBack}
        actions={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-xl hover:bg-slate-50 text-sm font-medium"
            >
              <Pencil className="w-4 h-4" />
              Modifier
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 text-red-700 rounded-xl hover:bg-red-50 text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer
            </button>
          </div>
        }
      />

      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-600 to-violet-600 text-white p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <TaskStatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
            </div>
            <div className="text-right">
              <p className="text-indigo-100 text-sm">Avancement</p>
              <p className="text-4xl font-bold">{progress}%</p>
            </div>
          </div>
          <div className="mt-4 w-full bg-white/20 rounded-full h-2.5">
            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </section>

        {task.description && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900 mb-2">Description</h2>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{task.description}</p>
          </section>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Détails</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-3 text-slate-700">
              <User className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <dt className="text-xs text-slate-500">Assignée à</dt>
                <dd className="font-medium">{task.assignedToName}</dd>
              </div>
            </div>
            <div className="flex items-center gap-3 text-slate-700">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <dt className="text-xs text-slate-500">Échéance</dt>
                <dd className={`font-medium ${overdue ? 'text-red-600' : ''}`}>
                  {new Date(task.dueDate).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                  {overdue ? ' — en retard' : ''}
                </dd>
              </div>
            </div>
            {task.stageId && (
              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={onOpenPipeline}
                  className="inline-flex items-center gap-2 text-sm font-medium text-violet-700 hover:text-violet-900"
                >
                  <FolderKanban className="w-4 h-4" />
                  Étape pipeline : {stageName ?? task.stageId}
                </button>
              </div>
            )}
            {task.linkedToProcesses && task.linkedToProcesses.length > 0 && (
              <div className="sm:col-span-2">
                <dt className="text-xs text-slate-500 mb-2">Processus ISO liés</dt>
                <dd className="space-y-2">
                  {linkedProcesses.map((process) => (
                    <button
                      key={process.id}
                      type="button"
                      onClick={() => onOpenProcess?.(process.id)}
                      className="w-full text-left rounded-xl border border-purple-200 bg-purple-50/60 px-4 py-3 hover:bg-purple-100/80 hover:border-purple-300 transition-colors group"
                    >
                      <span className="flex items-start justify-between gap-2">
                        <span className="inline-flex items-start gap-2 min-w-0">
                          <Link2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                          <span className="min-w-0">
                            <span className="block font-medium text-purple-900 group-hover:text-purple-950">
                              {process.title}
                            </span>
                            {process.steps.length > 0 && (
                              <span className="block text-xs text-purple-700/80 mt-1">
                                Étape(s) : {process.steps.map((s) => s.title).join(' · ')}
                              </span>
                            )}
                          </span>
                        </span>
                        <ChevronRight className="w-4 h-4 text-purple-400 shrink-0 mt-0.5 group-hover:text-purple-700" />
                      </span>
                    </button>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </section>

        {task.subtasks.length > 0 && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-indigo-600" />
              Sous-tâches ({task.subtasks.filter((st) => st.completed).length}/{task.subtasks.length})
            </h2>
            <ul className="space-y-2">
              {task.subtasks.map((st) => (
                <li
                  key={st.id}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2.5 text-sm"
                >
                  {st.completed ? (
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <span className="w-4 h-4 rounded border border-slate-300 shrink-0" />
                  )}
                  <span className={st.completed ? 'line-through text-slate-400' : 'text-slate-800'}>
                    {st.title}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </ViewShell>
  );
}
