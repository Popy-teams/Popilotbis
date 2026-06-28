import { useMemo, useState } from 'react';
import { Calendar, FolderKanban, GripVertical, Link2 } from 'lucide-react';
import type { TestTask, TestTeamMember } from '../../data/testData';
import { calculateTaskProgress } from '../../data/testData';
import type { PipelineStage } from '../../types/planning';
import { PriorityBadge } from '../shared/displayHelpers';

type TaskStatus = TestTask['status'];

const COLUMNS: { id: TaskStatus; label: string; accent: string; drop: string }[] = [
  { id: 'todo', label: 'À faire', accent: 'border-slate-300 bg-slate-50', drop: 'bg-slate-100/80' },
  { id: 'in-progress', label: 'En cours', accent: 'border-blue-300 bg-blue-50/60', drop: 'bg-blue-100/50' },
  { id: 'blocked', label: 'Bloquées', accent: 'border-rose-300 bg-rose-50/60', drop: 'bg-rose-100/50' },
  { id: 'done', label: 'Terminées', accent: 'border-emerald-300 bg-emerald-50/60', drop: 'bg-emerald-100/50' },
];

interface TasksKanbanBoardProps {
  tasks: TestTask[];
  members: TestTeamMember[];
  stages: PipelineStage[];
  onOpen: (task: TestTask) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

export function TasksKanbanBoard({
  tasks,
  members,
  stages,
  onOpen,
  onStatusChange,
}: TasksKanbanBoardProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<TaskStatus | null>(null);

  const byStatus = useMemo(() => {
    const map: Record<TaskStatus, TestTask[]> = {
      todo: [],
      'in-progress': [],
      blocked: [],
      done: [],
    };
    for (const task of tasks) {
      map[task.status].push(task);
    }
    for (const col of COLUMNS) {
      map[col.id].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    }
    return map;
  }, [tasks]);

  const isOverdue = (dueDate: string, status: string) =>
    new Date(dueDate) < new Date() && status !== 'done';

  const handleDrop = (status: TaskStatus) => {
    if (draggingId) onStatusChange(draggingId, status);
    setDraggingId(null);
    setOverColumn(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 min-h-[24rem]">
      {COLUMNS.map((col) => {
        const columnTasks = byStatus[col.id];
        const isTarget = overColumn === col.id;

        return (
          <section
            key={col.id}
            className={`flex flex-col rounded-2xl border-2 transition-colors ${col.accent} ${
              isTarget ? 'ring-2 ring-indigo-400 ring-offset-2' : ''
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setOverColumn(col.id);
            }}
            onDragLeave={() => setOverColumn((c) => (c === col.id ? null : c))}
            onDrop={(e) => {
              e.preventDefault();
              handleDrop(col.id);
            }}
          >
            <header className="flex items-center justify-between px-4 py-3 border-b border-white/60">
              <h3 className="font-bold text-slate-800 text-sm">{col.label}</h3>
              <span className="text-xs font-bold tabular-nums px-2 py-0.5 rounded-full bg-white/80 text-slate-600 shadow-sm">
                {columnTasks.length}
              </span>
            </header>

            <div className={`flex-1 p-3 space-y-3 min-h-[12rem] transition-colors ${isTarget ? col.drop : ''}`}>
              {columnTasks.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8 px-2">Glissez une tâche ici</p>
              ) : (
                columnTasks.map((task) => {
                  const progress = calculateTaskProgress(task);
                  const member = members.find((m) => m.id === task.assignedTo);
                  const stageName = stages.find((s) => s.id === task.stageId)?.name;
                  const overdue = isOverdue(task.dueDate, task.status);

                  return (
                    <article
                      key={task.id}
                      draggable
                      onDragStart={() => setDraggingId(task.id)}
                      onDragEnd={() => {
                        setDraggingId(null);
                        setOverColumn(null);
                      }}
                      className={`group rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md hover:border-indigo-200 transition-all ${
                        draggingId === task.id ? 'opacity-50 scale-[0.98]' : ''
                      }`}
                    >
                      <div className="flex gap-2">
                        <GripVertical className="w-4 h-4 text-slate-300 shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex-1 min-w-0">
                          <button
                            type="button"
                            onClick={() => onOpen(task)}
                            className="text-left w-full font-semibold text-sm text-slate-900 hover:text-indigo-700 line-clamp-2"
                          >
                            {task.title}
                          </button>

                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <PriorityBadge priority={task.priority} />
                            {stageName && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-violet-600 font-medium">
                                <FolderKanban className="w-3 h-3" />
                                {stageName}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-3 gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[9px] font-bold text-slate-600">
                                {member?.initials ?? '?'}
                              </span>
                              <span className="text-xs text-slate-500 truncate">{task.assignedToName}</span>
                            </div>
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] shrink-0 ${
                                overdue ? 'text-rose-600 font-semibold' : 'text-slate-500'
                              }`}
                            >
                              <Calendar className="w-3 h-3" />
                              {new Date(task.dueDate).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </span>
                          </div>

                          {task.linkedToProcesses && task.linkedToProcesses.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-purple-600 mt-2">
                              <Link2 className="w-3 h-3" />
                              {task.linkedToProcesses.length} processus
                            </span>
                          )}

                          <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
