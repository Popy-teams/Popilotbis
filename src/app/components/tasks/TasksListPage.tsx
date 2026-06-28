import { useMemo, useState } from 'react';
import type { TestTask, TestTeamMember } from '../../data/testData';
import { calculateTaskProgress } from '../../data/testData';
import type { PipelineStage } from '../../types/planning';
import { ViewShell } from '../shared';
import { TasksToolbar, type TasksViewMode } from './TasksToolbar';
import { TasksTable, TasksEmptyState } from './TasksTable';
import { TasksKanbanBoard } from './TasksKanbanBoard';

interface TasksListPageProps {
  projectName: string;
  tasks: TestTask[];
  members: TestTeamMember[];
  stages: PipelineStage[];
  onCreate: () => void;
  onOpen: (task: TestTask) => void;
  onEdit: (task: TestTask) => void;
  onDelete: (task: TestTask) => void;
  onStatusChange: (taskId: string, status: TestTask['status']) => void;
}

export function TasksListPage({
  projectName,
  tasks,
  members,
  stages,
  onCreate,
  onOpen,
  onEdit,
  onDelete,
  onStatusChange,
}: TasksListPageProps) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [viewMode, setViewMode] = useState<TasksViewMode>('kanban');

  const stats = useMemo(() => {
    const overdue = tasks.filter(
      (t) => new Date(t.dueDate) < new Date() && t.status !== 'done'
    ).length;
    const avgProgress = tasks.length
      ? Math.round(tasks.reduce((acc, t) => acc + calculateTaskProgress(t), 0) / tasks.length)
      : 0;
    return {
      total: tasks.length,
      inProgress: tasks.filter((t) => t.status === 'in-progress').length,
      done: tasks.filter((t) => t.status === 'done').length,
      overdue,
      avgProgress,
    };
  }, [tasks]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks
      .filter((task) => {
        if (viewMode === 'table' && statusFilter !== 'all' && task.status !== statusFilter) return false;
        if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
        if (!q) return true;
        return (
          task.title.toLowerCase().includes(q) ||
          task.description.toLowerCase().includes(q) ||
          task.assignedToName.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [tasks, query, statusFilter, priorityFilter, viewMode]);

  return (
    <ViewShell>
      <TasksToolbar
        projectName={projectName}
        query={query}
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
        viewMode={viewMode}
        stats={stats}
        onQueryChange={setQuery}
        onStatusFilterChange={setStatusFilter}
        onPriorityFilterChange={setPriorityFilter}
        onViewModeChange={setViewMode}
        onCreate={onCreate}
      />

      {filtered.length === 0 ? (
        <TasksEmptyState onCreate={onCreate} />
      ) : viewMode === 'kanban' ? (
        <TasksKanbanBoard
          tasks={filtered}
          members={members}
          stages={stages}
          onOpen={onOpen}
          onStatusChange={onStatusChange}
        />
      ) : (
        <TasksTable
          tasks={filtered}
          members={members}
          stages={stages}
          onOpen={onOpen}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    </ViewShell>
  );
}
