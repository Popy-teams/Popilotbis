import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { TEST_TASKS, TEST_TEAM_MEMBERS, type TestTask } from '../data/testData';
import { useApi, apiPost, apiPut, apiDelete } from '../hooks/useApi';
import { MEETING_DEMO_TASKS } from '../data/meetingDemoData';
import { DEMO_TASKS_BY_PROJECT } from '../data/multiProjectDemoFixtures';
import { mergeDemoData } from '../utils/demoDataMerge';
import { useProjectContext } from '../context/ProjectContext';
import { usePipeline } from '../context/PipelineContext';
import {
  linkTaskToPipelineStage,
  TASKS_STORAGE_KEY,
  applyPipelineSync,
  removeTaskFromPipeline,
} from '../utils/pipelineSync';
import { getRoutePath } from '../routes/viewRoutes';
import { filterByActiveProject } from '../utils/projectMatch';
import { getLinkedProcessesForTask } from '../data/testProcesses';
import { ViewShell, ViewHeader } from './shared';
import {
  TaskFormPage,
  emptyTaskForm,
  formValuesToTask,
  taskToFormValues,
  type TaskFormValues,
} from './tasks/TaskFormPage';
import { TaskDetailPage } from './tasks/TaskDetailPage';
import { TasksListPage } from './tasks/TasksListPage';

type PageMode = 'list' | 'create' | 'view' | 'edit';

export function TasksViewWithTestData() {
  const navigate = useNavigate();
  const { activeProject, activeProjectSlug, matchesProject } = useProjectContext();
  const { scopedStages, syncFromTasks } = usePipeline();
  const [pageMode, setPageMode] = useState<PageMode>('list');
  const [tasks, setTasks] = useState<TestTask[]>(TEST_TASKS);
  const [selectedTask, setSelectedTask] = useState<TestTask | null>(null);
  const [form, setForm] = useState<TaskFormValues>(() =>
    emptyTaskForm(TEST_TEAM_MEMBERS[0]?.id ?? '')
  );

  const { data: apiTasks, refetch: refetchTasks } = useApi<any[]>('/tasks');
  const { data: apiMembers } = useApi<any[]>(
    activeProject?.id ? `/team-members?project_id=${encodeURIComponent(activeProject.id)}` : '/team-members'
  );

  const membersList = useMemo(() => {
    if (apiMembers) {
      // Deduplicate by name or user_id in case we are viewing all projects
      const unique = [];
      const seen = new Set();
      for (const m of apiMembers) {
        const key = m.user_id || m.name || m.id;
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(m);
        }
      }
      return unique;
    }
    return TEST_TEAM_MEMBERS;
  }, [apiMembers]);

  useEffect(() => {
    if (apiTasks) {
      const mapped = apiTasks.map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description || '',
        projectId: t.project_id,
        projectName: t.project_id, 
        assignedTo: t.assigned_to,
        assignedToName: t.assigned_to_name || membersList.find((m: any) => m.id === t.assigned_to)?.name || t.assigned_to,
        status: t.status,
        priority: t.priority,
        dueDate: t.due_date ? new Date(t.due_date).toISOString().split('T')[0] : '',
        progress: t.progress,
        subtasks: [],
        stageId: null,
        linkedToProcesses: [],
        linkedToProcessSteps: []
      }));
      setTasks(mapped);
    }
  }, [apiTasks, membersList]);

  const projectTasks = useMemo(
    () => filterByActiveProject(tasks, matchesProject, activeProject?.id ?? 'popy'),
    [tasks, matchesProject, activeProjectSlug]
  );

  const persistTasks = (nextTasks: TestTask[]) => {
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(nextTasks));
    } catch {
      // ignore
    }
    applyPipelineSync(nextTasks);
    syncFromTasks(nextTasks);
    setTasks(nextTasks);
  };

  const openCreate = () => {
    setForm(emptyTaskForm(TEST_TEAM_MEMBERS[0]?.id ?? ''));
    setSelectedTask(null);
    setPageMode('create');
  };

  const openEdit = (task: TestTask) => {
    setSelectedTask(task);
    setForm(taskToFormValues(task));
    setPageMode('edit');
  };

  const openView = (task: TestTask) => {
    setSelectedTask(task);
    setPageMode('view');
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = pageMode === 'edit' && selectedTask;
    const base = isEdit && selectedTask ? selectedTask : { id: `task-${Date.now()}` };
    const next = formValuesToTask(
      form,
      base,
      membersList,
      activeProject?.id ?? 'popy',
      activeProject?.name ?? 'Projet'
    );
    
    try {
      if (isEdit) {
        await apiPut(`/tasks/${next.id}`, {
          title: next.title,
          description: next.description,
          assigned_to: next.assignedTo,
          status: next.status,
          priority: next.priority,
          due_date: next.dueDate,
          progress: next.progress
        });
      } else {
        await apiPost('/tasks', {
          id: next.id,
          title: next.title,
          description: next.description,
          project_id: next.projectId,
          assigned_to: next.assignedTo,
          status: next.status,
          priority: next.priority,
          due_date: next.dueDate,
          progress: next.progress
        });
      }
      refetchTasks();
    } catch (err) {
      console.error(err);
    }

    if (pageMode === 'create') {
      setPageMode('list');
      setSelectedTask(null);
    } else {
      setSelectedTask(next);
      setPageMode('view');
    }
    setForm(emptyTaskForm(membersList[0]?.id ?? ''));
  };

  const removeTask = async (id: string) => {
    try {
      await apiDelete(`/tasks/${id}`);
      refetchTasks();
    } catch(err) {
      console.error(err);
    }
    setSelectedTask(null);
    setPageMode('list');
  };

  const updateTaskStatus = async (taskId: string, status: TestTask['status']) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const progress = status === 'done' ? 100 : status === 'todo' ? Math.min(task.progress, 10) : task.progress;
    
    try {
      await apiPut(`/tasks/${taskId}`, { status, progress });
      refetchTasks();
    } catch(err) {
      console.error(err);
    }
  };

  if (pageMode === 'create') {
    return (
      <TaskFormPage
        mode="create"
        title="Nouvelle tâche"
        subtitle={activeProject ? `Tâches — ${activeProject.name}` : 'Tâches'}
        values={form}
        members={membersList}
        stages={scopedStages}
        submitLabel="Créer la tâche"
        onBack={() => setPageMode('list')}
        onSubmit={submitForm}
        onChange={setForm}
      />
    );
  }

  if (pageMode === 'edit' && selectedTask) {
    const task = tasks.find((t) => t.id === selectedTask.id) ?? selectedTask;
    return (
      <TaskFormPage
        mode="edit"
        title="Modifier la tâche"
        subtitle={task.title}
        values={form}
        members={membersList}
        stages={scopedStages}
        linkedProcessCount={task.linkedToProcesses?.length ?? 0}
        submitLabel="Enregistrer"
        onBack={() => setPageMode('view')}
        onSubmit={submitForm}
        onChange={setForm}
      />
    );
  }

  if (pageMode === 'view' && selectedTask) {
    const task = tasks.find((t) => t.id === selectedTask.id) ?? selectedTask;
    return (
      <TaskDetailPage
        task={task}
        stages={scopedStages}
        linkedProcesses={getLinkedProcessesForTask(
          task.linkedToProcesses,
          task.linkedToProcessSteps
        )}
        onBack={() => {
          setPageMode('list');
          setSelectedTask(null);
        }}
        onEdit={() => openEdit(task)}
        onDelete={() => removeTask(task.id)}
        onOpenPipeline={() => navigate(`/${getRoutePath('pipeline')}`)}
        onOpenProcess={(processId) =>
          navigate(`/${getRoutePath('process')}?id=${encodeURIComponent(processId)}`)
        }
      />
    );
  }

  if (!activeProject) {
    return (
      <ViewShell>
        <ViewHeader title="Tâches" subtitle="Sélectionnez un projet dans l'en-tête pour afficher les tâches." />
      </ViewShell>
    );
  }

  return (
    <TasksListPage
      projectName={activeProject.name}
      tasks={projectTasks}
      members={membersList}
      stages={scopedStages}
      onCreate={openCreate}
      onOpen={openView}
      onEdit={openEdit}
      onDelete={(task) => removeTask(task.id)}
      onStatusChange={updateTaskStatus}
    />
  );
}
